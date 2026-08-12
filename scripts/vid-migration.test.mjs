import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { backup, DatabaseSync } from 'node:sqlite'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const wranglerPath = join(repositoryRoot, 'node_modules/.bin/wrangler')
const schema = await readFile('workers/vid/migrations/0001_vid_catalog.sql', 'utf8')
const presentation = await readFile('workers/vid/migrations/0002_vid_presentation.sql', 'utf8')

function columns(database) {
  return database.prepare("SELECT name, type, \"notnull\" AS required, dflt_value AS defaultValue FROM pragma_table_info('vid_videos') ORDER BY cid").all()
}

function seedProductionLikeSnapshot(database) {
  database.exec(`
    INSERT INTO vid_videos (
      id, slug, bunny_video_id, idempotency_key, title, description, source_title,
      source_creator, source_creator_url, source_video_url, translation_label,
      rights_status, rights_note, tags_json, search_text, duration_seconds,
      thumbnail_url, preview_url, player_url, status, media_status, featured_rank,
      published_at, created_at, updated_at
    ) VALUES (
      'vid-01', 'ky-thuat-prompting-claude', 'bunny-01', 'upload-01',
      'Kỹ thuật prompting Claude', 'Mô tả', 'Claude prompting', 'Original Creator',
      'https://example.com/creator', 'https://example.com/video', 'Bản thuyết minh tiếng Việt',
      'owner-reviewed', 'Đã rà soát', '["ai"]', 'ky thuat prompting claude', 605,
      'https://example.com/thumb.jpg', 'https://example.com/preview.webp',
      'https://player.mediadelivery.net/embed/library/bunny-01', 'published', 'ready', 1,
      '2026-08-12T08:00:00.000Z', '2026-08-12T07:00:00.000Z', '2026-08-12T08:00:00.000Z'
    );
    INSERT INTO vid_topics (slug, label) VALUES ('ai', 'AI');
    INSERT INTO vid_video_topics (video_id, topic_slug) VALUES ('vid-01', 'ai');
    INSERT INTO vid_playlists (slug, title, description, published, updated_at)
      VALUES ('ai-foundation', 'AI Foundation', 'Nền tảng', 1, '2026-08-12T08:00:00.000Z');
    INSERT INTO vid_playlist_videos (playlist_slug, video_id, position)
      VALUES ('ai-foundation', 'vid-01', 0);
  `)
}

function runWrangler(args, cwd) {
  assert.equal(args.includes('--local'), true, 'migration test must target local D1')
  assert.equal(args.includes('--remote'), false, 'migration test must never target remote D1')
  const result = spawnSync(wranglerPath, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, CI: '1', WRANGLER_SEND_METRICS: 'false' },
    maxBuffer: 8 * 1024 * 1024,
  })
  assert.equal(result.status, 0, `Wrangler failed: ${args.join(' ')}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`)
  return `${result.stdout}\n${result.stderr}`
}

async function createLocalD1Fixture(name, migrationFiles) {
  const fixtureRoot = await mkdtemp(join(tmpdir(), `${name}-`))
  const migrationsDirectory = join(fixtureRoot, 'migrations')
  const persistenceDirectory = join(fixtureRoot, 'state')
  await mkdir(migrationsDirectory)
  await mkdir(persistenceDirectory)
  for (const file of migrationFiles) {
    await copyFile(join(repositoryRoot, 'workers/vid/migrations', file), join(migrationsDirectory, file))
  }
  const configPath = join(fixtureRoot, 'wrangler.toml')
  await writeFile(configPath, [
    '[[d1_databases]]',
    'binding = "VID_DB"',
    `database_name = "${name}"`,
    'database_id = "00000000-0000-0000-0000-000000000002"',
    'migrations_dir = "migrations"',
    '',
  ].join('\n'))
  return { fixtureRoot, configPath, persistenceDirectory }
}

test('Wrangler local D1 applies 0001 and 0002 to a fresh database', async () => {
  const fixture = await createLocalD1Fixture('vid-fresh-fixture', ['0001_vid_catalog.sql', '0002_vid_presentation.sql'])
  try {
    const applied = runWrangler([
      'd1', 'migrations', 'apply', 'vid-fresh-fixture', '--local', '--config', fixture.configPath,
      '--persist-to', fixture.persistenceDirectory,
    ], fixture.fixtureRoot)
    assert.match(applied, /0001_vid_catalog\.sql/)
    assert.match(applied, /0002_vid_presentation\.sql/)
    const evidence = runWrangler([
      'd1', 'execute', 'vid-fresh-fixture', '--local', '--config', fixture.configPath,
      '--persist-to', fixture.persistenceDirectory, '--json', '--command',
      "SELECT COUNT(*) AS focal_columns FROM pragma_table_info('vid_videos') WHERE name IN ('thumbnail_focal_x','thumbnail_focal_y');",
    ], fixture.fixtureRoot)
    assert.match(evidence, /"focal_columns"\s*:\s*2/)
  } finally {
    await rm(fixture.fixtureRoot, { recursive: true, force: true })
  }
})

test('Wrangler local D1 applies 0002 to a populated pre-migration snapshot', async () => {
  const fixture = await createLocalD1Fixture('vid-populated-fixture', ['0002_vid_presentation.sql'])
  const schemaPath = join(fixture.fixtureRoot, '0001.sql')
  const snapshotPath = join(fixture.fixtureRoot, 'snapshot.sql')
  await writeFile(schemaPath, schema)
  await writeFile(snapshotPath, [
    "INSERT INTO vid_videos (id, slug, bunny_video_id, idempotency_key, title, description, source_title, source_creator, source_creator_url, source_video_url, translation_label, rights_status, rights_note, tags_json, search_text, duration_seconds, thumbnail_url, preview_url, player_url, status, media_status, featured_rank, published_at, created_at, updated_at)",
    "VALUES ('vid-01', 'ky-thuat-prompting-claude', 'bunny-01', 'upload-01', 'Kỹ thuật prompting Claude', 'Mô tả', 'Claude prompting', 'Original Creator', 'https://example.com/creator', 'https://example.com/video', 'Bản thuyết minh tiếng Việt', 'owner-reviewed', 'Đã rà soát', '[\"ai\"]', 'ky thuat prompting claude', 605, 'https://example.com/thumb.jpg', 'https://example.com/preview.webp', 'https://player.mediadelivery.net/embed/library/bunny-01', 'published', 'ready', 1, '2026-08-12T08:00:00.000Z', '2026-08-12T07:00:00.000Z', '2026-08-12T08:00:00.000Z');",
    "INSERT INTO vid_topics (slug, label) VALUES ('ai', 'AI');",
    "INSERT INTO vid_video_topics (video_id, topic_slug) VALUES ('vid-01', 'ai');",
    "INSERT INTO vid_playlists (slug, title, description, published, updated_at) VALUES ('ai-foundation', 'AI Foundation', 'Nền tảng', 1, '2026-08-12T08:00:00.000Z');",
    "INSERT INTO vid_playlist_videos (playlist_slug, video_id, position) VALUES ('ai-foundation', 'vid-01', 0);",
    '',
  ].join('\n'))
  try {
    for (const file of [schemaPath, snapshotPath]) {
      runWrangler([
        'd1', 'execute', 'vid-populated-fixture', '--local', '--config', fixture.configPath,
        '--persist-to', fixture.persistenceDirectory, '--file', file,
      ], fixture.fixtureRoot)
    }
    const applied = runWrangler([
      'd1', 'migrations', 'apply', 'vid-populated-fixture', '--local', '--config', fixture.configPath,
      '--persist-to', fixture.persistenceDirectory,
    ], fixture.fixtureRoot)
    assert.match(applied, /0002_vid_presentation\.sql/)
    const evidence = runWrangler([
      'd1', 'execute', 'vid-populated-fixture', '--local', '--config', fixture.configPath,
      '--persist-to', fixture.persistenceDirectory, '--json', '--command',
      "SELECT slug, thumbnail_focal_x, thumbnail_focal_y, (SELECT COUNT(*) FROM vid_video_topics) AS topics, (SELECT COUNT(*) FROM vid_playlist_videos) AS playlist_items FROM vid_videos;",
    ], fixture.fixtureRoot)
    assert.match(evidence, /"slug"\s*:\s*"ky-thuat-prompting-claude"/)
    assert.match(evidence, /"thumbnail_focal_x"\s*:\s*50/)
    assert.match(evidence, /"thumbnail_focal_y"\s*:\s*24/)
    assert.match(evidence, /"topics"\s*:\s*1/)
    assert.match(evidence, /"playlist_items"\s*:\s*1/)
  } finally {
    await rm(fixture.fixtureRoot, { recursive: true, force: true })
  }
})

test('0002 applies after 0001 on a fresh SQLite/D1-compatible schema', () => {
  const database = new DatabaseSync(':memory:')
  try {
    database.exec(schema)
    database.exec(presentation)
    const focalColumns = columns(database)
      .filter(({ name }) => String(name).startsWith('thumbnail_focal_'))
      .map((row) => ({ ...row }))
    assert.deepEqual(focalColumns, [
      { name: 'thumbnail_focal_x', type: 'INTEGER', required: 1, defaultValue: '50' },
      { name: 'thumbnail_focal_y', type: 'INTEGER', required: 1, defaultValue: '24' },
    ])
  } finally {
    database.close()
  }
})

test('0002 preserves populated catalog relationships and backfills focal defaults', () => {
  const database = new DatabaseSync(':memory:')
  try {
    database.exec(schema)
    seedProductionLikeSnapshot(database)
    database.exec(presentation)

    assert.deepEqual(
      { ...database.prepare('SELECT slug, thumbnail_focal_x, thumbnail_focal_y FROM vid_videos').get() },
      { slug: 'ky-thuat-prompting-claude', thumbnail_focal_x: 50, thumbnail_focal_y: 24 },
    )
    assert.equal(database.prepare('SELECT COUNT(*) AS count FROM vid_video_topics').get().count, 1)
    assert.equal(database.prepare('SELECT COUNT(*) AS count FROM vid_playlist_videos').get().count, 1)
    assert.throws(() => database.exec('UPDATE vid_videos SET thumbnail_focal_x = -1 WHERE id = \'vid-01\';'), /CHECK constraint failed/)
    assert.throws(() => database.exec('UPDATE vid_videos SET thumbnail_focal_y = 101 WHERE id = \'vid-01\';'), /CHECK constraint failed/)
    assert.throws(() => database.exec('UPDATE vid_videos SET thumbnail_focal_x = 50.5 WHERE id = \'vid-01\';'), /CHECK constraint failed/)
    assert.throws(() => database.exec('UPDATE vid_videos SET thumbnail_focal_y = 24.5 WHERE id = \'vid-01\';'), /CHECK constraint failed/)
  } finally {
    database.close()
  }
})

test('pre-migration SQLite backup restores the exact populated schema and data', async () => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'vid-presentation-migration-'))
  const databasePath = join(fixtureRoot, 'catalog.sqlite')
  const snapshotPath = join(fixtureRoot, 'pre-0002.sqlite')
  const database = new DatabaseSync(databasePath)
  try {
    database.exec(schema)
    seedProductionLikeSnapshot(database)
    await backup(database, snapshotPath)
    database.exec(presentation)
    database.exec("UPDATE vid_videos SET thumbnail_focal_x = 17, thumbnail_focal_y = 83 WHERE id = 'vid-01';")
  } finally {
    database.close()
  }

  const restored = new DatabaseSync(snapshotPath, { readOnly: true })
  try {
    assert.equal(columns(restored).some(({ name }) => String(name).startsWith('thumbnail_focal_')), false)
    assert.deepEqual(
      { ...restored.prepare('SELECT id, slug, title FROM vid_videos').get() },
      { id: 'vid-01', slug: 'ky-thuat-prompting-claude', title: 'Kỹ thuật prompting Claude' },
    )
    assert.equal(restored.prepare('PRAGMA foreign_key_check').all().length, 0)
  } finally {
    restored.close()
    await rm(fixtureRoot, { recursive: true, force: true })
  }
})

test('migration runbook requires a pre-apply D1 bookmark and safe recovery choice', async () => {
  const runbook = await readFile('workers/vid/migrations/README.md', 'utf8')
  assert.match(runbook, /d1 time-travel info thongphan-vid .*--timestamp .*--json .*--config wrangler\.vid\.toml/)
  assert.match(runbook, /d1 time-travel restore thongphan-vid .*--bookmark .*--config wrangler\.vid\.toml/)
  assert.match(runbook, /forward repair/i)
  assert.match(runbook, /do not restore/i)
})
