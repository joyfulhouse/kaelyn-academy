# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kaelyn's Math Adventure is an interactive math learning website designed for young children. It features colorful animations, visual learning aids, and progressive practice modules for arithmetic fundamentals.

## Commands

```bash
# Install dependencies
bun install

# Run development server with auto-reload
bun run dev

# Run production server
bun start
```

The server runs on `http://localhost:3000` by default (configurable via `PORT` environment variable).

## Architecture

### Server (`server.js`)
Express.js server with cookie-session middleware for state persistence. Handles:
- Static file serving from `public/`
- Session state management APIs (`/api/state`, `/api/progress/:module`, etc.)
- Problem generation API (`/api/generate-problems`)

Session state persists for 30 days and tracks:
- Module-specific progress (questions attempted/correct)
- Practice session history and scores
- Stars earned and achievements
- Lessons visited/completed

### Frontend (`public/`)
Single-page application with vanilla JavaScript:
- `index.html` - Main layout with all learning modules as section elements
- `app.js` - Application logic (~1800 lines) handling all modules, animations, and API calls
- `styles.css` - CSS with CSS variables for theming and extensive animations

### Learning Modules

| Module | Section ID | Description |
|--------|-----------|-------------|
| Number Places | `number-places` | Place value visualization with interactive blocks |
| Stacked Math | `stacked-math` | Vertical addition/subtraction with digit inputs |
| Multiplication | `multiplication` | Visual grid, times tables, and quizzes |
| Division | `division` | Sharing scenarios with visual grouping |
| Carrying | `carry-over` | Step-by-step animated carry-over demos |
| Borrowing | `borrowing` | Step-by-step animated borrowing demos |
| Practice | `practice` | Configurable mixed practice sessions |

### State Flow

```
Frontend (app.js)
    ├── loadSessionState() → GET /api/state
    ├── saveSessionState() → POST /api/state
    ├── updateModuleProgress() → POST /api/progress/:module
    └── recordPracticeSession() → POST /api/practice/record
```

All state changes update UI immediately via `updateUIFromState()`.

## Key Patterns

### Problem Generation
Problems are generated client-side (`generateProblem()` in app.js) or server-side (`/api/generate-problems`). Both use the same difficulty tiers:
- easy: 1-10
- medium: 10-100
- hard: 100-1000

Division/multiplication are capped at 12×12 for all difficulties.

### Animation System
The carry-over and borrowing modules use `setInterval`-based step animations stored in `carryAnimationInterval`/`borrowAnimationInterval`. Always clear these when starting a new animation or navigating away.

### Session State Schema
```javascript
{
  userName: string,
  lessonsVisited: string[],
  lessonsCompleted: string[],
  numberPlaces: { questionsAttempted, questionsCorrect, highestNumber },
  stackedMath: { additionAttempted, additionCorrect, subtractionAttempted, subtractionCorrect },
  multiplication: { questionsAttempted, questionsCorrect, tablesCompleted: number[], bestStreak },
  division: { questionsAttempted, questionsCorrect, bestStreak },
  carryOver: { questionsAttempted, questionsCorrect, bestStreak },
  borrowing: { questionsAttempted, questionsCorrect, bestStreak },
  practice: { totalSessions, totalProblems, totalCorrect, bestScore, recentScores: object[] },
  totalStars: number,
  achievements: string[],
  lastActive: ISO timestamp
}
```
