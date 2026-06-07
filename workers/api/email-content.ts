/**
 * Email content for 21-day Brain2 Challenge
 * Each day has: subject, body (HTML)
 * Use {{name}} for personalization
 */

interface DayContent {
  subject: string;
  body: string;
}

const EMAIL_STYLE = `
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa; }
  .header { background: linear-gradient(135deg, #0a0a0a, #1a1a2e); color: #fff; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
  .header h1 { margin: 0; font-size: 22px; }
  .header .day-badge { display: inline-block; background: #f59e0b; color: #0a0a0a; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-bottom: 10px; }
  .content { background: #fff; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e5e5; border-top: none; }
  .content h2 { color: #0a0a0a; font-size: 18px; margin-top: 28px; }
  .content h3 { color: #333; font-size: 16px; }
  .task { background: #f8f9fa; border-left: 4px solid #f59e0b; padding: 16px 20px; margin: 16px 0; border-radius: 0 8px 8px 0; }
  .task h3 { margin-top: 0; }
  .insight { background: #fffbeb; border: 1px solid #fde68a; padding: 16px 20px; border-radius: 8px; margin: 16px 0; }
  .mistake { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 12px 0; border-radius: 0 8px 8px 0; }
  .checklist { list-style: none; padding: 0; }
  .checklist li { padding: 6px 0; }
  .checklist li::before { content: "☐ "; color: #f59e0b; font-weight: bold; }
  .prompt-box { background: #1a1a2e; color: #e5e5e5; padding: 20px; border-radius: 8px; font-size: 14px; white-space: pre-wrap; margin: 12px 0; }
  .footer { text-align: center; padding: 20px; color: #999; font-size: 13px; }
  a { color: #f59e0b; }
  blockquote { border-left: 3px solid #f59e0b; padding-left: 16px; color: #555; font-style: italic; margin: 16px 0; }
  code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
</style>
`;

function wrapEmail(dayNum: number, totalDays: number, title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${EMAIL_STYLE}</head><body>
<div class="header">
  <div class="day-badge">Ngày ${dayNum}/${totalDays}</div>
  <h1>${title}</h1>
</div>
<div class="content">
${bodyHtml}
</div>
<div class="footer">
  <p>Bạn nhận email này vì đã đăng ký <strong>21 Ngày Brain2</strong> tại thongphan.com</p>
  <p><a href="https://thongphan.com">thongphan.com</a></p>
</div>
</body></html>`;
}

// ============================================================
// DAY 4 — Career Direction
// ============================================================

const day4Body = `
<p>Chào {{name}},</p>

<p>Hôm qua bạn kể câu chuyện cuộc đời. Hôm nay bạn trả lời câu hỏi quan trọng hơn: <strong>"Với tất cả trải nghiệm đó — bạn đang đi về đâu, và vũ khí của bạn là gì?"</strong></p>

<blockquote>"Specific Knowledge là thứ không thể dạy trong trường học. Nó chỉ đến khi bạn sống sâu trong một vùng chuyên biệt suốt nhiều năm." — Naval Ravikant</blockquote>

<p>Đây không phải bài tập "tìm đam mê". Đây là bài tập <strong>định vị</strong> — giống GPS: xác định bạn đang đứng đâu, để mọi quyết định sau này đều rõ ràng hơn.</p>

<p>Khi file <code>identity-career-direction.md</code> nằm trong vault — AI hiểu bạn muốn đi đâu. Content nó viết sẽ phục vụ hướng đi CỦA BẠN, không phải generic.</p>

<h2>Nhiệm Vụ Hôm Nay</h2>

<div class="task">
<h3>✅ Task 1: Trả Lời 4 Câu Hỏi Với AI (25 phút)</h3>
<p>Mở AI assistant (Gemini / ChatGPT / Claude). Copy prompt:</p>
<div class="prompt-box">Tôi muốn tạo file career direction cho Brain2 vault. Hỏi tôi lần lượt từng câu, đợi tôi trả lời xong rồi hỏi câu tiếp:

1. Tôi giỏi nhất điều gì — thứ mà người cùng lĩnh vực không có? Thứ khiến người ta tìm đến tôi thay vì Google?

2. Thứ tôi làm không cần cố gắng mà người khác phải học 3 năm — thứ tôi thấy "hiển nhiên" nhưng người khác thấy "khó hiểu"?

3. Tôi muốn được nhớ đến vì điều gì trong 10 năm nữa? Nếu có 1 dòng mô tả trong Wikipedia — dòng đó viết gì?

4. Thứ tôi KHÔNG làm nữa — việc gì tôi đã/cần từ chối dù nó mang lại tiền?

Sau khi trả lời xong, tổng hợp thành file identity-career-direction.md với sections: Vùng Năng Lực Cốt Lõi, Lợi Thế Cạnh Tranh, Định Hướng 1-3 Năm, Danh Sách KHÔNG Làm.</div>

<p><strong>Lưu ý:</strong> Đừng trả lời bằng job title. <em>"Tôi giỏi marketing"</em> không nói gì cả. Trả lời bằng chứng cứ cụ thể:</p>
<ul>
<li>❌ "Tôi giỏi marketing"</li>
<li>✅ "Tôi có khả năng nhìn 1 sản phẩm tầm thường và tìm ra góc kể chuyện viral. 40 bài ngàn share trong 14 tháng là proof."</li>
</ul>
</div>

<div class="task">
<h3>✅ Task 2: Review Output (10 phút)</h3>
<p>AI cho ra file khá tốt. Nhưng bạn cần kiểm tra:</p>
<ul>
<li><strong>Test Thật:</strong> Đọc "Vùng Năng Lực" — bạn thấy đúng mình không? Nếu "ai cũng viết được" → cần cụ thể hơn.</li>
<li><strong>Test Từ Chối:</strong> "Anti-Goals" — bạn đã thật sự từ chối chưa? Anti-goals chỉ có giá trị khi đó là thứ có người trả tiền mà bạn vẫn nói không.</li>
<li><strong>Thêm số liệu:</strong> "Tôi giỏi viết" → "40 bài viral ngàn share trong 14 tháng." Số biến opinion thành evidence.</li>
</ul>
</div>

<div class="task">
<h3>✅ Task 3: Lưu Vault + Cross-link (5 phút)</h3>
<ol>
<li>Lưu file thành <code>01-Atomic/Identity/identity-career-direction.md</code></li>
<li>Thêm links: <code>[[identity-worldview]]</code> và <code>[[identity-life-story]]</code></li>
<li>Mở 2 file identity kia → thêm backlink về career direction</li>
</ol>
</div>

<h2>Tại Sao File Này Thay Đổi Cách AI Làm Việc Cho Bạn</h2>

<p>Khi vault có cả 3 Identity files (worldview + life story + career direction), AI trở thành <strong>thought partner</strong> biết:</p>
<ul>
<li>Bạn tin gì (worldview)</li>
<li>Bạn đã sống qua gì (life story)</li>
<li>Bạn đang đi về đâu (career direction)</li>
</ul>

<div class="insight">
<p><strong>💡 Không có career direction:</strong><br>"Viết post về AI" → AI viết bài generic</p>
<p><strong>Có career direction:</strong><br>"Viết post về AI" → AI viết từ góc độ của một người đã dùng AI xây hệ thống tri thức, tone của người dạy 500+ học viên ứng dụng AI thực tế.</p>
<p>Cùng 1 prompt. Kết quả khác hoàn toàn.</p>
</div>

<h2>🚨 Sai Lầm Phổ Biến</h2>

<div class="mistake">
<strong>Viết bằng "ngôn ngữ LinkedIn"</strong> — "Dynamic leader passionate about innovation." Đây là marketing copy. Viết bằng ngôn ngữ thật.
</div>

<div class="mistake">
<strong>Lẫn "muốn giỏi" với "đã giỏi"</strong> — Specific Knowledge = thứ đã tích lũy, không phải thứ muốn tích lũy. "Muốn học design" vào goals, "giỏi design" vào specific knowledge.
</div>

<div class="mistake">
<strong>Anti-Goals quá ngắn</strong> — Cần ≥5 mục. Biết mình không làm gì quan trọng ngang biết mình làm gì.
</div>

<h2>Checklist Ngày 4</h2>

<ul class="checklist">
<li>File <code>identity-career-direction.md</code> đã lưu trong <code>01-Atomic/Identity/</code></li>
<li>Có đủ 4 sections: Specific Knowledge, Lợi Thế, Định Hướng, Anti-Goals</li>
<li>Frontmatter đầy đủ (type, status, domain, tags, created, related)</li>
<li>Có ≥2 cross-links thật với identity-worldview và identity-life-story</li>
<li>Specific Knowledge viết bằng chứng cứ cụ thể, không phải job title</li>
</ul>

<p style="margin-top:24px;font-weight:600;">→ Ngày mai: Ngày 5 — Các Dự Án Đang Theo Đuổi</p>
`;

// ============================================================
// CONTENT MAP — add new days here
// ============================================================

const CHALLENGE_CONTENT: Record<number, DayContent> = {
  4: {
    subject: '[Brain2] Ngày 4/21 — Mày Giỏi Cái Gì Mà Người Khác Phải Học 3 Năm?',
    body: wrapEmail(4, 21, 'Mày Giỏi Cái Gì Mà Người Khác Phải Học 3 Năm?', day4Body),
  },
};

/**
 * Get email content for a specific day.
 * Returns custom content if available, otherwise a placeholder.
 */
export function getEmailContent(day: number, totalDays: number): DayContent {
  if (CHALLENGE_CONTENT[day]) {
    return CHALLENGE_CONTENT[day];
  }

  // Fallback placeholder for days not yet written
  return {
    subject: `[Brain2] Ngày ${day}/${totalDays}`,
    body: wrapEmail(day, totalDays, `Ngày ${day}`, `
      <p>Chào {{name}},</p>
      <p>Nội dung ngày ${day} đang được chuẩn bị. Bạn sẽ nhận được bản cập nhật sớm!</p>
      <p>Trong lúc chờ, hãy review lại bài ngày hôm qua và đảm bảo đã hoàn thành checklist nhé.</p>
    `),
  };
}
