import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const paths = {
  design: "docs/superpowers/specs/2026-07-26-r0-1-security-remediation-design.md",
  remediation: "docs/superpowers/plans/2026-07-26-r0-1-security-remediation.md",
  cutover: "docs/superpowers/plans/2026-07-26-r0-1-production-cutover.md",
  checklist: "docs/security/R0-1-OWNER-ACTION-CHECKLIST.md",
  report: "docs/security/R0-1-IMPLEMENTATION-REPORT.md",
};

const documents = Object.fromEntries(
  Object.entries(paths).map(([name, path]) => [
    name,
    readFileSync(join(repositoryRoot, path), "utf8"),
  ]),
);
const authorityCorpus = Object.values(documents).join("\n");
const normalizedAuthorityCorpus = authorityCorpus.replace(/\s+/g, " ");

function taskSection(number) {
  const start = documents.cutover.indexOf(`## Task ${number}:`);
  const end = documents.cutover.indexOf(`## Task ${number + 1}:`, start + 1);
  assert.ok(start >= 0, `Task ${number} missing`);
  return documents.cutover.slice(start, end < 0 ? undefined : end);
}

const requiredSessionAssertions = [
  'test "$R0_1B_EXIT_TRAP_INSTALLED" = 1',
  'test "$R0_1B_EVIDENCE_INITIALIZED" = 1',
  'test -n "$R0_1B_MAIN_SHA"',
  'test -n "$R0_1B_VERSION_DIR"',
  'test -d "$R0_1B_VERSION_DIR"',
  'test ! -L "$R0_1B_VERSION_DIR"',
  "trap -p EXIT | grep -F '_r0_1b_version_evidence_exit_handler'",
];

test("credential authority matches the owner-approved invalid/orphaned disposition", () => {
  assert.doesNotMatch(
    authorityCorpus,
    /(?:both|first|second|two)\s+(?:Cloudflare\s+)?credential candidates?.{0,80}(?:revoke|revoked|rotate|rotated)/i,
  );
  assert.match(authorityCorpus, /Candidate A[^\n]*invalid/i);
  assert.match(
    authorityCorpus,
    /Candidate B[^\n]*(?:legacy[_/ -]?orphaned|legacy_orphaned_not_present_in_active_inventory)/i,
  );
  assert.match(authorityCorpus, /3 User API Tokens[^\n]*1 Account API Token/i);
  assert.match(
    authorityCorpus,
    /zero active (?:Workers AI\/Vectorize|Workers AI or Vectorize) permission match/i,
  );
  assert.match(authorityCorpus, /No token names or IDs (?:are|were) recorded/i);
  assert.match(
    authorityCorpus,
    /No active Cloudflare token mutation (?:was|is) authorized or performed/i,
  );
});

test("R0.H1 remains nonblocking public-history hygiene", () => {
  assert.match(
    normalizedAuthorityCorpus,
    /R0\.H1.{0,160}(?:nonblocking|non-blocking)/i,
  );
  assert.match(
    normalizedAuthorityCorpus,
    /R0\.H1.{0,160}does not imply.{0,80}Candidate B.{0,80}(?:revoke|rotation)/i,
  );
});

test("release checkout and Worker evidence use the private failure-safe lifecycle", () => {
  const cutover = documents.cutover;
  const normalizedCutover = cutover.replace(/\s+/g, " ");
  const sourceIndex = cutover.indexOf(
    "source scripts/r0-1b-version-evidence-lifecycle.sh",
  );
  const trapIndex = cutover.indexOf("r0_1b_install_exit_trap");
  const mutationIndex = cutover.indexOf(
    "r0_1b_mark_remote_mutation_started",
  );
  const deployIndex = cutover.indexOf(
    "npx wrangler deploy --strict --config wrangler.embed.toml",
  );
  const finalVerificationIndex = cutover.indexOf(
    "npx wrangler deployments list --config wrangler.brain2-email.toml",
  );
  const successIndex = cutover.lastIndexOf("r0_1b_mark_cutover_succeeded");
  const cleanupIndex = cutover.lastIndexOf("r0_1b_cleanup_version_evidence");
  const removeTrapIndex = cutover.lastIndexOf("r0_1b_remove_exit_trap");

  assert.match(cutover, /\/Users\/rio\/thongphan-r0-1b-release\.XXXXXX/);
  assert.doesNotMatch(cutover, /\/tmp\/thongphan-r0-1b-release/);
  assert.ok(sourceIndex >= 0 && sourceIndex < trapIndex);
  assert.ok(trapIndex < mutationIndex);
  assert.ok(mutationIndex < deployIndex);
  assert.match(
    cutover.slice(mutationIndex, deployIndex + 100),
    /r0_1b_mark_remote_mutation_started\s+npx wrangler deploy --strict --config wrangler\.embed\.toml/,
  );
  assert.ok(finalVerificationIndex < successIndex);
  assert.ok(successIndex < cleanupIndex);
  assert.ok(cleanupIndex < removeTrapIndex);
  assert.match(
    normalizedCutover,
    /failure after remote mutation.{0,500}preserve evidence directory.{0,500}do not re-deploy/i,
  );
  assert.doesNotMatch(cutover, /r0_1b_cleanup_worker_version_evidence/);
  assert.doesNotMatch(cutover, /^\s*trap\s+.+\s+EXIT\s*$/m);
});

test("existing positional version-view commands remain valid", () => {
  const commands = [
    ...documents.cutover.matchAll(/npx wrangler versions view\s+([^\s\\]+)/g),
  ];
  assert.equal(commands.length, 7);
  for (const command of commands) {
    assert.match(
      command[1],
      /^(?:00000000-0000-0000-0000-000000000000|"\$R0_1B_(?:EMBED|CHAT|SIGNUP)_VERSION_ID")$/,
    );
  }
});

test("local tests contain no executable R0.1B production command", () => {
  const lifecycleTest = readFileSync(
    join(repositoryRoot, "scripts/r0-1b-version-evidence-lifecycle.test.mjs"),
    "utf8",
  );
  const thisTest = readFileSync(fileURLToPath(import.meta.url), "utf8");

  assert.doesNotMatch(
    lifecycleTest,
    /npx\s+wrangler|wrangler\s+(?:deploy|versions|pages|d1)|https:\/\/thongphan\.com|--remote/i,
  );
  const importedModules = [
    ...thisTest.matchAll(/^import[\s\S]*?from "([^"]+)";$/gm),
  ].map((match) => match[1]);
  assert.deepEqual(importedModules, [
    "node:assert/strict",
    "node:fs",
    "node:path",
    "node:url",
    "node:test",
  ]);
});

test("Tasks 1-10 require one persistent private Bash process", () => {
  const cutover = documents.cutover;
  const contractIndex = cutover.indexOf("## Execution process contract");
  const taskOneIndex = cutover.indexOf("## Task 1:");

  assert.ok(contractIndex >= 0 && contractIndex < taskOneIndex);
  assert.match(
    cutover.slice(contractIndex, taskOneIndex),
    /exactly one private, long-lived `\/bin\/bash`/i,
  );
  assert.match(
    cutover.slice(contractIndex, taskOneIndex),
    /persistent PTY\/session/i,
  );
  assert.match(
    cutover.slice(contractIndex, taskOneIndex),
    /Tasks 1–10.{0,120}same process/is,
  );
  assert.match(
    cutover.slice(contractIndex, taskOneIndex),
    /Never execute.{0,100}standalone Markdown\s+blocks/is,
  );
  assert.match(
    cutover.slice(contractIndex, taskOneIndex),
    /R0_1B_PERSISTENT_SHELL_UNAVAILABLE/,
  );
  assert.match(cutover.slice(contractIndex, taskOneIndex), /read-only recovery/i);
});

test("Task 1 initializes immutable identifiers immediately after strict mode", () => {
  const taskOne = taskSection(1);
  const initialization = [
    "set -euo pipefail",
    "readonly R0_1B_DOCS_PR=1",
    "readonly R0_1B_IMPL_PR=2",
    "readonly R0_1B_REPOSITORY=thongphan23/thongphan-web",
    "readonly R0_1B_EXPECTED_DEFAULT_BRANCH=main",
  ].join("\n");

  assert.ok(taskOne.includes(initialization));
  assert.ok(
    taskOne.indexOf("readonly R0_1B_DOCS_PR=1") <
      taskOne.indexOf('gh pr view "$R0_1B_DOCS_PR"'),
  );
  assert.ok(
    taskOne.indexOf("readonly R0_1B_IMPL_PR=2") <
      taskOne.indexOf('gh pr view "$R0_1B_IMPL_PR"'),
  );
  assert.match(
    taskOne,
    /gh repo view "\$R0_1B_REPOSITORY" --json defaultBranchRef/,
  );
  let stateIndex = taskOne.indexOf("r0_1b_install_exit_trap");
  for (const assertion of requiredSessionAssertions) {
    const index = taskOne.indexOf(assertion, stateIndex);
    assert.ok(index > stateIndex, `Task 1 missing or misorders: ${assertion}`);
    stateIndex = index;
  }
});

test("every post-initialization task begins with persistent-session assertions", () => {
  for (const taskNumber of [2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    const section = taskSection(taskNumber);
    const firstFenceStart = section.indexOf("```bash");
    const firstFenceEnd = section.indexOf("```", firstFenceStart + 7);
    const firstBlock = section.slice(firstFenceStart, firstFenceEnd);
    let previous = -1;
    for (const assertion of requiredSessionAssertions) {
      const index = firstBlock.indexOf(assertion);
      assert.ok(
        index > previous,
        `Task ${taskNumber} missing or misorders: ${assertion}`,
      );
      previous = index;
    }
  }

  assert.match(taskSection(5), /test -n "\$R0_1B_EMBED_VERSION_ID"/);
  assert.match(taskSection(6), /test -n "\$R0_1B_CHAT_VERSION_ID"/);
  for (const id of ["EMBED", "CHAT", "SIGNUP"]) {
    assert.match(
      taskSection(10),
      new RegExp(`test -n "\\$R0_1B_${id}_VERSION_ID"`),
    );
  }
});

test("controlled signup receives one generated private identity file", () => {
  const taskSix = taskSection(6);
  const generatorIndex = taskSix.indexOf(
    "node scripts/r0-1b-synthetic-identity.mjs",
  );
  const exportIndex = taskSix.indexOf("export R0_1_SMOKE_INPUT_FILE");
  const controlledSignupIndex = taskSix.indexOf("--controlled-signup");

  assert.ok(generatorIndex >= 0 && generatorIndex < exportIndex);
  assert.ok(exportIndex < controlledSignupIndex);
  assert.match(taskSix, /--directory "\$R0_1B_VERSION_DIR"/);
  assert.match(taskSix, /test -f "\$R0_1_SMOKE_INPUT_FILE"/);
  assert.match(taskSix, /test ! -L "\$R0_1_SMOKE_INPUT_FILE"/);
  assert.match(taskSix, /readonly R0_1_SMOKE_INPUT_FILE/);
  assert.match(
    taskSix.slice(exportIndex, controlledSignupIndex),
    /test -n "\$\{R0_1_SMOKE_INPUT_FILE:-\}"[\s\S]*test -f "\$R0_1_SMOKE_INPUT_FILE"/,
  );
});

test("Task 2 smoke contract uses the repository TypeScript loader", () => {
  assert.match(
    taskSection(2),
    /node --import tsx --test scripts\/r0-1-production-smoke\.test\.mjs/,
  );
});

test("control-plane preflight avoids identity output and stores private evidence", () => {
  const taskThree = taskSection(3);
  assert.doesNotMatch(documents.cutover, /^\s*npx wrangler whoami(?:\s|$)/m);
  assert.doesNotMatch(documents.cutover, /wrangler auth token/i);
  assert.match(
    taskThree,
    /\$R0_1B_VERSION_DIR\/control-plane-[^"\s]+\.json/g,
  );
  assert.match(
    taskThree,
    /chmod 600 "\$R0_1B_VERSION_DIR"\/control-plane-\*\.json/,
  );
  assert.match(
    taskThree,
    /Never print or copy the complete\s+control-plane files/i,
  );
});

test("Pages deploy is preceded by complete post-build source assertions", () => {
  const taskNine = taskSection(9);
  const buildIndex = taskNine.indexOf("npm run build");
  const headIndex = taskNine.indexOf(
    'test "$(git rev-parse HEAD)" = "$R0_1B_MAIN_SHA"',
    buildIndex,
  );
  const originIndex = taskNine.indexOf(
    'test "$(git rev-parse origin/main)" = "$R0_1B_MAIN_SHA"',
    headIndex,
  );
  const cleanIndex = taskNine.indexOf(
    'test -z "$(git status --porcelain)"',
    originIndex,
  );
  const deployIndex = taskNine.indexOf("npx wrangler pages deploy", cleanIndex);

  assert.ok(buildIndex >= 0 && buildIndex < headIndex);
  assert.ok(headIndex < originIndex && originIndex < cleanIndex);
  assert.ok(cleanIndex < deployIndex);
});

test("exit policy classifies cleanup failures by original mutation state", () => {
  const normalizedCutover = documents.cutover.replace(/\s+/g, " ");
  assert.match(
    normalizedCutover,
    /original exit status.{0,180}nonzero.{0,180}remote mutation.{0,180}preserve/i,
  );
  assert.match(
    normalizedCutover,
    /original exit status.{0,180}zero.{0,180}cutover succeeded.{0,180}clean/i,
  );
  assert.match(
    normalizedCutover,
    /pre-mutation failure.{0,180}clean/i,
  );
  assert.match(
    normalizedCutover,
    /cleanup fails after successful closure.{0,220}preserve/i,
  );
  assert.match(normalizedCutover, /preserve the original exit status/i);
});
