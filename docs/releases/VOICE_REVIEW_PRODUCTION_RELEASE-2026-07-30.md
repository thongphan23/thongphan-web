# Voice Review Production Release

Date: 2026-07-30  
Route: `https://thongphan.com/voice`  
Source commit: `49c2b87`  
Production baseline: `de6d903`

## Release Scope

- Publish three TPR V6 male voice comparison files as A, B and C.
- Keep the page private by discovery with `noindex, nofollow, nocache`.
- Use native MP3 controls, `preload="metadata"`, no autoplay and one active
  player at a time.
- Preserve all current production routes and the protected `/tpr` boundary.

## Verification Evidence

```text
Focused voice contract: 3 passed, 0 failed
Full website regression: 251 passed, 0 failed
ESLint: PASS
TypeScript: PASS
Static build: 85 routes, PASS
Desktop browser: 1440x1000, overflow 0, PASS
Mobile browser: 390x844, overflow 0, PASS
Preview browser console errors: 0
Audio switching: A paused after B starts, PASS
Audio durations: A 70.600125s, B 67.779542s, C 68.150167s
Production smoke: / 200, Remotion review 200, /tpr 401
```

Committed and production MP3 SHA-256 values:

```text
A dc575abe824ef12e3c1d00702d075ca5ed0357bfe3052708de90ffff1e611800
B e4de1a4bd724aae75eac47fa113b794e8eb52d6071c1e798370908e5c492229c
C 7e9a2f10972a0cddcd8d9e92bde0472026842ab19de4340015d3d484e4b2b35d
```

## Deployment And Rollback

- Immutable preview: `a5d9a0eb`, source `49c2b87`.
- Pages production: `9b69e8f7`, source `49c2b87`.
- Previous Pages production rollback: `e8f8731d-a019-40cc-99a9-9081184928f5`,
  source `de6d903`.
- The release was rebuilt from `de6d903` before deployment; it does not roll
  production back to the older operations-console branch.
