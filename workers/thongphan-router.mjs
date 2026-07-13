const PAGES_ORIGIN = 'https://thongphan-com.pages.dev'
const STATIC_PREFIXES = ['/assets/', '/images/']
const STATIC_FILES = new Set(['/favicon.svg', '/robots.txt', '/sitemap.xml'])
const FILE_EXTENSION_RE = /\.[a-zA-Z0-9]{2,10}$/

function isStaticRequest(pathname) {
  return STATIC_FILES.has(pathname)
    || STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    || FILE_EXTENSION_RE.test(pathname)
}

function cacheHeaderFor(pathname, contentType) {
  if (contentType?.includes('text/html') || !isStaticRequest(pathname)) {
    return 'public, max-age=0, must-revalidate'
  }

  return 'public, max-age=31536000, immutable'
}

export function createThongphanRouter({ fetchImpl = fetch } = {}) {
  return {
    async fetch(request) {
      const incomingUrl = new URL(request.url)
      const targetUrl = new URL(PAGES_ORIGIN)
      targetUrl.pathname = incomingUrl.pathname
      targetUrl.search = incomingUrl.search

      const response = await fetchImpl(targetUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
        redirect: 'manual',
      })
      const headers = new Headers(response.headers)
      headers.set('Cache-Control', cacheHeaderFor(incomingUrl.pathname, headers.get('content-type')))
      headers.set('X-TP-Router', 'pages-origin')
      headers.delete('Age')

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    },
  }
}

export default createThongphanRouter()
