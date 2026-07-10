import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getAllLibraryNotes,
  getLibraryBacklinks,
  getLibraryNoteBySlug,
  getLibrarySlugs,
  JOURNEY_LABELS,
  READER_STATE_LABELS,
  RELATION_LABELS,
  SECTION_LABELS,
  type LibraryNoteMeta,
  type LibraryRelatedLink,
} from '@/lib/library'
import LibraryArticle from './LibraryArticle'

interface HydratedLink extends LibraryRelatedLink {
  note: LibraryNoteMeta
}

export const dynamicParams = false

export async function generateStaticParams() {
  return getLibrarySlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const note = await getLibraryNoteBySlug(slug)

  if (!note) return { title: 'Không tìm thấy note' }

  return {
    title: `${note.title} — Ghi chú sống Thông Phan`,
    description: note.description,
    alternates: {
      canonical: `/library/${note.slug}`,
    },
    authors: [{ name: note.author, url: 'https://thongphan.com/about' }],
    category: SECTION_LABELS[note.section],
    keywords: note.tags,
    openGraph: {
      title: note.title,
      description: note.description,
      url: `/library/${note.slug}`,
      type: 'article',
      publishedTime: note.publishedAt,
      modifiedTime: note.updatedAt,
      authors: [note.author],
      section: SECTION_LABELS[note.section],
      tags: note.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: note.title,
      description: note.description,
    },
  }
}

function hydrateLinks(links: LibraryRelatedLink[], notes: LibraryNoteMeta[]): HydratedLink[] {
  return links.flatMap((link) => {
    const target = notes.find((note) => note.slug === link.slug)
    return target ? [{ ...link, note: target }] : []
  })
}

export default async function LibraryNotePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const note = await getLibraryNoteBySlug(slug)

  if (!note) notFound()

  const allNotes = getAllLibraryNotes()
  const relatedLinks = hydrateLinks(note.relatedLinks, allNotes)
  const backlinks = hydrateLinks(getLibraryBacklinks(note.slug), allNotes)

  return (
    <LibraryArticle
      note={note}
      relatedLinks={relatedLinks}
      backlinks={backlinks}
      labels={{
        section: SECTION_LABELS[note.section],
        journey: JOURNEY_LABELS[note.journey],
        readerState: READER_STATE_LABELS[note.readerState],
        relations: RELATION_LABELS,
      }}
    />
  )
}
