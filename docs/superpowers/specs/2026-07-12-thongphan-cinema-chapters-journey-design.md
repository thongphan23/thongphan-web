# Thông Phan Cinema Chapters Journey Design

**Status:** Approved for implementation on 2026-07-12.

**Source decision:** The reviewed Cinema Chapters + Editorial Light proposal is the design source of truth. Figma is a presentation aid only and is not an implementation dependency.

## Goal

Turn the released Unified Cinema site from a set of visually related pages into one coherent user journey. Every in-scope page must tell visitors where they are, what they just received, and why a specific next step is appropriate.

## Success criteria

- Every in-scope page has one primary next action and no more than two contextual secondary actions.
- Internal actions use canonical, buildable routes and explain why the destination is useful.
- Home, diagnostic, library, reading, assets, challenges, about, blog, chat, and Conan Maker form a connected journey instead of independent destinations.
- Cinema Dark, Evidence Dossier, Learning Dossier, and Editorial Light retain their distinct reading conditions while sharing typography, lacquer semantics, chapter labels, route handoffs, focus states, and motion grammar.
- Chat and diagnostic return structured recommendations with useful labels, reasons, and internal routes.
- Reading pages end with three different kinds of exit: think deeper, use a practical asset, or take action.
- Keyboard, reduced-motion, mobile, static export, SEO, and existing rights constraints remain intact.

## Scope

### Shared journey spine

- Add a typed route-intent registry that defines the role, chapter label, primary action, and contextual alternatives for each route family.
- Add one shared `ChapterHandoff` component with dark and paper variants.
- Add a pure route validator contract covering every internal destination exposed by the registry.
- Use the existing Unified Cinema tokens; add only the missing unified mono font variable and semantic oxblood token.

### Chat

- Replace plain mock strings with a structured answer containing a concise diagnosis and up to three route recommendations.
- Keep the existing external chat API contract unchanged. When the remote response contains no structured routes, append deterministic local recommendations based on the visitor's question.
- Render recommendations as cinematic route cards with a reason, destination label, and accessible link.
- Keep chat useful without a backend, JavaScript streaming failure, or network access.

### Diagnostic

- Preserve the five questions, score boundaries, and deterministic result levels.
- Expand each result into a compact dossier: diagnosis, current blockage, next move, and three reasoned recommendations.
- Replace external `com.conan.school` result links with the canonical local `/conanmaker/` bridge so users do not jump out of the visual system without context.
- Keep answer state local and resettable; do not add accounts or persistence.

### Library and readers

- Add a "start from your current state" strip to the library using three intent-led entries: clarify thinking, turn expertise into an asset, and begin a practice rhythm.
- Keep the current editorial archive, URL-backed discovery, and rights-gated readings.
- Extend reading endings beyond related readings with a shared contextual handoff to an asset and a challenge/diagnostic action.
- Do not fabricate article imagery or republish blocked source bodies.

### Remaining subpages

- About: lead from personal proof to diagnostic and library.
- Blog index/detail: lead from a timely argument into a related library path or diagnostic.
- Assets index/detail: explain when to use an asset, then offer application or guided next step.
- Challenges index/detail: lead from commitment into the canonical challenge and then Conan Maker only when the visitor has completed the action context.
- Conan Maker: preserve the standalone static app and its user-owned untracked assets. Add only a safe bridge before entry or a tracked HTML affordance if verification proves it does not overwrite those assets.

## Non-goals

- No Figma dependency, design-to-code import, CMS, backend, account system, analytics vendor, or new animation/component library.
- No full visual rewrite of the released homepage, Learn product pages, or standalone Conan application.
- No generated people, testimonials, proof, metrics, source claims, or copyrighted reading bodies.
- No route rename, redirect migration, or change to the static-export hosting model.
- No modification, deletion, formatting, staging, or replacement of the four user-owned untracked Conan Maker files.

## Architecture

### Route-intent registry

Create `lib/site-journey.ts` as the only source of truth for cross-page recommendations.

```ts
export type JourneyAction = {
  href: string
  label: string
  reason: string
  eyebrow: string
  external?: boolean
}

export type JourneyHandoff = {
  chapter: string
  title: string
  description: string
  primary: JourneyAction
  secondary: JourneyAction[]
}

export function getJourneyHandoff(key: JourneyKey): JourneyHandoff
export function getRecommendationsForPrompt(prompt: string): JourneyAction[]
```

The registry contains content and canonical route intent only. It imports no React or browser API, so it is directly testable and safe in server or client components.

### Presentation component

Create `components/journey/ChapterHandoff.tsx` and `ChapterHandoff.module.css`.

- `tone="dark"` uses ink, paper, lacquer, film-line framing, and restrained reveal.
- `tone="paper"` uses reading paper, text ink, oxblood, and editorial rules.
- The first action has visual priority. Secondary actions remain visible but quieter.
- Every card includes a reason before its link label.
- Internal links use `next/link`; external links use a normal anchor with safe target attributes.
- Motion is CSS-only and fully removed under `prefers-reduced-motion: reduce`.

### Route integration

Server pages select a handoff by stable `JourneyKey`. Client pages may import the pure registry and render the same component. Page-specific modules keep their current layout ownership; the shared component owns only the chapter-ending transition.

### Chat data flow

```text
visitor prompt
  -> current streaming/plain response
  -> pure prompt classifier
  -> 1 primary + up to 2 secondary JourneyAction records
  -> assistant message + recommendation cards
```

The classifier recognizes practical intent families rather than exact prompts: clarity/AI fear, knowledge system/Brain2, content/proof, asset/offer, learning, and community. Unknown prompts fall back to diagnostic, library, and chat-context guidance without claiming knowledge the model does not have.

### Diagnostic data flow

```text
five local answers -> score -> existing DiagnosticLevel
  -> level-owned JourneyAction records
  -> result dossier + contextual cards
```

Score calculation and boundaries do not change. Only recommendation structure and presentation change.

## Visual system

- Use Cormorant Garamond for cinematic statements, Newsreader for editorial chapter titles, Be Vietnam Pro for interface/body text, and IBM Plex Mono for evidence labels.
- Load IBM Plex Mono through `next/font/google` with `preload: false` and expose `--font-ibm-plex-mono` on the root body. Unified routes map `--font-mono` to it; legacy routes keep JetBrains Mono.
- Use `#b3231b` for primary action, `#e04b43` for rare active/hover emphasis, and `#7b2d1c` for oxblood dossier surfaces.
- Do not add gradients as decoration. Depth comes from border, paper/ink contrast, image material, spacing, and restrained shadow.
- Handoff blocks use an asymmetric editorial grid, not a repeated generic three-card dashboard.
- Minimum interactive target is 44px. Focus uses the existing lacquer focus ring.

## Content rules

- Labels describe the action; reasons describe why it is relevant now.
- Avoid generic copy such as "Khám phá thêm", "Tìm hiểu thêm", or "Bắt đầu hành trình" without an object.
- Vietnamese remains conversational and concrete. Product terms appear only when they help the user choose.
- A page ending must acknowledge what the visitor just completed before suggesting the next step.
- Each destination appears at most once in a handoff.

## Error handling

- An unknown journey key is a TypeScript error, not a runtime fallback.
- The route contract fails the test suite when an internal recommendation has no static route owner.
- Chat network failure keeps the existing friendly error and renders deterministic local recommendations instead of an empty state.
- Empty related-reading arrays still render the practical/action exits.
- Standalone and legacy routes are excluded from shared shell assumptions.

## Testing

- Pure tests for route registry uniqueness, canonical paths, prompt classification, and diagnostic recommendation boundaries.
- Source contracts for `ChapterHandoff`, link semantics, reduced motion, and page integration.
- Existing full tests, TypeScript, static build, release contracts, and bundle budget.
- Browser QA at 1440x900, 1280x720, 390x844, and 320x568.
- Keyboard QA for all new links, chat suggestions, chat form, diagnostic options, focus rings, and mobile menu.
- Reduced-motion QA for handoff reveal and existing film motion.
- Visual QA checks hierarchy, no clipped actions, no horizontal overflow, and continuity across dark-to-paper transitions.

## Release boundary

Implementation may be committed in independently green slices. Production deployment remains a separate explicit step. The four existing untracked Conan Maker assets must remain byte-for-byte untouched and unstaged throughout.
