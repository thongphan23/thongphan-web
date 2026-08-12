const PUBLIC_ORIGIN = 'https://vid.thongphan.com'

export function json(data: unknown, status = 200, cache = 'no-store'): Response {
  return Response.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': PUBLIC_ORIGIN,
      'Cache-Control': cache,
      'Content-Type': 'application/json; charset=utf-8',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export function error(code: string, status: number): Response {
  return json({ error: code }, status)
}

export async function readBoundedJson(request: Request, maximumBytes = 64 * 1024): Promise<unknown> {
  const length = Number(request.headers.get('content-length') ?? 0)
  if (Number.isFinite(length) && length > maximumBytes) throw new Error('body_too_large')
  const text = await request.text()
  if (new TextEncoder().encode(text).byteLength > maximumBytes) throw new Error('body_too_large')
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('invalid_json')
  }
}
