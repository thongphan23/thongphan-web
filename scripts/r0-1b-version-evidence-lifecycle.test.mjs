import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const helperPath = fileURLToPath(
  new URL("./r0-1b-version-evidence-lifecycle.sh", import.meta.url),
);

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "r0-1b-evidence-lifecycle-"));
  chmodSync(root, 0o700);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return { root, prefix: join(root, "worker-versions") };
}

function runBash(script, ...args) {
  return spawnSync("/bin/bash", ["-c", script, "fixture", helperPath, ...args], {
    encoding: "utf8",
  });
}

function outputPath(result) {
  const match = result.stdout.match(/^DIR=(\/[^\n]+)$/m);
  assert.ok(match, `missing evidence path in stdout: ${result.stdout}`);
  return match[1];
}

function mode(path) {
  return lstatSync(path).mode & 0o777;
}

test("initialization creates an owner-only evidence directory", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\nprintf "DIR=%s\\n" "$R0_1B_VERSION_DIR"',
    prefix,
  );

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  assert.equal(mode(outputPath(result)), 0o700);
});

test("files created after initialization inherit mode 0600", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\nprintf "{}" > "$R0_1B_VERSION_DIR/before.json"\nprintf "DIR=%s\\n" "$R0_1B_VERSION_DIR"',
    prefix,
  );

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  assert.equal(mode(join(outputPath(result), "before.json")), 0o600);
});

test("legacy EXIT-trap pipeline loses the trap in the host Bash subshell", (t) => {
  const { root } = fixture(t);
  const result = runBash(
    'trap "_r0_1b_version_evidence_exit_handler" EXIT\ntrap -p EXIT > "$2/direct.txt"\ngrep -Fq "_r0_1b_version_evidence_exit_handler" "$2/direct.txt"\ndirect_status=$?\ntrap -p EXIT | grep -Fq "_r0_1b_version_evidence_exit_handler"\npipeline_status=$?\ntrap - EXIT\nprintf "DIRECT=%s PIPELINE=%s\\n" "$direct_status" "$pipeline_status"',
    root,
  );

  assert.equal(result.status, 0);
  assert.equal(result.stdout, "DIRECT=0 PIPELINE=1\n");
  assert.equal(result.stderr, "");
});

test("portable EXIT-trap assertion passes repeatedly without output or artifacts", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\nr0_1b_install_exit_trap\nr0_1b_assert_exit_trap_installed\nr0_1b_assert_exit_trap_installed\ntest ! -e "$R0_1B_VERSION_DIR/exit-trap-assertion.txt"\nr0_1b_remove_exit_trap\nr0_1b_cleanup_version_evidence',
    prefix,
  );

  assert.equal(result.status, 0);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
});

test("portable assertion rejects a missing EXIT trap and cleans its artifact", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\nr0_1b_assert_exit_trap_installed\nstatus=$?\ntest ! -e "$R0_1B_VERSION_DIR/exit-trap-assertion.txt"\nprintf "STATUS=%s\\n" "$status"',
    prefix,
  );

  assert.equal(result.status, 0);
  assert.match(result.stdout, /^STATUS=[1-9][0-9]*\n$/);
  assert.doesNotMatch(result.stdout, /_r0_1b_version_evidence_exit_handler/);
  assert.equal(result.stderr, "");
});

test("portable assertion rejects a wrong EXIT handler without altering it", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\ntrap "printf wrong >/dev/null" EXIT\nr0_1b_assert_exit_trap_installed\nstatus=$?\ntrap -p EXIT > "$R0_1B_VERSION_DIR/remaining.txt"\ntrap - EXIT\ntest ! -e "$R0_1B_VERSION_DIR/exit-trap-assertion.txt"\nprintf "STATUS=%s DIR=%s\\n" "$status" "$R0_1B_VERSION_DIR"',
    prefix,
  );
  const directory = result.stdout.match(/ DIR=(\/[^\n]+)$/m)?.[1];

  assert.equal(result.status, 0);
  assert.match(result.stdout, /^STATUS=[1-9][0-9]* DIR=\//);
  assert.ok(directory);
  assert.match(readFileSync(join(directory, "remaining.txt"), "utf8"), /wrong/);
  assert.doesNotMatch(result.stdout, /printf wrong|_r0_1b_version/);
  assert.equal(result.stderr, "");
});

test("portable assertion rejects a lookalike handler containing the marker", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\ntrap "printf _r0_1b_version_evidence_exit_handler >/dev/null" EXIT\nr0_1b_assert_exit_trap_installed\nstatus=$?\ntrap - EXIT\ntest ! -e "$R0_1B_VERSION_DIR/exit-trap-assertion.txt"\nprintf "STATUS=%s\\n" "$status"',
    prefix,
  );

  assert.equal(result.status, 0);
  assert.match(result.stdout, /^STATUS=[1-9][0-9]*\n$/);
  assert.doesNotMatch(result.stdout, /_r0_1b_version_evidence_exit_handler/);
  assert.equal(result.stderr, "");
});

test("portable assertion rejects arguments without creating an artifact", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\nr0_1b_install_exit_trap\nr0_1b_assert_exit_trap_installed unexpected\nstatus=$?\ntest ! -e "$R0_1B_VERSION_DIR/exit-trap-assertion.txt"\nr0_1b_remove_exit_trap\nprintf "STATUS=%s\\n" "$status"',
    prefix,
  );

  assert.equal(result.status, 0);
  assert.equal(result.stdout, "STATUS=64\n");
  assert.equal(result.stderr, "");
});

test("portable assertion preserves the installed EXIT trap", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\nr0_1b_install_exit_trap\nr0_1b_assert_exit_trap_installed\ntrap -p EXIT > "$R0_1B_VERSION_DIR/remaining.txt"\nr0_1b_remove_exit_trap\nprintf "DIR=%s\\n" "$R0_1B_VERSION_DIR"',
    prefix,
  );
  const directory = outputPath(result);

  assert.equal(result.status, 0);
  assert.match(
    readFileSync(join(directory, "remaining.txt"), "utf8"),
    /_r0_1b_version_evidence_exit_handler/,
  );
  assert.equal(existsSync(join(directory, "exit-trap-assertion.txt")), false);
  assert.equal(result.stderr, "");
});

test("portable assertion observes a mode-0600 artifact in a mode-0700 directory", (t) => {
  const { root, prefix } = fixture(t);
  const modeRecord = join(root, "assertion-mode.txt");
  const result = runBash(
    'MODE_RECORD=$3\ngrep() { stat -f "%Lp" "$R0_1B_VERSION_DIR/exit-trap-assertion.txt" > "$MODE_RECORD"; command grep "$@"; }\nsource "$1"\nr0_1b_version_evidence_init "$2"\nr0_1b_install_exit_trap\nr0_1b_assert_exit_trap_installed\nr0_1b_remove_exit_trap\nprintf "DIR=%s\\n" "$R0_1B_VERSION_DIR"',
    prefix,
    modeRecord,
  );

  assert.equal(result.status, 0);
  assert.equal(readFileSync(modeRecord, "utf8"), "600\n");
  assert.equal(mode(outputPath(result)), 0o700);
  assert.equal(result.stderr, "");
});

test("portable assertion fails closed on a pre-existing assertion file", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\nr0_1b_install_exit_trap\nprintf sentinel > "$R0_1B_VERSION_DIR/exit-trap-assertion.txt"\nr0_1b_assert_exit_trap_installed\nstatus=$?\nr0_1b_remove_exit_trap\nprintf "STATUS=%s DIR=%s\\n" "$status" "$R0_1B_VERSION_DIR"',
    prefix,
  );
  const directory = result.stdout.match(/ DIR=(\/[^\n]+)$/m)?.[1];

  assert.equal(result.status, 0);
  assert.match(result.stdout, /^STATUS=[1-9][0-9]* DIR=\//);
  assert.ok(directory);
  assert.equal(
    readFileSync(join(directory, "exit-trap-assertion.txt"), "utf8"),
    "sentinel",
  );
  assert.equal(result.stderr, "");
});

test("portable assertion fails closed on a symlink without touching its target", (t) => {
  const { root, prefix } = fixture(t);
  const target = join(root, "outside.txt");
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\nr0_1b_install_exit_trap\nprintf outside > "$3"\nln -s "$3" "$R0_1B_VERSION_DIR/exit-trap-assertion.txt"\nr0_1b_assert_exit_trap_installed\nstatus=$?\nr0_1b_remove_exit_trap\nprintf "STATUS=%s DIR=%s\\n" "$status" "$R0_1B_VERSION_DIR"',
    prefix,
    target,
  );
  const directory = result.stdout.match(/ DIR=(\/[^\n]+)$/m)?.[1];

  assert.equal(result.status, 0);
  assert.match(result.stdout, /^STATUS=[1-9][0-9]* DIR=\//);
  assert.ok(directory);
  assert.equal(lstatSync(join(directory, "exit-trap-assertion.txt")).isSymbolicLink(), true);
  assert.equal(readFileSync(target, "utf8"), "outside");
  assert.equal(result.stderr, "");
});

test("successful cutover cleanup removes the evidence directory", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\nr0_1b_install_exit_trap\ndir=$R0_1B_VERSION_DIR\nr0_1b_mark_remote_mutation_started\nprintf "{}" > "$dir/after.json"\nprintf "ledger" > "$dir/migrations.txt"\nr0_1b_mark_cutover_succeeded\nr0_1b_cleanup_version_evidence\nr0_1b_remove_exit_trap\ntest ! -e "$dir"',
    prefix,
  );

  assert.equal(result.status, 0);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
});

test("failure before remote mutation cleans evidence and preserves the exit code", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\nr0_1b_install_exit_trap\nprintf "DIR=%s\\n" "$R0_1B_VERSION_DIR"\nprintf "{}" > "$R0_1B_VERSION_DIR/before.json"\nprintf "ledger" > "$R0_1B_VERSION_DIR/before.txt"\nexit 37',
    prefix,
  );
  const directory = outputPath(result);

  assert.equal(result.status, 37);
  assert.equal(result.stderr, "");
  assert.equal(existsSync(directory), false);
});

test("failure after remote mutation preserves secured evidence with redacted stderr", (t) => {
  const { prefix } = fixture(t);
  const sensitiveVersionId = "11111111-1111-4111-8111-111111111111";
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\nr0_1b_install_exit_trap\nprintf "DIR=%s\\n" "$R0_1B_VERSION_DIR"\nprintf "%s" "$3" > "$R0_1B_VERSION_DIR/after.json"\nprintf "ledger" > "$R0_1B_VERSION_DIR/after.txt"\nr0_1b_mark_remote_mutation_started\nexit 42',
    prefix,
    sensitiveVersionId,
  );
  const directory = outputPath(result);

  assert.equal(result.status, 42);
  assert.equal(
    result.stderr,
    `R0_1B_VERSION_EVIDENCE_PRESERVED=${directory}\n`,
  );
  assert.doesNotMatch(result.stderr, /11111111|\{|author|metadata/i);
  assert.equal(result.stderr.trim().split("\n").length, 1);
  assert.equal(existsSync(directory), true);
  assert.equal(mode(directory), 0o700);
  assert.equal(mode(join(directory, "after.json")), 0o600);
  assert.equal(mode(join(directory, "after.txt")), 0o600);
});

test("cleanup failure after success preserves evidence and returns nonzero once", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'set -e\nsource "$1"\nr0_1b_version_evidence_init "$2"\nr0_1b_install_exit_trap\ndir=$R0_1B_VERSION_DIR\nprintf "DIR=%s\\n" "$dir"\nprintf "{\\"safe\\":true}" > "$dir/after.json"\nprintf "ledger" > "$dir/after.txt"\nmkdir "$dir/cleanup-obstruction"\nchmod 700 "$dir/cleanup-obstruction"\nr0_1b_mark_remote_mutation_started\nr0_1b_mark_cutover_succeeded\nr0_1b_cleanup_version_evidence',
    prefix,
  );
  const directory = outputPath(result);

  assert.notEqual(result.status, 0);
  assert.equal(
    result.stderr,
    `R0_1B_VERSION_EVIDENCE_PRESERVED=${directory}\n`,
  );
  assert.equal(result.stderr.trim().split("\n").length, 1);
  assert.doesNotMatch(result.stderr, /safe|\{|author|metadata/i);
  assert.equal(existsSync(directory), true);
  assert.equal(existsSync(join(directory, "after.json")), true);
  assert.equal(existsSync(join(directory, "after.txt")), true);
  assert.equal(mode(directory), 0o700);
  assert.equal(mode(join(directory, "after.json")), 0o600);
  assert.equal(mode(join(directory, "after.txt")), 0o600);
  assert.equal(mode(join(directory, "cleanup-obstruction")), 0o700);
});

test("remote-mutation state becomes irreversible", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\nr0_1b_mark_remote_mutation_started\nr0_1b_mark_remote_mutation_started\n( R0_1B_REMOTE_MUTATION_STARTED=0 ) 2>/dev/null\nassignment_status=$?\nprintf "STATE=%s STATUS=%s\\n" "$R0_1B_REMOTE_MUTATION_STARTED" "$assignment_status"',
    prefix,
  );

  assert.equal(result.status, 0);
  assert.match(result.stdout, /^STATE=1 STATUS=[1-9][0-9]*\n$/);
  assert.equal(result.stderr, "");
});

test("cutover success cannot be marked before initialization", () => {
  const result = runBash('source "$1"\nr0_1b_mark_cutover_succeeded');

  assert.equal(result.status, 64);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
});

test("initialization rejects a relative prefix", () => {
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init relative/worker-versions',
  );

  assert.equal(result.status, 64);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
});

test("initialization rejects symlink and pre-existing targets", (t) => {
  const { root, prefix } = fixture(t);
  const realTarget = join(root, "real-target");
  const symlinkPrefix = join(root, "symlink-prefix");
  chmodSync(root, 0o700);
  symlinkSync(realTarget, symlinkPrefix);

  const symlinkResult = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"',
    symlinkPrefix,
  );
  const existingResult = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"',
    root,
  );

  assert.equal(symlinkResult.status, 64);
  assert.equal(existingResult.status, 64);
  assert.equal(symlinkResult.stderr, "");
  assert.equal(existingResult.stderr, "");
  assert.equal(existsSync(`${symlinkPrefix}.000000`), false);
  assert.equal(existsSync(`${prefix}.000000`), false);
});

test("initialization rejects a group- or other-writable parent", (t) => {
  const { root, prefix } = fixture(t);
  chmodSync(root, 0o777);

  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"',
    prefix,
  );

  assert.equal(result.status, 64);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
});

test("explicit direct cleanup removes evidence preserved by the trap", (t) => {
  const { prefix } = fixture(t);
  const failed = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\nr0_1b_install_exit_trap\nprintf "DIR=%s\\n" "$R0_1B_VERSION_DIR"\nprintf "{}" > "$R0_1B_VERSION_DIR/view.json"\nr0_1b_mark_remote_mutation_started\nexit 23',
    prefix,
  );
  const directory = outputPath(failed);
  assert.equal(failed.status, 23);
  assert.equal(existsSync(directory), true);

  const cleaned = runBash(
    'source "$1"\nR0_1B_VERSION_DIR=$2\nR0_1B_PREVIOUS_UMASK=$(umask)\nr0_1b_cleanup_version_evidence',
    directory,
  );

  assert.equal(cleaned.status, 0);
  assert.equal(cleaned.stdout, "");
  assert.equal(cleaned.stderr, "");
  assert.equal(existsSync(directory), false);
});

test("mark success plus mixed valid artifacts exits zero through the trap", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\nr0_1b_install_exit_trap\ndir=$R0_1B_VERSION_DIR\nprintf "DIR=%s\\n" "$dir"\nprintf "{}" > "$dir/view.json"\nprintf "ledger" > "$dir/ledger.txt"\nr0_1b_mark_remote_mutation_started\nr0_1b_mark_cutover_succeeded',
    prefix,
  );
  const directory = outputPath(result);

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  assert.equal(existsSync(directory), false);
});

test("unexpected extension fails before any valid artifact is deleted", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\ndir=$R0_1B_VERSION_DIR\nprintf "DIR=%s\\n" "$dir"\nprintf "{}" > "$dir/view.json"\nprintf "ledger" > "$dir/ledger.txt"\nprintf "unexpected" > "$dir/output.log"\nr0_1b_cleanup_version_evidence',
    prefix,
  );
  const directory = outputPath(result);

  assert.notEqual(result.status, 0);
  assert.equal(existsSync(join(directory, "view.json")), true);
  assert.equal(existsSync(join(directory, "ledger.txt")), true);
  assert.equal(existsSync(join(directory, "output.log")), true);
});

test("extensionless artifact fails before any valid artifact is deleted", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\ndir=$R0_1B_VERSION_DIR\nprintf "DIR=%s\\n" "$dir"\nprintf "{}" > "$dir/view.json"\nprintf "ledger" > "$dir/ledger.txt"\nprintf "unexpected" > "$dir/README"\nr0_1b_cleanup_version_evidence',
    prefix,
  );
  const directory = outputPath(result);

  assert.notEqual(result.status, 0);
  assert.equal(existsSync(join(directory, "view.json")), true);
  assert.equal(existsSync(join(directory, "ledger.txt")), true);
  assert.equal(existsSync(join(directory, "README")), true);
});

test("unexpected subdirectory fails before any artifact is deleted", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\ndir=$R0_1B_VERSION_DIR\nprintf "DIR=%s\\n" "$dir"\nprintf "{}" > "$dir/view.json"\nprintf "ledger" > "$dir/ledger.txt"\nmkdir "$dir/nested"\nr0_1b_cleanup_version_evidence',
    prefix,
  );
  const directory = outputPath(result);

  assert.notEqual(result.status, 0);
  assert.equal(existsSync(join(directory, "view.json")), true);
  assert.equal(existsSync(join(directory, "ledger.txt")), true);
  assert.equal(existsSync(join(directory, "nested")), true);
});

test("symlink artifact fails without following or deleting its target", (t) => {
  const { root, prefix } = fixture(t);
  const target = join(root, "outside.txt");
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\ndir=$R0_1B_VERSION_DIR\nprintf "DIR=%s\\n" "$dir"\nprintf "outside" > "$3"\nprintf "{}" > "$dir/view.json"\nprintf "ledger" > "$dir/ledger.txt"\nln -s "$3" "$dir/link.txt"\nr0_1b_cleanup_version_evidence',
    prefix,
    target,
  );
  const directory = outputPath(result);

  assert.notEqual(result.status, 0);
  assert.equal(existsSync(target), true);
  assert.equal(existsSync(join(directory, "link.txt")), true);
  assert.equal(existsSync(join(directory, "view.json")), true);
  assert.equal(existsSync(join(directory, "ledger.txt")), true);
});

test("exit trap unregisters before exit and does not recurse", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\nr0_1b_version_evidence_init "$2"\nr0_1b_install_exit_trap\nprintf "DIR=%s\\n" "$R0_1B_VERSION_DIR"\nr0_1b_mark_remote_mutation_started\nexit 19',
    prefix,
  );

  assert.equal(result.status, 19);
  assert.equal(result.stderr.trim().split("\n").length, 1);
});

test("cleanup restores the previous umask", (t) => {
  const { prefix } = fixture(t);
  const result = runBash(
    'source "$1"\numask 0027\nbefore=$(umask)\nr0_1b_version_evidence_init "$2"\nr0_1b_cleanup_version_evidence\nafter=$(umask)\nprintf "BEFORE=%s AFTER=%s\\n" "$before" "$after"',
    prefix,
  );

  assert.equal(result.status, 0);
  assert.equal(result.stdout, "BEFORE=0027 AFTER=0027\n");
  assert.equal(result.stderr, "");
});

test("helper source has no Wrangler, network, or JSON-content read path", () => {
  const source = readFileSync(helperPath, "utf8");
  assert.doesNotMatch(source, /\bwrangler\b|\bcurl\b|\bwget\b|\bfetch\b/i);
  assert.doesNotMatch(source, /\bcat\b|\bhead\b|\btail\b|\brg\b|\bjq\b/);
  assert.equal(
    [...source.matchAll(/\bgrep\b/g)].length,
    1,
    "only the EXIT-trap marker assertion may use grep",
  );
});
