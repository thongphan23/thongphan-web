const CANONICAL_HUB = 'https://thongphan.com/brain2/21-ngay'
const INITIAL_CACHE = 'public, max-age=300, s-maxage=300'

const redirectWorker = {
  async fetch(request) {
    const source = new URL(request.url)

    return new Response(null, {
      status: 301,
      headers: {
        'Cache-Control': INITIAL_CACHE,
        'Content-Length': '0',
        Location: `${CANONICAL_HUB}${source.search}`,
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
        'X-TP-Legacy-Redirect': 'worker-v1',
      },
    })
  },
}

export default redirectWorker
