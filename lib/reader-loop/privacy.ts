const encoder = new TextEncoder()

export async function deriveRotatingCallerHash(secret: string, clientAddress: string, now: string) {
  if (secret.length < 32) return null
  const address = clientAddress.trim()
  if (!address || address.length > 128 || /[\u0000-\u001f\u007f]/.test(address)) return null
  const timestamp = Date.parse(now)
  if (!Number.isFinite(timestamp)) return null
  const day = new Date(timestamp).toISOString().slice(0, 10)
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`reader-loop-preview:v1:${day}:${address}`))
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
