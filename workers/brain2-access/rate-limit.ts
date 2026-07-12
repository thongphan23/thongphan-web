import { base64UrlEncode, hmacSha256 } from './auth'
import type { D1DatabaseLike } from './types'

export const FAILURE_LIMIT = 5
export const FAILURE_WINDOW_SECONDS = 600

export async function rateLimitClientKey(ip: string, sessionSecret: string): Promise<string> {
  if (!ip.trim()) throw new Error('Client address is unavailable')
  const digest = await hmacSha256(sessionSecret, `rate:v1:${ip}`)
  return base64UrlEncode(digest.slice(0, 16))
}

export async function reserveAccessAttempt(
  DB: D1DatabaseLike,
  clientKey: string,
  now: number,
): Promise<number | null> {
  const result = await DB.prepare(
    `INSERT INTO brain2_access_failures (client_key, failed_at)
     SELECT ?, ?
      WHERE (
        SELECT COUNT(*)
          FROM brain2_access_failures
         WHERE client_key = ? AND failed_at >= ?
      ) < ?
     RETURNING id AS reservation_id`,
  ).bind(
    clientKey,
    now,
    clientKey,
    now - FAILURE_WINDOW_SECONDS,
    FAILURE_LIMIT,
  ).first<{ reservation_id: number }>()
  if (result === null) return null
  if (!Number.isInteger(result.reservation_id) || result.reservation_id < 1) {
    throw new Error('Access failure ledger returned an invalid reservation')
  }
  return result.reservation_id
}

export async function releaseAccessAttempt(
  DB: D1DatabaseLike,
  reservationId: number,
  clientKey: string,
): Promise<void> {
  const result = await DB.prepare(
    `DELETE FROM brain2_access_failures
      WHERE id = ? AND client_key = ?
     RETURNING id AS released_id`,
  ).bind(reservationId, clientKey).first<{ released_id: number }>()
  if (!result || result.released_id !== reservationId) {
    throw new Error('Access failure reservation could not be released')
  }
}
