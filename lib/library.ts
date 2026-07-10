// lib/library.ts
// Thin wrapper over generated living-library data.

export type {
  LibraryHeading,
  LibraryJourney,
  LibraryNote,
  LibraryNoteMeta,
  LibraryReaderState,
  LibraryRelatedLink,
  LibraryRelation,
  LibrarySection,
  LibraryStatus,
  LibraryType,
} from './library-data.generated'

export {
  getAllLibraryNotes,
  getLibraryBacklinks,
  getLibraryNoteBySlug,
  getLibrarySlugs,
} from './library-data.generated'

export const SECTION_LABELS = {
  concepts: 'Khái niệm',
  materials: 'Nguyên liệu',
  patterns: 'Mẫu',
  structures: 'Cấu trúc',
  templates: 'Khung thực hành',
  maps: 'Bản đồ',
  proof: 'Bằng chứng',
} as const

export const SECTION_DESCRIPTIONS = {
  concepts: 'Khái niệm gốc, định nghĩa và mental model.',
  materials: 'Story, observation, raw insight và proof nguồn.',
  patterns: 'Mẫu vận hành đã thấy lặp lại.',
  structures: 'Framework và logic bên dưới một hệ thống.',
  templates: 'Mẫu có thể điền, dùng lại hoặc chuyển thành tài sản.',
  maps: 'MOC và bản đồ đọc theo hành trình.',
  proof: 'Proof/case có provenance để chứng minh luận điểm.',
} as const

export const JOURNEY_LABELS = {
  'so-ai': 'Sợ AI',
  'dung-ai-dung-cach': 'Dùng AI đúng cách',
  brain2: 'Brain2',
  'content-keo-khach': 'Content kéo khách',
  'tai-san-so': 'Tài sản số',
  conan: 'Conan',
} as const

export const READER_STATE_LABELS = {
  'nhe-nhom': 'Nhẹ nhõm',
  'sang-to': 'Sáng tỏ',
  'kiem-soat': 'Kiểm soát',
} as const

export const STATUS_LABELS = {
  seed: 'Seed',
  growing: 'Growing',
  permanent: 'Permanent',
  evergreen: 'Evergreen',
} as const

export const RELATION_LABELS = {
  supports: 'Nâng đỡ',
  examples: 'Ví dụ',
  usedIn: 'Dùng trong',
  next: 'Đọc tiếp',
  contrasts: 'Tương phản',
  prerequisite: 'Cần trước',
} as const
