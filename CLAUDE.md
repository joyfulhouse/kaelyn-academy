# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kaelyn's Academy is an interactive learning website for young children featuring colorful animations, visual learning aids, and progressive modules for math and reading fundamentals.

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Development server with hot reload (localhost:3000)
bun run build        # Production build
bun start            # Run production server
bun run lint         # ESLint with Next.js TypeScript config
```

Optional: `node test-math-audit.js` runs a Chrome DevTools-based smoke test capturing screenshots to `docs/screenshots/` (requires dev server on port 3030).

## Architecture

### Tech Stack
- Next.js 16 with App Router
- React 19 with TypeScript (strict mode)
- Redux Toolkit for state management
- Tailwind CSS v4 with CSS variable theming

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (state, progress, practice, etc.)
│   ├── layout.tsx         # Root layout with Providers wrapper
│   ├── page.tsx           # Main SPA with section switching
│   └── globals.css        # Tailwind + CSS variable theme tokens
├── components/
│   ├── sections/          # Learning module sections (one per module)
│   │   ├── HomeSection.tsx        # Landing with subject-specific module cards
│   │   ├── SightWordsSection.tsx  # Reading: Dolch sight word flashcards
│   │   ├── LettersSection.tsx     # Reading: Alphabet learning
│   │   └── [Math modules...]      # NumberPlaces, StackedMath, etc.
│   ├── math/              # Math visualization components
│   ├── layout/            # Header, Navigation, SubjectTabs, FloatingShapes
│   └── common/            # Reusable UI (Button, Card, Input, StepIcon, etc.)
├── store/
│   ├── sessionSlice.ts    # User progress, stars, achievements (math + reading)
│   └── navigationSlice.ts # Active section and subject state
├── lib/
│   ├── session.ts         # Signed cookie-based session persistence
│   ├── csrf.ts            # Double-submit CSRF protection
│   ├── constants.ts       # SUBJECTS config, NAV_ITEMS, helpers
│   ├── sightWordLists.ts  # Dolch sight word lists by level (8 levels)
│   ├── mathUtils.ts       # Carry/borrow calculation utilities
│   └── problemGenerators.ts # Quiz and problem generation
├── hooks/                 # Typed Redux hooks, useAudio for speech synthesis
└── types/                 # TypeScript interfaces and type definitions
```

### State Flow

The app uses a dual-layer state approach:

1. **Client-side Redux** (`sessionSlice`, `navigationSlice`) for immediate UI updates
2. **Server-side cookies** (signed JSON in httpOnly cookie) for persistence across sessions

```
User Action → Redux dispatch → Async thunk → API route → Cookie update
                    ↓
            Immediate UI update
```

Session state persists for 30 days and includes per-module progress (questions attempted/correct, streaks), practice history, stars earned, and achievements.

### Subject-Based Navigation

The app uses tab-based subject navigation (`SubjectTabs` component):

| Subject | Color | Modules |
|---------|-------|---------|
| Math | Coral | Number Places, Stacked Math, Carry Over, Borrowing, Multiplication, Division, Practice |
| Reading | Sage | Sight Words, Letters |

The `activeSubject` state in `navigationSlice` controls which modules appear in the Navigation bar and HomeSection.

### Learning Modules

**Math Modules:**

| Section ID | Component | Description |
|------------|-----------|-------------|
| `home` | HomeSection | Landing page with subject-specific module cards |
| `number-places` | NumberPlacesSection | Place value visualization with blocks |
| `stacked-math` | StackedMathSection | Vertical addition/subtraction |
| `carry-over` | CarryOverSection | Animated step-by-step carrying demos |
| `borrowing` | BorrowingSection | Animated borrowing with click-to-borrow |
| `multiplication` | MultiplicationSection | Visual grids and times tables |
| `division` | DivisionSection | Sharing scenarios with grouping visuals |
| `practice` | PracticeSection | Configurable mixed practice sessions |

**Reading Modules:**

| Section ID | Component | Description |
|------------|-----------|-------------|
| `sight-words` | SightWordsSection | Dolch word flashcards with explore/quiz modes, 8 difficulty levels |
| `letters` | LettersSection | Alphabet learning with letter sounds, uppercase/lowercase matching |

### Problem Generation

**Math:** Generated via `src/lib/problemGenerators.ts` with difficulty tiers:
- **easy**: 1-10
- **medium**: 10-100
- **hard**: 100-1000

Multiplication/division are capped at 12x12. Carry/borrow problems use iterative generation to ensure the operation is actually required.

**Reading:** Sight words use Dolch word lists in `src/lib/sightWordLists.ts`:
- 8 levels from "First Words" (a, I, the) to "Story Words" (have, make, want)
- Quiz mode generates 4-option multiple choice from current level

### Security

- **CSRF**: Double-submit cookie pattern via `x-csrf-token` header matching cookie value
- **Session signing**: HMAC-SHA256 signature cookie alongside session cookie
- Requires `SESSION_SECRET` env var in production (falls back to dev secret)

## Key Patterns

### Path Aliases
Use `@/*` for imports (e.g., `@/components/common`, `@/lib/mathUtils`).

### Animation Cleanup
Carry-over and borrowing modules use `setInterval` for step animations. Always clear intervals when unmounting or starting new animations.

### Audio Feedback
The `useAudio` hook provides:
- `speak(text)` - Text-to-speech for words, letters, feedback
- `clickSound()` - UI interaction feedback
- `playSound('correct' | 'incorrect' | 'celebrate')` - Quiz feedback sounds

### Explore/Quiz Pattern
Reading modules follow a consistent dual-mode pattern:
1. **Explore mode**: Flashcard-style learning with audio pronunciation
2. **Quiz mode**: Multiple-choice recognition with streak tracking

### API Routes
All state-mutating endpoints require CSRF validation via `requireCsrf()`. Response format is `{ success: boolean, ...data }`.

### Styling
Uses Tailwind v4 with CSS variables defined in `globals.css`. Key color tokens: `--color-coral`, `--color-yellow`, `--color-sage`, `--color-sky`, `--color-cream` for the paper-craft aesthetic.

Touch targets are minimum 48px for child-friendly interaction.

## Coding Style

- TypeScript strict mode; functional React components with hooks
- `'use client'` directive required for client components
- Two-space indentation; PascalCase for components/files, camelCase for functions/variables, UPPER_SNAKE for constants
- Keep components side-effect free; move calculations to `src/lib`, state to `src/store`

## Testing

- Run `bun run lint` before pushing (baseline gate)
- Manual QA: verify navigation between sections, subject switching, session state persistence
- For animation/layout changes: capture before/after screenshots via the audit script

## Commits

- Short imperative subjects (e.g., "Add sight words module with Dolch word lists")
- PRs include summary, linked issue, and screenshots for visual changes
- List commands run (lint, dev smoke, audit) in PR body
