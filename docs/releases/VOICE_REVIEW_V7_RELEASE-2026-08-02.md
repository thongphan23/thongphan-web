# Voice Review V7 Release Evidence

## Scope

- Route: `/voice`
- Audio source: TPR Natural Performance V7 owner-review masters
- TPR source commit: `e4d2931bd0b9232ec7f49e54e5617f69573083f8`
- TPR evidence commit: `84af9e7`
- Run root: `/Users/rio/Movies/thong-phan-remotion-runs/thought-breath-energy-pham-tuyen-v7-20260802`

## Locked Masters

| Track | Duration | WAV SHA-256 | Semantic ASR CER | Critical phrases |
| --- | ---: | --- | ---: | ---: |
| A | 68.086s | `0182478793e7a68d3c3729036a2f6e1e08b7c73c5bf283c4ad95492357cde497` | 0.000849 | 12/12 |
| B | 66.325s | `2482b7adf6e4698d977c70dd17ef2c707331e74476ba35e52b8009c6a15d6696` | 0.003396 | 12/12 |
| C | 66.266s | `9bdda62826516af0369e1cd4cfaf478c55fcb7c15462c0408530ba4bf595d0c4` | 0.007640 | 12/12 |

Web MP3 SHA-256:

```text
A d798767cf90999e7c82cb6c38b3df69147239fb86115a58e6fce1c2f54675c51
B 470a8b87a3e7554f5e6d6dd8685922f6ce1205d51a7192cf8d3b22b57e9d4604
C 9a14247caa3ea3777f2a0153b0b061bcd6dc58fa69c4672a19ae3ed28dbf7c5e
```

## Verification

```text
voice route focused tests: 3 passed
website regression: 251 passed, 0 failed
eslint: PASS, 0 warnings
Next.js production build: PASS, /voice statically generated
desktop visual QA: PASS at 1440x1000, no horizontal overflow
mobile visual QA: PASS at 390x844, no horizontal overflow
browser audio playback: PASS for A, B and C
decoded durations: 68.085688s, 66.325188s, 66.266229s
```

## Release Boundary

The release branch starts from Cloudflare production source commit `3a69754`,
then adds the isolated `/voice` route and V7 audio. It does not include or
overwrite uncommitted work from the primary website worktree.
