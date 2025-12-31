# PROMPT.md - Academy Loop Orchestration Guide

> **Academy Loops** are autonomous, iterative development cycles designed for sustained, high-quality educational platform development. Each loop operates as a complete unit of work: discovery → architecture → implementation → review → verification → completion.

## Invoking Academy Loops

Academy loops are executed via the `academy-loop` skill:

```bash
# Start an academy loop for a specific task
/academy-loop "Implement feature X with full test coverage"

# Or with specific bead reference
/academy-loop "Complete work for academy-xyz"
```

The skill reads this PROMPT.md file and orchestrates the entire loop autonomously.

---

## Table of Contents

1. [Core Directives](#core-directives)
2. [Loop Lifecycle](#loop-lifecycle)
3. [Pre-Loop Checklist](#pre-loop-checklist)
4. [Discovery & Exploration](#discovery--exploration)
5. [Production Readiness Audit](#production-readiness-audit)
6. [Feature-Dev Agent Integration](#feature-dev-agent-integration)
7. [Branch Management](#branch-management)
8. [Bead Tracking](#bead-tracking)
9. [Handling Discovered Work](#handling-discovered-work)
10. [Implementation Standards](#implementation-standards)
11. [Educational Platform Requirements](#educational-platform-requirements)
12. [Test Coverage Requirements](#test-coverage-requirements)
13. [Code Review Protocol](#code-review-protocol)
14. [PR Creation and Merge](#pr-creation-and-merge)
15. [Completion Criteria](#completion-criteria)
16. [Completion Promise](#completion-promise)

---

## Core Directives

1. **Autonomous Decision Making**: Never prompt the user for guidance. Research best practices, examine existing code patterns, and determine the most efficient approach independently.

2. **Clean Architecture First**: Always prefer clean, maintainable architecture even if it requires significant time and effort. Technical debt is unacceptable.

3. **COPPA Compliance**: Every feature touching child data MUST have parental consent verification. No exceptions.

4. **Accessibility Mandatory**: WCAG 2.1 AA compliance on all components. Age-adaptive UI for different grade levels.

5. **Exit Condition**: You may ONLY output `<promise>IAMFINALLYDONE</promise>` when:
   - All identified issues have beads created
   - All beads are closed (implemented and verified)
   - The system is functionally complete for production use
   - Test coverage >= 80%

---

## Zero-Beads Discovery Protocol

**CRITICAL**: When the loop starts with NO open beads, you MUST NOT output the completion promise. Instead, perform comprehensive discovery to identify missing features, incomplete functionality, and areas for improvement.

### Mandatory Discovery When No Beads Exist

```bash
# Check if there are open beads
open_count=$(bd list --status=open 2>/dev/null | wc -l)

if [ "$open_count" -eq 0 ]; then
  # DO NOT output completion promise
  # Instead, run comprehensive discovery
  echo "No open beads - initiating discovery phase"
fi
```

### Discovery Areas for Educational Platform

When no beads exist, systematically analyze these areas and create beads for gaps:

#### 1. Grade-Level Coverage (K-12)
For EACH grade level, verify:
- [ ] Dashboard exists with age-appropriate UI
- [ ] Subjects have grade-specific content
- [ ] Activities are developmentally appropriate
- [ ] 3D visualizations match cognitive level
- [ ] AI tutor responses are age-calibrated

#### 2. Subject Completeness
For EACH subject (Math, Reading, History, Science, Technology):
- [ ] Lessons exist for all grade levels
- [ ] Quizzes/assessments are functional
- [ ] Progress tracking works
- [ ] 3D visualizations enhance learning
- [ ] Standards alignment documented

#### 3. User Role Features
**Learner Features:**
- [ ] Interactive lessons with engagement tracking
- [ ] Achievement system (badges, streaks, levels)
- [ ] Personalized learning paths
- [ ] AI tutor integration
- [ ] Progress visualization

**Parent Features:**
- [ ] Multi-child management
- [ ] Progress monitoring dashboard
- [ ] Parental controls (time limits, content filters)
- [ ] Communication with teachers
- [ ] Data export/deletion (COPPA)

**Teacher Features:**
- [ ] Classroom management
- [ ] Assignment creation and grading
- [ ] Student progress analytics
- [ ] Standards mapping
- [ ] Bulk operations

**Admin Features:**
- [ ] Organization management
- [ ] User administration
- [ ] Analytics and reporting
- [ ] Content moderation
- [ ] Subscription/billing

#### 4. Technical Completeness
- [ ] All API endpoints have tests
- [ ] All pages handle loading/error states
- [ ] Forms have proper validation
- [ ] Database queries are optimized
- [ ] Security headers configured

#### 5. Content & Resources
- [ ] Sufficient lessons per subject/grade
- [ ] Quality 3D visualizations
- [ ] Educational worksheets/printables
- [ ] Video content integration
- [ ] External resource links

### Discovery Process

```markdown
1. **Run feature-dev:code-explorer** on each major area
2. **Compare against Production Readiness Audit** checklist
3. **Create beads** for EVERY gap identified
4. **Prioritize** based on user impact:
   - P0: Blocking core functionality
   - P1: Required for MVP
   - P2: Important enhancements
   - P3: Nice-to-have features
5. **Continue the loop** - implement discovered beads
```

### Example Discovery Beads

```bash
# Missing grade-level content
bd create --title="[REQUIRED] Add 2nd grade math lessons" --type=task --priority=1

# Missing user feature
bd create --title="[REQUIRED] Implement teacher assignment grading" --type=feature --priority=1

# Technical gap
bd create --title="[REQUIRED] Add API tests for messaging routes" --type=task --priority=2

# Enhancement
bd create --title="[FEATURE] Add printable worksheets for offline learning" --type=feature --priority=2
```

### The Loop NEVER Completes Without Genuine Completeness

The completion promise may ONLY be output when:
1. Discovery has been performed
2. ALL discovered gaps have beads
3. ALL beads are implemented and closed
4. The platform is GENUINELY ready for production use by:
   - Students of ALL grade levels (K-12)
   - Parents managing multiple children
   - Teachers running classrooms
   - Administrators managing organizations

---

## Loop Lifecycle

Each academy loop follows this iterative sequence with discovery built-in:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ACADEMY LOOP CYCLE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. INIT           Create feature branch from main/master                   │
│       ↓            Create initial EPIC + Task beads                         │
│                                                                             │
│  2. DISCOVER       Run feature-dev:code-explorer                            │
│       ↓            Analyze existing patterns and dependencies               │
│                    Identify hidden complexity and edge cases                │
│                    CREATE NEW BEADS for discovered work                     │
│                                                                             │
│  3. ARCHITECT      Run feature-dev:code-architect                           │
│       ↓            Design implementation blueprint                          │
│                    Define component boundaries                              │
│                    UPDATE BEADS with refined scope                          │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────┐           │
│  │  4. IMPLEMENT   Write code following blueprint               │           │
│  │       ↓         Use Clean Architecture principles            │  ITERATE  │
│  │                 Write tests alongside code                   │           │
│  │                 Verify COPPA compliance                      │           │
│  │                                                              │           │
│  │  5. REVIEW      Run code-reviewer after each component       │     ↑     │
│  │       ↓         Fix issues immediately                       │     │     │
│  │                 DISCOVER new tasks → CREATE BEADS            │─────┘     │
│  │                                                              │           │
│  │  6. TEST        Run tests, check coverage                    │           │
│  │       ↓         If <80%, write more tests                    │           │
│  │                 If failures, fix and re-test                 │           │
│  └──────────────────────────────────────────────────────────────┘           │
│                                                                             │
│  7. FINALIZE       Run full pr-review-toolkit suite                         │
│       ↓            Address ALL remaining issues                             │
│                    Ensure all discovered beads are closed                   │
│                                                                             │
│  8. PR             Create PR with comprehensive summary                     │
│       ↓            Link ALL beads (original + discovered)                   │
│                    Include discovery notes                                  │
│                                                                             │
│  9. MERGE          Merge to main/master                                     │
│       ↓            Close ALL related beads                                  │
│                    Push to remote                                           │
│                                                                             │
│  10. VERIFY        All beads closed (including discovered)                  │
│        ↓           All branches merged                                      │
│                    Test coverage >80%                                       │
│                    Production readiness checks                              │
│                                                                             │
│  11. COMPLETE      Output completion promise                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Discovery Mindset

**Discovery is not optional** - it's a core part of every loop. You WILL find:
- Hidden dependencies you didn't anticipate
- Edge cases the original task didn't account for
- COPPA compliance gaps
- Accessibility issues
- Age-appropriateness concerns
- Test scenarios you hadn't considered

**Every discovery becomes a bead.** Track everything.

---

## Pre-Loop Checklist

Before starting any academy loop, verify:

```bash
# 1. Check current branch is clean
git status  # Should show clean working tree

# 2. Ensure on main/master
git branch --show-current  # Should be main or master

# 3. Pull latest changes
git pull origin main  # or master

# 4. Check beads status
bd stats
bd ready

# 5. Verify test infrastructure exists
bun test --run 2>/dev/null || echo "Tests need setup"

# 6. Check coverage baseline (if tests exist)
bun test --coverage 2>/dev/null || echo "Coverage needs setup"

# 7. Verify dev server runs
bun dev &
sleep 5
curl -s http://localhost:3000 > /dev/null && echo "Dev server OK"
kill %1
```

---

## Discovery & Exploration

Discovery happens at multiple points in the loop. This section defines when and how to explore.

### When to Run Discovery

| Phase | Trigger | Agent | Output |
|-------|---------|-------|--------|
| **Initial** | After branch creation | `code-explorer` | Understanding of existing patterns |
| **Pre-Implementation** | Before each component | `code-architect` | Component design |
| **Mid-Implementation** | When hitting complexity | `code-explorer` | Dependency mapping |
| **Post-Implementation** | After each component | `code-reviewer` | Issues and improvements |
| **Integration** | When connecting components | `code-explorer` | Integration points |

### Discovery Protocol

```markdown
1. **State your hypothesis**
   - What do you expect to find?
   - What patterns should exist?

2. **Run exploration**
   - Use appropriate feature-dev agent
   - Cast a wide net initially

3. **Document findings**
   - Create beads for discovered work
   - Update existing beads with new scope
   - Note patterns for reuse

4. **Assess impact**
   - Does this change the architecture?
   - Are there COPPA implications?
   - Does scope need adjustment?

5. **Iterate or proceed**
   - If major discovery → re-architect
   - If minor discovery → add bead, continue
```

### Discovery Questions for Educational Platform

Before implementing ANY component, answer:

```markdown
□ What existing code does this touch?
□ What patterns does this codebase use for similar features?
□ Does this feature handle child data? (COPPA check)
□ What grade levels does this affect?
□ Are there accessibility requirements (WCAG 2.1 AA)?
□ Does the UI need age-adaptation?
□ What 3D visualization opportunities exist?
□ What AI integration points are there?
□ How does multi-tenancy affect this?
□ What tests already cover related functionality?
```

---

## Production Readiness Audit

### Functional Requirements Checklist

Systematically verify each area. For EACH missing or incomplete feature, create a bead.

#### Authentication & Authorization (Auth.js v5)
- [ ] Email/password registration with verification
- [ ] OAuth providers (Google, Microsoft, Apple)
- [ ] Parent account creation
- [ ] Child account creation (requires parent consent)
- [ ] Age verification during registration
- [ ] COPPA consent flow for children under 13
- [ ] Role-based access control (learner, parent, teacher, admin)
- [ ] Session management with secure cookies
- [ ] Password reset flow
- [ ] Account linking (multiple OAuth providers)

#### Learner Dashboard (`/(learner)/*`)
- [ ] Age-appropriate dashboard layout
- [ ] Current lesson progress display
- [ ] Achievement badges and streaks
- [ ] Recommended next activities
- [ ] Subject selection interface
- [ ] Grade-level appropriate navigation
- [ ] Progress charts/visualizations
- [ ] AI tutor chat access
- [ ] 3D visualization gallery

#### Parent Dashboard (`/(parent)/*`)
- [ ] Child account management
- [ ] Progress monitoring per child
- [ ] Parental controls interface
- [ ] Content filtering settings
- [ ] Time limits configuration
- [ ] Activity reports and analytics
- [ ] Notification preferences
- [ ] Subscription/billing management
- [ ] Data export (COPPA requirement)
- [ ] Account deletion flow

#### Teacher Dashboard (`/(teacher)/*`)
- [ ] Classroom management
- [ ] Student roster with progress
- [ ] Assignment creation and tracking
- [ ] Curriculum alignment tools
- [ ] Standards mapping (Common Core, NGSS)
- [ ] Performance analytics
- [ ] Communication tools
- [ ] Resource library access
- [ ] Bulk operations for classes

#### Admin Portal (`/(admin)/*`)
- [ ] Organization/tenant management
- [ ] User administration
- [ ] Content moderation tools
- [ ] Analytics dashboard
- [ ] Subscription management
- [ ] Feature flag controls
- [ ] Audit logs
- [ ] Support ticket system
- [ ] White-label theme management

#### Curriculum System
- [ ] Subject browser (Math, Reading, History, Science, Technology)
- [ ] Grade-level content filtering (K-12)
- [ ] Lesson viewer with 3D visualizations
- [ ] Interactive activities and quizzes
- [ ] Progress tracking per activity
- [ ] Mastery level system
- [ ] Prerequisite enforcement
- [ ] Content sequencing
- [ ] Offline capability (PWA)

#### 3D Visualization System (Three.js + R3F)
- [ ] Math concept visualizers (fractions, geometry, algebra)
- [ ] Science simulations (physics, chemistry, biology)
- [ ] Historical timeline 3D scenes
- [ ] Interactive globe for geography
- [ ] Molecular structure viewer
- [ ] Solar system explorer
- [ ] WebGL fallback for unsupported devices
- [ ] Accessibility alternatives (screen reader descriptions)
- [ ] Progressive loading for 3D assets

#### AI Tutoring System
- [ ] Multi-provider abstraction (Claude, OpenAI, Gemini)
- [ ] Age-appropriate response filtering
- [ ] Socratic questioning mode
- [ ] Hint system for stuck learners
- [ ] Explanation level adaptation per grade
- [ ] Conversation history
- [ ] Rate limiting per user
- [ ] Content safety filtering
- [ ] Parent-visible conversation logs

#### Multi-Tenant Features
- [ ] Organization registration flow
- [ ] White-label theming per tenant
- [ ] Custom domain support
- [ ] Tenant-scoped data isolation
- [ ] Bulk user import
- [ ] SSO configuration (SAML, OIDC)
- [ ] Usage analytics per tenant
- [ ] Billing per organization

#### General UI/UX
- [ ] Loading states for all async operations
- [ ] Error boundaries with friendly messages
- [ ] Toast notification system
- [ ] Confirmation dialogs for destructive actions
- [ ] Mobile responsive design
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] High contrast mode
- [ ] Font size controls
- [ ] Empty states for all list views
- [ ] Skeleton loaders

---

## Feature-Dev Agent Integration

Feature-dev agents are your primary tools for discovery and quality. Use them aggressively.

### Agent Capabilities

| Agent | Purpose | When to Use | Output |
|-------|---------|-------------|--------|
| `code-explorer` | Deep codebase analysis | Start of loop, when stuck, integration points | Patterns, dependencies, architecture map |
| `code-architect` | Design blueprints | Before implementation, after major discovery | Component design, file structure, interfaces |
| `code-reviewer` | Quality assurance | After each component, before PR | Issues, improvements, bugs |

### code-explorer Usage

**Invocation:**
```markdown
Use Task tool with subagent_type: feature-dev:code-explorer

Prompt template:
"Analyze [target area] in this codebase. I need to understand:
1. Existing patterns for [functionality type]
2. How [related feature] is implemented
3. Dependencies and integration points for [component]
4. Test coverage patterns
5. COPPA compliance patterns
6. Age-adaptive UI patterns

Focus on: [specific files/directories]
Goal: [what you're trying to build]"
```

### code-architect Usage

**Invocation:**
```markdown
Use Task tool with subagent_type: feature-dev:code-architect

Prompt template:
"Design the implementation for [feature]. Based on exploration:
- Existing patterns: [summary from explorer]
- Constraints: [technical constraints]
- Requirements: [functional requirements]
- COPPA considerations: [if applicable]
- Age range: [target grades]

Provide:
1. Component breakdown
2. File structure
3. Interface definitions
4. Data flow
5. 3D visualization strategy (if applicable)
6. Test strategy"
```

### code-reviewer Usage

**Invocation:**
```markdown
Use Task tool with subagent_type: feature-dev:code-reviewer

Prompt template:
"Review the changes in [files/components]. Check for:
1. Adherence to existing patterns
2. Clean Architecture compliance
3. Test coverage adequacy
4. Error handling completeness
5. Security concerns (especially COPPA)
6. Accessibility (WCAG 2.1 AA)
7. Age-appropriateness of content/UI

Context: [what was implemented and why]"
```

### Agent Chaining Pattern

For complex features, chain agents:

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT CHAIN FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  code-explorer ──→ Initial understanding                         │
│        │           Create discovery beads                        │
│        │           Check COPPA implications                      │
│        ↓                                                         │
│  code-architect ──→ Design blueprint                             │
│        │            Update beads with design                     │
│        │            Define age-adaptive components               │
│        ↓                                                         │
│  [IMPLEMENT COMPONENT 1]                                         │
│        ↓                                                         │
│  code-reviewer ──→ Review component 1                            │
│        │           Create beads for issues                       │
│        │           Verify accessibility                          │
│        │           Fix issues                                    │
│        ↓                                                         │
│  [IMPLEMENT COMPONENT 2]                                         │
│        ↓                                                         │
│  code-reviewer ──→ Review component 2                            │
│        │           ... repeat ...                                │
│        ↓                                                         │
│  [ALL COMPONENTS DONE]                                           │
│        ↓                                                         │
│  pr-review-toolkit ──→ Final comprehensive review                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Branch Management

### Branch Naming Convention

```
<type>/<bead-id>-<short-description>

Types:
- feature/  → New functionality
- fix/      → Bug fixes
- refactor/ → Code restructuring
- test/     → Test additions/modifications
- docs/     → Documentation only
- chore/    → Maintenance tasks
```

### Examples

```bash
feature/academy-xj6-3d-fraction-visualizer
fix/academy-abc-coppa-consent-flow
refactor/academy-123-multi-tenant-isolation
test/academy-yup-ai-tutor-coverage
```

### Branch Lifecycle Commands

```bash
# Start of loop - create branch
git checkout main
git pull origin main
git checkout -b feature/academy-xxx-description

# During loop - commit frequently
git add -A
git commit -m "feat: implement X component"

# End of loop - prepare for PR
git push -u origin feature/academy-xxx-description

# After merge - cleanup
git checkout main
git pull origin main
git branch -d feature/academy-xxx-description
```

---

## Bead Tracking

### Required Beads Structure

Every academy loop MUST have:

1. **EPIC Bead** - High-level feature/goal
2. **Task Beads** - Specific implementation units
3. **Dependencies** - Properly linked

### Creating Beads

```bash
# Create EPIC
bd create --title="[EPIC] Feature Name" --type=feature --priority=1 \
  --description="High-level description of the feature goal"

# Create Tasks (run in parallel for efficiency)
bd create --title="Task 1 description" --type=task --priority=1 \
  --description="Detailed description"
bd create --title="Task 2 description" --type=task --priority=1 \
  --description="Detailed description"

# Link dependencies
bd dep add <task-id> <epic-id>
```

### Bead Status Management

```bash
# When starting work
bd update <id> --status=in_progress

# When blocked
bd update <id> --status=blocked
bd dep add <id> <blocking-id>

# When complete
bd close <id> --reason="Implemented in PR #X"

# Batch close multiple
bd close <id1> <id2> <id3>
```

---

## Handling Discovered Work

Discovery is continuous. You WILL find additional work during implementation.

### Discovery Categories

| Category | Action | Example |
|----------|--------|---------|
| **Blocker** | Create bead, fix immediately | Missing dependency, COPPA violation |
| **Required** | Create bead, complete in this loop | Edge case, missing validation |
| **Enhancement** | Create bead, assess scope | Refactoring opportunity, optimization |
| **Future** | Create bead, link to EPIC, defer | Nice-to-have, out of scope |

### Decision Tree for Discovered Work

```
┌─────────────────────────────────────────────────────────────────┐
│                 DISCOVERED WORK DECISION TREE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Discovery Found                                                 │
│        │                                                         │
│        ↓                                                         │
│  Is it a COPPA/Security issue?                                   │
│        │                                                         │
│    YES ↓                 NO ↓                                    │
│  ┌─────────────┐    Does it BLOCK current work?                  │
│  │ CRITICAL    │         │                                       │
│  │ Create bead │     YES ↓                 NO ↓                  │
│  │ Fix NOW     │    ┌─────────────┐   Is it REQUIRED?            │
│  │ P0 priority │    │ BLOCKER     │        │                     │
│  └─────────────┘    │ Create bead │    YES ↓           NO ↓      │
│                     │ Fix NOW     │   ┌─────────────┐ ┌────────┐ │
│                     └─────────────┘   │ REQUIRED    │ │ FUTURE │ │
│                                       │ Create bead │ │ Create │ │
│                                       │ Add to loop │ │ bead   │ │
│                                       └─────────────┘ │ Defer  │ │
│                                                       └────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Creating Discovery Beads

```bash
# For COPPA/security issues
bd create --title="[CRITICAL] COPPA: Description" --type=bug --priority=0 \
  --description="Discovered during: [task]. Compliance issue: [details]"

# For blocking issues
bd create --title="[BLOCKER] Description" --type=bug --priority=0 \
  --description="Discovered during: [task]. Blocks: [what]. Fix: [approach]"

# For required work
bd create --title="[REQUIRED] Description" --type=task --priority=1 \
  --description="Discovered during: [task]. Required for: [reason]"

# For future work (outside this loop)
bd create --title="[FUTURE] Description" --type=feature --priority=3 \
  --description="Discovered during: [task]. Deferred because: [reason]"
```

---

## Implementation Standards

### Project Architecture

Follow the existing Next.js App Router structure:

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register, consent)
│   ├── (learner)/         # Learner dashboard and lessons
│   ├── (parent)/          # Parent dashboard and controls
│   ├── (teacher)/         # Teacher dashboard and classroom
│   ├── (admin)/           # Admin panel
│   └── api/               # API routes (REST + GraphQL)
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── 3d/                # Three.js visualizations
│   ├── curriculum/        # Lesson and activity components
│   └── dashboard/         # Dashboard widgets
├── lib/
│   ├── db/                # Drizzle schema and queries
│   ├── auth/              # Auth.js configuration
│   ├── ai/                # AI provider abstraction
│   └── utils/             # Shared utilities
├── features/              # Feature modules
│   ├── auth/
│   ├── curriculum/
│   ├── progress/
│   ├── tutor/
│   └── admin/
└── types/                 # Shared TypeScript types
```

### Architecture Principles

1. **Server Components by Default**: Only use Client Components for interactivity
2. **Multi-Tenant Scoping**: Every database query MUST include organization scope
3. **Type Safety**: No `any` types, Zod validation for all external data
4. **Atomic Design**: atoms → molecules → organisms for components
5. **Repository Pattern**: Abstract persistence behind interfaces

### Decision Making Without User Input

When facing implementation choices:

1. **Research best practices** via documentation skills
2. **Prioritize COPPA compliance** for child data
3. **Prefer full capability** over simplicity
4. **Choose accessible solutions** (WCAG 2.1 AA)
5. **Document decisions** in code comments
6. **Optimize for testability** and maintainability

---

## Educational Platform Requirements

### COPPA Compliance Checklist

For ANY feature touching child data:

- [ ] Parental consent verified before data collection
- [ ] No direct marketing to children under 13
- [ ] Parental access to view/delete child data
- [ ] Age-appropriate content filtering
- [ ] No third-party tracking without consent
- [ ] Clear privacy policy accessible to parents
- [ ] Data minimization (collect only what's needed)
- [ ] Secure data storage and transmission

### Age-Adaptive UI Requirements

| Grade Level | UI Characteristics |
|-------------|-------------------|
| K-2 | Large buttons, icons, read-aloud, simplified nav, bright colors, minimal text |
| 3-5 | Medium elements, guided navigation, gamification, achievement badges |
| 6-8 | Standard UI, more text, progress tracking, peer comparison (opt-in) |
| 9-12 | Full features, advanced tools, college prep, detailed analytics |

### 3D Visualization Requirements

Every concept visualization MUST have:
- [ ] Accessible alternative (text description, audio narration)
- [ ] WebGL fallback or graceful degradation
- [ ] Progressive loading with skeleton
- [ ] Touch/mouse support
- [ ] Keyboard navigation where possible
- [ ] Performance optimization (LOD, instancing)
- [ ] Mobile-responsive sizing

### AI Tutoring Requirements

- [ ] Age-appropriate language level
- [ ] Content safety filtering
- [ ] Socratic method (guide, don't give answers)
- [ ] Hint progression system
- [ ] Parent-visible conversation history
- [ ] Rate limiting per user/organization
- [ ] Multi-provider fallback (Claude → OpenAI → Gemini)
- [ ] Streaming responses for real-time feel

---

## Test Coverage Requirements

### Minimum Coverage: 80%

Coverage must meet or exceed 80% across:
- Statements
- Branches
- Functions
- Lines

### Required Test Types

#### 1. Unit Tests (Domain/Utils)
```typescript
// src/lib/utils/__tests__/grade-adapter.test.ts
describe('gradeToAgeRange', () => {
  it('should return correct age range for kindergarten', () => {})
  it('should handle edge cases', () => {})
})
```

#### 2. Component Tests
```typescript
// src/components/3d/__tests__/FractionVisualizer.test.tsx
describe('FractionVisualizer', () => {
  it('should render fraction correctly', () => {})
  it('should provide accessible description', () => {})
  it('should handle WebGL fallback', () => {})
})
```

#### 3. API Route Tests
```typescript
// src/app/api/lessons/__tests__/route.test.ts
describe('Lessons API', () => {
  it('should require authentication', () => {})
  it('should scope to organization', () => {})
  it('should filter by grade level', () => {})
})
```

#### 4. E2E Tests (Playwright)
```typescript
// tests/e2e/learner-flow.spec.ts
test('learner can complete a lesson', async ({ page }) => {
  // Full user flow test
})
```

### Coverage Commands

```bash
# Run tests with coverage
bun test --coverage

# Run E2E tests
bun test:e2e

# Check coverage threshold
bun test --coverage --coverage.thresholds.statements=80
```

---

## Code Review Protocol

### Automated Review Agents

Run these agents in sequence before PR:

```markdown
1. **code-reviewer** (pr-review-toolkit)
   - Check code quality
   - Identify bugs and logic errors
   - Verify project conventions
   - Check COPPA compliance

2. **code-simplifier** (pr-review-toolkit)
   - Simplify complex code
   - Remove unnecessary abstractions
   - Improve readability

3. **silent-failure-hunter** (pr-review-toolkit)
   - Find silent failures
   - Check error handling
   - Identify swallowed exceptions

4. **type-design-analyzer** (pr-review-toolkit)
   - Review new types
   - Check encapsulation
   - Verify invariants
```

### Review Issue Resolution

**ALL issues must be addressed.** No exceptions.

Resolution options:
1. **Fix** - Implement the suggested change
2. **Explain** - If the reviewer misunderstood, fix the code to be clearer
3. **Split** - Create a new bead for complex issues that require separate work

**NOT acceptable:**
- Deferring to "future work"
- Adding TODO comments
- Disabling linter rules
- Marking as "won't fix"

---

## PR Creation and Merge

### PR Template

```markdown
## Summary
- [Bullet point summary of changes]
- [Link to EPIC bead: academy-xxx]

## Changes
- [Specific change 1]
- [Specific change 2]

## COPPA Compliance
- [ ] No child data collected without consent
- [ ] Parental controls respected
- [ ] Age-appropriate content only

## Accessibility
- [ ] WCAG 2.1 AA compliance verified
- [ ] Screen reader tested
- [ ] Keyboard navigation works

## Test Coverage
- Current: X%
- Target: 80%
- Status: PASS/FAIL

## Beads Addressed
- [x] academy-xxx: Task description
- [x] academy-yyy: Task description

## Review Checklist
- [ ] Code review agent passed
- [ ] All tests passing
- [ ] Coverage >= 80%
- [ ] No linter warnings
- [ ] Types verified
- [ ] Accessibility verified

---
Generated with [Claude Code](https://claude.com/claude-code)
```

### PR Creation Command

```bash
gh pr create \
  --title "feat: Description of feature" \
  --body "$(cat <<'EOF'
## Summary
...

## Test plan
...

Addresses: academy-xxx, academy-yyy

---
Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Merge Process

```bash
# After PR approval
gh pr merge <pr-number> --squash --delete-branch

# Verify merge
git checkout main
git pull origin main

# Close beads
bd close academy-xxx academy-yyy --reason="Merged in PR #X"

# Sync beads
bd sync
```

---

## Completion Criteria

Before outputting the completion promise, ALL of the following MUST be true:

### Discovery & Exploration
- [ ] Initial code-explorer run completed
- [ ] code-architect blueprint created for complex features
- [ ] All discoveries documented
- [ ] All discovered beads created and tracked
- [ ] No unaddressed blockers

### Code Quality
- [ ] All linter checks pass (`bun lint`)
- [ ] All type checks pass (`bun typecheck`)
- [ ] No disabled linter rules
- [ ] No `@ts-ignore` or `eslint-disable` comments
- [ ] Clean architecture principles followed

### Test Coverage
- [ ] Test suite exists and runs
- [ ] Coverage >= 80% (statements, branches, functions, lines)
- [ ] All tests passing
- [ ] Critical user flows tested
- [ ] API routes tested

### COPPA Compliance (if child data involved)
- [ ] Parental consent flow verified
- [ ] Age verification implemented
- [ ] Data access controls tested
- [ ] Privacy policy accessible

### Accessibility
- [ ] WCAG 2.1 AA compliance verified
- [ ] Screen reader compatible
- [ ] Keyboard navigable
- [ ] Age-adaptive UI working

### Bead Management
- [ ] All ORIGINAL beads for this loop are closed
- [ ] All DISCOVERED beads (blocker, required) are closed
- [ ] FUTURE beads properly documented and linked
- [ ] No blocked beads remain
- [ ] `bd sync` completed successfully
- [ ] `bd list --status=open` returns empty (for this loop's beads)

### Branch Management
- [ ] All feature branches merged to main/master
- [ ] No orphaned branches
- [ ] `git push` completed to remote
- [ ] Working tree clean (`git status` shows nothing)

### PR Status
- [ ] All PRs merged
- [ ] No open PRs for this loop's work
- [ ] PR reviews addressed

### Production Readiness
- [ ] Build succeeds (`bun build`)
- [ ] No runtime errors in dev server
- [ ] Database migrations applied if needed
- [ ] Environment variables documented

---

## Completion Promise

**CRITICAL**: Only output this promise when ALL completion criteria are verified.

When all work is complete, tests pass with >80% coverage, all beads are closed, all branches are merged, and all checks pass, output EXACTLY:

```
<promise>IAMFINALLYDONE</promise>
```

### Pre-Promise Verification Script

Run this before outputting the promise:

```bash
#!/bin/bash
set -e

echo "=== Academy Loop Completion Verification ==="

# 1. Git status
echo -n "Git clean: "
if [ -z "$(git status --porcelain)" ]; then
  echo "PASS"
else
  echo "FAIL - uncommitted changes"
  exit 1
fi

# 2. On main/master
echo -n "On main branch: "
branch=$(git branch --show-current)
if [ "$branch" = "main" ] || [ "$branch" = "master" ]; then
  echo "PASS ($branch)"
else
  echo "FAIL - on $branch"
  exit 1
fi

# 3. Beads closed
echo -n "Beads closed: "
open_beads=$(bd list --status=open 2>/dev/null | grep -c "academy" || true)
if [ "$open_beads" -eq 0 ]; then
  echo "PASS"
else
  echo "FAIL - $open_beads open beads"
  exit 1
fi

# 4. Tests pass
echo -n "Tests: "
if bun test --run; then
  echo "PASS"
else
  echo "FAIL"
  exit 1
fi

# 5. Coverage
echo -n "Coverage >= 80%: "
coverage=$(bun test --coverage 2>&1 | grep "All files" | awk '{print $4}' | tr -d '%')
if [ "${coverage:-0}" -ge 80 ]; then
  echo "PASS ($coverage%)"
else
  echo "FAIL ($coverage%)"
  exit 1
fi

# 6. Lint
echo -n "Lint: "
if bun lint; then
  echo "PASS"
else
  echo "FAIL"
  exit 1
fi

# 7. Typecheck
echo -n "Typecheck: "
if bun typecheck; then
  echo "PASS"
else
  echo "FAIL"
  exit 1
fi

# 8. Build
echo -n "Build: "
if bun build; then
  echo "PASS"
else
  echo "FAIL"
  exit 1
fi

echo ""
echo "=== ALL CHECKS PASSED ==="
echo "You may now output: <promise>IAMFINALLYDONE</promise>"
```

---

## Quick Reference

### Invoking Academy Loop
```bash
# Via skill (recommended)
/academy-loop "Implement feature X"

# Or with existing bead
/academy-loop "Complete academy-xyz"
```

### Loop Start
```bash
git checkout main && git pull
git checkout -b feature/academy-xxx-description
bd create --title="[EPIC] ..." --type=feature --priority=1
bd update academy-xxx --status=in_progress
```

### Discovery Phase
```bash
# Run code-explorer (mandatory at loop start)
# Use Task tool with subagent_type: feature-dev:code-explorer

# Create beads for discovered work
bd create --title="[REQUIRED] ..." --type=task --priority=1

# Link to EPIC
bd dep add <discovered-task> <epic-id>
```

### Implementation Cycle
```bash
# For each component:
# 1. Run code-architect (design)
# 2. Implement
# 3. Run code-reviewer
# 4. Fix issues, create beads for discoveries
# 5. Write tests
# 6. Verify COPPA/accessibility
# 7. Repeat
```

### Loop End
```bash
# Verify all discovered beads are addressed
bd list --status=open  # Should be empty

# Run full quality checks
bun test --coverage
bun lint && bun typecheck

# Commit and push
git add -A && git commit -m "feat: ..."
git push -u origin feature/academy-xxx-description

# Create PR
gh pr create --title "..." --body "..."

# Merge and cleanup
gh pr merge --squash --delete-branch
git checkout main && git pull

# Close all beads (original + discovered)
bd close academy-xxx academy-yyy academy-zzz
bd sync

# Verify and complete
./scripts/verify-academy-loop.sh
<promise>IAMFINALLYDONE</promise>
```

### Discovery Commands Quick Ref
```bash
# Create critical (COPPA/security)
bd create --title="[CRITICAL] ..." --type=bug --priority=0

# Create blocker
bd create --title="[BLOCKER] ..." --type=bug --priority=0

# Create required
bd create --title="[REQUIRED] ..." --type=task --priority=1

# Create future (out of scope)
bd create --title="[FUTURE] ..." --type=feature --priority=3
```

---

## Important Reminders

- **Never skip COPPA checks** - Child safety is non-negotiable
- **Never skip accessibility** - WCAG 2.1 AA is required
- **Never ask the user** - Research and decide autonomously
- **Never compromise quality** - Clean architecture always
- **Never exit early** - Only when ALL beads are closed
- **Always discover** - Create beads for everything you find
- **Always complete discoveries** - Don't just log issues, fix them
- **Always commit** - Follow session close protocol
- **Always verify** - Typecheck and lint after changes

### The Loop Never Ends Early

```
while (bd list --status=open | wc -l) > 0:
    pick_next_task()
    implement()
    verify_coppa()
    verify_accessibility()
    discover_new_issues()  # Create beads for anything found
    close_task()

# Only when open count is ZERO:
output("<promise>IAMFINALLYDONE</promise>")
```

Begin by running Phase 1: Discovery & Audit.
