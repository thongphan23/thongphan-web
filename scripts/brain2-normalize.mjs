import { createHash } from 'node:crypto'

import { parseFragment } from 'parse5'

import { MIGRATED_AT, RELEASE_ID } from './brain2-editorial-metadata.mjs'

const fail = (sourceName, message) => {
  throw new Error(`${sourceName}: ${message}`)
}

export const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex')

const stableValue = (value) => {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .filter((key) => value[key] !== undefined)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    )
  }
  return value
}

export const stableJsonStringify = (value) => JSON.stringify(stableValue(value))

export function contentSha256(value) {
  const body = {
    reason: value.reason,
    blocks: value.blocks,
    deliverable: value.deliverable,
    checklist: value.checklist,
  }
  return sha256(stableJsonStringify(body))
}

const attr = (node, name) => node.attrs?.find((entry) => entry.name === name)?.value

const textContent = (node) => {
  if (node.nodeName === '#text') return node.value
  if (node.tagName === 'br') return '\n'
  return (node.childNodes ?? []).map(textContent).join('')
}

const descendants = (node, predicate, found = []) => {
  for (const child of node.childNodes ?? []) {
    if (predicate(child)) found.push(child)
    descendants(child, predicate, found)
  }
  return found
}

const countMatches = (value, pattern) => [...value.matchAll(pattern)].length

const UNVERIFIED_COUNT_PATTERN =
  /\b(?:\d{3,}|\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?\s*[kKmM])(?:\+)?\s*(?:notes?|ghi\s*chú|shares?|lượt\s*chia\s*sẻ|members?|thành\s*viên)\b/i
const DYNAMIC_CLAIM_PATTERN =
  /(?:Obsidian\s+)?miễn\s+phí\s+(?:100\s*%|vĩnh\s+viễn)|free\s+forever/i

const OMIT_RULES = [
  {
    key: 'live-campaign',
    pattern: /\b(?:zoom|zalo|live\s*workshop|workshop\s*trực\s*tiếp|livestream|tháng\s*5\s*[/-]\s*2026)\b|#ngay\d+|#tuan\w*/i,
  },
  { key: 'embedded-passcode', pattern: /\b0203\b|passcode\s*[:：]?\s*0203/i },
  { key: 'legacy-domain', pattern: /brain2\.thongphan\.com/i },
  {
    key: 'private-chat-cta',
    pattern: /(?:mở|truy cập|bấm|vào).{0,48}(?:brain2\s*chat|gemini\s*chat)|(?:brain2\s*chat|gemini\s*chat).{0,48}(?:mở|truy cập|bấm|vào)/i,
  },
  {
    key: 'reflection-wall',
    pattern: /reflection\s*wall|tường\s*(?:reflection|phản\s*tư)|(?:đăng|chia\s*sẻ).{0,48}(?:lên|vào).{0,24}(?:tường\s*phản\s*tư|reflection)/i,
  },
  { key: 'local-machine-path', pattern: /\/Users\/|(?:^|[\\/])\.(?:agent|gemini)(?:[\\/]|$)/i },
  { key: 'ai-tool-link', pattern: /antigravity\.google/i },
  { key: 'omitted-resource', pattern: /sachmoi\.net/i },
  {
    key: 'unverified-count',
    pattern: UNVERIFIED_COUNT_PATTERN,
  },
  { key: 'dynamic-claim', pattern: DYNAMIC_CLAIM_PATTERN },
]

export const EDITORIAL_OMISSION_KEYS = OMIT_RULES.map(({ key }) => key)

export const BANNED_OUTPUT_RULES = [
  ['event-or-html', /<\/?[A-Za-z][^>]*>|dangerouslySetInnerHTML|\bon(?:click|mouseover|mouseout)\b/i],
  ['unsafe-url', /(?:javascript|data|vbscript):/i],
  ['live-campaign', /\b(?:zoom|zalo|live\s*workshop|workshop\s*trực\s*tiếp|livestream|tháng\s*5\s*[/-]\s*2026)\b|#ngay\d+|#tuan\w*/i],
  ['embedded-passcode', /\b0203\b|passcode\s*[:：]?\s*0203/i],
  ['legacy-domain', /brain2\.thongphan\.com/i],
  ['private-chat-cta', /(?:mở|truy cập|bấm|vào).{0,48}(?:brain2\s*chat|gemini\s*chat)|(?:brain2\s*chat|gemini\s*chat).{0,48}(?:mở|truy cập|bấm|vào)/i],
  ['reflection-wall', /reflection\s*wall|tường\s*(?:reflection|phản\s*tư)|(?:đăng|chia\s*sẻ).{0,48}(?:lên|vào).{0,24}(?:tường\s*phản\s*tư|reflection)/i],
  ['local-machine-path', /\/Users\/|(?:^|[\\/])\.(?:agent|gemini)(?:[\\/]|$)/i],
  ['omitted-resource', /sachmoi\.net/i],
  ['unverified-count', UNVERIFIED_COUNT_PATTERN],
  ['dynamic-claim', DYNAMIC_CLAIM_PATTERN],
  ['stale-ai-name', /\bAntigravity\b/i],
  ['stale-audience', /\b(?:mày|anh\s+em)\b/i],
]

export const emptyEditorialCounts = () =>
  Object.fromEntries([
    ...OMIT_RULES.map(({ key }) => [key, 0]),
    ['ai-tool-neutralized', 0],
    ['audience-normalized', 0],
  ])

const normalizeInstructionText = (value, counts) => {
  counts['ai-tool-neutralized'] += countMatches(value, /\bAntigravity\b/gi)
  counts['audience-normalized'] += countMatches(value, /\b(?:mày|anh\s+em)\b/gi)
  return value
    .replace(/\bAntigravity\b/gi, 'trợ lý AI')
    .replace(/\banh\s+em\b/gi, 'bạn')
    .replace(/\bmày\b/gi, 'bạn')
}

const omittedByEditorialRule = (value, counts) => {
  let omitted = false
  for (const { key, pattern } of OMIT_RULES) {
    if (!pattern.test(value)) continue
    counts[key] += 1
    omitted = true
  }
  return omitted
}

const normalizePlainText = (value, counts) =>
  normalizeInstructionText(value, counts).replace(/\s+/g, ' ').trim()

const normalizePromptText = (value, counts) => {
  const kept = []
  for (const line of value.replace(/\r\n?/g, '\n').split('\n')) {
    if (omittedByEditorialRule(line, counts)) continue
    kept.push(normalizeInstructionText(line, counts).trimEnd())
  }
  return kept.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

const externalHref = (href) => Boolean(href) && !href.startsWith('/') && !href.startsWith('#')
const retainedExternalHref = (href) => /^https:\/\//i.test(href)

export const isSafeLessonHref = (href) => {
  if (typeof href !== 'string' || href.length === 0 || href.includes('\\')) return false
  if (/^https:\/\//i.test(href)) {
    try {
      return new URL(href).protocol === 'https:'
    } catch {
      return false
    }
  }
  return /^\/(?!\/)(?:[A-Za-z0-9._~!$&'()*+,;=:@%/-])*(?:\?[A-Za-z0-9._~!$&'()*+,;=:@%/?-]*)?(?:#[A-Za-z0-9._~!$&'()*+,;=:@%/?-]*)?$/.test(
    href,
  )
}

const editorialHrefOmission = (href, counts) => {
  if (/brain2\.thongphan\.com/i.test(href)) {
    counts['legacy-domain'] += 1
    return true
  }
  if (/sachmoi\.net/i.test(href)) {
    counts['omitted-resource'] += 1
    return true
  }
  if (/antigravity\.google/i.test(href)) {
    counts['ai-tool-link'] += 1
    return true
  }
  return false
}

const normalizeRichNodes = (nodes) => {
  const merged = []
  for (const node of nodes.flat().filter(Boolean)) {
    if (node.type === 'text' && node.value.length === 0) continue
    const previous = merged.at(-1)
    if (node.type === 'text' && previous?.type === 'text') previous.value += node.value
    else merged.push(node)
  }
  if (merged[0]?.type === 'text') merged[0].value = merged[0].value.trimStart()
  if (merged.at(-1)?.type === 'text') merged.at(-1).value = merged.at(-1).value.trimEnd()
  return merged.filter((node) => node.type !== 'text' || node.value.length > 0)
}

const maskedHandler = (handler) => handler.replace(/(['"])[^'"]*\1/g, "'<literal>'").replace(/\s+/g, '')

const COPY_HANDLER_PATTERNS = [
  /^navigator\.clipboard\.writeText\(document\.getElementById\('<literal>'\)\.textContent\);this\.textContent='<literal>';setTimeout\(\(\)=>this\.textContent='<literal>',2000\)\s*;?$/,
  /^navigator\.clipboard\.writeText\(document\.getElementById\('<literal>'\)\.textContent\);this\.textContent='<literal>';this\.style\.background='<literal>';setTimeout\(\(\)=>\{this\.textContent='<literal>';this\.style\.background='<literal>'\},3000\)\s*;?$/,
]

const parseCopyTarget = (handler, sourceName, day) => {
  const references = [
    ...handler.matchAll(/document\.getElementById\((['"])([^'"]+)\1\)\.textContent/g),
  ]
  if (references.length !== 1 || !COPY_HANDLER_PATTERNS.some((pattern) => pattern.test(maskedHandler(handler)))) {
    fail(sourceName, `day ${day} copy button has a non-literal or unsupported handler`)
  }
  return references[0][2]
}

const isBlockAnchor = (node) =>
  node.tagName === 'a' &&
  descendants(node, (child) => ['div', 'p', 'ul', 'ol', 'h2', 'h3'].includes(child.tagName)).length > 0

const isInlineNode = (node) =>
  node.nodeName === '#text' ||
  ['span', 'strong', 'em', 'code', 'br'].includes(node.tagName) ||
  (node.tagName === 'a' && !isBlockAnchor(node))

export function normalizeLessonHtml(html, { day, sourceName = '<memory>' } = {}) {
  if (!Number.isInteger(day) || day < 1 || day > 21) fail(sourceName, 'normalization day must be 1..21')
  if (typeof html !== 'string') fail(sourceName, `day ${day} HTML must be a string`)

  const root = parseFragment(html)
  const ids = new Map()
  const buttons = []
  const inventory = {
    copyDerivedPrompts: 0,
    sourceExternalLinks: 0,
    retainedExternalLinks: 0,
    unsafeLinksRemoved: 0,
  }
  const editorialCounts = emptyEditorialCounts()

  const inventoryNode = (node) => {
    if (node.tagName) {
      const id = attr(node, 'id')
      if (id) {
        if (ids.has(id)) fail(sourceName, `day ${day} contains duplicate ID`)
        ids.set(id, node)
      }
      if (node.tagName === 'button') buttons.push(node)
      if (node.tagName === 'a' && externalHref(attr(node, 'href'))) inventory.sourceExternalLinks += 1
    }
    for (const child of node.childNodes ?? []) inventoryNode(child)
  }
  inventoryNode(root)

  const usedTargets = new Set()
  const targetPrompts = new Map()
  for (const button of buttons) {
    const handler = attr(button, 'onclick')
    if (!handler) fail(sourceName, `day ${day} copy button is missing a handler`)
    const targetId = parseCopyTarget(handler, sourceName, day)
    const target = ids.get(targetId)
    if (!target) fail(sourceName, `day ${day} copy button target is missing`)
    if (usedTargets.has(targetId)) fail(sourceName, `day ${day} copy button target is reused`)
    usedTargets.add(targetId)
    const label = normalizePlainText(textContent(button), editorialCounts)
    const text = normalizePromptText(textContent(target), editorialCounts)
    if (!label || !text) fail(sourceName, `day ${day} copy button target or label is empty`)
    targetPrompts.set(target, { kind: 'prompt', label, text })
  }
  inventory.copyDerivedPrompts = targetPrompts.size

  const richNodes = (nodes) => {
    const result = []
    for (const node of nodes ?? []) {
      if (node.nodeName === '#text') {
        result.push({ type: 'text', value: normalizeInstructionText(node.value, editorialCounts).replace(/\s+/g, ' ') })
        continue
      }
      if (node.tagName === 'span') {
        result.push(...richNodes(node.childNodes))
        continue
      }
      if (['strong', 'em', 'code'].includes(node.tagName)) {
        const children = normalizeRichNodes(richNodes(node.childNodes))
        if (children.length > 0) result.push({ type: node.tagName, children })
        continue
      }
      if (node.tagName === 'br') {
        result.push({ type: 'break' })
        continue
      }
      if (node.tagName === 'a') {
        const href = attr(node, 'href') ?? ''
        if (/\bAntigravity\b/i.test(textContent(node))) {
          editorialCounts['ai-tool-link'] += 1
          continue
        }
        const children = normalizeRichNodes(richNodes(node.childNodes))
        if (editorialHrefOmission(href, editorialCounts)) continue
        if (!isSafeLessonHref(href)) {
          inventory.unsafeLinksRemoved += 1
          result.push(...children)
          continue
        }
        if (retainedExternalHref(href)) inventory.retainedExternalLinks += 1
        result.push({ type: 'link', href, children })
        continue
      }
      result.push(...richNodes(node.childNodes))
    }
    return normalizeRichNodes(result)
  }

  const rawBlocks = []
  const push = (block) => rawBlocks.push(block)

  const visitChildren = (node) => {
    let inline = []
    const flushInline = () => {
      if (inline.length === 0) return
      const raw = textContent({ childNodes: inline })
      if (!omittedByEditorialRule(raw, editorialCounts)) {
        const children = richNodes(inline)
        if (children.length > 0) push({ kind: 'prose', children })
      }
      inline = []
    }

    for (const child of node.childNodes ?? []) {
      if (isInlineNode(child)) {
        inline.push(child)
        continue
      }
      flushInline()
      visit(child)
    }
    flushInline()
  }

  const visit = (node) => {
    if (targetPrompts.has(node)) {
      push(targetPrompts.get(node))
      return
    }
    if (node.tagName === 'button' || ['script', 'form', 'input', 'img', 'iframe'].includes(node.tagName)) return

    if (node.tagName === 'h2' || node.tagName === 'h3') {
      const raw = textContent(node)
      if (omittedByEditorialRule(raw, editorialCounts)) return
      const heading = normalizePlainText(raw, editorialCounts)
      if (heading) push({ kind: 'prose', heading, children: [] })
      return
    }

    if (node.tagName === 'p') {
      const raw = textContent(node)
      if (omittedByEditorialRule(raw, editorialCounts)) return
      const children = richNodes(node.childNodes)
      if (children.length > 0) push({ kind: 'prose', children })
      return
    }

    if (node.tagName === 'ul' || node.tagName === 'ol') {
      const items = []
      for (const item of (node.childNodes ?? []).filter((child) => child.tagName === 'li')) {
        const raw = textContent(item)
        if (omittedByEditorialRule(raw, editorialCounts)) continue
        const children = richNodes(item.childNodes)
        if (children.length > 0) items.push(children)
      }
      if (items.length > 0) push({ kind: 'list', ordered: node.tagName === 'ol', items })
      return
    }

    if (node.tagName === 'pre') {
      const text = normalizePromptText(textContent(node), editorialCounts)
      if (text) push({ kind: 'prompt', label: 'Mẫu làm việc', text })
      return
    }

    if (isBlockAnchor(node)) {
      const href = attr(node, 'href') ?? ''
      const raw = textContent(node)
      if (/\bAntigravity\b/i.test(raw)) {
        editorialCounts['ai-tool-link'] += 1
        return
      }
      if (omittedByEditorialRule(raw, editorialCounts) || editorialHrefOmission(href, editorialCounts)) return
      if (!isSafeLessonHref(href)) {
        inventory.unsafeLinksRemoved += 1
        visitChildren(node)
        return
      }
      const paragraphs = descendants(node, (child) => child.tagName === 'p')
        .map((paragraph) => normalizePlainText(textContent(paragraph), editorialCounts))
        .filter(Boolean)
      const title = paragraphs[0] ?? normalizePlainText(raw, editorialCounts)
      const note = paragraphs.slice(1).join(' · ')
      if (!title) return
      if (retainedExternalHref(href)) inventory.retainedExternalLinks += 1
      push({
        kind: 'resources',
        title: 'Tài nguyên tham khảo',
        items: [{ title, href, ...(note ? { note } : {}) }],
      })
      return
    }

    visitChildren(node)
  }

  visit(root)
  const prefix = `day-${String(day).padStart(2, '0')}-block-`
  const blocks = rawBlocks.map((block, index) => ({
    id: `${prefix}${String(index + 1).padStart(2, '0')}`,
    ...block,
  }))

  return { blocks, inventory, editorialCounts }
}

const richTextValue = (nodes) =>
  (nodes ?? [])
    .map((node) => {
      if (node.type === 'text') return node.value
      if (node.type === 'break') return ' '
      return richTextValue(node.children)
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()

const lessonBlockValue = (block) => {
  if (block.kind === 'prose') return [block.heading, richTextValue(block.children)].filter(Boolean).join(' ').trim()
  if (block.kind === 'list') return block.items.map(richTextValue).filter(Boolean).join(' · ')
  if (block.kind === 'callout' || block.kind === 'deliverable') {
    return [block.title, richTextValue(block.children)].filter(Boolean).join(' ').trim()
  }
  return ''
}

const EXERCISE_MARKER = /\b(?:bài\s*tập|thực\s*hành|làm\s*ngay|đầu\s*ra|hoàn\s*thành)\b/i

export function deriveProtectedLessonBody(blocks, publicMeta, slug) {
  const candidates = blocks.map((block, index) => ({ block, index, text: lessonBlockValue(block) }))
  const exerciseIndex = candidates.find(({ text }) => EXERCISE_MARKER.test(text))?.index ?? -1
  const beforeExercise = candidates.slice(0, exerciseIndex < 0 ? candidates.length : exerciseIndex)
  const reason =
    beforeExercise.find(
      ({ block, text }) =>
        block.kind === 'prose' &&
        block.children?.length > 0 &&
        text.length >= 12 &&
        !/^Ngày\s+\d+\b/i.test(text),
    )?.text ?? publicMeta.preview

  const afterExercise = candidates.slice(exerciseIndex + 1)
  const artifact =
    afterExercise.find(
      ({ block, text }) =>
        ['prose', 'callout', 'deliverable'].includes(block.kind) &&
        text.length >= 12 &&
        !EXERCISE_MARKER.test(text),
    ) ?? null
  const artifactText = artifact?.text ?? publicMeta.objective
  const artifactBody =
    artifact?.block.kind === 'prose' && artifact.block.children.length > 0
      ? structuredClone(artifact.block.children)
      : [{ type: 'text', value: artifact?.text ?? publicMeta.promise }]

  const labels = []
  const addLabel = (value) => {
    const label = value.replace(/\s+/g, ' ').trim()
    if (label && !labels.includes(label)) labels.push(label)
  }
  const exerciseList = afterExercise.find(({ block }) => block.kind === 'list')?.block
  for (const item of exerciseList?.items ?? []) addLabel(richTextValue(item))
  for (const value of [artifactText, ...afterExercise.map(({ text }) => text), publicMeta.objective, publicMeta.preview]) {
    if (labels.length >= 2) break
    addLabel(value)
  }

  return {
    reason,
    deliverable: { title: artifactText, body: artifactBody },
    checklist: labels.slice(0, 3).map((label, index) => ({
      id: `${slug}-check-${String(index + 1).padStart(2, '0')}`,
      label,
    })),
  }
}


export function buildManifest(packages, stats) {
  if (packages.length !== 21) throw new Error('manifest requires exactly 21 lesson metadata records')
  const publicCount = packages.filter(({ meta }) => meta.access === 'public').length
  const protectedCount = packages.filter(({ meta }) => meta.access === 'conan-maker').length
  return {
    schemaVersion: 1,
    releaseId: RELEASE_ID,
    migratedAt: MIGRATED_AT,
    source: { sha256: stats.sourceSha256 },
    counts: {
      lessons: packages.length,
      public: publicCount,
      protected: protectedCount,
      copyDerivedPrompts: stats.copyDerivedPrompts,
      sourceExternalLinks: stats.sourceExternalLinks,
      retainedExternalLinks: stats.retainedExternalLinks,
    },
    lessons: packages.map(({ meta }) => ({
      ...meta,
      ...(meta.access === 'conan-maker'
        ? { storageKey: `brain2:21:${RELEASE_ID}:day:${String(meta.day).padStart(2, '0')}` }
        : {}),
    })),
  }
}
