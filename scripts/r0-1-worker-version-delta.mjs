#!/usr/bin/env node

import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readSync,
} from "node:fs";
import { isAbsolute } from "node:path";

const MAX_INPUT_BYTES = 256 * 1024;
const VERSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fail(classification, exitCode) {
  process.stderr.write(`${classification}\n`);
  process.exitCode = exitCode;
}

function parseArguments(argv) {
  if (argv.length !== 4) throw new Error("invalid arguments");

  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const option = argv[index];
    const value = argv[index + 1];
    if (
      (option !== "--before" && option !== "--after") ||
      typeof value !== "string" ||
      value.length === 0 ||
      values.has(option)
    ) {
      throw new Error("invalid arguments");
    }
    values.set(option, value);
  }

  const before = values.get("--before");
  const after = values.get("--after");
  if (!before || !after || !isAbsolute(before) || !isAbsolute(after)) {
    throw new Error("invalid arguments");
  }
  return { before, after };
}

function assertSafeStat(stat) {
  if (!stat.isFile()) throw new Error("not a regular file");
  if ((stat.mode & 0o400) === 0) throw new Error("not owner-readable");
  if ((stat.mode & 0o022) !== 0) throw new Error("unsafe permissions");
  if (stat.size > MAX_INPUT_BYTES) throw new Error("input too large");
}

function readSafeFile(path) {
  const pathStat = lstatSync(path);
  if (pathStat.isSymbolicLink()) throw new Error("symlink rejected");
  assertSafeStat(pathStat);

  const descriptor = openSync(
    path,
    constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
  );
  try {
    const openedStat = fstatSync(descriptor);
    assertSafeStat(openedStat);
    if (openedStat.dev !== pathStat.dev || openedStat.ino !== pathStat.ino) {
      throw new Error("input changed");
    }

    const buffer = Buffer.alloc(MAX_INPUT_BYTES + 1);
    let bytesRead = 0;
    while (bytesRead < buffer.length) {
      const count = readSync(
        descriptor,
        buffer,
        bytesRead,
        buffer.length - bytesRead,
        bytesRead,
      );
      if (count === 0) break;
      bytesRead += count;
    }

    const finalStat = fstatSync(descriptor);
    if (
      bytesRead > MAX_INPUT_BYTES ||
      bytesRead !== openedStat.size ||
      finalStat.size !== openedStat.size ||
      finalStat.dev !== openedStat.dev ||
      finalStat.ino !== openedStat.ino
    ) {
      throw new Error("input changed or exceeded limit");
    }

    return buffer.toString("utf8", 0, bytesRead);
  } finally {
    closeSync(descriptor);
  }
}

function parseVersionIds(path) {
  const parsed = JSON.parse(readSafeFile(path));
  if (!Array.isArray(parsed)) throw new Error("invalid top-level value");

  const ids = new Set();
  for (const entry of parsed) {
    if (
      entry === null ||
      typeof entry !== "object" ||
      Array.isArray(entry) ||
      typeof entry.id !== "string" ||
      !VERSION_ID_PATTERN.test(entry.id) ||
      ids.has(entry.id)
    ) {
      throw new Error("invalid version entry");
    }
    ids.add(entry.id);
  }
  return ids;
}

try {
  const { before, after } = parseArguments(process.argv.slice(2));
  const beforeIds = parseVersionIds(before);
  const afterIds = parseVersionIds(after);
  const added = [...afterIds].filter((id) => !beforeIds.has(id));

  if (added.length === 0) {
    fail("VERSION_DELTA_NONE", 1);
  } else if (added.length > 1) {
    fail("VERSION_DELTA_MULTIPLE", 1);
  } else {
    process.stdout.write(`${added[0]}\n`);
  }
} catch {
  fail("VERSION_DELTA_INVALID", 2);
}
