// scripts/generate-library-data.mjs
// Pre-compile living library markdown into a TypeScript data file.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'library')
const OUTPUT_FILE = path.join(__dirname, '..', 'lib', 'library-data.generated.ts')

export const SECTIONS = [
  'concepts',
  'materials',
  'patterns',
  'structures',
  'templates',
  'maps',
  'proof',
]

export const TYPES = [
  'concept',
  'material',
  'pattern',
  'structure',
  'template',
  'map',
  'proof',
  'field-guide',
]

export const JOURNEYS = [
  'so-ai',
  'dung-ai-dung-cach',
  'brain2',
  'content-keo-khach',
  'tai-san-so',
  'conan',
]

export const READER_STATES = ['nhe-nhom', 'sang-to', 'kiem-soat']
export const STATUSES = ['seed', 'growing', 'permanent', 'evergreen']
export const RESERVED_SLUGS = ['read']

export const RELATIONS = [
  'supports',
  'examples',
  'usedIn',
  'next',
  'contrasts',
  'prerequisite',
]

const REQUIRED_FIELDS = [
  'title',
  'description',
  'section',
  'type',
  'journey',
  'readerState',
  'status',
  'author',
  'publishedAt',
  'updatedAt',
  'readTime',
  'promise',
  'proof',
  'sourceTrace',
  'related',
  'tags',
]

function normalizeArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String)
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}

export function flattenRelatedLinks(related = {}) {
  return RELATIONS.flatMap((relation) =>
    normalizeArray(related[relation]).map((slug) => ({ relation, slug }))
  )
}

function normalizeRelated(related = {}) {
  return Object.fromEntries(
    RELATIONS.map((relation) => [relation, normalizeArray(related[relation])])
  )
}

export function validateLibraryNote(note) {
  const errors = []

  for (const field of REQUIRED_FIELDS) {
    if (note[field] === undefined || note[field] === null || note[field] === '') {
      errors.push(`${note.slug || 'unknown'} missing required field: ${field}`)
    }
  }

  if (!SECTIONS.includes(note.section)) errors.push(`${note.slug} has invalid section: ${note.section}`)
  if (!TYPES.includes(note.type)) errors.push(`${note.slug} has invalid type: ${note.type}`)
  if (!JOURNEYS.includes(note.journey)) errors.push(`${note.slug} has invalid journey: ${note.journey}`)
  if (!READER_STATES.includes(note.readerState)) {
    errors.push(`${note.slug} has invalid readerState: ${note.readerState}`)
  }
  if (!STATUSES.includes(note.status)) errors.push(`${note.slug} has invalid status: ${note.status}`)
  if (RESERVED_SLUGS.includes(note.slug)) {
    errors.push(`${note.slug} uses reserved route slug: ${note.slug}`)
  }

  const links = flattenRelatedLinks(note.related)
  if (links.length < 3) errors.push(`${note.slug} must have at least 3 related links`)
  if (links.some((link) => link.slug === note.slug)) {
    errors.push(`${note.slug} must not link to itself`)
  }

  return errors
}

function calculateReadingTime(content) {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

function extractHeadings(html) {
  const headings = []
  const regex = /<h([23])\s+id="([^"]*)"[^>]*>(.*?)<\/h[23]>/gi
  let match

  while ((match = regex.exec(html)) !== null) {
    const text = match[3]
      .replace(/<a\b[^>]*class="[^"]*\bheading-anchor\b[^"]*"[\s\S]*?<\/a>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/^#\s*/, '')
      .trim()
    headings.push({ level: Number.parseInt(match[1], 10), id: match[2], text })
  }

  return headings
}

function remarkLibraryDirectives() {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type !== 'containerDirective' &&
        node.type !== 'leafDirective' &&
        node.type !== 'textDirective'
      ) {
        return
      }

      const data = node.data || (node.data = {})
      const label = node.attributes?.label

      if (node.name === 'callout') {
        data.hName = 'div'
        data.hProperties = {
          className: ['library-callout'],
          'data-label': label || 'Chỗ cần giữ lại',
        }
      } else if (node.name === 'proof') {
        data.hName = 'div'
        data.hProperties = {
          className: ['library-proof-block'],
          'data-label': label || 'Proof / context',
        }
      } else if (node.name === 'template') {
        data.hName = 'div'
        data.hProperties = {
          className: ['library-template-block'],
          'data-label': label || 'Template',
        }
      } else if (node.name === 'takeaway') {
        data.hName = 'div'
        data.hProperties = {
          className: ['library-takeaway'],
          'data-label': label || 'Takeaway',
        }
      }
    })
  }
}

async function processMarkdown(content) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkLibraryDirectives)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'prepend',
      properties: { className: ['heading-anchor'], ariaHidden: true, tabIndex: -1 },
      content: {
        type: 'element',
        tagName: 'span',
        properties: { className: ['anchor-icon'] },
        children: [{ type: 'text', value: '#' }],
      },
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content)

  return String(result)
}

function validateGraphTargets(notes) {
  const slugs = new Set(notes.map((note) => note.slug))
  const errors = []

  for (const note of notes) {
    for (const link of flattenRelatedLinks(note.related)) {
      if (!slugs.has(link.slug)) {
        errors.push(`${note.slug} has related link to missing note: ${link.slug}`)
      }
    }
  }

  return errors
}

async function buildLibraryNotes() {
  if (!fs.existsSync(CONTENT_DIR)) {
    throw new Error(`Content directory not found: ${CONTENT_DIR}`)
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((file) => file.endsWith('.md'))
  const notes = []
  const errors = []

  for (const file of files) {
    const slug = file.replace(/\.md$/, '')
    const filePath = path.join(CONTENT_DIR, file)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)
    const related = normalizeRelated(data.related)
    const note = {
      ...data,
      slug,
      readTime: Number(data.readTime || calculateReadingTime(content)),
      calculatedReadTime: calculateReadingTime(content),
      sourceTrace: normalizeArray(data.sourceTrace),
      tags: normalizeArray(data.tags),
      related,
      relatedLinks: flattenRelatedLinks(related),
      contentHtml: await processMarkdown(content),
    }

    note.headings = extractHeadings(note.contentHtml)
    errors.push(...validateLibraryNote(note))
    notes.push(note)
  }

  errors.push(...validateGraphTargets(notes))

  if (errors.length > 0) {
    throw new Error(`Library validation failed:\n- ${errors.join('\n- ')}`)
  }

  return notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

function generateTypeScript(notes) {
  return `// AUTO-GENERATED by scripts/generate-library-data.mjs
// Run \`npm run generate-library\` to regenerate
// DO NOT EDIT MANUALLY

export type LibrarySection = ${SECTIONS.map((section) => JSON.stringify(section)).join(' | ')}
export type LibraryType = ${TYPES.map((type) => JSON.stringify(type)).join(' | ')}
export type LibraryJourney = ${JOURNEYS.map((journey) => JSON.stringify(journey)).join(' | ')}
export type LibraryReaderState = ${READER_STATES.map((state) => JSON.stringify(state)).join(' | ')}
export type LibraryStatus = ${STATUSES.map((status) => JSON.stringify(status)).join(' | ')}
export type LibraryRelation = ${RELATIONS.map((relation) => JSON.stringify(relation)).join(' | ')}

export interface LibraryHeading {
  id: string
  text: string
  level: number
}

export interface LibraryRelatedLink {
  relation: LibraryRelation
  slug: string
}

export type LibraryRelated = Partial<Record<LibraryRelation, string[]>>

export interface LibraryNoteMeta {
  slug: string
  title: string
  description: string
  section: LibrarySection
  type: LibraryType
  journey: LibraryJourney
  readerState: LibraryReaderState
  status: LibraryStatus
  author: string
  publishedAt: string
  updatedAt: string
  readTime: number
  calculatedReadTime: number
  promise: string
  proof: string
  sourceTrace: string[]
  related: LibraryRelated
  relatedLinks: LibraryRelatedLink[]
  tags: string[]
  cta?: {
    label?: string
    title: string
    body?: string
    href: string
    cta: string
  }
}

export interface LibraryNote extends LibraryNoteMeta {
  contentHtml: string
  headings: LibraryHeading[]
}

export const libraryNotes: LibraryNote[] = ${JSON.stringify(notes, null, 2)}

export function getAllLibraryNotes(): LibraryNoteMeta[] {
  return libraryNotes.map(({ contentHtml, headings, ...meta }) => meta)
}

export function getLibrarySlugs(): string[] {
  return libraryNotes.map((note) => note.slug)
}

export async function getLibraryNoteBySlug(slug: string): Promise<LibraryNote | null> {
  return libraryNotes.find((note) => note.slug === slug) || null
}

export function getLibraryBacklinks(slug: string): LibraryRelatedLink[] {
  return libraryNotes.flatMap((note) =>
    note.relatedLinks
      .filter((link) => link.slug === slug)
      .map((link) => ({ relation: link.relation, slug: note.slug }))
  )
}
`
}

export async function main() {
  const notes = await buildLibraryNotes()
  fs.writeFileSync(OUTPUT_FILE, generateTypeScript(notes), 'utf-8')
  console.log(`Generated ${OUTPUT_FILE}`)
  console.log(`${notes.length} library notes, sorted by updatedAt DESC`)
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])

if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })
}
