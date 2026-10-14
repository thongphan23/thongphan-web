// Real photos used by /, /tensai and /conan. Files are produced by scripts/photos/ (see its README);
// width/height are the exported pixel sizes. `faces` gates publishing: anything still
// 'pending-owner-consent' is blocked by scripts/two-path-photo-consent.test.ts in test:release.
export type FaceStatus =
  | 'none' // no people or no identifiable faces
  | 'thong-only' // only Thông is identifiable
  | 'blurred' // bystander faces blurred locally
  | 'consent-confirmed' // owner confirmed consent (record who/when in consentNote)
  | 'pending-owner-consent' // identifiable people, consent not yet confirmed

export type TwoPathPhoto = {
  id: string
  src: `/images/two-path/${string}.webp`
  width: number
  height: number
  alt: string
  caption?: string
  source: string // original file or public album URL
  faces: FaceStatus
  consentNote?: string
  budgetBytes: number
  focal?: { x: number; y: number } // object-position hint for responsive crops
}

const KB = 1024
const CONAN_ALBUM = 'https://image.conan.school/media-library/5c000000-0001-4000-8000-000000000001/'

const records = [
  {
    id: 'home-hero',
    width: 1920,
    height: 1080,
    alt: 'Thông Phan đứng trên sân khấu, quay lưng về phía máy ảnh, nói với một hội trường kín người',
    source: 'Ảnh gốc DQH179.JPG do Thông cung cấp (không commit); khán giả đã làm mờ bằng scripts/photos/blur-audience.py',
    faces: 'blurred',
    budgetBytes: 180 * KB,
    focal: { x: 0.8, y: 0.45 },
  },
  {
    id: 'home-hero-mobile',
    width: 900,
    height: 1125,
    alt: 'Thông Phan đứng trên sân khấu, quay lưng về phía máy ảnh, nói với một hội trường kín người',
    source: 'Ảnh gốc DQH179.JPG do Thông cung cấp (không commit); khán giả đã làm mờ bằng scripts/photos/blur-audience.py',
    faces: 'blurred',
    budgetBytes: 180 * KB,
  },
  {
    // Transparent cut-out: the stage hero sets Thông in front of his name, so only he is kept.
    id: 'home-stage-hero',
    width: 1098,
    height: 1200,
    alt: 'Thông Phan cầm micro, đang nói trên sân khấu tối',
    source:
      'public/images/homepage/evidence-cinema-hero-v3.webp; tách nền bằng scripts/photos/person-mask.swift (Vision), viền làm mềm 1.2px',
    faces: 'thong-only',
    budgetBytes: 180 * KB,
  },
  {
    id: 'home-stage-hero-mobile',
    width: 787,
    height: 860,
    alt: 'Thông Phan cầm micro, đang nói trên sân khấu tối',
    source:
      'public/images/homepage/evidence-cinema-hero-v3.webp; tách nền bằng scripts/photos/person-mask.swift (Vision), viền làm mềm 1.2px',
    faces: 'thong-only',
    budgetBytes: 180 * KB,
  },
  {
    id: 'founder-portrait',
    width: 736,
    height: 920,
    alt: 'Thông Phan cầm micro, đang nói trước khán giả trong một buổi chia sẻ',
    source: 'assets/branding/thongphan-speaker-hires.jpg trong kho ảnh của Thông; nền slide đã làm mờ để chữ không đọc được',
    faces: 'thong-only',
    budgetBytes: 140 * KB,
    focal: { x: 0.5, y: 0.3 },
  },
  {
    id: 'door-tensai',
    width: 640,
    height: 800,
    alt: 'Thông Phan ôm cuốn sách Thần thoại Hy Lạp trong một hiệu sách',
    source: 'public/images/homepage/proof/thong-author-book-3x2-v1.webp',
    faces: 'thong-only',
    budgetBytes: 140 * KB,
    focal: { x: 0.5, y: 0.35 },
  },
  {
    id: 'door-conan',
    width: 960,
    height: 1200,
    alt: 'Học viên ngồi quanh bàn dài, mở laptop làm bài trong lớp AI Factory',
    caption: 'Lớp học AI Factory tại Hà Nội',
    source: `${CONAN_ALBUM}589d3613-9eb2-4f6d-b6e5-b5f2d46670f5.webp`,
    faces: 'pending-owner-consent',
    budgetBytes: 140 * KB,
  },
  {
    id: 'field-content-class',
    width: 1200,
    height: 800,
    alt: 'Nhóm học viên quanh bàn họp có laptop, cười và giơ tay chào máy ảnh sau buổi học viết content',
    caption: 'Offline Hà Nội 2026 · Cùng học viết Content · Flow Haus',
    source: `${CONAN_ALBUM}239f4131-3be4-4489-aaa9-fcfdc5b45a09.webp`,
    faces: 'pending-owner-consent',
    budgetBytes: 140 * KB,
  },
  {
    id: 'tensai-map',
    width: 1080,
    height: 867,
    alt: 'Màn hình Tensai: bản đồ khóa Định vị với bốn phần học và bài tiếp theo "Định vị là gì?"',
    caption: 'Bản đồ khóa Định vị trên Tensai',
    source: 'tensai-home: docs/positioning-v8/release/screens/live-map.png (chụp app live 01/10/2026)',
    faces: 'none',
    budgetBytes: 140 * KB,
  },
  {
    id: 'tensai-lesson',
    width: 940,
    height: 867,
    alt: 'Màn hình bài học Tensai "Khách hiểu sản phẩm theo cách nào?" với ví dụ và nút thử áp dụng',
    caption: 'Mở đầu bài "Khách hiểu sản phẩm theo cách nào?"',
    source: 'tensai-home: docs/positioning-v8/release/screens/live-lesson-intro.png (chụp app live 01/10/2026)',
    faces: 'none',
    budgetBytes: 140 * KB,
  },
  {
    id: 'conan-hero',
    width: 1792,
    height: 1008,
    alt: 'Khoảng hai mươi học viên Conan School quây quanh bàn họp, cùng bắn tim về phía máy ảnh',
    caption: 'Offline Sài Gòn 2026 · Second Brain và Business',
    source: `${CONAN_ALBUM}98a49e1f-6729-4974-96ae-f4938db9aab4.webp`,
    faces: 'pending-owner-consent',
    budgetBytes: 180 * KB,
  },
  {
    id: 'conan-hero-mobile',
    width: 840,
    height: 1050,
    alt: 'Khoảng hai mươi học viên Conan School quây quanh bàn họp, cùng bắn tim về phía máy ảnh',
    caption: 'Offline Sài Gòn 2026 · Second Brain và Business',
    source: `${CONAN_ALBUM}98a49e1f-6729-4974-96ae-f4938db9aab4.webp`,
    faces: 'pending-owner-consent',
    budgetBytes: 180 * KB,
  },
  {
    id: 'gallery-ai-factory',
    width: 1200,
    height: 900,
    alt: 'Hai dãy học viên làm bài trên laptop, phía cuối phòng có người đứng hướng dẫn',
    caption: 'Lớp học AI Factory tại Hà Nội',
    source: `${CONAN_ALBUM}589d3613-9eb2-4f6d-b6e5-b5f2d46670f5.webp`,
    faces: 'pending-owner-consent',
    budgetBytes: 120 * KB,
  },
  {
    id: 'gallery-ai-factory-design',
    width: 1200,
    height: 900,
    alt: 'Học viên trao đổi quanh bàn làm việc, màn hình laptop mở tài liệu, bảng trắng ghi sơ đồ phía sau',
    caption: 'Lớp AI Factory Design · Hà Nội · 2025',
    source: `${CONAN_ALBUM}bce04c9f-a9d2-4fdb-be7f-db8d07a6c5cb.webp`,
    faces: 'pending-owner-consent',
    budgetBytes: 120 * KB,
  },
  {
    id: 'gallery-decision-making',
    width: 1200,
    height: 900,
    alt: 'Nhóm học viên ngồi quanh bàn tròn trong quán cà phê, chụp ảnh chung',
    caption: 'Offline Hà Nội 2026 · Trao đổi về Decision Making',
    source: `${CONAN_ALBUM}a6c20418-a615-4cb3-b460-cb361663e73e.webp`,
    faces: 'pending-owner-consent',
    budgetBytes: 120 * KB,
  },
  {
    id: 'gallery-content-flow-haus',
    width: 1200,
    height: 900,
    alt: 'Nhóm học viên trong phòng họp tường xanh, bàn đầy laptop, cùng giơ tay chào máy ảnh',
    caption: 'Offline Hà Nội 2026 · Cùng học viết Content · Flow Haus',
    source: `${CONAN_ALBUM}239f4131-3be4-4489-aaa9-fcfdc5b45a09.webp`,
    faces: 'pending-owner-consent',
    budgetBytes: 120 * KB,
  },
  {
    id: 'gallery-katinat',
    width: 1200,
    height: 900,
    alt: 'Học viên ngồi quanh các bàn nhỏ trong quán KATINAT, cầm ly nước và laptop, cười với máy ảnh',
    caption: 'Offline Hà Nội 2026 · KATINAT Kim Mã',
    source: `${CONAN_ALBUM}52eb03ee-a360-474b-ae62-41fd9983dbf2.webp`,
    faces: 'pending-owner-consent',
    budgetBytes: 120 * KB,
  },
  {
    id: 'gallery-manulife',
    width: 1200,
    height: 900,
    alt: 'Tám người đứng thành hàng trong phòng họp doanh nghiệp, cầm túi quà và chụp ảnh chung',
    caption: 'Training Content cho các MDRT tại Manulife · TECOS Building',
    source: `${CONAN_ALBUM}1f236f14-ec53-41ea-b6e8-6c46e6d4b2f7.webp`,
    faces: 'pending-owner-consent',
    budgetBytes: 120 * KB,
  },
  {
    id: 'gallery-after-class',
    width: 1200,
    height: 900,
    alt: 'Nhóm học viên ngồi quanh bàn lẩu trong một quán ăn nhỏ sau buổi học',
    caption: 'Đi ăn sau những giờ học căng thẳng',
    source: `${CONAN_ALBUM}22cbf614-ba02-46c8-81a9-2300091de13b.webp`,
    faces: 'pending-owner-consent',
    budgetBytes: 120 * KB,
  },
  {
    id: 'mentor-dac-nguyen',
    width: 384,
    height: 480,
    alt: 'Chân dung Đắc Nguyễn, đeo kính, mặc áo đen, giơ tay chữ V',
    source: 'https://image.conan.school/mentors/dac-nguyen.jpg',
    faces: 'pending-owner-consent',
    budgetBytes: 60 * KB,
  },
  {
    id: 'mentor-thong-phan',
    width: 368,
    height: 460,
    alt: 'Chân dung Thông Phan khoanh tay, mỉm cười trước bức tường hình bản đồ thế giới',
    source: 'https://image.conan.school/mentors/thong-phan.jpg',
    faces: 'thong-only',
    budgetBytes: 60 * KB,
  },
] as const satisfies readonly Omit<TwoPathPhoto, 'src'>[]

export type TwoPathPhotoId = (typeof records)[number]['id']

export const twoPathPhotos = Object.fromEntries(
  records.map((record): [TwoPathPhotoId, TwoPathPhoto] => [
    record.id,
    { ...record, src: `/images/two-path/${record.id}.webp` },
  ]),
) as Record<TwoPathPhotoId, TwoPathPhoto>

export function photo(id: TwoPathPhotoId): TwoPathPhoto {
  return twoPathPhotos[id]
}
