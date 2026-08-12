import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'

const checks = [
  ['focused tests', 'node', ['--import', 'tsx', '--test', 'scripts/vid-*.test.ts', 'scripts/vid-*.test.mjs']],
  ['full tests', 'npm', ['test']],
  ['TypeScript', 'npx', ['tsc', '--noEmit']],
  ['Vid Worker TypeScript', 'npm', ['run', 'typecheck:vid-worker']],
  ['lint', 'npm', ['run', 'lint']],
  ['build', 'npm', ['run', 'build']],
  ['bundle budget', 'npm', ['run', 'test:bundle']],
  ['secret integrity', 'npm', ['run', 'test:secret-integrity']],
  ['Wrangler dry run', 'npx', ['wrangler', 'deploy', '--config', 'wrangler.vid.toml', '--dry-run', '--outdir', '/private/tmp/thongphan-vid-worker-dry-run']],
  ['visual QA', 'npm', ['run', 'qa:vid']],
  ['diff check', 'git', ['diff', '--check']],
]

const results = []
for (const [label, command, args] of checks) {
  const result = spawnSync(command, args, { encoding: 'utf8', shell: label === 'focused tests', stdio: 'pipe' })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  process.stdout.write(`\n[${label}]\n${output}`)
  results.push({ label, pass: result.status === 0, status: result.status, signal: result.signal })
  if (result.status !== 0) break
}

const config = await readFile('wrangler.vid.toml', 'utf8')
const externalReady = !config.includes('00000000-0000-0000-0000-000000000000')
  && !config.includes('configure-before-deploy')
const localPass = results.length === checks.length && results.every(({ pass }) => pass)
console.log(`\nVID_RELEASE_LOCAL=${localPass ? 'PASS_LOCAL' : 'FAIL'}`)
console.log(`VID_RELEASE_EXTERNAL=${externalReady ? 'CONFIGURED_NOT_VERIFIED' : 'PARTIAL_NOT_PROVISIONED'}`)
if (!localPass) process.exitCode = 1
