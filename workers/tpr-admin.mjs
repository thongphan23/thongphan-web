const PAGES_ORIGIN = 'https://thongphan-com.pages.dev'
const COOKIE_NAME = 'tpr_session'
const SESSION_TTL_SECONDS = 12 * 60 * 60
const FAILURE_LIMIT = 5
const FAILURE_TTL_SECONDS = 10 * 60
const MAX_LOGIN_BODY_BYTES = 256

const encoder = new TextEncoder()

function securityHeaders(headers = new Headers()) {
  headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'no-referrer')
  headers.set('Cache-Control', 'private, no-store')
  return headers
}

function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: securityHeaders(new Headers({ 'Content-Type': 'application/json; charset=utf-8', ...headers })),
  })
}

function base64UrlEncode(value) {
  const bytes = typeof value === 'string' ? encoder.encode(value) : value
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function base64UrlDecode(value) {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (value.length % 4)) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)))
}

function timingSafeEqual(left, right) {
  const leftBytes = encoder.encode(left)
  const rightBytes = encoder.encode(right)
  let difference = leftBytes.length ^ rightBytes.length
  const length = Math.max(leftBytes.length, rightBytes.length)
  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0)
  }
  return difference === 0
}

function cookieValue(request, name) {
  const cookie = request.headers.get('cookie') ?? ''
  for (const part of cookie.split(';')) {
    const [key, ...value] = part.trim().split('=')
    if (key === name) return value.join('=')
  }
  return null
}

async function issueSession(secret, now) {
  const payload = base64UrlEncode(JSON.stringify({
    version: 1,
    issued_at: Math.floor(now / 1000),
    expires_at: Math.floor(now / 1000) + SESSION_TTL_SECONDS,
  }))
  return `${payload}.${base64UrlEncode(await hmac(secret, payload))}`
}

async function validSession(request, env, now) {
  const token = cookieValue(request, COOKIE_NAME)
  if (!token || !env.TPR_SESSION_SECRET) return false
  const [payload, signature, extra] = token.split('.')
  if (!payload || !signature || extra) return false
  try {
    const expected = base64UrlEncode(await hmac(env.TPR_SESSION_SECRET, payload))
    if (!timingSafeEqual(expected, signature)) return false
    const session = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)))
    return session.version === 1 && Number(session.expires_at) > Math.floor(now / 1000)
  } catch {
    return false
  }
}

function loginPage(message = '') {
  const escaped = message.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive"><title>TPR · Truy cập</title>
<style>
:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;background:#f4f1eb;color:#181817;font:15px/1.5 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{width:min(420px,calc(100% - 32px));border-top:5px solid #ef3f8f;background:#fff;padding:32px;border-radius:6px;box-shadow:0 20px 60px rgb(30 24 20/.12)}p{color:#635f59}label{display:block;font-weight:700;margin:24px 0 8px}input{width:100%;height:46px;border:1px solid #b9b4ac;border-radius:4px;padding:0 12px;font:inherit}button{width:100%;height:46px;margin-top:12px;border:0;border-radius:4px;background:#ef3f8f;color:#fff;font:700 14px/1 inherit;cursor:pointer}.error{min-height:22px;color:#a41e53;font-weight:650}</style></head>
<body><main><small>THÔNG PHAN REMOTION</small><h1>TPR Control Room</h1><p>Không gian vận hành riêng tư cho model, graph, quyết định hình ảnh và bằng chứng sản xuất.</p>
<form><label for="code">Mã truy cập</label><input id="code" name="code" type="password" autocomplete="current-password" required autofocus><button type="submit">Mở bảng điều khiển</button><p class="error" role="alert">${escaped}</p></form></main>
<script>document.querySelector('form').addEventListener('submit',async(e)=>{e.preventDefault();const b=e.currentTarget.querySelector('button');const m=e.currentTarget.querySelector('.error');b.disabled=true;m.textContent='';try{const r=await fetch('/tpr/api/access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:e.currentTarget.code.value})});if(r.ok){location.href='/tpr';return}m.textContent=r.status===429?'Đã thử quá nhiều lần. Vui lòng chờ 10 phút.':'Mã truy cập không đúng.'}catch{m.textContent='Không thể kết nối. Vui lòng thử lại.'}finally{b.disabled=false}})</script></body></html>`
}

function loginResponse(message = '') {
  return new Response(loginPage(message), {
    status: 401,
    headers: securityHeaders(new Headers({ 'Content-Type': 'text/html; charset=utf-8' })),
  })
}

function sameOrigin(request) {
  const origin = request.headers.get('origin')
  return origin === new URL(request.url).origin
}

function secretsReady(env) {
  return /^[a-f0-9]{64}$/.test(env.TPR_ACCESS_CODE_HASH ?? '')
    && typeof env.TPR_SESSION_SECRET === 'string'
    && env.TPR_SESSION_SECRET.length >= 32
    && typeof env.TPR_ADMIN_DATA?.get === 'function'
    && typeof env.TPR_ADMIN_DATA?.put === 'function'
}

async function rateLimitKey(request, secret) {
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
  return `access-failures:${base64UrlEncode(await hmac(secret, ip)).slice(0, 32)}`
}

async function accessHandler(request, env, now) {
  if (request.method === 'GET') {
    return (await validSession(request, env, now))
      ? new Response(null, { status: 204, headers: securityHeaders() })
      : jsonResponse({ error: 'UNAUTHORIZED' }, 401)
  }
  if (request.method === 'DELETE') {
    if (!sameOrigin(request)) return jsonResponse({ error: 'ORIGIN_REQUIRED' }, 403)
    return new Response(null, {
      status: 204,
      headers: securityHeaders(new Headers({
        'Set-Cookie': `${COOKIE_NAME}=; Path=/tpr; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
      })),
    })
  }
  if (request.method !== 'POST') return jsonResponse({ error: 'METHOD_NOT_ALLOWED' }, 405)
  if (!sameOrigin(request)) return jsonResponse({ error: 'ORIGIN_REQUIRED' }, 403)
  if (!secretsReady(env)) return jsonResponse({ error: 'SERVICE_NOT_CONFIGURED' }, 503)
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return jsonResponse({ error: 'JSON_REQUIRED' }, 415)
  }
  const declaredLength = Number.parseInt(request.headers.get('content-length') ?? '0', 10)
  if (declaredLength > MAX_LOGIN_BODY_BYTES) return jsonResponse({ error: 'PAYLOAD_TOO_LARGE' }, 413)
  const failureKey = await rateLimitKey(request, env.TPR_SESSION_SECRET)
  const failures = Number.parseInt((await env.TPR_ADMIN_DATA.get(failureKey)) ?? '0', 10) || 0
  if (failures >= FAILURE_LIMIT) return jsonResponse({ error: 'RATE_LIMITED' }, 429, { 'Retry-After': String(FAILURE_TTL_SECONDS) })
  let body
  try {
    const rawBody = await request.text()
    if (encoder.encode(rawBody).byteLength > MAX_LOGIN_BODY_BYTES) {
      return jsonResponse({ error: 'PAYLOAD_TOO_LARGE' }, 413)
    }
    body = JSON.parse(rawBody)
  } catch {
    return jsonResponse({ error: 'INVALID_JSON' }, 400)
  }
  const candidateHash = await sha256Hex(String(body?.code ?? ''))
  if (!env.TPR_ACCESS_CODE_HASH || !timingSafeEqual(candidateHash, env.TPR_ACCESS_CODE_HASH)) {
    await env.TPR_ADMIN_DATA.put(failureKey, String(failures + 1), { expirationTtl: FAILURE_TTL_SECONDS })
    return jsonResponse({ error: 'INVALID_CODE' }, 401)
  }
  await env.TPR_ADMIN_DATA.put(failureKey, '0', { expirationTtl: 60 })
  const token = await issueSession(env.TPR_SESSION_SECRET, now)
  return new Response(null, {
    status: 204,
    headers: securityHeaders(new Headers({
      'Set-Cookie': `${COOKIE_NAME}=${token}; Path=/tpr; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`,
    })),
  })
}

export function createTprAdminWorker({ fetchImpl = fetch, now = () => Date.now() } = {}) {
  return {
    async fetch(request, env) {
      const url = new URL(request.url)
      const isTprPath = url.pathname === '/tpr' || url.pathname.startsWith('/tpr/')
      if (!isTprPath) return new Response('Not found', { status: 404 })
      if (url.pathname === '/tpr/api/access') return accessHandler(request, env, now())

      if (!(await validSession(request, env, now()))) {
        return url.pathname === '/tpr' || url.pathname === '/tpr/'
          ? loginResponse()
          : jsonResponse({ error: 'UNAUTHORIZED' }, 401)
      }
      if (url.pathname === '/tpr/api/snapshot') {
        const snapshot = await env.TPR_ADMIN_DATA.get('snapshot:current')
        if (!snapshot) return jsonResponse({ error: 'SNAPSHOT_UNAVAILABLE' }, 503)
        return new Response(snapshot, {
          status: 200,
          headers: securityHeaders(new Headers({ 'Content-Type': 'application/json; charset=utf-8' })),
        })
      }
      const target = new URL(PAGES_ORIGIN)
      target.pathname = url.pathname
      target.search = url.search
      const response = await fetchImpl(target.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
        redirect: 'manual',
      })
      const headers = securityHeaders(new Headers(response.headers))
      headers.set('X-TPR-Admin', 'protected-pages-origin')
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    },
  }
}

export default createTprAdminWorker()
