import { randomBytes } from "node:crypto";
import {
  closeSync,
  constants,
  fchmodSync,
  fstatSync,
  lstatSync,
  openSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { isAbsolute, join } from "node:path";

const failureMessage = "R0_1B_SYNTHETIC_IDENTITY_FAILED\n";
const targetName = "controlled-signup-identity.json";
let targetPath = "";
let targetCreated = false;
let descriptor;

function failClosed() {
  if (descriptor !== undefined) {
    try {
      closeSync(descriptor);
    } catch {
      // Best-effort close while failing closed.
    }
    descriptor = undefined;
  }
  if (targetCreated && targetPath) {
    try {
      unlinkSync(targetPath);
    } catch {
      // Never touch a target that this process did not create.
    }
  }
  process.stderr.write(failureMessage);
  process.exitCode = 1;
}

try {
  if (
    process.argv.length !== 4 ||
    process.argv[2] !== "--directory" ||
    !process.argv[3]
  ) {
    throw new Error("invalid arguments");
  }

  const directory = process.argv[3];
  if (!isAbsolute(directory)) {
    throw new Error("directory must be absolute");
  }
  if (typeof process.getuid !== "function") {
    throw new Error("owner verification unavailable");
  }

  const directoryStat = lstatSync(directory);
  if (
    !directoryStat.isDirectory() ||
    directoryStat.isSymbolicLink() ||
    directoryStat.uid !== process.getuid() ||
    (directoryStat.mode & 0o777) !== 0o700
  ) {
    throw new Error("unsafe directory");
  }

  const randomId = randomBytes(16).toString("hex");
  const identity = {
    email: `r0-1b-${randomId}@signup.invalid`,
    name: `R0.1B Synthetic Signup ${randomId.slice(-8)}`,
    synthetic: true,
  };

  targetPath = join(directory, targetName);
  const flags =
    constants.O_WRONLY |
    constants.O_CREAT |
    constants.O_EXCL |
    (constants.O_NOFOLLOW ?? 0);
  descriptor = openSync(targetPath, flags, 0o600);
  targetCreated = true;
  fchmodSync(descriptor, 0o600);

  const fileStat = fstatSync(descriptor);
  if (
    !fileStat.isFile() ||
    fileStat.uid !== process.getuid() ||
    (fileStat.mode & 0o777) !== 0o600
  ) {
    throw new Error("unsafe target");
  }

  writeFileSync(descriptor, `${JSON.stringify(identity)}\n`, "utf8");
  closeSync(descriptor);
  descriptor = undefined;

  const finalDirectoryStat = lstatSync(directory);
  const finalFileStat = lstatSync(targetPath);
  if (
    !finalDirectoryStat.isDirectory() ||
    finalDirectoryStat.isSymbolicLink() ||
    finalDirectoryStat.uid !== process.getuid() ||
    (finalDirectoryStat.mode & 0o777) !== 0o700 ||
    !finalFileStat.isFile() ||
    finalFileStat.isSymbolicLink() ||
    finalFileStat.uid !== process.getuid() ||
    (finalFileStat.mode & 0o777) !== 0o600
  ) {
    throw new Error("post-write verification failed");
  }

  process.stdout.write(`${targetPath}\n`);
} catch {
  failClosed();
}
