import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const helperPath = fileURLToPath(
  new URL("./r0-1-worker-version-delta.mjs", import.meta.url),
);

const IDS = {
  first: "11111111-1111-4111-8111-111111111111",
  second: "22222222-2222-4222-8222-222222222222",
  third: "33333333-3333-4333-8333-333333333333",
};

function version(id, number) {
  return {
    id,
    number,
    metadata: {
      created_on: `2026-07-26T00:00:0${number}.000000Z`,
      modified_on: `2026-07-26T00:00:0${number}.000000Z`,
      source: "wrangler",
      author_email: "operator@example.invalid",
    },
    annotations: {},
    resources: {
      bindings: [],
      script: {},
      script_runtime: { compatibility_date: "2026-07-26" },
    },
  };
}

function fixtureDir() {
  const directory = mkdtempSync(join(tmpdir(), "r0-1-worker-version-delta-"));
  chmodSync(directory, 0o700);
  return directory;
}

function writeFixture(directory, name, value, mode = 0o600) {
  const path = join(directory, name);
  const body = typeof value === "string" ? value : JSON.stringify(value);
  writeFileSync(path, body, { encoding: "utf8", mode: 0o600 });
  chmodSync(path, mode);
  return path;
}

function run(beforePath, afterPath, extraArgs = []) {
  return spawnSync(
    process.execPath,
    [helperPath, "--before", beforePath, "--after", afterPath, ...extraArgs],
    { encoding: "utf8" },
  );
}

function assertClassifiedFailure(result, status, classification) {
  assert.equal(result.status, status);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, `${classification}\n`);
}

test("prints exactly one new version ID using set difference, not list order", () => {
  const directory = fixtureDir();
  const before = writeFixture(directory, "before.json", [
    version(IDS.first, 1),
    version(IDS.second, 2),
  ]);
  const after = writeFixture(directory, "after.json", [
    version(IDS.second, 2),
    version(IDS.third, 3),
    version(IDS.first, 1),
  ]);

  const result = run(before, after);

  assert.equal(result.status, 0);
  assert.equal(result.stdout, `${IDS.third}\n`);
  assert.equal(result.stderr, "");
});

test("returns exit 1 when there is no new version", () => {
  const directory = fixtureDir();
  const before = writeFixture(directory, "before.json", [version(IDS.first, 1)]);
  const after = writeFixture(directory, "after.json", [version(IDS.first, 1)]);
  assertClassifiedFailure(run(before, after), 1, "VERSION_DELTA_NONE");
});

test("returns exit 1 when there are multiple new versions", () => {
  const directory = fixtureDir();
  const before = writeFixture(directory, "before.json", [version(IDS.first, 1)]);
  const after = writeFixture(directory, "after.json", [
    version(IDS.first, 1),
    version(IDS.second, 2),
    version(IDS.third, 3),
  ]);
  assertClassifiedFailure(run(before, after), 1, "VERSION_DELTA_MULTIPLE");
});

for (const side of ["before", "after"]) {
  test(`rejects duplicate IDs in ${side} JSON`, () => {
    const directory = fixtureDir();
    const duplicate = [version(IDS.first, 1), version(IDS.first, 2)];
    const normal = [version(IDS.first, 1), version(IDS.second, 2)];
    const before = writeFixture(
      directory,
      "before.json",
      side === "before" ? duplicate : [version(IDS.first, 1)],
    );
    const after = writeFixture(
      directory,
      "after.json",
      side === "after" ? duplicate : normal,
    );
    assertClassifiedFailure(run(before, after), 2, "VERSION_DELTA_INVALID");
  });
}

for (const [name, invalidEntry] of [
  ["missing id", { number: 1, metadata: {}, annotations: {}, resources: {} }],
  ["empty id", version("", 1)],
  ["malformed id", version("not-a-worker-version-id", 1)],
]) {
  test(`rejects an entry with ${name}`, () => {
    const directory = fixtureDir();
    const before = writeFixture(directory, "before.json", []);
    const after = writeFixture(directory, "after.json", [invalidEntry]);
    assertClassifiedFailure(run(before, after), 2, "VERSION_DELTA_INVALID");
  });
}

test("rejects malformed JSON", () => {
  const directory = fixtureDir();
  const before = writeFixture(directory, "before.json", "[");
  const after = writeFixture(directory, "after.json", []);
  assertClassifiedFailure(run(before, after), 2, "VERSION_DELTA_INVALID");
});

test("rejects a non-array top-level value", () => {
  const directory = fixtureDir();
  const before = writeFixture(directory, "before.json", { items: [] });
  const after = writeFixture(directory, "after.json", []);
  assertClassifiedFailure(run(before, after), 2, "VERSION_DELTA_INVALID");
});

test("rejects relative input paths", () => {
  const directory = fixtureDir();
  writeFixture(directory, "before.json", []);
  const after = writeFixture(directory, "after.json", [version(IDS.first, 1)]);
  assertClassifiedFailure(run("before.json", after), 2, "VERSION_DELTA_INVALID");
});

test("rejects symlink input", () => {
  const directory = fixtureDir();
  const realBefore = writeFixture(directory, "real-before.json", []);
  const before = join(directory, "before.json");
  symlinkSync(realBefore, before);
  const after = writeFixture(directory, "after.json", [version(IDS.first, 1)]);
  assertClassifiedFailure(run(before, after), 2, "VERSION_DELTA_INVALID");
});

test("rejects oversized input", () => {
  const directory = fixtureDir();
  const before = writeFixture(directory, "before.json", " ".repeat(256 * 1024 + 1));
  const after = writeFixture(directory, "after.json", []);
  assertClassifiedFailure(run(before, after), 2, "VERSION_DELTA_INVALID");
});

test("rejects group- or other-writable input", () => {
  const directory = fixtureDir();
  const before = writeFixture(directory, "before.json", [], 0o622);
  const after = writeFixture(directory, "after.json", [version(IDS.first, 1)]);
  assertClassifiedFailure(run(before, after), 2, "VERSION_DELTA_INVALID");
});

test("rejects input that is not owner-readable", () => {
  const directory = fixtureDir();
  const before = writeFixture(directory, "before.json", [], 0o200);
  const after = writeFixture(directory, "after.json", [version(IDS.first, 1)]);
  assertClassifiedFailure(run(before, after), 2, "VERSION_DELTA_INVALID");
});

test("rejects invalid arguments", () => {
  const directory = fixtureDir();
  const before = writeFixture(directory, "before.json", []);
  const after = writeFixture(directory, "after.json", [version(IDS.first, 1)]);
  assertClassifiedFailure(
    run(before, after, ["--unexpected"]),
    2,
    "VERSION_DELTA_INVALID",
  );
});

test("redacts complete JSON and unrelated metadata from errors", () => {
  const directory = fixtureDir();
  const sensitive = {
    ...version(IDS.first, 1),
    metadata: {
      author_email: "private-operator@example.invalid",
      unrelated: "DO_NOT_PRINT_THIS_METADATA",
    },
  };
  const before = writeFixture(directory, "before.json", [sensitive, sensitive]);
  const after = writeFixture(directory, "after.json", []);

  const result = run(before, after);

  assertClassifiedFailure(result, 2, "VERSION_DELTA_INVALID");
  assert.doesNotMatch(result.stderr, /private-operator|DO_NOT_PRINT|\{|\[/);
});

test("helper source has no Wrangler, child-process or network execution path", () => {
  const source = readFileSync(helperPath, "utf8");
  assert.doesNotMatch(source, /node:child_process|\bspawn(?:Sync)?\b|\bexec(?:File|Sync)?\b/);
  assert.doesNotMatch(source, /node:https?|\bfetch\s*\(|\bwrangler\b/i);
});
