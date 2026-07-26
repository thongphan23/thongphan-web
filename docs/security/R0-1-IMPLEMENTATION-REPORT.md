# R0.1 Security Remediation Implementation Report

Status: IN PROGRESS

## R0.1A Task 1 — Working-tree preservation gate

Task 1 installs a local capture/verification guard. It does not deploy, migrate or
change any production resource.

### Starting repository state

The protected baseline was captured read-only from the canonical dirty repository:

- Repository: `/Users/rio/thongphan-com`
- Branch: `agent/r0-foundation-audit`
- HEAD: `6a1ec9a5a0d61342106c16a1edf42b04a00099de`
- Upstream: `origin/agent/r0-foundation-audit`

Implementation runs in the isolated clean repository:

- Repository: `/Users/rio/thongphan-com-r0-1a`
- Branch: `agent/r0-1a-security-remediation`
- Starting HEAD: `bde1778d698d9c1c0cc4e1823cc28485a3e4a8cf`
- Upstream: `origin/agent/r0-1a-security-remediation`

Pre-existing canonical dirty paths:

```text
 M tsconfig.tsbuildinfo
?? public/conanmaker/assets/index-CIK0RB8_.css
?? public/conanmaker/assets/index-Dqi6Mg8p.js
?? public/conanmaker/assets/thong-stage-anchor-CyfnwxYu.jpg
?? public/conanmaker/assets/thong-stage-anchor-loop-Csh11-t8.mp4
```

Starting protected SHA-256 values:

| Path | SHA-256 |
|---|---|
| `tsconfig.tsbuildinfo` | `2de0b6ca88190106152ba8cc4ae7f0260b45c442d1ba6daa84ac5b33790f7a2c` |
| `public/conanmaker/assets/index-CIK0RB8_.css` | `c4434e44be49b2cdb4abfe6dec9f04b0675fbee5b87aa771368ce8dd99e5b6c5` |
| `public/conanmaker/assets/index-Dqi6Mg8p.js` | `fe309b6dc4156e92f6418ed7313652c3a1306d8d832aa8fd7ab9a586226d732e` |
| `public/conanmaker/assets/thong-stage-anchor-CyfnwxYu.jpg` | `0928f0a2682ca148a1e2155bae981cd43d6891290bd07373df28db1b445e40f4` |
| `public/conanmaker/assets/thong-stage-anchor-loop-Csh11-t8.mp4` | `0af0e452665f1dd3a3da1739e414b69ceb7223ea6616e9dcf3ea4d941609d4cb` |

### TDD evidence

RED:

```bash
node --test scripts/r0-1-change-boundary.test.mjs
```

- Exit code: `1`
- Expected reason: `scripts/r0-1-change-boundary.mjs` did not exist.

GREEN:

```bash
npm run test:r0-1-boundary
```

- Exit code: `0`
- Result: `14/14` fixture tests passed.
- Coverage: unchanged dirty tree, exact allowlist, protected-file mutation,
  disappearing starting dirty path, new out-of-boundary path, NUL-safe unusual
  path, private `0600` baseline, output-symlink escape, executable mode, invalid
  roots/paths, missing protected files, duplicate values/flags and unknown
  arguments.

### Canonical baseline capture

The script lives only in the isolated implementation repository. The absolute
script path below allowed a read-only capture with the canonical repository as the
current Git root.

```bash
node /Users/rio/thongphan-com-r0-1a/scripts/r0-1-change-boundary.mjs capture \
  --output /tmp/thongphan-r0-1-boundary.json \
  --protect tsconfig.tsbuildinfo \
  --protect public/conanmaker/assets/index-CIK0RB8_.css \
  --protect public/conanmaker/assets/index-Dqi6Mg8p.js \
  --protect public/conanmaker/assets/thong-stage-anchor-CyfnwxYu.jpg \
  --protect public/conanmaker/assets/thong-stage-anchor-loop-Csh11-t8.mp4
```

- Working directory: `/Users/rio/thongphan-com`
- Exit code: `0`
- Baseline path requested: `/tmp/thongphan-r0-1-boundary.json`
- Baseline path resolved by the operating system: `/private/tmp/thongphan-r0-1-boundary.json`
- Baseline mode: `0600`
- Result: captured starting HEAD, exact NUL-delimited porcelain entries and five
  protected hashes without file bodies.

### Canonical boundary verification

```bash
node /Users/rio/thongphan-com-r0-1a/scripts/r0-1-change-boundary.mjs verify \
  --baseline /tmp/thongphan-r0-1-boundary.json \
  --allow scripts/r0-1-change-boundary.mjs \
  --allow scripts/r0-1-change-boundary.test.mjs \
  --allow package.json \
  --allow docs/security/R0-1-IMPLEMENTATION-REPORT.md
```

- Working directory: `/Users/rio/thongphan-com`
- Exit code: `0`
- Result: `VERIFY PASS`; all five starting dirty paths remained present, all five
  protected hashes were unchanged and no new canonical changed path appeared.

### Rollback

Delete only `scripts/r0-1-change-boundary.mjs`,
`scripts/r0-1-change-boundary.test.mjs` and this report, then remove only the
`test:r0-1-boundary` package script. Leave the canonical dirty state untouched.

### Remaining R0.1A boundary

Task 1 does not mark R0.1A ready for implementation review. Later tasks own the
remaining local source controls and final report status. R0.1B production cutover
has not started.
