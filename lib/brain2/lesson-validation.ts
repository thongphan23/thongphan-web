import type {
  Brain2LessonBlock,
  Brain2LessonMeta,
  Brain2LessonPackage,
  RichTextNode,
} from './lesson-contract'
import { isExternalLessonHref, isInternalLessonHref } from './lesson-hrefs'

type JsonRecord = Record<string, unknown>

const META_KEYS = [
  'schemaVersion',
  'day',
  'slug',
  'week',
  'access',
  'title',
  'promise',
  'objective',
  'estimatedMinutes',
  'preview',
  'sourceFragmentSha256',
  'contentSha256',
  'migratedAt',
  'editorialState',
] as const

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const hasExactKeys = (value: unknown, expected: readonly string[]): value is JsonRecord => {
  if (!isRecord(value)) return false
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index])
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isSafeHref = (value: unknown): value is string =>
  typeof value === 'string' && (isExternalLessonHref(value) || isInternalLessonHref(value))

const stableValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stableValue)
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .filter((key) => value[key] !== undefined)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    )
  }
  return value
}

export const stableJsonStringify = (value: unknown): string => JSON.stringify(stableValue(value))

export async function brain2LessonContentSha256(
  value: Pick<Brain2LessonPackage, 'reason' | 'blocks' | 'deliverable' | 'checklist'>,
): Promise<string | null> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) return null
  const body = {
    reason: value.reason,
    blocks: value.blocks,
    deliverable: value.deliverable,
    checklist: value.checklist,
  }
  try {
    const digest = await subtle.digest('SHA-256', new TextEncoder().encode(stableJsonStringify(body)))
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  } catch {
    return null
  }
}

const validateRichText = (value: unknown): value is RichTextNode[] => {
  if (!Array.isArray(value)) return false
  return value.every((node) => {
    if (!isRecord(node) || typeof node.type !== 'string') return false
    if (node.type === 'text') {
      return hasExactKeys(node, ['type', 'value']) && isNonEmptyString(node.value)
    }
    if (node.type === 'break') return hasExactKeys(node, ['type'])
    if (node.type === 'strong' || node.type === 'em' || node.type === 'code') {
      return hasExactKeys(node, ['type', 'children']) && validateRichText(node.children)
    }
    if (node.type === 'link') {
      return hasExactKeys(node, ['type', 'href', 'children']) &&
        isSafeHref(node.href) &&
        validateRichText(node.children)
    }
    return false
  })
}

const validateBlock = (value: unknown): value is Brain2LessonBlock => {
  if (!isRecord(value) || !isNonEmptyString(value.id) || typeof value.kind !== 'string') return false

  if (value.kind === 'prose') {
    const hasHeading = Object.hasOwn(value, 'heading')
    return hasExactKeys(value, hasHeading ? ['id', 'kind', 'heading', 'children'] : ['id', 'kind', 'children']) &&
      (!hasHeading || isNonEmptyString(value.heading)) &&
      validateRichText(value.children) &&
      (value.children.length > 0 || hasHeading)
  }

  if (value.kind === 'list') {
    return hasExactKeys(value, ['id', 'kind', 'ordered', 'items']) &&
      typeof value.ordered === 'boolean' &&
      Array.isArray(value.items) &&
      value.items.length > 0 &&
      value.items.every(validateRichText)
  }

  if (value.kind === 'callout') {
    const hasTitle = Object.hasOwn(value, 'title')
    return hasExactKeys(value, hasTitle ? ['id', 'kind', 'tone', 'title', 'children'] : ['id', 'kind', 'tone', 'children']) &&
      (value.tone === 'principle' || value.tone === 'tip' || value.tone === 'warning' || value.tone === 'example') &&
      (!hasTitle || isNonEmptyString(value.title)) &&
      validateRichText(value.children)
  }

  if (value.kind === 'prompt') {
    return hasExactKeys(value, ['id', 'kind', 'label', 'text']) &&
      isNonEmptyString(value.label) &&
      isNonEmptyString(value.text)
  }

  if (value.kind === 'resources') {
    return hasExactKeys(value, ['id', 'kind', 'title', 'items']) &&
      isNonEmptyString(value.title) &&
      Array.isArray(value.items) &&
      value.items.length > 0 &&
      value.items.every((item) => {
        if (!isRecord(item)) return false
        const hasNote = Object.hasOwn(item, 'note')
        return hasExactKeys(item, hasNote ? ['title', 'href', 'note'] : ['title', 'href']) &&
          isNonEmptyString(item.title) &&
          isSafeHref(item.href) &&
          (!hasNote || isNonEmptyString(item.note))
      })
  }

  if (value.kind === 'deliverable') {
    return hasExactKeys(value, ['id', 'kind', 'title', 'children']) &&
      isNonEmptyString(value.title) &&
      validateRichText(value.children)
  }

  return false
}

const validateMeta = (value: unknown, canonical: Brain2LessonMeta): value is Brain2LessonMeta =>
  hasExactKeys(value, META_KEYS) &&
  hasExactKeys(value.estimatedMinutes, ['min', 'max']) &&
  stableJsonStringify(value) === stableJsonStringify(canonical)

export async function validateBrain2LessonPackage(
  value: unknown,
  canonicalMeta: Brain2LessonMeta,
): Promise<Brain2LessonPackage | null> {
  if (!hasExactKeys(value, ['meta', 'reason', 'blocks', 'deliverable', 'checklist'])) return null
  if (!validateMeta(value.meta, canonicalMeta) || !isNonEmptyString(value.reason)) return null
  if (!Array.isArray(value.blocks) || value.blocks.length === 0 || !value.blocks.every(validateBlock)) return null

  const blockIds = new Set(value.blocks.map((block) => block.id))
  if (blockIds.size !== value.blocks.length) return null

  if (!hasExactKeys(value.deliverable, ['title', 'body']) ||
      !isNonEmptyString(value.deliverable.title) ||
      !validateRichText(value.deliverable.body)) return null

  if (!Array.isArray(value.checklist) || value.checklist.length === 0) return null
  const checklistIds = new Set<string>()
  for (const item of value.checklist) {
    if (!hasExactKeys(item, ['id', 'label']) || !isNonEmptyString(item.id) || !isNonEmptyString(item.label)) return null
    if (checklistIds.has(item.id)) return null
    checklistIds.add(item.id)
  }

  const lesson = value as unknown as Brain2LessonPackage
  const checksum = await brain2LessonContentSha256(lesson)
  return checksum === canonicalMeta.contentSha256 ? lesson : null
}
