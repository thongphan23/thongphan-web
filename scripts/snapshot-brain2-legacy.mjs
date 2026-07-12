import { execFileSync } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import {
  chmod,
  lstat,
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  rm,
  stat,
} from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const SOURCE_ALLOWLIST = Object.freeze([
  'functions/api/reflections.js',
  'functions/api/signup.js',
  'index.html',
  'script.js',
  'style.css',
  'thong-phan.jpg',
  'worldview-sample.md',
  'wrangler.toml',
])

export const AUDITED_PRODUCTION_DEPLOYMENT_ID = '8d400ccd-3357-4c51-9a0f-87bd2648b9ff'
export const AUDITED_PRODUCTION_DEPLOYMENT_COUNT = 64

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const DEFAULT_REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), '..')
const DEFAULT_SOURCE_ROOT = '/Users/rio/brain2-landing'
const DEFAULT_OUTPUT_DIR = '/Users/rio/Private/thongphan-brain2-legacy-2026-07-12'
const DEFAULT_LEGACY_ORIGIN = 'https://brain2.thongphan.com'
const DEFAULT_ACCOUNT_ID = 'c9ac9be0687c0ce664de7fdc571fbb6a'
const DEFAULT_PROJECT_NAME = 'brain2-platform'
const CLOUDFLARE_API_ROOT = 'https://api.cloudflare.com/client/v4'
const PAGE_SIZE = 25
const FORBIDDEN_SOURCE_PARTS = new Set(['.env', '.env.local', '.dev.vars', '.wrangler', '.git'])

function sha256(contents) {
  return createHash('sha256').update(contents).digest('hex')
}

function isInside(candidate, parent) {
  const relative = path.relative(parent, candidate)
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
}

async function resolveThroughExistingAncestor(candidate) {
  let cursor = path.resolve(candidate)
  const missing = []

  for (;;) {
    try {
      const existing = await realpath(cursor)
      return path.join(existing, ...missing.reverse())
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
      const parent = path.dirname(cursor)
      if (parent === cursor) throw error
      missing.push(path.basename(cursor))
      cursor = parent
    }
  }
}

async function nearestExistingDirectory(candidate) {
  let cursor = path.resolve(candidate)

  for (;;) {
    try {
      const info = await stat(cursor)
      return realpath(info.isDirectory() ? cursor : path.dirname(cursor))
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
      const parent = path.dirname(cursor)
      if (parent === cursor) throw error
      cursor = parent
    }
  }
}

function gitWorktreeRoot(directory) {
  try {
    return path.resolve(execFileSync('git', ['-C', directory, 'rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim())
  } catch {
    return null
  }
}

function gitCommonDirectory(directory) {
  try {
    const value = execFileSync(
      'git',
      ['-C', directory, 'rev-parse', '--path-format=absolute', '--git-common-dir'],
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    ).trim()
    return path.resolve(directory, value)
  } catch {
    return null
  }
}

export async function assertSafeOutputPath(outputDir, repoRoot = DEFAULT_REPO_ROOT) {
  const [resolvedOutput, resolvedRepo, existingDirectory] = await Promise.all([
    resolveThroughExistingAncestor(outputDir),
    realpath(repoRoot),
    nearestExistingDirectory(outputDir),
  ])

  const enclosingWorktree = gitWorktreeRoot(existingDirectory)
  const publicGitDirectory = gitCommonDirectory(resolvedRepo)
  const entersGitMetadata = resolvedOutput.split(path.sep).includes('.git')

  if (
    isInside(resolvedOutput, resolvedRepo) ||
    (enclosingWorktree && isInside(resolvedOutput, enclosingWorktree)) ||
    (publicGitDirectory && isInside(resolvedOutput, publicGitDirectory)) ||
    entersGitMetadata
  ) {
    throw new Error(
      'Legacy snapshot output must stay outside the public repository and every Git worktree.',
    )
  }

  return resolvedOutput
}

async function readAllowlistedSources(sourceRoot) {
  const resolvedRoot = await realpath(sourceRoot)
  const artifacts = []

  for (const relativePath of SOURCE_ALLOWLIST) {
    const parts = relativePath.split('/')
    if (parts.some((part) => FORBIDDEN_SOURCE_PARTS.has(part) || part.startsWith('.env'))) {
      throw new Error(`Unsafe source allowlist entry: ${relativePath}`)
    }

    const requestedPath = path.join(resolvedRoot, relativePath)
    const [fileInfo, resolvedPath] = await Promise.all([lstat(requestedPath), realpath(requestedPath)])
    if (!fileInfo.isFile() || fileInfo.isSymbolicLink() || !isInside(resolvedPath, resolvedRoot)) {
      throw new Error(`Allowlisted source must be a regular in-root file: ${relativePath}`)
    }

    artifacts.push({
      path: `source/${relativePath}`,
      contents: await readFile(resolvedPath),
    })
  }

  return artifacts
}

function sanitizeDeployment(deployment) {
  return {
    id: deployment.id,
    short_id: deployment.short_id ?? null,
    environment: deployment.environment ?? null,
    url: deployment.url ?? null,
    aliases: Array.isArray(deployment.aliases) ? deployment.aliases : [],
    created_on: deployment.created_on ?? null,
    modified_on: deployment.modified_on ?? null,
    latest_stage: deployment.latest_stage
      ? {
          name: deployment.latest_stage.name ?? null,
          status: deployment.latest_stage.status ?? null,
        }
      : null,
  }
}

export async function fetchDeploymentInventory({
  accountId,
  projectName,
  authToken,
  fetchImpl = fetch,
  expectedCount = AUDITED_PRODUCTION_DEPLOYMENT_COUNT,
  expectedDeploymentId = AUDITED_PRODUCTION_DEPLOYMENT_ID,
}) {
  if (!authToken) throw new Error('Cloudflare authentication is required for deployment inventory.')

  const deployments = []
  const apiPages = []
  let page = 1
  let totalPages = 1

  do {
    const endpoint = new URL(
      `${CLOUDFLARE_API_ROOT}/accounts/${encodeURIComponent(accountId)}/pages/projects/${encodeURIComponent(projectName)}/deployments`,
    )
    endpoint.searchParams.set('env', 'production')
    endpoint.searchParams.set('page', String(page))
    endpoint.searchParams.set('per_page', String(PAGE_SIZE))

    const response = await fetchImpl(endpoint, {
      method: 'GET',
      redirect: 'error',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    })
    if (!response.ok) {
      throw new Error(`Cloudflare deployment inventory request failed with HTTP ${response.status}.`)
    }

    const payload = await response.json()
    if (payload?.success !== true || !Array.isArray(payload.result)) {
      throw new Error(`Cloudflare deployment inventory returned an invalid page at page ${page}.`)
    }

    const info = payload.result_info ?? {}
    const reportedTotal = Number(info.total_count)
    const reportedPages = Number(info.total_pages)
    totalPages = Number.isInteger(reportedPages) && reportedPages > 0
      ? reportedPages
      : Math.max(1, Math.ceil(reportedTotal / PAGE_SIZE))
    if (!Number.isInteger(totalPages) || totalPages > 100) {
      throw new Error('Cloudflare deployment inventory pagination is outside the safe limit.')
    }

    apiPages.push({
      page,
      count: payload.result.length,
      per_page: Number(info.per_page) || PAGE_SIZE,
      total_count: Number.isFinite(reportedTotal) ? reportedTotal : null,
      total_pages: totalPages,
    })
    deployments.push(...payload.result.map(sanitizeDeployment))
    page += 1
  } while (page <= totalPages)

  const ids = deployments.map(({ id }) => id)
  if (ids.some((id) => typeof id !== 'string' || id.length === 0)) {
    throw new Error('Cloudflare deployment inventory contains a deployment without an ID.')
  }
  if (new Set(ids).size !== ids.length) {
    throw new Error('Cloudflare deployment inventory contains duplicate IDs across API pages.')
  }
  if (deployments.some(({ environment }) => environment !== 'production')) {
    throw new Error('Cloudflare production inventory contains a non-production deployment.')
  }
  if (deployments.length !== expectedCount) {
    throw new Error(
      `Cloudflare deployment inventory expected ${expectedCount} production deployments but received ${deployments.length}.`,
    )
  }
  if (!ids.includes(expectedDeploymentId)) {
    throw new Error(`Cloudflare deployment inventory is missing audited deployment ${expectedDeploymentId}.`)
  }

  return {
    schema_version: 1,
    account_id: accountId,
    project_name: projectName,
    environment: 'production',
    deployment_count: deployments.length,
    audited_production_deployment_id: expectedDeploymentId,
    api_pages: apiPages,
    deployments,
  }
}

async function fetchLegacyArtifact(url, kind, fetchImpl) {
  const response = await fetchImpl(url, {
    method: 'GET',
    redirect: 'manual',
    headers: { Accept: kind === 'json' ? 'application/json' : 'text/html' },
  })
  if (!response.ok) throw new Error(`Legacy ${kind} snapshot request failed with HTTP ${response.status}.`)

  const contents = Buffer.from(await response.arrayBuffer())
  if (kind === 'json') {
    try {
      JSON.parse(contents.toString('utf8'))
    } catch {
      throw new Error('Legacy reflection snapshot response is not valid JSON.')
    }
  }

  return contents
}

async function writePrivateFile(root, relativePath, contents) {
  const destination = path.join(root, relativePath)
  if (!isInside(destination, root)) throw new Error(`Unsafe snapshot artifact path: ${relativePath}`)

  const parent = path.dirname(destination)
  await mkdir(parent, { recursive: true, mode: 0o700 })
  await chmod(parent, 0o700)

  const handle = await open(destination, 'wx', 0o600)
  try {
    await handle.writeFile(contents)
  } finally {
    await handle.close()
  }
  await chmod(destination, 0o600)
}

async function verifySnapshot(outputDir, manifest, manifestArtifact) {
  const directoryInfo = await stat(outputDir)
  if ((directoryInfo.mode & 0o777) !== 0o700) throw new Error('Snapshot directory mode is not 700.')

  for (const artifact of [...manifest.artifacts, manifestArtifact]) {
    const filePath = path.join(outputDir, artifact.path)
    const fileInfo = await stat(filePath)
    if ((fileInfo.mode & 0o777) !== 0o600) {
      throw new Error(`Snapshot file mode is not 600: ${artifact.path}`)
    }
    const contents = await readFile(filePath)
    if (contents.byteLength !== artifact.bytes || sha256(contents) !== artifact.sha256) {
      throw new Error(`Snapshot verification failed: ${artifact.path}`)
    }
  }
}

export async function createLegacySnapshot({
  repoRoot = DEFAULT_REPO_ROOT,
  sourceRoot = DEFAULT_SOURCE_ROOT,
  outputDir = DEFAULT_OUTPUT_DIR,
  legacyOrigin = DEFAULT_LEGACY_ORIGIN,
  accountId = DEFAULT_ACCOUNT_ID,
  projectName = DEFAULT_PROJECT_NAME,
  authToken,
  fetchImpl = fetch,
  expectedCount = AUDITED_PRODUCTION_DEPLOYMENT_COUNT,
  expectedDeploymentId = AUDITED_PRODUCTION_DEPLOYMENT_ID,
  now = () => new Date(),
}) {
  const safeOutput = await assertSafeOutputPath(outputDir, repoRoot)
  const safeSource = await realpath(sourceRoot)
  if (isInside(safeOutput, safeSource)) {
    throw new Error('Legacy snapshot output must stay outside the legacy source directory.')
  }
  try {
    await lstat(safeOutput)
    throw new Error('Legacy snapshot output already exists; refusing to overwrite evidence.')
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }

  const sourceArtifacts = await readAllowlistedSources(safeSource)
  const [productionHtml, reflectionsJson, inventory] = await Promise.all([
    fetchLegacyArtifact(`${legacyOrigin}/`, 'html', fetchImpl),
    fetchLegacyArtifact(`${legacyOrigin}/api/reflections`, 'json', fetchImpl),
    fetchDeploymentInventory({
      accountId,
      projectName,
      authToken,
      fetchImpl,
      expectedCount,
      expectedDeploymentId,
    }),
  ])
  const createdAt = now().toISOString()
  const deploymentContents = Buffer.from(
    `${JSON.stringify({ ...inventory, captured_at: createdAt }, null, 2)}\n`,
    'utf8',
  )
  const payloads = [
    ...sourceArtifacts,
    { path: 'live/production.html', contents: productionHtml },
    { path: 'live/reflections.json', contents: reflectionsJson },
    { path: 'cloudflare/deployments.json', contents: deploymentContents },
  ]
  const artifacts = payloads
    .map(({ path: artifactPath, contents }) => ({
      path: artifactPath,
      bytes: contents.byteLength,
      sha256: sha256(contents),
    }))
    .sort((a, b) => a.path.localeCompare(b.path))
  const manifest = {
    schema_version: 1,
    classification: 'private-release-evidence',
    created_at: createdAt,
    legacy_origin: legacyOrigin,
    cloudflare_project: {
      account_id: accountId,
      project_name: projectName,
      environment: 'production',
      deployment_count: inventory.deployment_count,
      audited_production_deployment_id: expectedDeploymentId,
      api_page_count: inventory.api_pages.length,
    },
    source_allowlist: [...SOURCE_ALLOWLIST],
    artifacts,
  }
  const manifestContents = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  const manifestArtifact = {
    path: 'manifest.json',
    bytes: manifestContents.byteLength,
    sha256: sha256(manifestContents),
  }

  const parent = path.dirname(safeOutput)
  const temporaryOutput = `${safeOutput}.tmp-${process.pid}-${randomBytes(6).toString('hex')}`
  await mkdir(parent, { recursive: true, mode: 0o700 })
  await mkdir(temporaryOutput, { mode: 0o700 })
  await chmod(temporaryOutput, 0o700)

  try {
    for (const payload of payloads) {
      await writePrivateFile(temporaryOutput, payload.path, payload.contents)
    }
    await writePrivateFile(temporaryOutput, manifestArtifact.path, manifestContents)
    await rename(temporaryOutput, safeOutput)
    try {
      await verifySnapshot(safeOutput, manifest, manifestArtifact)
    } catch (error) {
      await rm(safeOutput, { recursive: true, force: true })
      throw error
    }
  } catch (error) {
    await rm(temporaryOutput, { recursive: true, force: true })
    throw error
  }

  return {
    verified: true,
    files: [...artifacts, manifestArtifact].sort((a, b) => a.path.localeCompare(b.path)),
  }
}

function parseArguments(argv) {
  let outputDir = DEFAULT_OUTPUT_DIR

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--output') {
      const value = argv[index + 1]
      if (!value || value.startsWith('--')) throw new Error('--output requires a directory path.')
      outputDir = value
      index += 1
      continue
    }
    if (argument === '--help') {
      return { help: true, outputDir }
    }
    throw new Error(`Unknown argument: ${argument}`)
  }

  return { help: false, outputDir }
}

function cloudflareTokenFromWrangler(repoRoot) {
  const wranglerPath = path.join(repoRoot, 'node_modules/.bin/wrangler')
  let serialized
  try {
    serialized = execFileSync(wranglerPath, ['auth', 'token', '--json'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 1024 * 1024,
    })
  } catch {
    throw new Error('Unable to obtain an in-memory Cloudflare credential from Wrangler.')
  }

  try {
    const parsed = JSON.parse(serialized)
    if (typeof parsed.token !== 'string' || parsed.token.length === 0) throw new Error('missing')
    return parsed.token
  } catch {
    throw new Error('Wrangler returned an invalid Cloudflare credential response.')
  }
}

async function main() {
  const { help, outputDir } = parseArguments(process.argv.slice(2))
  if (help) {
    process.stdout.write('Usage: node scripts/snapshot-brain2-legacy.mjs [--output <outside-repo-directory>]\n')
    return
  }

  await assertSafeOutputPath(outputDir, DEFAULT_REPO_ROOT)
  const authToken = cloudflareTokenFromWrangler(DEFAULT_REPO_ROOT)
  const result = await createLegacySnapshot({ outputDir, authToken })
  for (const artifact of result.files) {
    process.stdout.write(`${artifact.path}\t${artifact.bytes}\t${artifact.sha256}\n`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  })
}
