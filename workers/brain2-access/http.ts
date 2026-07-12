const BASE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  Pragma: 'no-cache',
  Vary: 'Cookie',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
} as const

export function protectedHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(BASE_HEADERS)
  if (extra) new Headers(extra).forEach((value, name) => headers.set(name, value))
  return headers
}

export function jsonResponse(status: number, value: unknown, extra?: HeadersInit): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: protectedHeaders({ 'Content-Type': 'application/json; charset=utf-8', ...Object.fromEntries(new Headers(extra ?? {})) }),
  })
}

export function emptyResponse(status: number, extra?: HeadersInit): Response {
  return new Response(null, { status, headers: protectedHeaders(extra) })
}

export function safeError(status: number, code: string, extra?: HeadersInit): Response {
  return jsonResponse(status, { error: code }, extra)
}
