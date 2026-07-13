const disabledLearnPage = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Chương học chưa mở — Thông Phan</title>
    <style>
      :root { color-scheme: dark; font-family: system-ui, sans-serif; }
      * { box-sizing: border-box; }
      body { background: #080807; color: #f1eadc; margin: 0; min-height: 100vh; padding: 6vw; }
      main { border-top: 2px solid #b3231b; display: grid; gap: 3rem; margin: auto; max-width: 72rem; min-height: 78vh; padding-top: 10vh; }
      p { color: #e04b43; font-size: .75rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
      h1 { font-family: Georgia, serif; font-size: clamp(3.2rem, 9vw, 8rem); font-weight: 400; letter-spacing: -.06em; line-height: .9; margin: 0; max-width: 10ch; }
      span { color: #aaa49a; display: block; line-height: 1.7; max-width: 42rem; }
      nav { align-items: center; border-top: 1px solid #37332d; display: flex; flex-wrap: wrap; gap: 1rem 2rem; padding-top: 1.5rem; }
      a { color: #f1eadc; min-height: 44px; padding: .7rem 0; text-underline-offset: .3rem; }
      a:focus-visible { outline: 2px solid #e04b43; outline-offset: 4px; }
    </style>
  </head>
  <body>
    <main>
      <div>
        <p>TP / LEARN / CHƯA MỞ</p>
        <h1>Chương học này chưa lên sóng.</h1>
      </div>
      <div>
        <span>Ứng dụng học đang được hoàn thiện. Trong lúc chờ, bạn có thể làm bản đồ chuyên môn hoặc mở thư viện để chọn một bước phù hợp ngay bây giờ.</span>
        <nav aria-label="Đi tiếp">
          <a href="/diagnostic">Làm bản đồ chuyên môn →</a>
          <a href="/library">Mở thư viện →</a>
        </nav>
      </div>
    </main>
  </body>
</html>`

type LearnPagesContext = {
  env: { LEARN_PUBLIC_ENABLED?: string }
  next: () => Promise<Response>
}

export async function onRequest(context: LearnPagesContext): Promise<Response> {
  if (context.env.LEARN_PUBLIC_ENABLED === 'true') return context.next()

  return new Response(disabledLearnPage, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
