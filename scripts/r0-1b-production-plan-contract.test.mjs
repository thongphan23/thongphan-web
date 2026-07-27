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
