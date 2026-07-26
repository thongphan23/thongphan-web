#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import {
  closeSync,
  lstatSync,
  openSync,
  readFileSync,
  readSync,
  realpathSync,
} from 'node:fs';
import { basename, relative, resolve, sep } from 'node:path';

const MAX_TEXT_BYTES = 8 * 1024 * 1024;
const BINARY_SAMPLE_BYTES = 8 * 1024;
const CANDIDATE_PATTERN = /(?<![A-Za-z0-9_./+=-])([A-Za-z0-9][A-Za-z0-9_./+=-]{31,})(?![A-Za-z0-9_./+=-])/g;
const ASSIGNMENT_PATTERN = /(?:^|[\s`"'[{(,;])([A-Za-z][A-Za-z0-9_.-]*(?:token|secret|password|api[_-]?key|access[_-]?key)[A-Za-z0-9_.-]*)\s*(?:=|:)\s*(.*)$/i;
const TOKEN_LABEL_PATTERN = /(?:^|[^A-Za-z0-9])(?:token|api[_ -]?key|secret|credential)(?=$|[^A-Za-z0-9])/i;
const PROVIDER_PATTERN = /(?:^|[^A-Za-z0-9])(?:cloudflare|openai|brevo|resend|stripe|github|anthropic|google|vectorize)(?=$|[^A-Za-z0-9])/i;
const BEARER_PATTERN = /\bbearer\s+([A-Za-z0-9_./+=-]{32,})/i;

class ScannerFailure extends Error {
  constructor(classification, file) {
    super(classification);
    this.classification = classification;
    this.file = file;
  }
}

function fail(classification, file) {
  throw new ScannerFailure(classification, file);
}

function runGit(root, args, options = {}) {
  try {
    return execFileSync('git', args, {
      cwd: root,
      encoding: options.encoding ?? 'buffer',
      maxBuffer: options.maxBuffer ?? 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    fail('git_failure');
  }
}

function parseArguments(args) {
  const known = new Set(['--history', '--include-local-env']);
  const seen = new Set();
  for (const argument of args) {
    if (!known.has(argument) || seen.has(argument)) {
      fail('invalid_arguments');
    }
    seen.add(argument);
  }
  if (seen.has('--history') && seen.has('--include-local-env')) {
    fail('invalid_arguments');
  }
  return {
    history: seen.has('--history'),
    includeLocalEnv: seen.has('--include-local-env'),
  };
}

function repositoryRoot() {
  const output = runGit(process.cwd(), ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
  });
  const root = output.trim();
  if (root === '') {
    fail('git_failure');
  }
  return realpathSync(root);
}

function splitNul(buffer) {
  return buffer
    .toString('utf8')
    .split('\0')
    .filter((entry) => entry !== '');
}

function trackedPaths(root) {
  return splitNul(runGit(root, ['ls-files', '-z', '--cached']));
}

function ignoredLocalEnvironmentPaths(root) {
  const paths = splitNul(
    runGit(root, [
      'ls-files',
      '-z',
      '--others',
      '--ignored',
      '--exclude-standard',
      '--',
      ':(glob).env*',
      ':(glob)**/.env*',
    ]),
  );
  return paths.filter((path) => basename(path).startsWith('.env'));
}

function resolveInsideRoot(root, file) {
  const absolutePath = resolve(root, file);
  const relativePath = relative(root, absolutePath);
  if (
    relativePath === '' ||
    relativePath === '..' ||
    relativePath.startsWith(`..${sep}`) ||
    resolve(root, relativePath) !== absolutePath
  ) {
    fail('path_outside_repository', file);
  }
  return absolutePath;
}

function sampleFile(absolutePath, bytes) {
  const descriptor = openSync(absolutePath, 'r');
  try {
    const sample = Buffer.alloc(Math.min(bytes, BINARY_SAMPLE_BYTES));
    const count = readSync(descriptor, sample, 0, sample.length, 0);
    return sample.subarray(0, count);
  } finally {
    closeSync(descriptor);
  }
}

function isBinary(buffer) {
  return buffer.includes(0);
}

function decodeText(buffer) {
  if (isBinary(buffer)) {
    return null;
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return null;
  }
}

function readTrackedText(root, file) {
  const absolutePath = resolveInsideRoot(root, file);
  let stat;
  try {
    stat = lstatSync(absolutePath);
  } catch {
    fail('unreadable_file', file);
  }
  if (stat.isSymbolicLink()) {
    fail('symlink_rejected', file);
  }
  if (!stat.isFile()) {
    return null;
  }
  if (stat.size > MAX_TEXT_BYTES) {
    const sample = sampleFile(absolutePath, stat.size);
    if (isBinary(sample)) {
      return null;
    }
    fail('oversized_text_rejected', file);
  }
  return decodeText(readFileSync(absolutePath));
}

function entropy(value) {
  const counts = new Map();
  for (const character of value) {
    counts.set(character, (counts.get(character) ?? 0) + 1);
  }
  let bits = 0;
  for (const count of counts.values()) {
    const probability = count / value.length;
    bits -= probability * Math.log2(probability);
  }
  return bits;
}

function isPlaceholder(value) {
  return (
    value.startsWith('${') ||
    value.startsWith('$') ||
    /^<[^>]+>$/.test(value) ||
    /^\[[^\]]+\]$/.test(value) ||
    /^(?:your[_-]|example|placeholder|redacted|change[_-]?me|x{8,})/i.test(value) ||
    /(?:^|[_-])(?:test|fixture|example|placeholder|synthetic|fake|dummy|mock|dev|local)(?:[_-]|$)/i.test(
      value,
    )
  );
}

function candidateValues(text, { allowPathLike = false } = {}) {
  const values = [];
  for (const match of text.matchAll(CANDIDATE_PATTERN)) {
    const value = match[1];
    const looksLikePath =
      value.includes('/') ||
      /\.(?:mjs|cjs|js|ts|tsx|md|json|html|css|map|png|jpe?g|svg|mp4)$/i.test(
        value,
      );
    const looksLikeEnvironmentReference = /^(?:(?:(?:process|import\.meta)\.)?env\.)?[A-Z][A-Z0-9_]+$/.test(
      value,
    );
    if (
      (allowPathLike || !looksLikePath) &&
      !looksLikeEnvironmentReference &&
      !/^[a-f0-9]+$/i.test(value) &&
      !isPlaceholder(value) &&
      new Set(value).size >= 8 &&
      entropy(value) >= 3
    ) {
      values.push(value);
    }
  }
  return values;
}

function isSecretName(name) {
  const leaf = name.split(/[.-]/).at(-1);
  if (/(?:type|count|length|name|label|status|expires|expiry|scope|id)s?$/i.test(leaf)) {
    return false;
  }
  const namedSecret =
    /(?:^|[_-])(?:token|secret|password|api[_-]?key|access[_-]?key)$/i.test(leaf) ||
    /^(?:token|secret|password|key|apiKey|accessToken|authToken|refreshToken|cloudflareApiToken)$/i.test(
      leaf,
    );
  const providerNamedSecret =
    /(?:cloudflare|openai|brevo|resend|stripe|github|anthropic|google|vectorize)/i.test(
      leaf,
    ) && /(?:token|secret|password|key)/i.test(leaf);
  return (
    providerNamedSecret ||
    (namedSecret && /^(?:api|access|auth|bearer)[_-]?(?:token|key|secret)$/i.test(leaf))
  );
}

function providerContextBefore(lines, index) {
  let openFence = -1;
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (lines[cursor].trim().startsWith('```')) {
      openFence = openFence === -1 ? cursor : -1;
    }
  }
  if (openFence !== -1) {
    return lines.slice(Math.max(0, openFence - 1), index).join(' ');
  }
  return lines.slice(Math.max(0, index - 2), index).join(' ');
}

function findingsForText(text, file, classification) {
  const findings = [];
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const bearer = line.match(BEARER_PATTERN);
    if (
      bearer &&
      candidateValues(bearer[1], { allowPathLike: true }).length > 0
    ) {
      findings.push({
        rule_id: 'bearer-token-literal',
        file,
        line: index + 1,
        classification,
      });
      continue;
    }
    const assignment = line.match(ASSIGNMENT_PATTERN);
    if (
      assignment &&
      isSecretName(assignment[1]) &&
      candidateValues(assignment[2], { allowPathLike: true }).length > 0
    ) {
      findings.push({
        rule_id: 'named-secret-assignment',
        file,
        line: index + 1,
        classification,
      });
      continue;
    }
    if (
      PROVIDER_PATTERN.test(line) &&
      TOKEN_LABEL_PATTERN.test(line) &&
      candidateValues(line).length > 0
    ) {
      findings.push({
        rule_id: 'token-labeled-prose',
        file,
        line: index + 1,
        classification,
      });
      continue;
    }
    const context = providerContextBefore(lines, index);
    if (
      PROVIDER_PATTERN.test(context) &&
      TOKEN_LABEL_PATTERN.test(context) &&
      candidateValues(line).length > 0
    ) {
      findings.push({
        rule_id: 'token-labeled-prose',
        file,
        line: index + 1,
        classification,
      });
      continue;
    }
  }
  return findings;
}

function scanCurrentTree(root, includeLocalEnv) {
  const files = trackedPaths(root).map((file) => ({
    file,
    classification: 'tracked_plaintext',
  }));
  if (includeLocalEnv) {
    files.push(
      ...ignoredLocalEnvironmentPaths(root).map((file) => ({
        file,
        classification: 'local_env_plaintext',
      })),
    );
  }

  const findings = [];
  const seen = new Set();
  for (const entry of files) {
    const key = `${entry.classification}\0${entry.file}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    const text = readTrackedText(root, entry.file);
    if (text !== null) {
      findings.push(...findingsForText(text, entry.file, entry.classification));
    }
  }
  return findings;
}

function historyObjects(root) {
  const listing = runGit(root, ['rev-list', '--objects', '--all'], {
    encoding: 'utf8',
  });
  const records = [];
  for (const line of listing.split('\n')) {
    const separator = line.indexOf(' ');
    if (separator <= 0) {
      continue;
    }
    const objectId = line.slice(0, separator);
    const file = line.slice(separator + 1);
    if (file !== '') {
      records.push({ objectId, file });
    }
  }
  return records;
}

function historyObjectMetadata(root, records) {
  if (records.length === 0) {
    return new Map();
  }
  const input = `${records.map(({ objectId }) => objectId).join('\n')}\n`;
  const result = spawnSync(
    'git',
    ['cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)'],
    {
      cwd: root,
      encoding: 'utf8',
      input,
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  if (result.status !== 0) {
    fail('git_failure');
  }
  const metadata = new Map();
  for (const line of result.stdout.trim().split('\n')) {
    const [objectId, type, rawSize] = line.split(' ');
    metadata.set(objectId, { type, size: Number(rawSize) });
  }
  return metadata;
}

function scanHistory(root) {
  const records = historyObjects(root);
  const metadata = historyObjectMetadata(root, records);
  const findings = [];
  const scanned = new Set();
  for (const { objectId, file } of records) {
    const object = metadata.get(objectId);
    if (!object || object.type !== 'blob') {
      continue;
    }
    const key = `${objectId}\0${file}`;
    if (scanned.has(key)) {
      continue;
    }
    scanned.add(key);
    if (!Number.isSafeInteger(object.size) || object.size < 0) {
      fail('invalid_history_object', file);
    }
    if (object.size > MAX_TEXT_BYTES) {
      continue;
    }
    const buffer = runGit(root, ['cat-file', 'blob', objectId], {
      maxBuffer: MAX_TEXT_BYTES + 1,
    });
    const text = decodeText(buffer);
    if (text !== null) {
      findings.push(...findingsForText(text, file, 'history_plaintext'));
    }
  }
  return findings;
}

function stableUniqueFindings(findings) {
  const unique = new Map();
  for (const finding of findings) {
    const key = [
      finding.classification,
      finding.file,
      finding.line,
      finding.rule_id,
    ].join('\0');
    unique.set(key, finding);
  }
  return [...unique.values()].sort(
    (left, right) =>
      left.file.localeCompare(right.file) ||
      left.line - right.line ||
      left.rule_id.localeCompare(right.rule_id) ||
      left.classification.localeCompare(right.classification),
  );
}

function reportFailure(error) {
  const classification =
    error instanceof ScannerFailure ? error.classification : 'scanner_failure';
  const file = error instanceof ScannerFailure ? error.file : undefined;
  const fields = [`classification=${classification}`];
  if (file) {
    fields.push(`file=${file}`);
  }
  process.stderr.write(`scanner_error ${fields.join(' ')}\n`);
  process.exitCode = 2;
}

try {
  const options = parseArguments(process.argv.slice(2));
  const root = repositoryRoot();
  const findings = stableUniqueFindings(
    options.history
      ? scanHistory(root)
      : scanCurrentTree(root, options.includeLocalEnv),
  );
  for (const finding of findings) {
    process.stdout.write(`${JSON.stringify(finding)}\n`);
  }
  process.exitCode = findings.length > 0 ? 1 : 0;
} catch (error) {
  reportFailure(error);
}
