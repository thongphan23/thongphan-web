import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  lstatSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const helperPath = fileURLToPath(
  new URL("./r0-1b-synthetic-identity.mjs", import.meta.url),
);

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "r0-1b-synthetic-identity-"));
  chmodSync(root, 0o700);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function runHelper(...args) {
  return spawnSync(process.execPath, [helperPath, ...args], {
    encoding: "utf8",
  });
}

function mode(path) {
  return lstatSync(path).mode & 0o777;
}

function assertFailureIsRedacted(result) {
  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, "");
  assert.doesNotMatch(
    result.stdout + result.stderr,
    /@|\.invalid|"(?:email|name|synthetic)"|[0-9a-f]{16,}/i,
  );
}

test("creates one private bounded synthetic identity with an exact interface", (t) => {
  const directory = fixture(t);
  const expectedPath = join(directory, "controlled-signup-identity.json");
  const result = runHelper("--directory", directory);

  assert.equal(result.status, 0);
  assert.equal(result.stdout, `${expectedPath}\n`);
  assert.equal(result.stderr, "");
  assert.equal(lstatSync(expectedPath).isSymbolicLink(), false);
  assert.equal(lstatSync(expectedPath).isFile(), true);
  assert.equal(mode(expectedPath), 0o600);

  const identity = JSON.parse(readFileSync(expectedPath, "utf8"));
  assert.deepEqual(Object.keys(identity), ["email", "name", "synthetic"]);
  assert.equal(identity.synthetic, true);
  assert.match(identity.name, /^R0\.1B Synthetic Signup [0-9a-f]{8}$/);
  assert.ok(identity.name.length >= 2 && identity.name.length <= 100);
  assert.equal(identity.email, identity.email.toLowerCase());
  assert.match(identity.email, /^r0-1b-[0-9a-f]{32}@signup\.invalid$/);
  assert.ok(identity.email.length <= 254);
});

test("generates unique identities across private directories", (t) => {
  const firstDirectory = fixture(t);
  const secondDirectory = fixture(t);
  const first = runHelper("--directory", firstDirectory);
  const second = runHelper("--directory", secondDirectory);

  assert.equal(first.status, 0);
  assert.equal(second.status, 0);
  const firstIdentity = JSON.parse(readFileSync(first.stdout.trim(), "utf8"));
  const secondIdentity = JSON.parse(readFileSync(second.stdout.trim(), "utf8"));
  assert.notEqual(firstIdentity.email, secondIdentity.email);
  assert.notEqual(firstIdentity.name, secondIdentity.name);
});

test("rejects a relative directory", () => {
  assertFailureIsRedacted(runHelper("--directory", "relative/evidence"));
});

test("rejects a symlink directory", (t) => {
  const realDirectory = fixture(t);
  const linkRoot = fixture(t);
  const link = join(linkRoot, "evidence-link");
  symlinkSync(realDirectory, link);

  assertFailureIsRedacted(runHelper("--directory", link));
});

test("rejects any group- or other-accessible directory mode", (t) => {
  for (const unsafeMode of [0o750, 0o701]) {
    const directory = fixture(t);
    chmodSync(directory, unsafeMode);
    assertFailureIsRedacted(runHelper("--directory", directory));
  }
});

test("never overwrites a pre-existing target", (t) => {
  const directory = fixture(t);
  const target = join(directory, "controlled-signup-identity.json");
  const sentinel = "owner-data-must-remain";
  writeFileSync(target, sentinel, { mode: 0o600 });

  const result = runHelper("--directory", directory);

  assertFailureIsRedacted(result);
  assert.equal(readFileSync(target, "utf8"), sentinel);
});

test("never follows or replaces a pre-existing target symlink", (t) => {
  const directory = fixture(t);
  const target = join(directory, "controlled-signup-identity.json");
  const sentinelPath = join(directory, "owner-sentinel.json");
  const sentinel = "owner-data-must-remain";
  writeFileSync(sentinelPath, sentinel, { mode: 0o600 });
  symlinkSync(sentinelPath, target);

  const result = runHelper("--directory", directory);

  assertFailureIsRedacted(result);
  assert.equal(lstatSync(target).isSymbolicLink(), true);
  assert.equal(readFileSync(sentinelPath, "utf8"), sentinel);
});

test("rejects missing, duplicate, and unexpected arguments", () => {
  for (const args of [
    [],
    ["--directory"],
    ["--unexpected", "/private"],
    ["--directory", "/private", "--directory", "/private"],
  ]) {
    assertFailureIsRedacted(runHelper(...args));
  }
});

test("source has no network, child-process, Wrangler, or Git path", () => {
  const source = readFileSync(helperPath, "utf8");
  assert.doesNotMatch(
    source,
    /node:(?:child_process|http|https|net|tls)|\bfetch\b|\bwrangler\b|\bgit\b/i,
  );
});
