# Code Review — Kaelyn's Academy (`kaelyn-math`)

Date: 2025-12-12

## Scope

This review covers:
- Next.js App Router structure (`src/app/*`)
- Client state + persistence (`src/store/*`, `src/lib/session.ts`, `src/lib/csrf*.ts`)
- API routes (`src/app/api/*`)
- Core UI modules and common components (`src/components/*`)
- Build/lint health + repo hygiene

## Commands Run / Current Health

- `bun run lint` (passes with warnings)
  - Unused `adjusted` (`src/lib/mathValidation.test.ts:244`)
  - Unused `uniqueDigits` (`src/lib/problemGenerators.ts:211`)
- `bun run build` (success)
  - Warning about Next.js selecting a workspace root due to multiple lockfiles; `next.config.ts` is currently empty (`next.config.ts:1`)

## Architecture Summary

- Next.js 16 + App Router; UI is effectively a single-page section switcher (`src/app/page.tsx:1`).
- Redux Toolkit for client state (`src/store/index.ts:1`, `src/store/sessionSlice.ts:1`, `src/store/navigationSlice.ts:1`).
- Persistence is implemented via a signed JSON session cookie (`src/lib/session.ts:8`) and a double-submit CSRF cookie (`src/lib/csrf.ts:6`).
- Audio feedback uses Web Speech API + Web Audio API (`src/contexts/AudioContext.tsx:1`, `src/hooks/useAudio.ts:1`).
- Tailwind v4 theme tokens are defined via CSS variables + `@theme` (`src/app/globals.css:1`).

## Strengths

- Clean separation between “sections” and reusable UI primitives.
- Consistent kid-friendly UX patterns (large touch targets, high contrast tokens, celebratory feedback).
- Good timer cleanup in interval-based demos (e.g., `src/components/sections/CarryOverSection.tsx:1`, `src/components/sections/BorrowingSection.tsx:1`).
- Reasonable cookie size guardrails for session storage (`src/lib/session.ts:11`).

## Findings (Prioritized)

### P0 — Fix Before Production

1) Session signing falls back to a hardcoded secret
- `getSessionSecret()` uses `'development-session-secret'` when `SESSION_SECRET` is missing (`src/lib/session.ts:18`).
- Impact: in production, an attacker can forge/modify session cookies if the secret is not configured.
- Recommendation: hard-fail in production when the secret is missing; keep the dev fallback only in development.

2) State persistence is currently inconsistent and partially broken
- `/api/state` expects a partial `SessionState` at the top level (`src/app/api/state/route.ts:36`), but `saveSessionState` sends `{ updates: ... }` (`src/store/sessionSlice.ts:29`).
- `/api/progress/[module]` expects the update object (`src/app/api/progress/[module]/route.ts:35`), but `updateModuleProgress` sends `{ updates: ... }` (`src/store/sessionSlice.ts:42`).
- Reading modules update Redux only (e.g. `updateSightWords` in `src/components/sections/SightWordsSection.tsx:91`), so progress won’t persist across reloads unless you also write to the cookie-backed session.
- Recommendation: pick a single contract and enforce it (either server expects `{ updates }` everywhere or clients send raw partials everywhere). Add persistence calls where user progress matters.

3) Tailwind dynamic classnames likely won’t generate CSS for letters
- `LettersSection` uses template strings such as `from-${letterColor}/20`, `text-${letterColor}`, `bg-${color}/20` (`src/components/sections/LettersSection.tsx:246`, `src/components/sections/LettersSection.tsx:305`).
- Impact: in production builds, many of these classes can be missing because Tailwind scans for static classnames.
- Recommendation: replace dynamic class strings with explicit maps (e.g. `{ coral: 'from-coral/20 ...' }`) or use CSS variables/styles for dynamic colors.

4) Server-side merge patterns are too permissive
- `/api/state` iterates `Object.entries(updates)` and assigns into `state` with minimal validation (`src/app/api/state/route.ts:39`).
- `/api/progress/[module]` uses `Object.assign(moduleData, updates)` for arbitrary JSON (`src/app/api/progress/[module]/route.ts:46`).
- Impact: shape corruption is easy; keys like `__proto__`/`constructor` should be rejected; untrusted nested objects can be merged unexpectedly.
- Recommendation: whitelist allowed keys per route and reject dangerous property names; validate value types (a small manual schema is sufficient here).

5) React correctness issue in `NumberLine`
- Component updates state during render when `start` changes (`src/components/math/NumberLine.tsx:29`).
- Effect intentionally disables hook dependency checks (`src/components/math/NumberLine.tsx:71`), which can lead to stale reads for `position`, `min/max`, and `onPositionChange`.
- Impact: can cause subtle bugs under React 19 strict/concurrent behavior.
- Recommendation: move “reset on start change” into an effect, and include proper dependencies in the animation effect.

### P1 — Fix Soon (Reliability / UX)

1) Unused or “not wired” progress endpoints
- `recordLessonVisit` exists (`src/store/sessionSlice.ts:55`) but is not used; `lessonsCompleted` is displayed as a completion indicator on Home (`src/components/sections/HomeSection.tsx:99`) but nothing updates it.
- Recommendation: either wire lesson visit/complete into navigation/sections or remove the unused API surface to reduce maintenance.

2) Fetch thunks don’t check `response.ok`
- `loadSessionState`/`saveSessionState` assume JSON success (`src/store/sessionSlice.ts:20`).
- Recommendation: check `response.ok`, handle failures, and set `state.session.error` consistently.

3) `safeParseJson` accepts arrays
- It returns any “object” including arrays (`src/lib/apiUtils.ts:24`).
- Recommendation: reject arrays (`!Array.isArray(body)`) if your handlers expect objects.

4) `/api/reset` should be environment-guarded
- Even with CSRF, exposing reset in production is unnecessary risk (`src/app/api/reset/route.ts:1`).
- Recommendation: block in production (or require an additional dev-only header/flag).

### P2 — Nice to Have (Performance / Maintainability)

1) Initial client bundle likely larger than needed
- `src/app/page.tsx` imports all sections eagerly (`src/app/page.tsx:6`), including large reading datasets (`src/lib/phonicsData.ts`).
- Recommendation: `next/dynamic` for sections (at least for `phonics`), and/or split by subject.

2) Repo documentation drift
- `README.md` describes an Express + vanilla stack that no longer matches the current Next.js/React/Redux codebase (`README.md:74`).
- Recommendation: update README to reflect actual stack and current scripts.

3) Unused helpers
- `apiSuccess` and `withErrorHandling` appear unused (`src/lib/apiUtils.ts:16`).
- Recommendation: remove or adopt consistently to reduce dead code.

## Suggested Next Steps (Concrete)

### Quick Wins (1–2 hours)
- Enforce `SESSION_SECRET` in production (`src/lib/session.ts:18`).
- Fix client/server payload contracts for `/api/state` and `/api/progress/[module]` (`src/app/api/state/route.ts:26`, `src/store/sessionSlice.ts:29`, `src/app/api/progress/[module]/route.ts:21`).
- Replace dynamic Tailwind classnames in `LettersSection` with explicit maps (`src/components/sections/LettersSection.tsx:246`).
- Refactor `NumberLine` to avoid setState-in-render and fix effect deps (`src/components/math/NumberLine.tsx:29`).
- Remove the two lint warnings.
- Update `README.md` to match the real stack.

### Medium Changes (half-day)
- Decide what “progress persistence” means per module and wire the APIs accordingly:
  - Persist reading progress (Sight Words / Letters / Phonics) into the cookie session.
  - Define when lessons are “visited” vs “completed” and update `lessonsVisited/lessonsCompleted` consistently.
- Harden API input validation (per-route allowlists, reject `__proto__`, type checks).

### Longer-Term Improvements
- Add basic automated tests for API routes and session/CSRF behavior.
- Consider moving large curricula data behind dynamic imports and/or separate chunks.
- Add observability hooks (simple client-side error reporting) for the error boundary.

## Appendix: Notes on Current Session/CSRF Design

- Session cookie is httpOnly + signed (`src/lib/session.ts:95`); good baseline for integrity.
- CSRF uses double-submit with a readable cookie + header (`src/lib/csrf.ts:12`, `src/lib/csrfClient.ts:19`).
- Ensure `/api/state` GET is called early so the CSRF cookie exists; this currently happens on app load (`src/app/page.tsx:47`).

