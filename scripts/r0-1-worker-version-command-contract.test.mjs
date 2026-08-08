import assert from "node:assert/strict";
import { lstatSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const commandWords = ["wrangler", "versions", "view"];

function listFiles(path) {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink()) return [];
  if (stat.isFile()) return [path];
  if (!stat.isDirectory()) return [];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) =>
    listFiles(join(path, entry.name)),
  );
}

function invalidVersionViewCommands(source) {
  const joined = source.replace(/\\\r?\n/g, " ");
  const pattern = new RegExp(
    `\\b(?:npx[ \\t]+)?${commandWords.join("[ \\t]+")}\\b`,
    "g",
  );
  const invalid = [];

  for (const match of joined.matchAll(pattern)) {
    const suffix = joined.slice(match.index + match[0].length);
    const horizontalSpace = suffix.match(/^[ \t]*/)?.[0].length ?? 0;
    const next = suffix[horizontalSpace];
    if (
      next === undefined ||
      next === "\n" ||
      next === "\r" ||
      next === "`" ||
      next === ";" ||
      next === "|" ||
      next === "&" ||
      next === "#" ||
      next === "-"
    ) {
      const line = joined.slice(0, match.index).split("\n").length;
      invalid.push({ line, command: match[0] });
    }
  }

  return invalid;
}

test("command parser catches same-line and multiline missing positional IDs", () => {
  const prefix = commandWords.join(" ");
  const continuation = "\\";
  assert.equal(invalidVersionViewCommands(`${prefix} --config worker.toml`).length, 1);
  assert.equal(
    invalidVersionViewCommands(
      [`${prefix} ${continuation}`, "  --config worker.toml"].join("\n"),
    ).length,
    1,
  );
  assert.equal(
    invalidVersionViewCommands(
      [
        `${prefix} ${continuation}`,
        `  "$VERSION_ID" ${continuation}`,
        "  --config worker.toml",
      ].join("\n"),
    ).length,
    0,
  );
});

test("all repository version-view commands include a positional version ID", () => {
  const files = [
    ...listFiles(join(repositoryRoot, "docs")),
    ...listFiles(join(repositoryRoot, "scripts")),
    join(repositoryRoot, "package.json"),
    join(repositoryRoot, "AGENTS.md"),
  ];
  const failures = [];

  for (const path of files) {
    const source = readFileSync(path, "utf8");
    for (const finding of invalidVersionViewCommands(source)) {
      failures.push(`${relative(repositoryRoot, path)}:${finding.line}`);
    }
  }

  assert.deepEqual(failures, []);
});
