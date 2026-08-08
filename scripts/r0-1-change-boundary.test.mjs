import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(
  new URL("./r0-1-change-boundary.mjs", import.meta.url),
);

test("guard is directly executable", () => {
  assert.notEqual(statSync(SCRIPT_PATH).mode & 0o111, 0);
});

function run(command, args, cwd) {
  return spawnSync(command, args, {
    cwd,
    encoding: "utf8",
  });
}

function runGit(cwd, ...args) {
  const result = run("git", args, cwd);
  assert.equal(
    result.status,
    0,
    `git ${args.join(" ")} failed: ${result.stderr}`,
  );
  return result.stdout.trim();
}

function runBoundary(cwd, ...args) {
  return run(process.execPath, [SCRIPT_PATH, ...args], cwd);
}

function createFixture({ untrackedPath = "untracked.txt" } = {}) {
  const temporaryRoot = mkdtempSync(
    path.join(tmpdir(), "thongphan-r0-1-boundary-test-"),
  );
  const repositoryRoot = path.join(temporaryRoot, "repo");
  const baselinePath = path.join(temporaryRoot, "baseline.json");

  mkdirSync(repositoryRoot);
  runGit(repositoryRoot, "init", "-b", "main");
  runGit(repositoryRoot, "config", "user.name", "Boundary Test");
  runGit(repositoryRoot, "config", "user.email", "boundary@example.invalid");

  writeFileSync(path.join(repositoryRoot, "tracked.txt"), "tracked baseline\n");
  writeFileSync(path.join(repositoryRoot, "protected.txt"), "protected baseline\n");
  runGit(repositoryRoot, "add", "tracked.txt", "protected.txt");
  runGit(repositoryRoot, "commit", "-m", "fixture baseline");

  writeFileSync(path.join(repositoryRoot, "tracked.txt"), "tracked dirty\n");
  writeFileSync(path.join(repositoryRoot, untrackedPath), "untracked dirty\n");

  return {
    baselinePath,
    repositoryRoot,
    temporaryRoot,
    untrackedPath,
  };
}

function capture(fixture, ...extraArguments) {
  return runBoundary(
    fixture.repositoryRoot,
    "capture",
    "--output",
    fixture.baselinePath,
    "--protect",
    "protected.txt",
    ...extraArguments,
  );
}

function verify(fixture, ...extraArguments) {
  return runBoundary(
    fixture.repositoryRoot,
    "verify",
    "--baseline",
    fixture.baselinePath,
    ...extraArguments,
  );
}

function withFixture(callback, options) {
  const fixture = createFixture(options);
  try {
    callback(fixture);
  } finally {
    rmSync(fixture.temporaryRoot, { recursive: true, force: true });
  }
}

test("capture and verify preserve an unchanged dirty working tree", () => {
  withFixture((fixture) => {
    const captureResult = capture(fixture);
    assert.equal(captureResult.status, 0, captureResult.stderr);

    const verifyResult = verify(fixture);
    assert.equal(verifyResult.status, 0, verifyResult.stderr);
    assert.match(verifyResult.stdout, /VERIFY PASS/);
    assert.match(verifyResult.stdout, /protected\.txt/);
    assert.match(verifyResult.stdout, /tracked\.txt/);
    assert.match(verifyResult.stdout, /untracked\.txt/);
  });
});

test("verify rejects a changed protected file and names the exact path", () => {
  withFixture((fixture) => {
    assert.equal(capture(fixture).status, 0);
    writeFileSync(
      path.join(fixture.repositoryRoot, "protected.txt"),
      "malicious change\n",
    );

    const result = verify(fixture);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /protected hash changed: "protected\.txt"/);
  });
});

test("verify rejects a removed starting dirty path and names the exact path", () => {
  withFixture((fixture) => {
    assert.equal(capture(fixture).status, 0);
    rmSync(path.join(fixture.repositoryRoot, fixture.untrackedPath));

    const result = verify(fixture);
    assert.notEqual(result.status, 0);
    assert.match(
      result.stderr,
      /starting dirty path disappeared: "untracked\.txt"/,
    );
  });
});

test("verify rejects a new dirty path outside the allowlist", () => {
  withFixture((fixture) => {
    assert.equal(capture(fixture).status, 0);
    writeFileSync(path.join(fixture.repositoryRoot, "outside.txt"), "outside\n");

    const result = verify(fixture, "--allow", "allowed.txt");
    assert.notEqual(result.status, 0);
    assert.match(
      result.stderr,
      /new changed path outside allowlist: "outside\.txt"/,
    );
  });
});

test("verify permits an exact new dirty path in the allowlist", () => {
  withFixture((fixture) => {
    assert.equal(capture(fixture).status, 0);
    writeFileSync(path.join(fixture.repositoryRoot, "allowed.txt"), "allowed\n");

    const result = verify(fixture, "--allow", "allowed.txt");
    assert.equal(result.status, 0, result.stderr);
  });
});

test("capture stores NUL-safe porcelain entries for unusual paths", () => {
  withFixture(
    (fixture) => {
      const result = capture(fixture);
      assert.equal(result.status, 0, result.stderr);

      const baseline = JSON.parse(readFileSync(fixture.baselinePath, "utf8"));
      assert.ok(
        baseline.porcelainEntries.some(
          (entry) => entry.path === fixture.untrackedPath && entry.status === "??",
        ),
      );
      assert.equal(verify(fixture).status, 0);
    },
    { untrackedPath: "untracked\nfile.txt" },
  );
});

test("capture writes a private baseline outside the repository", () => {
  withFixture((fixture) => {
    const result = capture(fixture);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(statSync(fixture.baselinePath).mode & 0o777, 0o600);

    const insideResult = runBoundary(
      fixture.repositoryRoot,
      "capture",
      "--output",
      path.join(fixture.repositoryRoot, "baseline.json"),
      "--protect",
      "protected.txt",
    );
    assert.notEqual(insideResult.status, 0);
    assert.match(insideResult.stderr, /output path must be outside repository/);
  });
});

test("capture rejects an outside output symlink that targets the repository", () => {
  withFixture((fixture) => {
    const outputLink = path.join(fixture.temporaryRoot, "baseline-link.json");
    symlinkSync(path.join(fixture.repositoryRoot, "tracked.txt"), outputLink);

    const result = runBoundary(
      fixture.repositoryRoot,
      "capture",
      "--output",
      outputLink,
      "--protect",
      "protected.txt",
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /output path must be outside repository/);
  });
});

test("capture rejects a relative output path", () => {
  withFixture((fixture) => {
    const result = runBoundary(
      fixture.repositoryRoot,
      "capture",
      "--output",
      "baseline.json",
      "--protect",
      "protected.txt",
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /output path must be absolute/);
  });
});

test("capture rejects a missing protected file", () => {
  withFixture((fixture) => {
    const result = runBoundary(
      fixture.repositoryRoot,
      "capture",
      "--output",
      fixture.baselinePath,
      "--protect",
      "missing.txt",
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /protected file missing: "missing\.txt"/);
  });
});

test("commands reject duplicate values, duplicate singleton flags, and unknown arguments", () => {
  withFixture((fixture) => {
    const duplicateProtected = capture(
      fixture,
      "--protect",
      "protected.txt",
    );
    assert.notEqual(duplicateProtected.status, 0);
    assert.match(
      duplicateProtected.stderr,
      /duplicate --protect value: "protected\.txt"/,
    );

    const duplicateOutput = runBoundary(
      fixture.repositoryRoot,
      "capture",
      "--output",
      fixture.baselinePath,
      "--output",
      path.join(fixture.temporaryRoot, "other.json"),
      "--protect",
      "protected.txt",
    );
    assert.notEqual(duplicateOutput.status, 0);
    assert.match(duplicateOutput.stderr, /duplicate flag: --output/);

    const unknown = capture(fixture, "--unknown", "value");
    assert.notEqual(unknown.status, 0);
    assert.match(unknown.stderr, /unknown argument: --unknown/);
  });
});

test("verify rejects a baseline captured from another Git root", () => {
  const first = createFixture();
  const second = createFixture();
  try {
    assert.equal(capture(first).status, 0);
    const result = runBoundary(
      second.repositoryRoot,
      "verify",
      "--baseline",
      first.baselinePath,
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /baseline repository does not match current Git root/);
  } finally {
    rmSync(first.temporaryRoot, { recursive: true, force: true });
    rmSync(second.temporaryRoot, { recursive: true, force: true });
  }
});

test("verify rejects a relative baseline path and duplicate allow values", () => {
  withFixture((fixture) => {
    const relative = runBoundary(
      fixture.repositoryRoot,
      "verify",
      "--baseline",
      "baseline.json",
    );
    assert.notEqual(relative.status, 0);
    assert.match(relative.stderr, /baseline path must be absolute/);

    assert.equal(capture(fixture).status, 0);
    chmodSync(fixture.baselinePath, 0o600);
    const duplicateAllow = verify(
      fixture,
      "--allow",
      "allowed.txt",
      "--allow",
      "allowed.txt",
    );
    assert.notEqual(duplicateAllow.status, 0);
    assert.match(
      duplicateAllow.stderr,
      /duplicate --allow value: "allowed\.txt"/,
    );
  });
});
