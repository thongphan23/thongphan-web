#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  lstatSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

function fail(message) {
  throw new Error(message);
}

function quotePath(filePath) {
  return JSON.stringify(filePath);
}

function parseArguments(arguments_) {
  const [command, ...tokens] = arguments_;
  const definitions = {
    capture: {
      repeated: new Set(["--protect"]),
      required: new Set(["--output", "--protect"]),
      singleton: new Set(["--output"]),
    },
    verify: {
      repeated: new Set(["--allow"]),
      required: new Set(["--baseline"]),
      singleton: new Set(["--baseline"]),
    },
  };
  const definition = definitions[command];
  if (!definition) {
    fail(`unknown command: ${command ?? "(missing)"}`);
  }

  const parsed = {};
  for (let index = 0; index < tokens.length; index += 2) {
    const flag = tokens[index];
    const value = tokens[index + 1];
    if (!definition.singleton.has(flag) && !definition.repeated.has(flag)) {
      fail(`unknown argument: ${flag ?? "(missing)"}`);
    }
    if (value === undefined) {
      fail(`missing value for ${flag}`);
    }

    if (definition.singleton.has(flag)) {
      if (parsed[flag] !== undefined) {
        fail(`duplicate flag: ${flag}`);
      }
      parsed[flag] = value;
      continue;
    }

    parsed[flag] ??= [];
    if (parsed[flag].includes(value)) {
      fail(`duplicate ${flag} value: ${quotePath(value)}`);
    }
    parsed[flag].push(value);
  }

  for (const flag of definition.required) {
    if (parsed[flag] === undefined || parsed[flag].length === 0) {
      fail(`missing required flag: ${flag}`);
    }
  }

  return { command, parsed };
}

function currentGitRoot() {
  try {
    const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return realpathSync(root);
  } catch {
    fail("current directory is not inside a Git repository");
  }
}

function currentHead(repositoryRoot) {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    fail("unable to read current Git HEAD");
  }
}

function parsePorcelain(buffer) {
  const entries = [];
  let cursor = 0;

  function readRecord() {
    const terminator = buffer.indexOf(0, cursor);
    if (terminator === -1) {
      fail("invalid NUL-delimited Git status output");
    }
    const record = buffer.subarray(cursor, terminator).toString("utf8");
    cursor = terminator + 1;
    return record;
  }

  while (cursor < buffer.length) {
    const record = readRecord();
    if (record.length < 4 || record[2] !== " ") {
      fail("invalid Git porcelain entry");
    }

    const status = record.slice(0, 2);
    const entry = { status, path: record.slice(3) };
    if (
      status[0] === "R" ||
      status[0] === "C" ||
      status[1] === "R" ||
      status[1] === "C"
    ) {
      entry.originalPath = readRecord();
    }
    entries.push(entry);
  }

  return entries;
}

function workingTreeStatus(repositoryRoot) {
  let porcelain;
  try {
    porcelain = execFileSync("git", ["status", "--porcelain=v1", "-z"], {
      cwd: repositoryRoot,
      encoding: "buffer",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    fail("unable to read Git working tree status");
  }

  return {
    entries: parsePorcelain(porcelain),
    porcelainV1ZBase64: porcelain.toString("base64"),
  };
}

function normalizedRepositoryPath(repositoryRoot, filePath, flag) {
  if (path.isAbsolute(filePath)) {
    fail(`${flag} value must be repository-relative: ${quotePath(filePath)}`);
  }
  const normalized = path.normalize(filePath);
  if (
    !filePath ||
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith(`..${path.sep}`) ||
    normalized !== filePath
  ) {
    fail(`${flag} value must be a normalized repository-relative path: ${quotePath(filePath)}`);
  }

  const absolutePath = path.resolve(repositoryRoot, normalized);
  const relative = path.relative(repositoryRoot, absolutePath);
  if (relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    fail(`${flag} value escapes repository: ${quotePath(filePath)}`);
  }
  return normalized;
}

function isInsideRepository(repositoryRoot, candidatePath) {
  const relative = path.relative(repositoryRoot, candidatePath);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative))
  );
}

function requireAbsoluteOutsideRepository(repositoryRoot, filePath, label) {
  if (!path.isAbsolute(filePath)) {
    fail(`${label} path must be absolute`);
  }
  let resolved;
  let outputEntryExists = false;
  try {
    lstatSync(filePath);
    outputEntryExists = true;
  } catch {
    // A new baseline path is valid when its existing parent is outside the repo.
  }
  try {
    resolved = outputEntryExists
      ? realpathSync(filePath)
      : path.join(realpathSync(path.dirname(filePath)), path.basename(filePath));
  } catch {
    fail(
      outputEntryExists
        ? `${label} path cannot be resolved`
        : `${label} parent directory must exist`,
    );
  }
  if (isInsideRepository(repositoryRoot, resolved)) {
    fail(`${label} path must be outside repository`);
  }
  return resolved;
}

function sha256(absolutePath) {
  return createHash("sha256").update(readFileSync(absolutePath)).digest("hex");
}

function entryPaths(entries) {
  const paths = [];
  for (const entry of entries) {
    paths.push(entry.path);
    if (entry.originalPath !== undefined) {
      paths.push(entry.originalPath);
    }
  }
  return paths;
}

function capture(repositoryRoot, parsed) {
  const outputPath = requireAbsoluteOutsideRepository(
    repositoryRoot,
    parsed["--output"],
    "output",
  );
  const protectedPaths = parsed["--protect"].map((filePath) =>
    normalizedRepositoryPath(repositoryRoot, filePath, "--protect"),
  );

  const protectedFiles = protectedPaths.map((filePath) => {
    const absolutePath = path.join(repositoryRoot, filePath);
    if (!existsSync(absolutePath)) {
      fail(`protected file missing: ${quotePath(filePath)}`);
    }
    return { path: filePath, sha256: sha256(absolutePath) };
  });
  const status = workingTreeStatus(repositoryRoot);
  const baseline = {
    version: 1,
    repositoryRoot,
    head: currentHead(repositoryRoot),
    porcelainV1ZBase64: status.porcelainV1ZBase64,
    porcelainEntries: status.entries,
    protectedFiles,
  };

  writeFileSync(outputPath, `${JSON.stringify(baseline, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  chmodSync(outputPath, 0o600);

  console.log("CAPTURE PASS");
  console.log(`BASELINE ${quotePath(outputPath)}`);
  console.log(`HEAD ${baseline.head}`);
  for (const entry of baseline.porcelainEntries) {
    console.log(`DIRTY ${entry.status} ${quotePath(entry.path)}`);
    if (entry.originalPath !== undefined) {
      console.log(`DIRTY SOURCE ${quotePath(entry.originalPath)}`);
    }
  }
  for (const protectedFile of baseline.protectedFiles) {
    console.log(
      `PROTECTED ${protectedFile.sha256} ${quotePath(protectedFile.path)}`,
    );
  }
}

function readBaseline(repositoryRoot, baselinePath) {
  let baseline;
  try {
    baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  } catch {
    fail("unable to read baseline JSON");
  }

  if (
    baseline?.version !== 1 ||
    typeof baseline.repositoryRoot !== "string" ||
    typeof baseline.head !== "string" ||
    !Array.isArray(baseline.porcelainEntries) ||
    !Array.isArray(baseline.protectedFiles)
  ) {
    fail("invalid baseline JSON schema");
  }
  if (path.resolve(baseline.repositoryRoot) !== repositoryRoot) {
    fail("baseline repository does not match current Git root");
  }

  for (const entry of baseline.porcelainEntries) {
    if (
      typeof entry?.status !== "string" ||
      typeof entry?.path !== "string" ||
      (entry.originalPath !== undefined && typeof entry.originalPath !== "string")
    ) {
      fail("invalid baseline porcelain entry");
    }
  }
  for (const protectedFile of baseline.protectedFiles) {
    if (
      typeof protectedFile?.path !== "string" ||
      !/^[0-9a-f]{64}$/.test(protectedFile?.sha256)
    ) {
      fail("invalid baseline protected file entry");
    }
    normalizedRepositoryPath(repositoryRoot, protectedFile.path, "protected path");
  }

  return baseline;
}

function verify(repositoryRoot, parsed) {
  const baselinePath = requireAbsoluteOutsideRepository(
    repositoryRoot,
    parsed["--baseline"],
    "baseline",
  );
  const allowedPaths = new Set(
    (parsed["--allow"] ?? []).map((filePath) =>
      normalizedRepositoryPath(repositoryRoot, filePath, "--allow"),
    ),
  );
  const baseline = readBaseline(repositoryRoot, baselinePath);
  const currentStatus = workingTreeStatus(repositoryRoot);
  const startingDirtyPaths = new Set(entryPaths(baseline.porcelainEntries));
  const currentDirtyPaths = new Set(entryPaths(currentStatus.entries));
  const failures = [];

  for (const protectedFile of baseline.protectedFiles) {
    const absolutePath = path.join(repositoryRoot, protectedFile.path);
    if (!existsSync(absolutePath)) {
      failures.push(`protected file missing: ${quotePath(protectedFile.path)}`);
      continue;
    }
    if (sha256(absolutePath) !== protectedFile.sha256) {
      failures.push(`protected hash changed: ${quotePath(protectedFile.path)}`);
    }
  }

  for (const filePath of startingDirtyPaths) {
    if (!currentDirtyPaths.has(filePath)) {
      failures.push(`starting dirty path disappeared: ${quotePath(filePath)}`);
    }
  }

  for (const filePath of currentDirtyPaths) {
    if (!startingDirtyPaths.has(filePath) && !allowedPaths.has(filePath)) {
      failures.push(
        `new changed path outside allowlist: ${quotePath(filePath)}`,
      );
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`VERIFY FAIL ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("VERIFY PASS");
  console.log(`BASELINE ${quotePath(baselinePath)}`);
  console.log(`HEAD START ${baseline.head}`);
  console.log(`HEAD CURRENT ${currentHead(repositoryRoot)}`);
  for (const protectedFile of baseline.protectedFiles) {
    console.log(
      `PROTECTED UNCHANGED ${protectedFile.sha256} ${quotePath(protectedFile.path)}`,
    );
  }
  for (const entry of baseline.porcelainEntries) {
    console.log(`DIRTY PRESERVED ${entry.status} ${quotePath(entry.path)}`);
    if (entry.originalPath !== undefined) {
      console.log(`DIRTY PRESERVED SOURCE ${quotePath(entry.originalPath)}`);
    }
  }
}

try {
  const { command, parsed } = parseArguments(process.argv.slice(2));
  const repositoryRoot = currentGitRoot();
  if (command === "capture") {
    capture(repositoryRoot, parsed);
  } else {
    verify(repositoryRoot, parsed);
  }
} catch (error) {
  console.error(`ERROR ${error instanceof Error ? error.message : "unknown error"}`);
  process.exitCode = 1;
}
