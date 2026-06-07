// scripts/generate-blog-data.mjs
// Pre-compile all blog markdown files into a TypeScript data file
// Run this before `next build` to avoid fs module issues in Turbopack workers

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
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'blog')
const OUTPUT_FILE = path.join(__dirname, '..', 'lib', 'blog-data.generated.ts')

function calculateReadingTime(content) {
  const words = content.trim().split(/\s+/).length
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
    headings.push({ level: parseInt(match[1]), id: match[2], text })
  }
  return headings
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildMidCtaHtml(data) {
  const cta = data.midCta
  if (!cta || !cta.href || !cta.title) return ''

  const label = escapeHtml(cta.label || 'Chỗ này đáng dừng lại')
  const title = escapeHtml(cta.title)
  const body = escapeHtml(cta.body || '')
  const href = escapeHtml(cta.href)
  const action = escapeHtml(cta.cta || 'Đi tiếp')

  return `
<aside class="blog-mid-cta" aria-label="${label}">
  <div class="blog-mid-cta__label">${label}</div>
  <p class="blog-mid-cta__title">${title}</p>
  ${body ? `<p class="blog-mid-cta__body">${body}</p>` : ''}
  <a class="blog-mid-cta__link" href="${href}">${action}</a>
</aside>
`
}

function injectMidCta(contentHtml, data) {
  const ctaHtml = buildMidCtaHtml(data)
  if (!ctaHtml) return contentHtml

  const h2Matches = [...contentHtml.matchAll(/<h2\b/gi)]
  if (h2Matches.length >= 3) {
    const insertionIndex = h2Matches[2].index
    return `${contentHtml.slice(0, insertionIndex)}${ctaHtml}${contentHtml.slice(insertionIndex)}`
  }

  const hrIndex = contentHtml.lastIndexOf('<hr>')
  if (hrIndex > 0) {
    return `${contentHtml.slice(0, hrIndex)}${ctaHtml}${contentHtml.slice(hrIndex)}`
  }

  return `${contentHtml}${ctaHtml}`
}

function remarkCustomDirectives() {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const data = node.data || (node.data = {})
        const tagName = node.name
        if (tagName === 'callout') {
          data.hName = 'div'
          data.hProperties = {
            className: ['blog-callout'],
            'data-label': node.attributes?.label || 'Lưu ý',
          }
        } else if (tagName === 'pullquote') {
          data.hName = 'blockquote'
          data.hProperties = { className: ['blog-pullquote'] }
        } else if (tagName === 'takeaway') {
          data.hName = 'div'
          data.hProperties = { className: ['blog-takeaway'] }
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
    .use(remarkCustomDirectives)
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

async function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error('Content directory not found:', CONTENT_DIR)
    process.exit(1)
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'))
  console.log(`Processing ${files.length} blog posts...`)

  const posts = []

  for (const file of files) {
    const slug = file.replace(/\.md$/, '')
    const filePath = path.join(CONTENT_DIR, file)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    console.log(`  - ${slug}`)
    const contentHtml = injectMidCta(await processMarkdown(content), data)
    const headings = extractHeadings(contentHtml)
    const calculatedReadingTime = data.readingTime || calculateReadingTime(content)

    posts.push({
      ...data,
      slug,
      calculatedReadingTime,
      contentHtml,
      headings,
    })
  }

  // Sort by publishedAt DESC
  posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

  // Generate TypeScript file
  const tsContent = `// AUTO-GENERATED by scripts/generate-blog-data.mjs
// Run \`npm run generate-blog\` to regenerate
// DO NOT EDIT MANUALLY

export interface TOCHeading {
  id: string
  text: string
  level: number
}

export interface ArticleCta {
  label?: string
  title: string
  body?: string
  href: string
  cta: string
}

export interface PostMeta {
  slug: string
  title: string
  description: string
  category: string
  tags?: string[]
  journey?: string
  readerState?: string
  promise?: string
  proof?: string
  midCta?: ArticleCta
  endCta?: ArticleCta
  publishedAt: string
  updatedAt?: string
  readingTime?: number
  calculatedReadingTime: number
  featured?: boolean
  series?: string
  seriesOrder?: number
  coverImage?: string
  ogImage?: string
}

export interface Post extends PostMeta {
  contentHtml: string
  headings: TOCHeading[]
}

export const blogPosts: Post[] = ${JSON.stringify(posts, null, 2)}

export function getAllPosts(): PostMeta[] {
  return blogPosts.map(({ contentHtml, headings, ...meta }) => meta)
}

export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug)
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return blogPosts.find((p) => p.slug === slug) || null
}
`

  fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf-8')
  console.log(`\n✅ Generated ${OUTPUT_FILE}`)
  console.log(`   ${posts.length} posts, sorted by publishedAt DESC`)
}

main().catch(console.error)
