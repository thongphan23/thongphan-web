import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export async function readVidAdminSecret(): Promise<string> {
  const { stdout } = await execFileAsync('/usr/bin/security', [
    'find-generic-password',
    '-s',
    'thongphan-vid-admin',
    '-a',
    'hmac-secret',
    '-w',
  ], { maxBuffer: 8 * 1024 })
  const secret = stdout.trim()
  if (secret.length < 32) throw new Error('Vid admin secret is missing or too short')
  return secret
}
