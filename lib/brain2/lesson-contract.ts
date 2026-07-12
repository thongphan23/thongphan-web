export type Brain2LessonAccess = 'public' | 'conan-maker'
export type RichTextNode =
  | { type: 'text'; value: string }
  | { type: 'strong' | 'em' | 'code'; children: RichTextNode[] }
  | { type: 'link'; href: string; children: RichTextNode[] }
  | { type: 'break' }

export type Brain2LessonBlock =
  | { id: string; kind: 'prose'; heading?: string; children: RichTextNode[] }
  | { id: string; kind: 'list'; ordered: boolean; items: RichTextNode[][] }
  | { id: string; kind: 'callout'; tone: 'principle' | 'tip' | 'warning' | 'example'; title?: string; children: RichTextNode[] }
  | { id: string; kind: 'prompt'; label: string; text: string }
  | { id: string; kind: 'resources'; title: string; items: Array<{ title: string; href: string; note?: string }> }
  | { id: string; kind: 'deliverable'; title: string; children: RichTextNode[] }

export interface Brain2LessonMeta {
  schemaVersion: 1
  day: number
  slug: string
  week: 1 | 2 | 3
  access: Brain2LessonAccess
  title: string
  promise: string
  objective: string
  estimatedMinutes: { min: number; max: number }
  preview: string
  sourceFragmentSha256: string
  contentSha256: string
  migratedAt: string
  editorialState: 'reviewed'
}

export interface Brain2LessonPackage {
  meta: Brain2LessonMeta
  reason: string
  blocks: Brain2LessonBlock[]
  deliverable: { title: string; body: RichTextNode[] }
  checklist: Array<{ id: string; label: string }>
}
