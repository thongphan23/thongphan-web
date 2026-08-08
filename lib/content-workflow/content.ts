import type { ChallengeDay } from './model'

export type ContentWorkflowDay = Readonly<{
  day: ChallengeDay
  slug: `day-0${ChallengeDay}`
  title: string
  question: string
  duration: '45–60 phút'
  concept: string
  problem: string
  artifact: string
  locked: false
  theory: readonly Readonly<{ title: string; body: string }>[]
  misconceptions: readonly Readonly<{ myth: string; correction: string }>[]
  conanCase: typeof CONAN_SCHOOL_CASE & Readonly<{ title: string; body: string; decision: string }>
  practice: readonly string[]
  qualityGate: readonly string[]
  revision: string
  aiLab: Readonly<{ duration: '20–30 phút tùy chọn'; role: string; prompt: string }>
  minimum: string
  insideConan: string
}>

export const CONAN_SCHOOL_CASE = {
  label: 'Tình huống Conan School',
  isVerifiedOperatingProof: false,
  disclosure: 'Tình huống này dùng định vị và sản phẩm thật của Conan School. Các bước workflow đang được thiết kế để giảng dạy; đây không phải bằng chứng về một quy trình vận hành hay kết quả kinh doanh đã được kiểm chứng.',
} as const

const caseFor = (title: string, body: string, decision: string) => ({ ...CONAN_SCHOOL_CASE, title, body, decision })

export const CONTENT_WORKFLOW_DAYS: readonly ContentWorkflowDay[] = [
  {
    day: 1, slug: 'day-01', locked: false, duration: '45–60 phút',
    title: 'Workflow không phải là một câu lệnh thật dài',
    question: 'Bạn đang thiết kế con đường lặp lại nào?',
    concept: 'Bản mô tả thiết kế workflow (Workflow Design Brief)',
    artifact: 'Bản mô tả workflow',
    problem: 'Bạn có thể nhận được một kết quả tốt từ AI trong một lần, nhưng lần sau lại phải giải thích từ đầu và tự vá từng chỗ. Vấn đề không nằm ở việc câu lệnh chưa đủ dài; bạn chưa xác định một con đường có điểm bắt đầu, điểm kết thúc và điều kiện kiểm tra rõ ràng.',
    theory: [
      { title: 'Một workflow là con đường có thể chạy lại', body: 'Workflow bắt đầu khi một điểm kích hoạt xuất hiện, nhận đầu vào đã biết, đi qua một chuỗi chuyển đổi và kết thúc ở một đầu ra quan sát được. Người khác phải có khả năng nhận ra lúc nào workflow bắt đầu và lúc nào nó thực sự hoàn tất.' },
      { title: 'Workflow chứa quyết định và cổng chất lượng', body: 'Một chuỗi thao tác chưa đủ. Bạn cần nhìn thấy chỗ con người phải phán đoán và cổng chất lượng (quality gate) phải vượt qua trước khi đầu ra được chuyển tiếp.' },
      { title: 'Thiết kế trước công cụ', body: 'Workflow mô tả logic công việc, không phụ thuộc ChatGPT, Claude, Notion hay một ứng dụng cụ thể. Khi logic đúng, bạn mới chọn công cụ phù hợp cho từng bước.' },
    ],
    misconceptions: [
      { myth: 'Câu lệnh chính là workflow.', correction: 'Câu lệnh chỉ là một hướng dẫn nằm trong một hoặc vài bước của workflow.' },
      { myth: 'Workflow phải tự động hóa.', correction: 'Bản đầu có thể hoàn toàn thủ công, miễn là chạy lại được và có tiêu chuẩn.' },
      { myth: 'Càng nhiều bước càng chặt chẽ.', correction: 'Chỉ giữ bước tạo ra một chuyển đổi hoặc quyết định cần thiết.' },
      { myth: 'Workflow đầu tiên phải làm mọi loại content.', correction: 'Hãy chọn đúng một đầu ra đủ hẹp để thử trong bảy ngày.' },
    ],
    conanCase: caseFor('Thu hẹp “dùng AI làm content” thành một kết quả rõ', 'Conan School chọn tình huống biến một khái niệm trong Hành trình Builder thành một tài sản học tập công khai. Đầu ra phải giúp người đọc hiểu một ý, thực hiện một hành động và tạo một sản phẩm nhỏ—không phải “làm content hay hơn” một cách chung chung.', 'Giữ một loại đầu ra là bài học chữ; chưa làm video, landing page hay chiến dịch bán hàng.'),
    practice: ['Chọn một công việc content bạn đã làm hoặc muốn làm lặp lại.', 'Ghi điểm kích hoạt khiến công việc bắt đầu và các đầu vào bạn đang có.', 'Mô tả đầu ra cuối cùng cùng người sẽ sử dụng nó.', 'Ghi vướng mắc hiện tại, phạm vi bảy ngày và ít nhất hai điều workflow này không làm.', 'Đọc lại toàn bộ bản mô tả và thu hẹp một chỗ còn mơ hồ.'],
    qualityGate: ['Đầu ra là thứ có thể nhìn thấy hoặc kiểm tra.', 'Điểm bắt đầu và điểm kết thúc không phụ thuộc một công cụ cụ thể.', 'Phạm vi đủ hẹp để chạy thử trong bảy ngày.', 'Đã ghi rõ điều không làm.'],
    revision: 'Khoanh một cụm từ mơ hồ như “hay”, “đều” hoặc “chuyên nghiệp”, rồi thay nó bằng một kết quả có thể quan sát.',
    aiLab: { duration: '20–30 phút tùy chọn', role: 'AI đóng vai người phỏng vấn và phản biện phạm vi.', prompt: 'Hãy phỏng vấn tôi từng câu để làm rõ workflow tôi muốn xây. Chỉ hỏi một câu mỗi lượt về điểm kích hoạt, đầu vào, đầu ra, người dùng đầu ra, vướng mắc, phạm vi và điều không làm. Sau khi tôi trả lời đủ, hãy chỉ ra ba chỗ còn mơ hồ và đặt câu hỏi để tôi tự quyết định; không tự thiết kế workflow cuối cùng thay tôi.' },
    minimum: 'Một bản mô tả có tên workflow, công việc lặp lại, điểm kích hoạt, đầu vào, đầu ra, người dùng, vướng mắc, phạm vi và điều không làm.',
    insideConan: 'Tinh thần “Học bằng cách xây” của Conan School được thể hiện ở việc bạn kết thúc ngày đầu bằng một sản phẩm thiết kế thật, không chỉ một danh sách kiến thức.',
  },
  {
    day: 2, slug: 'day-02', locked: false, duration: '45–60 phút',
    title: 'Chuẩn bị bối cảnh để AI không phải tự đoán',
    question: 'AI cần biết điều gì trước mỗi lần workflow chạy?',
    concept: 'Hồ sơ bối cảnh phiên bản 1 (Context Pack v1)', artifact: 'Hồ sơ bối cảnh',
    problem: 'Nếu mỗi lần chạy bạn lại kể lại doanh nghiệp, chuyên môn, đối tượng và giọng điệu theo một cách khác, đầu ra sẽ thay đổi khó đoán. Nếu bạn đổ toàn bộ tài liệu thô vào AI, thông tin quan trọng lại chìm trong nhiễu. Hồ sơ bối cảnh là lớp thông tin ổn định, đã chọn lọc để workflow dùng lại.',
    theory: [
      { title: 'Tách bối cảnh ổn định khỏi đầu vào từng lần', body: 'Định vị, người nhận, giọng điệu và giới hạn thường ổn định qua nhiều lần chạy. Chủ đề, ghi chú hay bản ghi của một lần cụ thể là đầu vào thay đổi.' },
      { title: 'Phân biệt điều đã biết và nhận định', body: 'Bạn không cần đợi mọi thông tin được kiểm chứng mới bắt đầu. Hãy ghi rõ điều đã biết, nhận định hiện tại và khoảng trống cần bổ sung để AI không biến giả định thành sự thật.' },
      { title: 'Ít nhưng có chủ đích', body: 'Một hồ sơ bối cảnh tốt đủ ngắn để đọc lại, đủ cụ thể để ra quyết định và chỉ chứa dữ liệu bạn có quyền sử dụng. Chất lượng chọn lọc quan trọng hơn số trang.' },
    ],
    misconceptions: [
      { myth: 'Càng đưa nhiều tài liệu càng tốt.', correction: 'Tài liệu không được chọn lọc làm tăng nhiễu và mâu thuẫn.' },
      { myth: 'AI đã nhớ doanh nghiệp từ các cuộc trò chuyện cũ.', correction: 'Workflow phải mang theo bối cảnh cần thiết cho mỗi lần chạy.' },
      { myth: 'Nhận định của tôi phải viết như sự thật.', correction: 'Gắn nhãn “nhận định hiện tại” là đủ để bắt đầu an toàn.' },
      { myth: 'Dữ liệu nhạy cảm làm đầu ra cá nhân hóa hơn.', correction: 'Chỉ dùng dữ liệu tối thiểu và bỏ thông tin định danh không cần thiết.' },
    ],
    conanCase: caseFor('Tạo hồ sơ bối cảnh ngắn cho Conan School', 'Hồ sơ ghi Conan School dành cho người xây lần đầu (First-Time Builder), giúp họ xây doanh nghiệp đầu tiên trong kỷ nguyên AI và học bằng cách tạo sản phẩm. Hồ sơ cũng cấm bịa thành tích, doanh thu, khách hàng hoặc lời chứng thực.', 'Chỉ giữ định vị công khai, mục tiêu học tập, giọng điệu và giới hạn; để chủ đề bài học ở phần đầu vào từng lần.'),
    practice: ['Ghi doanh nghiệp hoặc dự án, chuyên môn hoặc offer và người nhận dự kiến.', 'Liệt kê điều bạn đã biết và tách riêng nhận định hiện tại.', 'Ghi giọng điệu, điều phải làm và điều không được làm.', 'Liệt kê tài liệu có thể tham chiếu cùng khoảng trống cần bổ sung.', 'Loại bỏ dữ liệu nhạy cảm hoặc chi tiết không giúp workflow ra quyết định.'],
    qualityGate: ['Hồ sơ đủ ngắn để đọc lại trong vài phút.', 'Nhận định chưa chắc chắn được gắn nhãn rõ.', 'Không chứa dữ liệu nhạy cảm không cần thiết.', 'Có quy tắc không bịa hoặc không tự thêm tuyên bố.'],
    revision: 'Xóa một đoạn chỉ “có vẻ hữu ích” nhưng không ảnh hưởng tới bất kỳ quyết định nào trong workflow.',
    aiLab: { duration: '20–30 phút tùy chọn', role: 'AI đóng vai người phỏng vấn bối cảnh và biên tập viên rút gọn.', prompt: 'Hãy phỏng vấn tôi để tạo Hồ sơ bối cảnh cho workflow đã chọn. Tách rõ: điều đã biết, nhận định hiện tại và khoảng trống cần bổ sung. Khi tóm tắt, không thêm thành tích, khách hàng, doanh thu, bằng chứng hoặc thông tin tôi chưa cung cấp. Cuối cùng hãy chỉ ra phần nào không ảnh hưởng tới quyết định của workflow để tôi cân nhắc loại bỏ.' },
    minimum: 'Một Hồ sơ bối cảnh có danh tính, chuyên môn hoặc offer, người nhận, điều đã biết, nhận định, giọng điệu, giới hạn, tài liệu và khoảng trống.',
    insideConan: 'Conan School dành cho người đang xây doanh nghiệp đầu tiên; Conan Maker là một sản phẩm khác dành cho người đã có doanh nghiệp và đang gặp nút thắt vận hành phụ thuộc founder.',
  },
  {
    day: 3, slug: 'day-03', locked: false, duration: '45–60 phút',
    title: 'Thiết kế đích đến trước khi thiết kế các bước',
    question: 'Thế nào là một đầu ra thực sự đạt yêu cầu?',
    concept: 'Hợp đồng đầu ra (Output Contract)', artifact: 'Hợp đồng đầu ra',
    problem: '“Viết một bài thật hay, chuyên nghiệp và có chiều sâu” nghe có vẻ rõ nhưng hai người có thể hiểu hoàn toàn khác nhau. Khi đích đến mơ hồ, bạn không thể thiết kế bước, phân vai hay biết lúc nào nên dừng. Hợp đồng đầu ra biến gu và kỳ vọng thành điều có thể quan sát.',
    theory: [
      { title: 'Bắt đầu từ người dùng và mục đích', body: 'Một đầu ra chỉ tốt trong một bối cảnh sử dụng cụ thể. Hãy xác định ai sẽ dùng nó và sau khi dùng họ phải hiểu, quyết định hoặc làm được điều gì.' },
      { title: 'Chuyển tính từ thành dấu hiệu nhìn thấy', body: '“Rõ ràng” có thể trở thành “mỗi phần có một ý chính và người mới giải thích lại được”. “Thực tế” có thể trở thành “có ví dụ, hành động và sản phẩm cụ thể”.' },
      { title: 'Phản ví dụ làm ranh giới sắc hơn', body: 'Một đầu ra bóng bẩy nhưng vi phạm mục đích giúp bạn nhìn thấy điều phải tránh. Phản ví dụ đặc biệt hữu ích để ngăn AI tối ưu hình thức mà bỏ quên tác dụng.' },
    ],
    misconceptions: [
      { myth: 'Chất lượng là điều ai cũng tự hiểu.', correction: 'Chất lượng cần được mô tả bằng dấu hiệu người khác có thể kiểm tra.' },
      { myth: 'Có thể vừa viết vừa quyết định đầu ra.', correction: 'Khi đích đổi giữa đường, workflow không thể ổn định.' },
      { myth: 'Một bài tham khảo chính là hợp đồng.', correction: 'Bài tham khảo là ví dụ; hợp đồng giải thích vì sao nó phù hợp hoặc không phù hợp.' },
      { myth: 'Càng nhiều tiêu chí càng tốt.', correction: 'Chỉ giữ tiêu chí ảnh hưởng tới quyết định dùng hay sửa đầu ra.' },
    ],
    conanCase: caseFor('Định nghĩa một tài sản học tập có thể kiểm tra', 'Tài sản Conan School phải gọi tên một vấn đề Builder, dạy một khái niệm, cho thấy một quyết định, dẫn tới một hành động và tạo một sản phẩm nhỏ. Nó tránh tuyên bố thiếu căn cứ và không chỉ dừng ở cảm hứng.', 'Ưu tiên khả năng người học tạo được sản phẩm hơn độ bóng bẩy của câu chữ.'),
    practice: ['Ghi người dùng đầu ra và mục đích cụ thể.', 'Chọn định dạng, cấu trúc và giới hạn độ dài phù hợp.', 'Ghi điều bắt buộc phải có và điều phải tránh.', 'Chuyển ít nhất ba tính từ mơ hồ thành tiêu chí quan sát được.', 'Viết một phản ví dụ có vẻ ổn nhưng không đạt hợp đồng.'],
    qualityGate: ['Một người khác có thể dùng tiêu chí để tự kiểm.', 'Điều bắt buộc và điều phải tránh không mâu thuẫn.', 'Có tiêu chí ngăn bịa hoặc thêm dữ liệu.', 'Hợp đồng phù hợp với Hồ sơ bối cảnh Ngày 2.'],
    revision: 'Chọn tiêu chí khó kiểm nhất và viết lại thành một câu hỏi có thể trả lời “có” hoặc “không”.',
    aiLab: { duration: '20–30 phút tùy chọn', role: 'AI đóng vai nhà phê bình tiêu chuẩn đầu ra.', prompt: 'Đọc Hợp đồng đầu ra của tôi và tìm các từ mơ hồ, tiêu chí mâu thuẫn hoặc không thể quan sát. Với mỗi chỗ, hãy hỏi tôi một câu để chuyển nó thành dấu hiệu kiểm tra được. Sau đó tạo một phản ví dụ cố tình đạt hình thức nhưng sai mục đích; không tự sửa hợp đồng cho tới khi tôi quyết định.' },
    minimum: 'Một Hợp đồng đầu ra có người dùng, mục đích, định dạng, cấu trúc, điều phải có, điều phải tránh, tiêu chí và phản ví dụ.',
    insideConan: 'Conan ưu tiên sản phẩm thật trong hành trình học: tiêu chuẩn không chỉ hỏi người học “đã hiểu chưa” mà hỏi họ đã tạo được gì và tự kiểm bằng cách nào.',
  },
  {
    day: 4, slug: 'day-04', locked: false, duration: '45–60 phút',
    title: 'Chẻ công việc thành các bước có thể kiểm soát',
    question: 'Làm sao biến một kết quả lớn thành chuỗi chuyển đổi rõ ràng?',
    concept: 'Bản đồ workflow (Workflow Map)', artifact: 'Bản đồ workflow',
    problem: 'Khi mọi quyết định vẫn nằm trong đầu, bạn có thể tự làm nhưng không thể chạy nhất quán hoặc bàn giao. Nếu bản đồ ghi từng cú nhấp chuột, nó lại quá vụn và phụ thuộc công cụ. Một bước tốt phải biến một đầu vào đã biết thành một đầu ra có thể chuyển tiếp.',
    theory: [
      { title: 'Thiết kế ngược từ đầu ra', body: 'Bắt đầu ở đầu ra cuối và hỏi: ngay trước đó cần có gì? Lặp lại cho tới điểm kích hoạt. Cách này giúp phát hiện đầu ra trung gian bị thiếu.' },
      { title: 'Mỗi bước là một phép chuyển đổi', body: 'Một bước có tên, đầu vào, thao tác chuyển đổi và đầu ra. Nếu nó không tạo ra trạng thái mới hoặc quyết định mới, có thể đó chỉ là một nhiệm vụ nhỏ.' },
      { title: 'Hiển thị quyết định và cổng chất lượng', body: 'Điểm con người quyết định phải được viết ra. Cổng chất lượng cho biết điều kiện để chuyển sang bước sau và ngăn lỗi lan tới cuối workflow.' },
    ],
    misconceptions: [
      { myth: 'Mỗi cú nhấp là một bước.', correction: 'Gom thao tác cùng phục vụ một chuyển đổi thành một bước chính.' },
      { myth: 'Workflow luôn tuyến tính.', correction: 'Có thể quay lại bước trước khi không vượt cổng chất lượng.' },
      { myth: 'Nhiều bước đồng nghĩa kiểm soát tốt.', correction: 'Bước thừa làm tăng bàn giao và cơ hội mất bối cảnh.' },
      { myth: 'Founder cứ giữ quyết định trong đầu.', correction: 'Quyết định vô hình khiến workflow không thể bàn giao hoặc cải tiến.' },
    ],
    conanCase: caseFor('Thiết kế ngược tài sản học tập Conan School', 'Bản đồ mẫu đi từ khái niệm nguồn tới lời hứa học tập, dàn ý khái niệm và ranh giới, ví dụ làm mẫu, hành động của người học, bản nháp và kiểm tra cuối. Mỗi bước tạo một đầu ra có thể đọc trước khi chuyển tiếp.', 'Con người duyệt lời hứa học tập và sản phẩm người học phải tạo; cổng cuối kiểm tra sự thật, giọng điệu và khả năng hành động.'),
    practice: ['Đặt đầu ra cuối ở cuối bản đồ rồi thiết kế ngược.', 'Tạo từ bốn đến bảy bước chính.', 'Ghi đầu vào, chuyển đổi và đầu ra cho từng bước.', 'Đánh dấu mọi điểm con người phải phán đoán.', 'Thêm ít nhất hai cổng chất lượng và xóa một bước không tạo chuyển đổi.'],
    qualityGate: ['Có từ bốn đến bảy bước chính.', 'Mỗi bước có đầu vào, chuyển đổi và đầu ra.', 'Có ít nhất hai cổng chất lượng.', 'Quyết định của con người được nhìn thấy.', 'Không phụ thuộc một công cụ cụ thể.'],
    revision: 'Chọn một bước và thử xóa nó. Nếu đầu ra cuối không thay đổi, hãy bỏ hoặc gộp bước đó.',
    aiLab: { duration: '20–30 phút tùy chọn', role: 'AI đóng vai nhà phân tích quy trình.', prompt: 'Hãy phản biện Bản đồ workflow của tôi như một nhà phân tích quy trình. Tìm đầu ra bị bỏ quên, bước trùng, bàn giao mơ hồ, quyết định còn nằm trong đầu và trạng thái có thể mắc kẹt. Với mỗi phát hiện, chỉ đặt câu hỏi chẩn đoán và nêu rủi ro; đừng tự thêm hoặc xóa bước thay tôi.' },
    minimum: 'Một bản đồ có 4–7 bước, đầu vào và đầu ra từng bước, quyết định con người cùng ít nhất hai cổng chất lượng.',
    insideConan: 'Conan Maker quan tâm đặc biệt tới những quy trình doanh nghiệp đang phụ thuộc bối cảnh và phán đoán của founder; việc làm quyết định trở nên hữu hình là bước nền trước tự động hóa.',
  },
  {
    day: 5, slug: 'day-05', locked: false, duration: '45–60 phút',
    title: 'Phân vai đúng giữa con người, AI và công cụ',
    question: 'Ai nên làm gì và ai chịu trách nhiệm quyết định?',
    concept: 'Workflow có thể chạy (Runnable Workflow)', artifact: 'Workflow có thể chạy',
    problem: 'Giao toàn bộ workflow cho AI có thể tạo kết quả nhanh nhưng che khuất ai chịu trách nhiệm về mục tiêu, sự thật và quyết định cuối. Ngược lại, bắt con người làm mọi việc khiến AI không tạo được đòn bẩy. Phân vai đúng biến bản đồ hôm qua thành hướng dẫn có thể chạy ngay.',
    theory: [
      { title: 'AI mạnh ở phương án và chuyển đổi', body: 'AI phù hợp khi cần tạo nhiều phương án, tóm tắt, tái cấu trúc, định dạng hoặc kiểm tra theo một danh sách rõ. Nó không tự sở hữu mục tiêu hoặc chịu hậu quả kinh doanh.' },
      { title: 'Con người giữ phán đoán và sự thật', body: 'Con người chọn mục tiêu, bảo vệ bối cảnh nhạy cảm, xác nhận tuyên bố, xử lý đánh đổi và duyệt cuối. Những điểm này phải xuất hiện trong workflow.' },
      { title: 'Bàn giao cần một hợp đồng nhỏ', body: 'Mỗi bước cần nói rõ nhận gì, làm gì, trả gì, tự kiểm ra sao và chuyển toàn bộ dữ liệu nào sang bước kế tiếp.' },
    ],
    misconceptions: [
      { myth: 'Giao hết cho AI sẽ nhanh nhất.', correction: 'Bạn sẽ mất thời gian sửa khi AI phải tự đoán mục tiêu và đánh đổi.' },
      { myth: 'Một câu lệnh khổng lồ đơn giản hơn.', correction: 'Nó che giấu điểm dừng, bàn giao và nguyên nhân khi lỗi xảy ra.' },
      { myth: 'AI tự kiểm có thể thay phán đoán.', correction: 'AI có thể so theo tiêu chí; con người vẫn chịu trách nhiệm về sự thật và mức phù hợp.' },
      { myth: 'Sửa câu lệnh sẽ cứu mọi workflow.', correction: 'Lỗi có thể nằm ở bối cảnh, đầu vào, phân vai hoặc hợp đồng đầu ra.' },
    ],
    conanCase: caseFor('Đặt AI ở nơi tạo đòn bẩy cho Builder', 'AI có thể đề xuất góc học tập, cấu trúc và kiểm tra theo tiêu chí. Con người chọn luận điểm, xác nhận sự thật thương hiệu, duyệt lời hứa học tập và quyết định sản phẩm có thật sự giúp người học tiến lên.', 'Mỗi bước có hướng dẫn riêng; workflow dừng ở quyết định quan trọng thay vì để AI tự chọn và viết tới cuối.'),
    practice: ['Chọn vai trò con người, AI, phối hợp hoặc công cụ cho từng bước.', 'Viết mục đích, hướng dẫn và định dạng đầu ra cho mỗi bước.', 'Thêm quy tắc tự kiểm và dữ liệu bàn giao.', 'Đọc lại mọi điểm con người quyết định.', 'Ghép các thẻ hướng dẫn thành một workflow có thể sao chép và chạy.'],
    qualityGate: ['Mọi bước đều có người hoặc hệ thống chịu trách nhiệm.', 'Đầu vào và đầu ra cho AI cụ thể.', 'Quyết định cần phán đoán cao thuộc về con người.', 'AI không được tự xác nhận dữ liệu nó có thể đã bịa.', 'Workflow chạy được trước khi tự động hóa.'],
    revision: 'Tìm một bước đang ghi “phối hợp” nhưng không nói ai quyết định cuối; viết lại trách nhiệm đó.',
    aiLab: { duration: '20–30 phút tùy chọn', role: 'AI đóng vai người kiểm toán phân vai.', prompt: 'Hãy kiểm toán cách tôi phân vai cho từng bước. Tìm chỗ AI được giao quá nhiều quyền, con người đang làm việc lặp lại có thể giao cho AI, hoặc dữ liệu bàn giao bị thiếu. Mô phỏng một tình huống thiếu đầu vào và hỏi workflow phải dừng ở đâu. Không tự thay đổi vai trò; hãy đưa rủi ro để tôi quyết định.' },
    minimum: 'Mỗi bước có vai trò, mục đích, hướng dẫn, định dạng đầu ra, tự kiểm và bàn giao; sau đó tạo được một bản workflow có thể chạy.',
    insideConan: 'Conan xem AI là đòn bẩy cho Builder, không phải người thay thế trách nhiệm của Builder. Năng lực cốt lõi là thiết kế quyết định và dùng AI ở đúng chỗ.',
  },
  {
    day: 6, slug: 'day-06', locked: false, duration: '45–60 phút',
    title: 'Chạy thử để tìm đúng nơi workflow bị vỡ',
    question: 'Workflow hỏng ở đầu vào, bước làm hay tiêu chuẩn?',
    concept: 'Nhật ký chạy thử (Test Run Log)', artifact: 'Nhật ký chạy thử',
    problem: 'Một đầu ra tốt có thể đến từ việc bạn âm thầm cứu workflow bằng kinh nghiệm. Một đầu ra xấu cũng chưa chắc do AI yếu. Nếu không lưu đầu ra từng bước và chỗ bạn can thiệp, bạn không biết phải sửa bối cảnh, hướng dẫn, bàn giao, vai trò hay hợp đồng đầu ra.',
    theory: [
      { title: 'Workflow là giả thuyết cho tới khi chạy', body: 'Bản đồ và hướng dẫn chỉ mô tả điều bạn tin sẽ xảy ra. Một lần chạy từ đầu tới cuối tạo dữ liệu đầu tiên về nơi workflow thực sự dừng hoặc lệch.' },
      { title: 'Tách lỗi đầu ra khỏi lỗi quy trình', body: 'Đầu ra chưa đạt có thể do đầu vào thiếu, bối cảnh mơ hồ, hướng dẫn yếu, bàn giao mất dữ liệu, phân vai sai, cổng lỏng hoặc hợp đồng mâu thuẫn.' },
      { title: 'Sửa ít, chạy lại đúng chỗ', body: 'Chọn một hoặc hai lỗi lớn nhất, thay đổi workflow rồi chạy lại bước bị ảnh hưởng. Nếu sửa mọi thứ cùng lúc, bạn không biết thay đổi nào tạo ra khác biệt.' },
    ],
    misconceptions: [
      { myth: 'Một đầu ra tốt chứng minh workflow tốt.', correction: 'Có thể người chạy đã dùng hiểu biết ngầm để cứu nó.' },
      { myth: 'Âm thầm sửa thủ công vẫn là thành công.', correction: 'Can thiệp phải được ghi để biến hiểu biết ngầm thành thiết kế.' },
      { myth: 'Phải sửa mọi lỗi cùng lúc.', correction: 'Ưu tiên lỗi ảnh hưởng lớn nhất và chạy lại.' },
      { myth: 'Chỉ cần thử đầu vào dễ nhất.', correction: 'Đầu vào thực tế vừa đủ khó mới làm lộ điểm yếu hữu ích.' },
    ],
    conanCase: caseFor('Cho thấy một lỗi thay vì kể một câu chuyện hoàn hảo', 'Conan School chạy tình huống bài học với một khái niệm Builder đã thu hẹp, lưu đầu ra trung gian và ghi lại nơi con người phải can thiệp. Tình huống chỉ minh họa cách kiểm thử, không tuyên bố hiệu suất nội dung hay kết quả người học.', 'Chọn lỗi hướng dẫn lớn nhất, sửa đúng thẻ hướng dẫn và chạy lại bước liên quan trước khi đóng gói.'),
    practice: ['Chọn một đầu vào thật bạn có quyền sử dụng.', 'Chạy workflow từ đầu tới cuối và lưu đầu ra của từng bước.', 'Ghi vấn đề cùng mọi lần con người can thiệp.', 'Đánh giá đầu ra cuối theo Hợp đồng đầu ra.', 'Phân loại lỗi, sửa lỗi lớn nhất và chạy lại bước bị ảnh hưởng.'],
    qualityGate: ['Workflow đã được chạy trọn vẹn ít nhất một lần.', 'Có đầu ra thật và nhật ký từng bước.', 'Có ít nhất một lỗi hoặc can thiệp được ghi.', 'Có một thay đổi cụ thể trong workflow.', 'Kết quả chạy lại được ghi để so sánh.'],
    revision: 'Viết lại thay đổi theo dạng “Ở bước nào, thay điều gì, vì lỗi nào” thay vì ghi “cải thiện câu lệnh”.',
    aiLab: { duration: '20–30 phút tùy chọn', role: 'AI đóng vai người điều phối buổi nhìn lại.', prompt: 'Dựa trên nhật ký chạy thử, hãy hỏi tôi lần lượt: điều gì đã xảy ra, điều gì lẽ ra phải xảy ra, khoảng cách xuất hiện ở bước nào và nguyên nhân có thể thuộc nhóm nào. Giúp tôi so sánh trước và sau khi sửa, nhưng không tự tuyên bố workflow thành công và không đề nghị sửa quá hai vấn đề trong vòng này.' },
    minimum: 'Một lần chạy đủ bước, đầu ra cuối, lỗi lớn nhất, loại lỗi, thay đổi đã làm và kết quả chạy lại.',
    insideConan: 'Builder Portfolio có giá trị khi chứa cả sản phẩm và quá trình ra quyết định. Nhật ký lỗi và lần sửa cho thấy năng lực xây hệ thống rõ hơn một đầu ra bóng bẩy đơn lẻ.',
  },
  {
    day: 7, slug: 'day-07', locked: false, duration: '45–60 phút',
    title: 'Đóng gói workflow thành tài sản có thể dùng lại',
    question: 'Người khác có thể chạy lại và chuyển phương pháp này không?',
    concept: 'Bộ workflow và Bản thiết kế chuyển giao (Transfer Blueprint)', artifact: 'Bộ workflow hoàn chỉnh',
    problem: 'Một thư mục chứa nhiều câu lệnh chưa phải tài sản. Nếu lần sau bạn không biết chuẩn bị gì, chạy theo thứ tự nào, xử lý lỗi ra sao hoặc khi nào phải cập nhật, workflow vẫn phụ thuộc trí nhớ của người tạo. Đóng gói biến lần thử thành một hệ thống có phiên bản và có thể chuyển giao.',
    theory: [
      { title: 'Tài sản cần hướng dẫn chạy và phiên bản', body: 'Gói hoàn chỉnh gồm mục đích, điều kiện chuẩn bị, bối cảnh, hợp đồng đầu ra, các bước, vai trò, cổng, lỗi phổ biến, cách cập nhật và lịch sử phiên bản.' },
      { title: 'Chuyển giao phương pháp, không sao chép content', body: 'Để chứng minh đã hiểu, bạn phác thảo một workflow khác bằng cùng câu hỏi thiết kế: kết quả, bối cảnh, hợp đồng, bước, quyết định và kế hoạch thử.' },
      { title: 'Phiên bản 1 là điểm bắt đầu sử dụng', body: 'Bạn không cần hoàn hảo hay tự động hóa. Bạn cần một bản đủ rõ để chạy thêm hai lần, mỗi lần quan sát một điểm nghẽn và cập nhật có chủ đích.' },
    ],
    misconceptions: [
      { myth: 'Phiên bản 1 phải hoàn hảo.', correction: 'Nó chỉ cần đủ rõ để chạy lại, gỡ lỗi và cải tiến.' },
      { myth: 'Tài liệu phải thật dài.', correction: 'Hướng dẫn tốt ưu tiên quyết định và điều kiện vận hành, không ưu tiên số trang.' },
      { myth: 'Chuyển giao là sao chép mọi câu lệnh content.', correction: 'Bạn phải dùng phương pháp để thiết kế một workflow cho kết quả khác.' },
      { myth: 'Phải tự động hóa trước khi bàn giao.', correction: 'Tự động hóa một workflow chưa ổn định chỉ làm lỗi chạy nhanh hơn.' },
    ],
    conanCase: caseFor('Đóng gói tài sản học tập thành một hệ thống có thể cải tiến', 'Conan School đóng gói mục đích, chuẩn bị, bối cảnh, hợp đồng, bước, vai trò, cổng, lỗi và phiên bản của tình huống học tập. Sản phẩm này có thể trở thành một phần Builder Portfolio mà không cần tuyên bố kết quả kinh doanh chưa kiểm chứng.', 'Dùng phương pháp để phác thảo workflow xử lý biên bản họp, không sao chép nguyên các bước viết bài học.'),
    practice: ['Áp dụng thay đổi từ lần chạy thử và đặt số phiên bản.', 'Viết mục đích, phần chuẩn bị và hướng dẫn chạy một trang.', 'Ghi lỗi phổ biến cùng điều kiện cần cập nhật workflow.', 'Tải Bộ workflow thành tệp Markdown để giữ ngoài trình duyệt.', 'Phác thảo một workflow khác bằng Bản thiết kế chuyển giao.'],
    qualityGate: ['Người khác biết cần chuẩn bị gì và bắt đầu ở đâu.', 'Quyết định con người và kiểm tra đầu ra được nhìn thấy.', 'Có lỗi phổ biến và điều kiện cập nhật.', 'Workflow thứ hai dùng phương pháp thay vì sao chép luồng content.', 'Toàn bộ bảy sản phẩm có thể xuất thành một tệp.'],
    revision: 'Đưa bản hướng dẫn cho một người chưa làm cùng bạn đọc; ghi lại câu hỏi đầu tiên họ phải hỏi và bổ sung câu trả lời vào gói.',
    aiLab: { duration: '20–30 phút tùy chọn', role: 'AI đóng vai người nhận bàn giao.', prompt: 'Hãy đóng vai một người chưa biết workflow này. Chỉ dùng Bộ workflow tôi cung cấp để hỏi cách chuẩn bị, bắt đầu, xử lý điểm quyết định, kiểm tra đầu ra và phục hồi khi lỗi. Sau đó kiểm tra Bản thiết kế chuyển giao bằng câu hỏi; không tự xây workflow thứ hai thay tôi và không coi câu trả lời mơ hồ là đã đạt.' },
    minimum: 'Một Bộ workflow có phiên bản và hướng dẫn chạy, cùng một Bản thiết kế chuyển giao cho công việc khác.',
    insideConan: 'Nếu bạn là người xây lần đầu, Conan School và cộng đồng Tokyo giúp tiếp tục hành trình xây sản phẩm thật. Nếu bạn đã có doanh nghiệp và quy trình thật vẫn phụ thuộc founder, bạn có thể tìm hiểu Conan Maker. Bạn cũng có thể tự chạy workflow thêm hai lần trong 14 ngày.',
  },
] as const

export function getContentWorkflowDay(slug: string): ContentWorkflowDay | undefined {
  return CONTENT_WORKFLOW_DAYS.find((lesson) => lesson.slug === slug)
}
