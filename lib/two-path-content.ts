import evidence from '../content/proof/origin-story-evidence.json'
import type { PathKey } from './two-path-links'

function claimText(id: string) {
  const claim = evidence.claims.find((item) => item.id === id)
  if (!claim) throw new Error(`Missing origin story claim: ${id}`)
  return claim.text
}

export type PathDoorCopy = {
  path: PathKey
  label: string
  description: string
  shortLabel: string
  photoId: 'door-tensai' | 'door-conan'
}

const doors = [
  {
    path: 'tensai',
    label: 'Tôi đi làm',
    description: 'Học dùng AI cho việc thật mỗi ngày, cùng Tensai.',
    shortLabel: 'Tôi đi làm',
    photoId: 'door-tensai',
  },
  {
    path: 'conan',
    label: 'Tôi đang hoặc muốn kinh doanh',
    description: 'Xây doanh nghiệp trong kỷ nguyên AI, cùng Conan School.',
    shortLabel: 'Tôi kinh doanh',
    photoId: 'door-conan',
  },
] as const satisfies readonly PathDoorCopy[]

export const homeContent = {
  eyebrow: 'Thông Phan · người dẫn đường',
  title: 'AI đang đổi cách chúng ta làm việc và làm ăn. Bạn đang đứng ở phía nào?',
  hero: { photoId: 'home-hero', mobilePhotoId: 'home-hero-mobile' },
  doors,
  resume: { prefix: 'Lần trước bạn xem', action: 'Tiếp tục' },
  letter: {
    title: 'Vì sao tui chia làm hai đường',
    paragraphs: [
      `Tui từng thắng sự chú ý và thua ở sản phẩm cốt lõi. ${claimText('hstl-debt')} Điều tui tiếc nhất không phải lần thất bại đó, mà là những bài học đã để trôi mất.`,
      'Giờ AI đang đổi cách chúng ta làm việc và làm ăn nhanh hơn mọi lần tui từng thấy. Người đi làm và người kinh doanh đứng trước hai câu hỏi khác nhau, nên tui không nhét cả hai vào một chỗ.',
      'Nếu bạn đi làm, Tensai giúp bạn học dùng AI cho chính công việc mỗi ngày, từng bài ngắn một. Nếu bạn đang hoặc muốn kinh doanh, Conan School là cộng đồng nơi bạn xây doanh nghiệp cùng những người đang làm thật.',
      'Chọn một cửa. Tui đi cùng bạn đoạn đầu.',
    ],
    signature: 'Thông Phan',
    portraitId: 'founder-portrait',
  },
  fieldNotes: {
    title: 'Việc thật, không phải lời hứa',
    photoId: 'field-content-class',
    cards: [
      {
        claimId: 'rebuild-twelve-thousand-shares',
        text: 'Một bài viết vượt 12.000 lượt chia sẻ sau 14 tháng gần như không ai đọc.',
        href: '/about#origin-act-rebuilding',
        linkLabel: 'Đọc trong câu chuyện',
      },
      {
        claimId: 'brain2-twenty-one-outputs',
        text: 'Brain2 đang chạy thật: 21 ngày, 21 đầu ra quan sát được.',
        href: '/brain2/21-ngay',
        linkLabel: 'Xem lộ trình 21 ngày',
      },
    ],
  },
  closing: { title: 'Bắt đầu từ chỗ bạn đang đứng' },
} as const

export const tensaiContent = {
  eyebrow: 'Tensai · cho người đi làm',
  title: 'Bất kỳ ai cũng là thiên tài nếu được học đúng cách.',
  lead: 'Tensai là nơi tui đặt những bài học ngắn để bạn dùng AI cho chính việc mình đang làm: hiểu AI làm được gì, giao việc có căn cứ và tự kiểm kết quả trước khi gửi đi.',
  primaryCta: 'Học thử miễn phí',
  secondaryCta: { label: 'Xem các khóa đang mở', href: '#khoa-hoc' },
  launchNote: 'Tensai mở từ 30/09/2026. Bạn là một trong những người học đầu tiên.',
  heroPhotoId: 'tensai-map',
  situations: {
    title: 'Bạn có đang gặp một trong ba chuyện này?',
    items: [
      {
        problem: 'Mỗi tuần làm lại cùng một bản báo cáo bằng tay.',
        course: 'Workflow AI cơ bản',
        lessons: ['Dựng và chạy một workflow báo cáo'],
      },
      {
        problem: 'AI trả lời rất trôi chảy, nhưng bạn không chắc nó đúng.',
        course: 'Hiểu về AI',
        lessons: ['Vì sao AI có thể nói sai?', 'Giao việc để AI có đủ căn cứ'],
      },
      {
        problem: 'Phải viết nội dung mà không biết nói gì cho khác người.',
        course: 'Định vị',
        lessons: ['Để mỗi nội dung có một lý do'],
      },
    ],
  },
  courses: {
    id: 'khoa-hoc',
    title: 'Các khóa đang mở',
    items: [
      {
        name: 'Workflow AI cơ bản',
        tagline: 'Hiểu từ gốc. Thiết kế có lý do. Tự làm báo cáo của bạn.',
        scale: '15 bài, 5 màn vượt ải',
        opensOn: '30/09/2026',
      },
      {
        name: 'Hiểu về AI',
        tagline: 'Hiểu cách LLM hoạt động. Dùng AI có căn cứ.',
        scale: '6 bài, 2 màn vượt ải',
        opensOn: '30/09/2026',
      },
      {
        name: 'Định vị',
        tagline: 'Để mỗi nội dung có một lý do.',
        scale: '12 bài, 4 màn vượt ải',
        opensOn: '01/10/2026',
      },
    ],
    note: 'Danh sách đối chiếu ngày 13/10/2026.',
  },
  method: {
    title: 'Đừng chỉ xem. Thử làm một chút.',
    steps: [
      { title: 'Một bài, một ý.', body: 'Mỗi bài ngắn, đi từ khởi động đến tự vận dụng.' },
      { title: 'Thử ngay trong bài.', body: 'Bạn chạm, chọn, viết thử; sai thì sửa tiếp.' },
      { title: 'Vượt ải để biết mình làm được.', body: 'Cứ vài bài có một màn vượt ải với tình huống mới.' },
    ],
    photoId: 'tensai-lesson',
  },
  closing: {
    title: 'Bắt đầu bằng một bài ngắn.',
    crossLink: { label: 'Bạn đang kinh doanh? Xem Conan School', href: '/conan' },
  },
} as const

// The first item is shown large; the rest are grouped by kind of activity.
const galleryItems = [
  { photoId: 'gallery-ai-factory', kind: 'Lớp học' },
  { photoId: 'gallery-ai-factory-design', kind: 'Lớp học' },
  { photoId: 'gallery-decision-making', kind: 'Offline' },
  { photoId: 'gallery-content-flow-haus', kind: 'Offline' },
  { photoId: 'gallery-katinat', kind: 'Offline' },
  { photoId: 'gallery-manulife', kind: 'Đào tạo doanh nghiệp' },
  { photoId: 'gallery-after-class', kind: 'Sau giờ học' },
] as const

export const conanContent = {
  eyebrow: 'Conan School · cộng đồng cho người xây doanh nghiệp',
  title: 'Xây doanh nghiệp đầu tiên trong kỷ nguyên AI.',
  lead: 'Conan School là cộng đồng dành cho những người bắt đầu hành trình xây dựng doanh nghiệp trong kỷ nguyên AI. Bạn học business bằng cách hiểu khách hàng, thiết kế offer, xây sản phẩm thật và cải tiến với AI.',
  primaryCta: 'Vào Conan School',
  heroPhotoId: 'conan-hero',
  heroMobilePhotoId: 'conan-hero-mobile',
  // Source: Brain2 note 02-Projects/Conan School.md (not yet published on the Conan School site).
  principle: {
    text: 'Chúng tôi không hứa giúp bạn đi nhanh nhất. Chúng tôi giúp bạn không đi sai.',
    source: 'Kim chỉ nam của Conan School',
  },
  audiences: {
    title: 'Conan School dành cho ai',
    items: [
      {
        title: 'Bạn muốn bắt đầu kinh doanh',
        body: 'Bạn có chuyên môn hoặc một ý tưởng, nhưng chưa biết biến nó thành thứ người khác muốn mua. Bạn muốn đi đúng từ đầu.',
      },
      {
        title: 'Bạn đang kinh doanh',
        body: 'Bạn muốn hiểu khách hàng sâu hơn, làm lại offer và cách truyền đạt, và đưa AI vào việc thật.',
      },
    ],
  },
  journey: {
    title: 'Từ một câu hỏi đến năng lực của một Builder.',
    lead: 'Mỗi khóa học trả lời một Clarity Question. Đi hết chuỗi này, bạn xây đủ năng lực để học, nghĩ, hiểu người, chọn đúng cuộc chơi, tạo offer, truyền đạt và xây thứ chạy được.',
    stages: [
      {
        number: '01',
        name: 'Learn & Think',
        questions: ['Tôi có biết học không?', 'Tôi có nghĩ rõ không?', 'Điều tôi tin có đứng vững không?'],
      },
      { number: '02', name: 'Understand', questions: ['Tôi có hiểu người không?', 'Tôi có hiểu đúng problem không?'] },
      {
        number: '03',
        name: 'Choose & Create',
        questions: ['Tôi có chọn đúng game không?', 'Tôi có tạo thứ đáng mua không?'],
      },
      {
        number: '04',
        name: 'Communicate & Sell',
        questions: [
          'Tôi có biết cần nói gì không?',
          'Tôi có làm người khác nhìn thấy không?',
          'Tôi có hiểu vì sao họ quyết định mua không?',
        ],
      },
      { number: '05', name: 'Build', questions: ['Tôi có thể biến idea thành thứ chạy được không?'] },
    ],
  },
  gallery: {
    title: 'Ở Conan, việc học diễn ra như thế này',
    items: galleryItems,
    photoIds: galleryItems.map((item) => item.photoId),
  },
  mentors: {
    title: 'Người dẫn đường',
    people: [
      { name: 'Đắc Nguyễn', role: 'CEO Conan School', photoId: 'mentor-dac-nguyen' },
      { name: 'Thông Phan', role: 'CMO Conan School', photoId: 'mentor-thong-phan' },
    ],
  },
  closing: {
    title: 'Đi cùng những người đang làm thật.',
    crossLink: { label: 'Bạn đang đi làm? Xem Tensai', href: '/tensai' },
  },
} as const

export const aboutPathContent = {
  title: 'Vì sao có hai con đường',
  paragraphs: [
    'AI đang đổi cách chúng ta làm việc và làm ăn nhanh hơn mọi lần tui từng thấy. Người đi làm và người kinh doanh đứng trước hai câu hỏi khác nhau, nên tui không nhét cả hai vào một chỗ.',
    'Nếu bạn đi làm, Tensai giúp bạn học dùng AI cho chính công việc mỗi ngày. Nếu bạn đang hoặc muốn kinh doanh, Conan School là cộng đồng nơi bạn xây doanh nghiệp cùng những người đang làm thật.',
  ],
  proofLink: { label: 'Xem nguồn và bằng chứng', href: '/library/proof-stack-thong-phan-2026' },
} as const
