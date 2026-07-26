import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';

const scannerPath = resolve('scripts/secret-integrity-scan.mjs');
const temporaryRoots = new Set();

function makeRepository() {
  const root = mkdtempSync(join(tmpdir(), 'secret-integrity-fixture-'));
  temporaryRoots.add(root);
  git(root, ['init', '--quiet']);
  return root;
}

function git(root, args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function writeFixture(root, relativePath, contents) {
  const absolutePath = join(root, relativePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents, 'utf8');
}

function track(root, ...paths) {
  git(root, ['add', '--', ...paths]);
}

function commit(root, message) {
  git(root, [
    '-c',
    'user.name=fixture',
    '-c',
    'user.email=fixture.invalid',
    'commit',
    '--quiet',
    '-m',
    message,
  ]);
}

function runScanner(root, args = []) {
  return spawnSync(process.execPath, [scannerPath, ...args], {
    cwd: root,
    encoding: 'utf8',
  });
}

function parseFindings(stdout) {
  const lines = stdout.trim() === '' ? [] : stdout.trim().split('\n');
  return lines.map((line) => JSON.parse(line));
}

function assertMetadataOnly(result, prohibitedValue) {
  assert.equal(result.stdout.includes(prohibitedValue), false);
  assert.equal(result.stderr.includes(prohibitedValue), false);
  for (const finding of parseFindings(result.stdout)) {
    assert.deepEqual(Object.keys(finding).sort(), [
      'classification',
      'file',
      'line',
      'rule_id',
    ]);
  }
}

function syntheticCredential() {
  return ['Az7_', 'By8-', 'Cx9_', 'Dw0-'].join('').repeat(3);
}

test.after(() => {
  for (const root of temporaryRoots) {
    rmSync(root, { force: true, recursive: true });
  }
});

test('reports a named secret assignment using metadata only', () => {
  const root = makeRepository();
  const value = syntheticCredential();
  writeFixture(root, 'fixtures/assignment.txt', `CLOUDFLARE_API_TOKEN="${value}"\n`);
  track(root, 'fixtures/assignment.txt');

  const result = runScanner(root);

  assert.equal(result.status, 1);
  assert.deepEqual(parseFindings(result.stdout), [
    {
      rule_id: 'named-secret-assignment',
      file: 'fixtures/assignment.txt',
      line: 1,
      classification: 'tracked_plaintext',
    },
  ]);
  assertMetadataOnly(result, value);
});

test('reports generic service, database, and API secret assignments', () => {
  const root = makeRepository();
  const value = syntheticCredential();
  writeFixture(
    root,
    'fixtures/generic-assignments.txt',
    [
      `SERVICE_TOKEN=${value}`,
      `DATABASE_PASSWORD=${value}`,
      `MY_API_KEY=${value}`,
      '',
    ].join('\n'),
  );
  track(root, 'fixtures/generic-assignments.txt');

  const result = runScanner(root);

  assert.equal(result.status, 1);
  assert.deepEqual(parseFindings(result.stdout), [
    {
      rule_id: 'named-secret-assignment',
      file: 'fixtures/generic-assignments.txt',
      line: 1,
      classification: 'tracked_plaintext',
    },
    {
      rule_id: 'named-secret-assignment',
      file: 'fixtures/generic-assignments.txt',
      line: 2,
      classification: 'tracked_plaintext',
    },
    {
      rule_id: 'named-secret-assignment',
      file: 'fixtures/generic-assignments.txt',
      line: 3,
      classification: 'tracked_plaintext',
    },
  ]);
  assertMetadataOnly(result, value);
});

test('ignores an explicit minimum-length test fixture phrase', () => {
  const root = makeRepository();
  writeFixture(
    root,
    'fixtures/public-fixture.test.ts',
    "const SESSION_SECRET = 'task6-session-secret-that-is-at-least-thirty-two-bytes'\n",
  );
  track(root, 'fixtures/public-fixture.test.ts');

  const result = runScanner(root);

  assert.equal(result.status, 0);
  assert.deepEqual(parseFindings(result.stdout), []);
});

test('accepts hexadecimal credentials only in explicit assignment and bearer contexts', () => {
  const root = makeRepository();
  const value = '0123456789abcdef'.repeat(2);
  writeFixture(
    root,
    'fixtures/hex-contexts.txt',
    [
      `CLOUDFLARE_API_TOKEN=${value}`,
      `Authorization: Bearer ${value}`,
      `Cloudflare token checksum: ${value}`,
      '',
    ].join('\n'),
  );
  track(root, 'fixtures/hex-contexts.txt');

  const result = runScanner(root);

  assert.equal(result.status, 1);
  assert.deepEqual(parseFindings(result.stdout), [
    {
      rule_id: 'named-secret-assignment',
      file: 'fixtures/hex-contexts.txt',
      line: 1,
      classification: 'tracked_plaintext',
    },
    {
      rule_id: 'bearer-token-literal',
      file: 'fixtures/hex-contexts.txt',
      line: 2,
      classification: 'tracked_plaintext',
    },
  ]);
  assertMetadataOnly(result, value);
});

test('reports token-labeled prose using metadata only', () => {
  const root = makeRepository();
  const value = syntheticCredential();
  writeFixture(root, 'notes/provider.txt', `Cloudflare token is valid: ${value}\n`);
  track(root, 'notes/provider.txt');

  const result = runScanner(root);

  assert.equal(result.status, 1);
  assert.deepEqual(parseFindings(result.stdout), [
    {
      rule_id: 'token-labeled-prose',
      file: 'notes/provider.txt',
      line: 1,
      classification: 'tracked_plaintext',
    },
  ]);
  assertMetadataOnly(result, value);
});

test('recognizes provider and token labels separated by underscores', () => {
  const root = makeRepository();
  const value = syntheticCredential();
  writeFixture(
    root,
    'notes/provider-identifier.txt',
    `Use CLOUDFLARE_API_TOKEN with literal ${value}\n`,
  );
  track(root, 'notes/provider-identifier.txt');

  const result = runScanner(root);

  assert.equal(result.status, 1);
  assert.deepEqual(parseFindings(result.stdout), [
    {
      rule_id: 'token-labeled-prose',
      file: 'notes/provider-identifier.txt',
      line: 1,
      classification: 'tracked_plaintext',
    },
  ]);
  assertMetadataOnly(result, value);
});

test('reports a provider token value on the following line', () => {
  const root = makeRepository();
  const value = syntheticCredential();
  writeFixture(
    root,
    'notes/provider.txt',
    ['Cloudflare API token used by this command:', value, ''].join('\n'),
  );
  track(root, 'notes/provider.txt');

  const result = runScanner(root);

  assert.equal(result.status, 1);
  assert.deepEqual(parseFindings(result.stdout), [
    {
      rule_id: 'token-labeled-prose',
      file: 'notes/provider.txt',
      line: 2,
      classification: 'tracked_plaintext',
    },
  ]);
  assertMetadataOnly(result, value);
});

test('reports a provider token literal later in the same semantic block', () => {
  const root = makeRepository();
  const value = syntheticCredential();
  writeFixture(
    root,
    'notes/provider-block.txt',
    [
      'Cloudflare API token used by the release command:',
      '```sh',
      'set -o errexit',
      'set -o nounset',
      '# authenticated provider request',
      value,
      '```',
      '',
    ].join('\n'),
  );
  track(root, 'notes/provider-block.txt');

  const result = runScanner(root);

  assert.equal(result.status, 1);
  assert.deepEqual(parseFindings(result.stdout), [
    {
      rule_id: 'token-labeled-prose',
      file: 'notes/provider-block.txt',
      line: 6,
      classification: 'tracked_plaintext',
    },
  ]);
  assertMetadataOnly(result, value);
});

test('reports a bearer credential literal without requiring a nearby token label', () => {
  const root = makeRepository();
  const value = syntheticCredential();
  writeFixture(
    root,
    'notes/provider-command.txt',
    `curl --header "Authorization: Bearer ${value}" https://example.invalid\n`,
  );
  track(root, 'notes/provider-command.txt');

  const result = runScanner(root);

  assert.equal(result.status, 1);
  assert.deepEqual(parseFindings(result.stdout), [
    {
      rule_id: 'bearer-token-literal',
      file: 'notes/provider-command.txt',
      line: 1,
      classification: 'tracked_plaintext',
    },
  ]);
  assertMetadataOnly(result, value);
});

test('ignores environment references, placeholders, and unrelated checksums', () => {
  const root = makeRepository();
  writeFixture(
    root,
    'fixtures/safe.txt',
    [
      'CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}',
      'CLOUDFLARE_API_TOKEN=[REDACTED — credential rotated]',
      'Cloudflare token: <TOKEN_FROM_SECRET_STORE>',
      `checksum: ${'a1'.repeat(32)}`,
      '',
    ].join('\n'),
  );
  track(root, 'fixtures/safe.txt');

  const result = runScanner(root);

  assert.equal(result.status, 0);
  assert.deepEqual(parseFindings(result.stdout), []);
});

test('ignores scanner paths and non-secret token metadata fields', () => {
  const root = makeRepository();
  const metadataValue = syntheticCredential();
  writeFixture(
    root,
    'fixtures/non-secrets.txt',
    [
      'Create scripts/secret-integrity-scan.mjs',
      'node scripts/secret-integrity-scan.mjs --history',
      `tokenType="${metadataValue}"`,
      '',
    ].join('\n'),
  );
  track(root, 'fixtures/non-secrets.txt');

  const result = runScanner(root);

  assert.equal(result.status, 0);
  assert.deepEqual(parseFindings(result.stdout), []);
  assertMetadataOnly(result, metadataValue);
});

test('ignores provider documentation paths without a file extension', () => {
  const root = makeRepository();
  writeFixture(
    root,
    'fixtures/provider-url.txt',
    'Cloudflare API token inventory: ops/provider/credential-material-production-record\n',
  );
  track(root, 'fixtures/provider-url.txt');

  const result = runScanner(root);

  assert.equal(result.status, 0);
  assert.deepEqual(parseFindings(result.stdout), []);
});

test('ignores checksums and unrelated metadata near provider-token documentation', () => {
  const root = makeRepository();
  const unrelatedMetadata = syntheticCredential();
  writeFixture(
    root,
    'fixtures/provider-metadata.txt',
    [
      'Cloudflare API token is loaded from CLOUDFLARE_API_TOKEN.',
      'No plaintext is recorded here.',
      '',
      `release checksum: ${'0123456789abcdef'.repeat(4)}`,
      'scripts/secret-integrity-scan.mjs',
      'The release artifact is documented separately.',
      `release artifact: ${unrelatedMetadata}`,
      '',
    ].join('\n'),
  );
  track(root, 'fixtures/provider-metadata.txt');

  const result = runScanner(root);

  assert.equal(result.status, 0);
  assert.deepEqual(parseFindings(result.stdout), []);
  assertMetadataOnly(result, unrelatedMetadata);
});

test('ignores long environment-variable references in provider code', () => {
  const root = makeRepository();
  writeFixture(
    root,
    'fixtures/provider-reference.txt',
    [
      'Brevo API token is supplied at runtime.',
      'const token = env.BRAIN2_EMAIL_PROVIDER_API_TOKEN;',
      'const header = `Bearer ${BRAIN2_EMAIL_PROVIDER_API_TOKEN}`;',
      '',
    ].join('\n'),
  );
  track(root, 'fixtures/provider-reference.txt');

  const result = runScanner(root);

  assert.equal(result.status, 0);
  assert.deepEqual(parseFindings(result.stdout), []);
});

test('ignores Node and browser environment references assigned to secret-named fields', () => {
  const root = makeRepository();
  writeFixture(
    root,
    'fixtures/provider-environment-code.txt',
    [
      'const accessToken = process.env.CLOUDFLARE_API_TOKEN;',
      'const apiKey = import.meta.env.BREVO_PROVIDER_API_KEY;',
      '',
    ].join('\n'),
  );
  track(root, 'fixtures/provider-environment-code.txt');

  const result = runScanner(root);

  assert.equal(result.status, 0);
  assert.deepEqual(parseFindings(result.stdout), []);
});

test('scans an exact ignored local environment file only when requested', () => {
  const root = makeRepository();
  const value = syntheticCredential();
  writeFixture(root, '.gitignore', '.env.fixture\n');
  writeFixture(root, '.env.fixture', `CLOUDFLARE_API_TOKEN=${value}\n`);
  track(root, '.gitignore');

  const defaultResult = runScanner(root);
  const localResult = runScanner(root, ['--include-local-env']);

  assert.equal(defaultResult.status, 0);
  assert.equal(localResult.status, 1);
  assert.deepEqual(parseFindings(localResult.stdout), [
    {
      rule_id: 'named-secret-assignment',
      file: '.env.fixture',
      line: 1,
      classification: 'local_env_plaintext',
    },
  ]);
  assertMetadataOnly(localResult, value);
});

test('history mode scans reachable prior blobs without exposing values or object IDs', () => {
  const root = makeRepository();
  const value = syntheticCredential();
  writeFixture(root, 'notes/provider.txt', `Cloudflare token is valid: ${value}\n`);
  track(root, 'notes/provider.txt');
  commit(root, 'fixture with prohibited value');
  writeFixture(root, 'notes/provider.txt', 'Cloudflare token: ${CLOUDFLARE_API_TOKEN}\n');
  track(root, 'notes/provider.txt');
  commit(root, 'fixture sanitized');

  const currentResult = runScanner(root);
  const historyResult = runScanner(root, ['--history']);

  assert.equal(currentResult.status, 0);
  assert.equal(historyResult.status, 1);
  assert.deepEqual(parseFindings(historyResult.stdout), [
    {
      rule_id: 'token-labeled-prose',
      file: 'notes/provider.txt',
      line: 1,
      classification: 'history_plaintext',
    },
  ]);
  assertMetadataOnly(historyResult, value);
});

test('history mode rejects oversized text instead of silently skipping it', () => {
  const root = makeRepository();
  writeFixture(root, 'archive/oversized.txt', 'historical-text-fixture\n'.repeat(400_000));
  track(root, 'archive/oversized.txt');
  commit(root, 'add oversized historical text');
  git(root, ['rm', '--quiet', '--', 'archive/oversized.txt']);
  commit(root, 'remove oversized historical text');

  const result = runScanner(root, ['--history']);

  assert.equal(result.status, 2);
  assert.deepEqual(parseFindings(result.stdout), []);
  assert.equal(result.stderr.includes('classification=oversized_text_rejected'), true);
  assert.equal(result.stderr.includes('file=archive/oversized.txt'), true);
});

test('history mode safely skips an oversized blob with a binary prefix', () => {
  const root = makeRepository();
  const binary = Buffer.alloc(9 * 1024 * 1024);
  const path = join(root, 'archive/large.bin');
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, binary);
  track(root, 'archive/large.bin');
  commit(root, 'add oversized historical binary');
  git(root, ['rm', '--quiet', '--', 'archive/large.bin']);
  commit(root, 'remove oversized historical binary');

  const result = runScanner(root, ['--history']);

  assert.equal(result.status, 0);
  assert.deepEqual(parseFindings(result.stdout), []);
});

test('rejects tracked symlinks without reading their targets', () => {
  const root = makeRepository();
  const outside = join(tmpdir(), `secret-integrity-outside-${process.pid}.txt`);
  writeFileSync(outside, 'outside fixture\n', 'utf8');
  temporaryRoots.add(outside);
  symlinkSync(outside, join(root, 'linked.txt'));
  track(root, 'linked.txt');

  const result = runScanner(root);

  assert.equal(result.status, 2);
  assert.deepEqual(parseFindings(result.stdout), []);
});

test('rejects oversized tracked text instead of partially scanning it', () => {
  const root = makeRepository();
  writeFixture(root, 'fixtures/oversized.txt', 'plain-text-fixture\n'.repeat(500_000));
  track(root, 'fixtures/oversized.txt');

  const result = runScanner(root);

  assert.equal(result.status, 2);
  assert.deepEqual(parseFindings(result.stdout), []);
});

test('returns scanner failure for unknown or incompatible flags', () => {
  const root = makeRepository();
  const unknown = runScanner(root, ['--unknown']);
  const incompatible = runScanner(root, ['--history', '--include-local-env']);

  assert.equal(unknown.status, 2);
  assert.equal(incompatible.status, 2);
  assert.deepEqual(parseFindings(unknown.stdout), []);
  assert.deepEqual(parseFindings(incompatible.stdout), []);
});
