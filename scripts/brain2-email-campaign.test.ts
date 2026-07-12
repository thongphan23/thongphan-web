import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync, rmSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import manifest from '../content/brain2/manifest.json'
import {
  BRAIN2_CAMPAIGN_VERSION,
  BRAIN2_CHALLENGE_SLUG,
  BRAIN2_EMAIL_TEMPLATES,
  buildBrain2CampaignSchedule,
  buildBrain2QueueStatements,
  getBrain2EmailContent,
  handleBrain2SignupRequest,
  personalizeBrain2Email,
} from '../workers/brain2-campaign'
import {
  ADMIN_PATH,
  EMAIL_EXPIRE_SQL,
  EMAIL_OWNED_UPDATE_SQL,
  UNSUBSCRIBE_PATH,
  buildBrevoPayload,
  createBrain2EmailWorker,
  createUnsubscribeToken,
  processPendingEmails,
  verifyUnsubscribeToken,
} from '../workers/api/email-drip'

const ORIGIN = 'https://thongphan.com'

class Statement {
  values: unknown[] = []

  constructor(readonly query: string, private readonly database: SignupDatabase) {}

  bind(...values: unknown[]) {
    this.values = values
    return this
  }

  async first<T>() {
    if (/FROM challenges/i.test(this.query)) {
      if (this.database.failChallengeRead) throw new Error('synthetic challenge read failure')
      return { id: 'brain2-21', duration_days: 21 } as T
    }
    if (/FROM challenge_signups/i.test(this.query)) {
      if (this.database.failDuplicateRead || (this.database.failDuplicateReadAfterBatch && this.database.batchAttempted)) {
        throw new Error('synthetic duplicate read failure')
      }
      return this.database.duplicate ? { id: 'existing' } as T : null
    }
    throw new Error(`Unexpected first query: ${this.query}`)
  }

  async run() {
    throw new Error(`Signup writes must use one batch: ${this.query}`)
  }
}

class SignupDatabase {
  prepared: Statement[] = []
  batches: Statement[][] = []
  duplicate = false
  failBatch = false
  duplicateAfterBatchFailure = false
  failChallengeRead = false
  failDuplicateRead = false
  failDuplicateReadAfterBatch = false
  batchAttempted = false

  prepare(query: string) {
    const statement = new Statement(query, this)
    this.prepared.push(statement)
    return statement
  }

  async batch(statements: Statement[]) {
    this.batchAttempted = true
    if (this.failBatch) {
      if (this.duplicateAfterBatchFailure) this.duplicate = true
      throw new Error('synthetic batch failure')
    }
    this.batches.push(statements)
    return statements.map(() => ({ success: true }))
  }
}

class SignupRateLimiter {
  calls: string[] = []

  constructor(public success = true, public fail = false) {}

  async limit({ key }: { key: string }) {
    this.calls.push(key)
    if (this.fail) throw new Error('synthetic rate limiter failure')
    return { success: this.success }
  }
}

const signupEnv = (DB: SignupDatabase, overrides: Partial<{
  ip: SignupRateLimiter
  email: SignupRateLimiter
  KV: { delete(key: string): Promise<unknown> }
}> = {}) => ({
  DB,
  KV: overrides.KV,
  SIGNUP_IP_RATE_LIMITER: overrides.ip ?? new SignupRateLimiter(),
  SIGNUP_EMAIL_RATE_LIMITER: overrides.email ?? new SignupRateLimiter(),
})

const signupHeaders = { 'Content-Type': 'application/json', Origin: ORIGIN, 'CF-Connecting-IP': '203.0.113.17' }

test('campaign builds exactly 21 truthful metadata-only link emails', () => {
  assert.equal(BRAIN2_CAMPAIGN_VERSION, 'brain2-2026-v1')
  assert.equal(BRAIN2_CHALLENGE_SLUG, 'brain2-21-ngay')
  assert.equal(BRAIN2_EMAIL_TEMPLATES.length, 21)

  for (let day = 1; day <= 21; day += 1) {
    const dayText = String(day).padStart(2, '0')
    const lesson = manifest.lessons[day - 1]
    const template = getBrain2EmailContent(day, 21)
    assert.equal(template.day, day)
    assert.equal(template.url, `${ORIGIN}/brain2/21-ngay/ngay-${dayText}`)
    assert.match(template.subject, new RegExp(`Ngày ${dayText}/21`))
    assert.match(template.body, new RegExp(`ngay-${dayText}`))
    assert.match(template.body, /unsubscribe_url/)
    assert.match(template.body, new RegExp(lesson.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.match(template.body, new RegExp(String(lesson.estimatedMinutes.min)))
    assert.match(template.body, new RegExp(String(lesson.estimatedMinutes.max)))
    if (day <= 7) assert.match(template.body, /mở công khai/i)
    else assert.match(template.body, /Conan Maker/i)
  }

  const serialized = JSON.stringify(BRAIN2_EMAIL_TEMPLATES)
  assert.doesNotMatch(serialized, /đang được chuẩn bị|15 phút|prompt-box|identity-career-direction/i)
  assert.doesNotMatch(serialized, /"reason"|"blocks"|"deliverable"|"checklist"/)
})

test('campaign schedule uses day-one within five minutes and 09:00 Asia/Ho_Chi_Minh thereafter', () => {
  const signupAt = '2026-07-12T17:30:00.000Z' // 00:30 on 13 July in Vietnam.
  const schedule = buildBrain2CampaignSchedule(signupAt)
  assert.equal(schedule.length, 21)
  const delta = Date.parse(schedule[0]) - Date.parse(signupAt)
  assert.ok(delta >= 0 && delta <= 5 * 60 * 1000)
  assert.equal(schedule[1], '2026-07-14T02:00:00.000Z')
  for (const value of schedule.slice(1)) {
    const date = new Date(value)
    assert.equal(date.getUTCHours(), 2)
    assert.equal(date.getUTCMinutes(), 0)
    assert.equal(date.getUTCSeconds(), 0)
  }

  const yearBoundary = buildBrain2CampaignSchedule('2027-12-31T20:00:00.000Z')
  assert.equal(yearBoundary[1], '2028-01-02T02:00:00.000Z')
})

test('queue statements are a complete v1 campaign and personalization escapes user input', () => {
  const DB = new SignupDatabase()
  let sequence = 0
  const statements = buildBrain2QueueStatements({
    DB: DB as never,
    signupId: 'signup-fixture',
    signupAt: '2026-07-12T00:00:00.000Z',
    randomUUID: () => `00000000-0000-4000-8000-${String(sequence += 1).padStart(12, '0')}`,
  }) as unknown as Statement[]
  assert.equal(statements.length, 21)
  for (const [index, statement] of statements.entries()) {
    assert.match(statement.query, /campaign_version/i)
    assert.ok(statement.values.includes(BRAIN2_CAMPAIGN_VERSION))
    assert.ok(statement.values.includes(index + 1))
  }

  const personalized = personalizeBrain2Email(
    getBrain2EmailContent(1, 21).body,
    { name: '<img src=x onerror=alert(1)>', unsubscribeUrl: 'https://thongphan.com/safe?x=1&y=2' },
  )
  assert.doesNotMatch(personalized, /<img src=x/)
  assert.match(personalized, /&lt;img/)
  assert.match(personalized, /x=1&amp;y=2/)
})

test('signup uses one transaction for signup plus 21 v1 rows and returns one stable JSON shape', async () => {
  const DB = new SignupDatabase()
  const deleted: string[] = []
  let sequence = 0
  const env = {
    ...signupEnv(DB),
    KV: { delete: async (key: string) => { deleted.push(key) } },
  }
  const request = new Request(`${ORIGIN}/api/signup`, {
    method: 'POST',
    headers: signupHeaders,
    body: JSON.stringify({ challenge_slug: BRAIN2_CHALLENGE_SLUG, name: ' Anh Thông ', email: 'TEST@EXAMPLE.COM ' }),
  })
  const response = await handleBrain2SignupRequest(request, env as never, {
    now: () => new Date('2026-07-12T00:00:00.000Z'),
    randomUUID: () => `00000000-0000-4000-8000-${String(sequence += 1).padStart(12, '0')}`,
  })
  assert.equal(response.status, 200)
  assert.deepEqual(Object.keys(await response.clone().json()).sort(), ['message', 'signup_id', 'success'])
  assert.equal(DB.batches.length, 1)
  assert.equal(DB.batches[0].length, 22)
  assert.match(DB.batches[0][0].query, /INSERT INTO challenge_signups/i)
  assert.ok(DB.batches[0].slice(1).every((statement) => statement.values.includes(BRAIN2_CAMPAIGN_VERSION)))
  assert.ok(DB.prepared.some((statement) => statement.values.includes('test@example.com')))
  assert.deepEqual(deleted, ['challenge:brain2-21-ngay'])

  const duplicateDB = new SignupDatabase()
  duplicateDB.duplicate = true
  const duplicateRequest = new Request(`${ORIGIN}/api/signup`, {
    method: 'POST',
    headers: signupHeaders,
    body: JSON.stringify({ challenge_slug: BRAIN2_CHALLENGE_SLUG, name: 'Anh Thông', email: 'test@example.com' }),
  })
  const duplicate = await handleBrain2SignupRequest(duplicateRequest, signupEnv(duplicateDB, { KV: env.KV }) as never)
  assert.equal(duplicate.status, 409)
  const duplicateJson = await duplicate.json() as Record<string, unknown>
  assert.deepEqual(Object.keys(duplicateJson).sort(), ['message', 'success'])
  assert.equal(duplicateJson.success, false)
  assert.equal(duplicateDB.batches.length, 0)
})

test('signup bounds streaming bodies, rejects control characters and resolves transaction races safely', async () => {
  const oversizedDB = new SignupDatabase()
  const oversized = new Request(`${ORIGIN}/api/signup`, {
    method: 'POST',
    headers: signupHeaders,
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"challenge_slug":"brain2-21-ngay","name":"'))
        controller.enqueue(new Uint8Array(2_100).fill(97))
        controller.enqueue(new TextEncoder().encode('","email":"safe@example.com"}'))
        controller.close()
      },
    }),
    duplex: 'half',
  } as RequestInit & { duplex: 'half' })
  Object.defineProperty(oversized, 'text', {
    value: async () => { throw new Error('signup must not buffer an unbounded request body') },
  })
  assert.equal((await handleBrain2SignupRequest(oversized, signupEnv(oversizedDB) as never)).status, 413)
  assert.equal(oversizedDB.prepared.length, 0)

  const invalidName = new Request(`${ORIGIN}/api/signup`, {
    method: 'POST',
    headers: signupHeaders,
    body: JSON.stringify({ challenge_slug: BRAIN2_CHALLENGE_SLUG, name: 'Anh\nThông', email: 'safe@example.com' }),
  })
  assert.equal((await handleBrain2SignupRequest(invalidName, signupEnv(new SignupDatabase()) as never)).status, 400)

  const racedDB = new SignupDatabase()
  racedDB.failBatch = true
  racedDB.duplicateAfterBatchFailure = true
  const raced = new Request(`${ORIGIN}/api/signup`, {
    method: 'POST',
    headers: signupHeaders,
    body: JSON.stringify({ challenge_slug: BRAIN2_CHALLENGE_SLUG, name: 'Anh Thông', email: 'RACE@example.com' }),
  })
  assert.equal((await handleBrain2SignupRequest(raced, signupEnv(racedDB) as never)).status, 409)

  const failedDB = new SignupDatabase()
  failedDB.failBatch = true
  const failed = new Request(`${ORIGIN}/api/signup`, {
    method: 'POST',
    headers: signupHeaders,
    body: JSON.stringify({ challenge_slug: BRAIN2_CHALLENGE_SLUG, name: 'Anh Thông', email: 'failed@example.com' }),
  })
  assert.equal((await handleBrain2SignupRequest(failed, signupEnv(failedDB) as never)).status, 503)
})

test('signup rate limits abuse and returns stable JSON when infrastructure fails', async () => {
  const request = () => new Request(`${ORIGIN}/api/signup`, {
    method: 'POST',
    headers: signupHeaders,
    body: JSON.stringify({ challenge_slug: BRAIN2_CHALLENGE_SLUG, name: 'Anh Thông', email: 'safe@example.com' }),
  })

  const blockedDB = new SignupDatabase()
  const blockedIp = new SignupRateLimiter(false)
  const blocked = await handleBrain2SignupRequest(request(), signupEnv(blockedDB, { ip: blockedIp }) as never)
  assert.equal(blocked.status, 429)
  assert.equal(blocked.headers.get('retry-after'), '60')
  assert.equal(blockedDB.prepared.length, 0)
  assert.equal(blockedIp.calls.length, 1)
  assert.doesNotMatch(blockedIp.calls[0], /203\.0\.113\.17|safe@example\.com/)

  const readFailureDB = new SignupDatabase()
  readFailureDB.failChallengeRead = true
  const readFailure = await handleBrain2SignupRequest(request(), signupEnv(readFailureDB) as never)
  assert.equal(readFailure.status, 503)
  assert.deepEqual(Object.keys(await readFailure.json()).sort(), ['message', 'success'])

  const recheckFailureDB = new SignupDatabase()
  recheckFailureDB.failBatch = true
  recheckFailureDB.failDuplicateReadAfterBatch = true
  const recheckFailure = await handleBrain2SignupRequest(request(), signupEnv(recheckFailureDB) as never)
  assert.equal(recheckFailure.status, 503)

  const limiterFailure = await handleBrain2SignupRequest(
    request(),
    signupEnv(new SignupDatabase(), { email: new SignupRateLimiter(true, true) }) as never,
  )
  assert.equal(limiterFailure.status, 503)
})

test('migration freezes 210 legacy rows and adds retry state without reclassification', () => {
  const database = join(homedir(), `.brain2-email-migration-${process.pid}.sqlite`)
  rmSync(database, { force: true })
  try {
    execFileSync('sqlite3', [database], { input: readFileSync(new URL('../workers/schema.sql', import.meta.url)) })
    const fixtureSql = Array.from({ length: 10 }, (_, signupIndex) => {
      const signupId = `signup-${signupIndex}`
      const signup = `INSERT INTO challenge_signups (id, challenge_id, name, email) VALUES ('${signupId}', 'brain2-21', 'Fixture', 'fixture-${signupIndex}@example.com');`
      const rows = Array.from({ length: 21 }, (_, dayIndex) => {
        const day = dayIndex + 1
        return `INSERT INTO email_queue (id, signup_id, day, subject, body, scheduled_at) VALUES ('queue-${signupIndex}-${day}', '${signupId}', ${day}, 'subject', 'body', '2026-01-01T00:00:00.000Z');`
      }).join('\n')
      return `${signup}\n${rows}`
    }).join('\n')
    execFileSync('sqlite3', [database], { input: fixtureSql })
    execFileSync('sqlite3', [database], {
      input: readFileSync(new URL('../workers/migrations/0002_brain2_access_and_email_campaign.sql', import.meta.url)),
    })
    const counts = execFileSync('sqlite3', [database, "SELECT campaign_version,status,COUNT(*) FROM email_queue GROUP BY campaign_version,status;"], { encoding: 'utf8' }).trim()
    assert.equal(counts, 'legacy-v0|pending|210')
    const columns = execFileSync('sqlite3', [database, 'PRAGMA table_info(email_queue);'], { encoding: 'utf8' })
    assert.match(columns, /first_attempt_at/)
    const update = spawnSync('sqlite3', [database, "UPDATE email_queue SET campaign_version='brain2-2026-v1' WHERE id='queue-0-1';"], { encoding: 'utf8' })
    const deletion = spawnSync('sqlite3', [database, "DELETE FROM email_queue WHERE id='queue-0-1';"], { encoding: 'utf8' })
    assert.notEqual(update.status, 0)
    assert.notEqual(deletion.status, 0)
  } finally {
    rmSync(database, { force: true })
  }
})

const sqlLiteral = (value: string | number | null) => {
  if (value === null) return 'NULL'
  if (typeof value === 'number') return String(value)
  return `'${value.replaceAll("'", "''")}'`
}

const bindSql = (query: string, values: Array<string | number | null>) => {
  let index = 0
  const bound = query.replace(/\?/g, () => {
    if (index >= values.length) throw new Error('Missing SQLite fixture binding')
    return sqlLiteral(values[index++])
  })
  assert.equal(index, values.length)
  return `${bound};`
}

test('real SQLite lease and ownership guards reject cleanup and stale sender races', () => {
  const database = join(homedir(), `.brain2-email-race-${process.pid}.sqlite`)
  rmSync(database, { force: true })
  try {
    execFileSync('sqlite3', [database], { input: readFileSync(new URL('../workers/schema.sql', import.meta.url)) })
    execFileSync('sqlite3', [database], {
      input: readFileSync(new URL('../workers/migrations/0002_brain2_access_and_email_campaign.sql', import.meta.url)),
    })
    execFileSync('sqlite3', [database], {
      input: `
        INSERT INTO challenge_signups (id, challenge_id, name, email)
        VALUES ('race-signup', 'brain2-21', 'Fixture', 'race@example.com');
        INSERT INTO email_queue
          (id, signup_id, day, subject, body, scheduled_at, status, campaign_version,
           attempt_count, first_attempt_at, last_attempt_at)
        VALUES
          ('race-queue', 'race-signup', 1, 'subject', 'body', '2026-07-12T00:00:00.000Z',
           'pending', 'brain2-2026-v1', 3, '2026-07-12T00:00:00.000Z', '2026-07-12T00:29:30.000Z');
      `,
    })

    execFileSync('sqlite3', [database], {
      input: bindSql(EMAIL_EXPIRE_SQL, ['2026-07-12T00:26:00.000Z', 3, '2026-07-12T00:05:00.000Z']),
    })
    assert.equal(execFileSync('sqlite3', [database, "SELECT status FROM email_queue WHERE id='race-queue';"], { encoding: 'utf8' }).trim(), 'pending')

    execFileSync('sqlite3', [database], {
      input: bindSql(EMAIL_OWNED_UPDATE_SQL, ['failed', 'stale_owner', 'race-queue', 2, '2026-07-12T00:20:00.000Z']),
    })
    assert.equal(execFileSync('sqlite3', [database, "SELECT status,error_message FROM email_queue WHERE id='race-queue';"], { encoding: 'utf8' }).trim(), 'pending|')

    execFileSync('sqlite3', [database, "UPDATE email_queue SET last_attempt_at='2026-07-12T00:20:00.000Z' WHERE id='race-queue';"])
    execFileSync('sqlite3', [database], {
      input: bindSql(EMAIL_EXPIRE_SQL, ['2026-07-12T00:26:00.000Z', 3, '2026-07-12T00:05:00.000Z']),
    })
    assert.equal(execFileSync('sqlite3', [database, "SELECT status,error_message FROM email_queue WHERE id='race-queue';"], { encoding: 'utf8' }).trim(), 'failed|delivery_unknown')
  } finally {
    rmSync(database, { force: true })
  }
})

test('sender is v1-only, atomically claimed, Brevo-idempotent and initially inert', () => {
  const sender = readFileSync(new URL('../workers/api/email-drip.ts', import.meta.url), 'utf8')
  const config = readFileSync(new URL('../wrangler.brain2-email.toml', import.meta.url), 'utf8')
  const migration = readFileSync(new URL('../workers/migrations/0002_brain2_access_and_email_campaign.sql', import.meta.url), 'utf8')

  assert.match(sender, /UPDATE email_queue[\s\S]*campaign_version\s*=\s*'brain2-2026-v1'[\s\S]*RETURNING/i)
  assert.match(sender, /attempt_count[\s\S]*first_attempt_at[\s\S]*last_attempt_at/i)
  assert.match(sender, /is_unsubscribed\s*=\s*0/i)
  assert.match(sender, /delivery_unknown[\s\S]*last_attempt_at\s*<=\s*\?/i)
  assert.match(sender, /status\s*=\s*'pending'[\s\S]*attempt_count\s*=\s*\?[\s\S]*last_attempt_at\s*=\s*\?/i)
  assert.match(sender, /idempotencyKey/i)
  assert.match(sender, /AbortSignal\.timeout\(PROVIDER_TIMEOUT_MS\)/)
  assert.match(sender, /api\.brevo\.com\/v3\/smtp\/email/)
  assert.doesNotMatch(sender, /\/trigger|signup\.email\)|response\.text\(|errorText|console\.(?:log|error)\([^)]*(?:email|name)/i)
  assert.match(migration, /quarantine[\s\S]*legacy-v0/i)
  assert.match(config, /workers_dev\s*=\s*false/)
  assert.match(config, /preview_urls\s*=\s*false/)
  assert.match(config, /crons\s*=\s*\[\s*\]/)
  assert.match(config, /BRAIN2_EMAIL_ADMIN_SECRET|email-admin/)
  assert.match(config, /pattern\s*=\s*"thongphan\.com\/brain2\/21-ngay\/api\/unsubscribe\*"/)
  assert.match(config, /pattern\s*=\s*"www\.thongphan\.com\/brain2\/21-ngay\/api\/unsubscribe\*"/)
  assert.doesNotMatch(config, /BREVO_API_KEY\s*=/)

  const signupConfig = readFileSync(new URL('../wrangler.signup.toml', import.meta.url), 'utf8')
  assert.match(signupConfig, /workers_dev\s*=\s*false/)
  assert.match(signupConfig, /preview_urls\s*=\s*false/)
  assert.match(signupConfig, /SIGNUP_IP_RATE_LIMITER[\s\S]*SIGNUP_EMAIL_RATE_LIMITER/)
})

test('Brevo payload and signed unsubscribe token contain no raw credential or recipient in logs', async () => {
  const item = {
    id: '00000000-0000-4000-8000-000000000001',
    day: 8,
    subject: 'Synthetic subject',
    body: getBrain2EmailContent(8, 21).body,
  }
  const secret = 'task8-unsubscribe-secret-that-is-at-least-thirty-two-bytes'
  const token = await createUnsubscribeToken('00000000-0000-4000-8000-000000000002', secret)
  assert.equal(await verifyUnsubscribeToken(token, secret), '00000000-0000-4000-8000-000000000002')
  assert.equal(await verifyUnsubscribeToken(`${token}x`, secret), null)

  const html = personalizeBrain2Email(item.body, {
    name: 'Synthetic Name',
    unsubscribeUrl: `${ORIGIN}${UNSUBSCRIBE_PATH}?token=${encodeURIComponent(token)}`,
  })
  const payload = buildBrevoPayload(item, { name: 'Synthetic Name', email: 'synthetic@example.com' }, html)
  assert.equal(payload.headers.idempotencyKey, item.id)
  assert.deepEqual(payload.to, [{ name: 'Synthetic Name', email: 'synthetic@example.com' }])
  assert.equal(JSON.stringify(payload).includes(secret), false)
  assert.equal(ADMIN_PATH, '/brain2/21-ngay/api/email-admin')
  assert.equal(UNSUBSCRIBE_PATH, '/brain2/21-ngay/api/unsubscribe')
})

class SenderStatement {
  values: unknown[] = []

  constructor(readonly query: string, private readonly database: SenderDatabase) {}

  bind(...values: unknown[]) {
    this.values = values
    return this
  }

  async first<T>() {
    if (/RETURNING id, signup_id, day, subject, body, attempt_count/i.test(this.query)) {
      if (this.database.claimed) return null
      this.database.claimed = true
      return this.database.item as T
    }
    if (/SELECT name, email, is_unsubscribed/i.test(this.query)) return this.database.recipient as T
    throw new Error(`Unexpected sender first query: ${this.query}`)
  }

  async run() {
    this.database.runs.push(this)
    return { success: true }
  }
}

class SenderDatabase {
  claimed = false
  failBatch = false
  runs: SenderStatement[] = []
  batches: SenderStatement[][] = []
  item = {
    id: '00000000-0000-4000-8000-000000000011',
    signup_id: '00000000-0000-4000-8000-000000000012',
    day: 8,
    subject: getBrain2EmailContent(8, 21).subject,
    body: getBrain2EmailContent(8, 21).body,
    attempt_count: 1,
  }
  recipient = { name: 'Synthetic Recipient', email: 'synthetic@example.com', is_unsubscribed: 0 }

  prepare(query: string) {
    return new SenderStatement(query, this)
  }

  async batch(statements: SenderStatement[]) {
    if (this.failBatch) throw new Error('synthetic email batch failure')
    this.batches.push(statements)
    return statements.map(() => ({ success: true }))
  }
}

const emailEnv = (DB: SenderDatabase) => ({
  DB,
  BREVO_API_KEY: 'task8-brevo-key-fixture-at-least-thirty-two-bytes',
  BRAIN2_EMAIL_ADMIN_SECRET: 'task8-admin-secret-fixture-at-least-thirty-two-bytes',
  BRAIN2_EMAIL_UNSUBSCRIBE_SECRET: 'task8-unsubscribe-secret-fixture-at-least-thirty-two-bytes',
})

test('sender claims one v1 row, sends an idempotent link email and treats Brevo duplicate as accepted', async () => {
  const DB = new SenderDatabase()
  const calls: Array<{ url: string; init?: RequestInit }> = []
  const report = await processPendingEmails(emailEnv(DB) as never, {
    now: () => new Date('2026-07-12T00:00:00.000Z'),
    fetcher: (async (input: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(input), init })
      return new Response(JSON.stringify({ code: 'duplicate_parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }) as typeof fetch,
  })
  assert.deepEqual(report, { selected: 1, sent: 1, failed: 0, retry: 0 })
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://api.brevo.com/v3/smtp/email')
  assert.ok(calls[0].init?.signal instanceof AbortSignal)
  const payload = JSON.parse(String(calls[0].init?.body))
  assert.equal(payload.headers.idempotencyKey, DB.item.id)
  assert.match(payload.htmlContent, /unsubscribe\?token=/)
  assert.doesNotMatch(payload.htmlContent, /\{\{name\}\}|\{\{unsubscribe_url\}\}/)
  assert.equal(DB.batches.length, 1)
  assert.equal(DB.batches[0][1].values[0], DB.item.id)
  assert.ok(DB.runs.every((statement) => !statement.query.includes('legacy-v0')))
})

test('email admin and unsubscribe routes are authenticated, no-store and GET unsubscribe never mutates', async () => {
  const DB = new SenderDatabase()
  const env = emailEnv(DB)
  const accountCalls: string[] = []
  const worker = createBrain2EmailWorker({
    fetcher: (async (input: string | URL | Request) => {
      accountCalls.push(String(input))
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch,
  })

  const unauthorized = await worker.fetch(new Request(`${ORIGIN}${ADMIN_PATH}`), env as never)
  assert.equal(unauthorized.status, 401)
  assert.equal(accountCalls.length, 0)
  const health = await worker.fetch(new Request(`${ORIGIN}${ADMIN_PATH}`, {
    headers: { Authorization: `Bearer ${env.BRAIN2_EMAIL_ADMIN_SECRET}` },
  }), env as never)
  assert.equal(health.status, 204)
  assert.deepEqual(accountCalls, ['https://api.brevo.com/v3/account'])
  assert.match(health.headers.get('cache-control') ?? '', /no-store/)
  assert.equal((await worker.fetch(new Request(`${ORIGIN}/trigger`, { method: 'POST' }), env as never)).status, 404)

  const signupId = '00000000-0000-4000-8000-000000000012'
  const token = await createUnsubscribeToken(signupId, env.BRAIN2_EMAIL_UNSUBSCRIBE_SECRET)
  const get = await worker.fetch(new Request(`${ORIGIN}${UNSUBSCRIBE_PATH}?token=${encodeURIComponent(token)}`), env as never)
  assert.equal(get.status, 200)
  assert.equal(DB.batches.length, 0)
  const post = await worker.fetch(new Request(`${ORIGIN}${UNSUBSCRIBE_PATH}?token=${encodeURIComponent(token)}`, { method: 'POST' }), env as never)
  assert.equal(post.status, 200)
  assert.match(await post.clone().text(), /Đã dừng email/i)
  assert.equal(DB.batches.length, 1)
  assert.ok(DB.batches[0].some((statement) => /campaign_version = 'brain2-2026-v1'/.test(statement.query)))

  const failedDB = new SenderDatabase()
  failedDB.failBatch = true
  const failedWorker = createBrain2EmailWorker()
  const failedToken = await createUnsubscribeToken(signupId, emailEnv(failedDB).BRAIN2_EMAIL_UNSUBSCRIBE_SECRET)
  const failedPost = await failedWorker.fetch(
    new Request(`${ORIGIN}${UNSUBSCRIBE_PATH}?token=${encodeURIComponent(failedToken)}`, { method: 'POST' }),
    emailEnv(failedDB) as never,
  )
  assert.equal(failedPost.status, 503)
  assert.match(failedPost.headers.get('cache-control') ?? '', /no-store/)
  assert.match(await failedPost.text(), /chưa thể lưu yêu cầu/i)
})

test('both signup surfaces share v2 logic and the hub mounts the corrected resilient form', () => {
  const workerSignup = readFileSync(new URL('../workers/api/signup.ts', import.meta.url), 'utf8')
  const pagesSignup = readFileSync(new URL('../functions/api/signup.ts', import.meta.url), 'utf8')
  const form = readFileSync(new URL('../components/SignupForm.tsx', import.meta.url), 'utf8')
  const hub = readFileSync(new URL('../app/brain2/21-ngay/page.tsx', import.meta.url), 'utf8')
  const oldEmailContent = readFileSync(new URL('../workers/api/email-content.ts', import.meta.url), 'utf8')

  assert.match(workerSignup, /handleBrain2SignupRequest/)
  assert.match(pagesSignup, /handleBrain2SignupRequest/)
  assert.doesNotMatch(`${workerSignup}\n${pagesSignup}`, /setHours\(|INSERT INTO email_queue/)
  assert.match(form, /data\.message\s*\?\?\s*data\.error/)
  assert.match(form, /response\.json\(\)\.catch/)
  assert.match(form, /data\.success\s*!==\s*true/)
  assert.doesNotMatch(form, /setFormData\(\{\s*name:\s*['"]['"],\s*email:/)
  assert.doesNotMatch(form, /error instanceof Error/)
  assert.match(hub, /<SignupForm\s+challengeSlug="brain2-21-ngay"/)
  assert.match(oldEmailContent, /brain2-campaign/)
  assert.doesNotMatch(oldEmailContent, /prompt-box|đang được chuẩn bị|identity-career-direction/i)

  const workerReadme = readFileSync(new URL('../workers/README.md', import.meta.url), 'utf8')
  assert.doesNotMatch(workerReadme, /\/api\/email-drip\/trigger|mailchannels\.net|thongphan-email-drip/i)
  assert.match(workerReadme, /wrangler\.brain2-email\.toml/)

  const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { scripts?: Record<string, string> }
  assert.equal(packageJson.scripts?.['typecheck:brain2-workers'], 'tsc --noEmit -p tsconfig.brain2-workers.json')
  assert.match(workerReadme, /typecheck:brain2-workers/)
})
