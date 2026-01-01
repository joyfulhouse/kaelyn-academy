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
12. [End-to-End Testing Requirements](#end-to-end-testing-requirements-mandatory) ← **NEW: MANDATORY**
13. [Test Coverage Requirements](#test-coverage-requirements)
14. [Code Review Protocol](#code-review-protocol)
15. [PR Creation and Merge](#pr-creation-and-merge)
16. [Completion Criteria](#completion-criteria)
17. [Completion Promise](#completion-promise)

---

## Core Directives

1. **Autonomous Decision Making**: Never prompt the user for guidance. Research best practices, examine existing code patterns, and determine the most efficient approach independently.

2. **Clean Architecture First**: Always prefer clean, maintainable architecture even if it requires significant time and effort. Technical debt is unacceptable.

3. **COPPA Compliance**: Every feature touching child data MUST have parental consent verification. No exceptions.

4. **Accessibility Mandatory**: WCAG 2.1 AA compliance on all components. Age-adaptive UI for different grade levels.

5. **E2E Testing Mandatory**: Before ANY loop completion, test ALL personas (learner, parent, teacher, admin) via dev-oauth. Verify:
   - Dev server starts without errors
   - Each persona can login via dev-oauth
   - Each persona reaches their dashboard without 500 errors
   - Role-based access control works (blocked routes return 403/redirect)
   - NO EXCEPTIONS. Do not claim completion without E2E validation.

6. **Exit Condition**: You may ONLY output `<promise>IAMFINALLYDONE</promise>` when:
   - All identified issues have beads created
   - All beads are closed (implemented and verified)
   - The system is functionally complete for production use
   - Test coverage >= 80%
   - **E2E persona tests pass for ALL roles**

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

## End-to-End Testing Requirements (MANDATORY)

**CRITICAL**: Before ANY loop can complete, full E2E testing MUST be performed. This is NON-NEGOTIABLE.

### Dev Server Validation

The dev server MUST be running and accessible before any other testing:

```bash
# 1. Start dev server
bun dev &
DEV_PID=$!
sleep 5

# 2. Verify server responds
curl -s http://localhost:5001 > /dev/null || { echo "FAIL: Dev server not responding"; exit 1; }

# 3. Verify auth providers available
providers=$(curl -s http://localhost:5001/api/auth/providers)
echo "$providers" | jq -e '.providers | length > 0' || { echo "FAIL: No auth providers"; exit 1; }
```

### Dev OAuth Login Flow Validation

The dev OAuth flow MUST work for all personas:

```bash
# Required environment variable
ENABLE_DEV_OAUTH=true  # Must be set in .env

# Test the dev OAuth flow programmatically
# 1. Get CSRF token
csrf=$(curl -s http://localhost:5001/api/auth/csrf | jq -r '.csrfToken')

# 2. Initiate dev-oauth signin (check it doesn't error)
curl -s -X POST http://localhost:5001/api/auth/signin/dev-oauth \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "csrfToken=$csrf" \
  --max-redirs 0 \
  -w "%{http_code}" | grep -q "302" || echo "WARN: OAuth redirect check"
```

### Persona E2E Test Matrix (MANDATORY)

**Each persona MUST be tested with the following flows:**

#### 1. Learner Persona
```markdown
□ Login via dev-oauth with role=learner
□ Verify redirect to /learn (learner dashboard)
□ Verify learner dashboard loads without errors
□ Verify subjects list is accessible
□ Verify lesson viewer works
□ Verify AI tutor chat is accessible
□ Verify progress tracking displays
□ Verify CANNOT access /admin, /teacher, /parent routes (403/redirect)
```

#### 2. Parent Persona
```markdown
□ Login via dev-oauth with role=parent
□ Verify redirect to /parent (parent dashboard)
□ Verify parent dashboard loads without errors
□ Verify children list is accessible
□ Verify can view child progress
□ Verify parental controls page works
□ Verify activity reports load
□ Verify CANNOT access /admin, /teacher routes (403/redirect)
```

#### 3. Teacher Persona
```markdown
□ Login via dev-oauth with role=teacher
□ Verify redirect to /teacher (teacher dashboard)
□ Verify teacher dashboard loads without errors
□ Verify classes list is accessible
□ Verify student roster works
□ Verify assignments page works
□ Verify standards alignment tools accessible
□ Verify CANNOT access /admin route (403/redirect)
```

#### 4. Admin Persona
```markdown
□ Login via dev-oauth with role=admin
□ Verify redirect to /admin (admin dashboard)
□ Verify admin dashboard loads without errors
□ Verify users management page works
□ Verify organizations page works
□ Verify analytics dashboard loads
□ Verify audit logs accessible
□ Verify CAN access all routes (/admin, /teacher, /parent, /learn)
```

### E2E Test Execution Script

**This script MUST pass before loop completion:**

```bash
#!/bin/bash
# scripts/e2e-persona-tests.sh
set -e

BASE_URL="${BASE_URL:-http://localhost:5001}"
FAILED=0

echo "========================================"
echo "  E2E PERSONA VALIDATION TESTS"
echo "========================================"
echo ""

# Function to test persona login and route access
test_persona() {
  local role=$1
  local expected_dashboard=$2
  local blocked_routes=("${@:3}")

  echo "Testing: $role persona"
  echo "----------------------------------------"

  # 1. Check dev-oauth provider is available
  providers=$(curl -s "$BASE_URL/api/auth/providers")
  if ! echo "$providers" | jq -e '.providers[] | select(.id == "dev-oauth")' > /dev/null 2>&1; then
    echo "  FAIL: dev-oauth provider not available"
    echo "        Ensure ENABLE_DEV_OAUTH=true in .env"
    return 1
  fi
  echo "  PASS: dev-oauth provider available"

  # 2. Get CSRF token
  csrf=$(curl -s "$BASE_URL/api/auth/csrf" | jq -r '.csrfToken')
  if [ -z "$csrf" ] || [ "$csrf" = "null" ]; then
    echo "  FAIL: Could not get CSRF token"
    return 1
  fi
  echo "  PASS: CSRF token obtained"

  # 3. Test dev-oauth authorize endpoint exists
  auth_status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/dev-oauth/authorize?role=$role&state=test")
  if [ "$auth_status" != "302" ] && [ "$auth_status" != "200" ]; then
    echo "  FAIL: dev-oauth authorize endpoint returned $auth_status"
    return 1
  fi
  echo "  PASS: dev-oauth authorize endpoint works"

  # 4. Test expected dashboard route exists (unauthenticated should redirect to login)
  dashboard_status=$(curl -s -o /dev/null -w "%{http_code}" -L "$BASE_URL$expected_dashboard")
  if [ "$dashboard_status" = "500" ]; then
    echo "  FAIL: $expected_dashboard returns 500 error"
    return 1
  fi
  echo "  PASS: $expected_dashboard route exists (status: $dashboard_status)"

  # 5. Test blocked routes return appropriate response
  for route in "${blocked_routes[@]}"; do
    if [ -n "$route" ]; then
      route_status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$route")
      if [ "$route_status" = "500" ]; then
        echo "  FAIL: $route returns 500 error (should be 403 or redirect)"
        return 1
      fi
      echo "  PASS: $route access control works (status: $route_status)"
    fi
  done

  echo "  ALL CHECKS PASSED for $role"
  echo ""
  return 0
}

# Test each persona
echo ""
echo "1. LEARNER PERSONA"
if ! test_persona "learner" "/learn" "/admin" "/teacher/classes"; then
  FAILED=1
fi

echo "2. PARENT PERSONA"
if ! test_persona "parent" "/parent" "/admin" "/teacher/classes"; then
  FAILED=1
fi

echo "3. TEACHER PERSONA"
if ! test_persona "teacher" "/teacher" "/admin"; then
  FAILED=1
fi

echo "4. ADMIN PERSONA"
if ! test_persona "admin" "/admin"; then
  FAILED=1
fi

echo "========================================"
if [ $FAILED -eq 0 ]; then
  echo "  ALL PERSONA TESTS PASSED"
  echo "========================================"
  exit 0
else
  echo "  SOME TESTS FAILED"
  echo "========================================"
  exit 1
fi
```

### Browser-Based E2E Tests (Playwright)

In addition to API tests, full browser tests MUST exist:

```typescript
// tests/e2e/auth/dev-oauth-flow.spec.ts
import { test, expect } from '@playwright/test';

const personas = ['learner', 'parent', 'teacher', 'admin'] as const;

for (const role of personas) {
  test.describe(`${role} persona`, () => {
    test(`can login via dev-oauth and access dashboard`, async ({ page }) => {
      // Navigate to login
      await page.goto('/login');

      // Click dev oauth button
      await page.click('[data-testid="dev-oauth-button"]');

      // Select role in dev oauth flow
      await page.selectOption('[data-testid="role-select"]', role);
      await page.fill('[data-testid="email-input"]', `test-${role}@example.com`);
      await page.fill('[data-testid="name-input"]', `Test ${role}`);
      await page.click('[data-testid="login-submit"]');

      // Verify redirect to correct dashboard
      const expectedPaths = {
        learner: '/learn',
        parent: '/parent',
        teacher: '/teacher',
        admin: '/admin',
      };
      await expect(page).toHaveURL(new RegExp(expectedPaths[role]));

      // Verify dashboard loads without error
      await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
    });

    test(`cannot access unauthorized routes`, async ({ page }) => {
      // Login as role first
      await loginAsRole(page, role);

      // Try to access unauthorized routes
      const blockedRoutes = {
        learner: ['/admin', '/teacher/classes', '/parent/children'],
        parent: ['/admin', '/teacher/classes'],
        teacher: ['/admin'],
        admin: [], // Admin can access all
      };

      for (const route of blockedRoutes[role]) {
        await page.goto(route);
        // Should either redirect to login or show 403
        const url = page.url();
        const is403 = await page.locator('text=Access Denied').isVisible().catch(() => false);
        expect(url.includes('/login') || is403).toBe(true);
      }
    });
  });
}
```

### Required Route Validation

These routes MUST work for each persona:

| Route | Learner | Parent | Teacher | Admin |
|-------|---------|--------|---------|-------|
| `/login` | ✓ | ✓ | ✓ | ✓ |
| `/learn` | ✓ | ✗ | ✗ | ✓ |
| `/learn/subjects` | ✓ | ✗ | ✗ | ✓ |
| `/parent` | ✗ | ✓ | ✗ | ✓ |
| `/parent/children` | ✗ | ✓ | ✗ | ✓ |
| `/parent/children/[slug]` | ✗ | ✓ | ✗ | ✓ |
| `/parent/children/[slug]/controls` | ✗ | ✓ | ✗ | ✓ |
| `/teacher` | ✗ | ✗ | ✓ | ✓ |
| `/teacher/classes` | ✗ | ✗ | ✓ | ✓ |
| `/teacher/students` | ✗ | ✗ | ✓ | ✓ |
| `/admin` | ✗ | ✗ | ✗ | ✓ |
| `/admin/users` | ✗ | ✗ | ✗ | ✓ |
| `/admin/organizations` | ✗ | ✗ | ✗ | ✓ |

### E2E Test Execution in Loop

**These tests MUST be run:**

1. **Before Implementation**: Verify current state
2. **After Each Major Change**: Catch regressions immediately
3. **Before PR Creation**: Full test suite must pass
4. **Before Loop Completion**: Final validation

```bash
# Run E2E tests in loop
echo "Running E2E persona tests..."
./scripts/e2e-persona-tests.sh || {
  echo "E2E tests FAILED - creating bead for fix"
  bd create --title="[CRITICAL] Fix E2E persona test failures" --type=bug --priority=0
  # DO NOT proceed until fixed
}
```

### Common E2E Failures and Fixes

| Failure | Cause | Fix |
|---------|-------|-----|
| "dev-oauth provider not available" | `ENABLE_DEV_OAUTH=true` missing | Add to `.env` |
| "500 error on dashboard" | Server-side render error | Check server logs, fix error |
| "Redirect to login instead of dashboard" | Auth callback not setting session | Fix auth callback flow |
| "403 on accessible route" | RBAC misconfigured | Check role permissions |
| "Can access blocked route" | Missing auth middleware | Add route protection |

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

### E2E Testing (MANDATORY - NO EXCEPTIONS)
- [ ] Dev server starts without errors
- [ ] Auth providers endpoint returns dev-oauth
- [ ] **Learner persona**: Login → dashboard → subjects → lessons (no 500s)
- [ ] **Parent persona**: Login → dashboard → children → controls (no 500s)
- [ ] **Teacher persona**: Login → dashboard → classes → students (no 500s)
- [ ] **Admin persona**: Login → dashboard → users → orgs → audit logs (no 500s)
- [ ] Role-based access control verified (blocked routes return 403/redirect)
- [ ] `./scripts/e2e-persona-tests.sh` passes (if exists)

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

# 9. E2E Persona Tests (MANDATORY)
echo ""
echo "=== E2E PERSONA VALIDATION ==="

# Start dev server in background
bun dev &
DEV_PID=$!
sleep 5

# Check dev server responds
echo -n "Dev server: "
if curl -s http://localhost:5001 > /dev/null; then
  echo "PASS"
else
  echo "FAIL - server not responding"
  kill $DEV_PID 2>/dev/null
  exit 1
fi

# Check auth providers
echo -n "Auth providers: "
providers=$(curl -s http://localhost:5001/api/auth/providers)
if echo "$providers" | jq -e '.providers[] | select(.id == "dev-oauth")' > /dev/null 2>&1; then
  echo "PASS (dev-oauth available)"
else
  echo "FAIL - dev-oauth not available"
  kill $DEV_PID 2>/dev/null
  exit 1
fi

# Test each persona route
test_route() {
  local route=$1
  local name=$2
  local status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5001$route")
  if [ "$status" = "500" ]; then
    echo "FAIL - $name ($route) returns 500"
    return 1
  fi
  echo "PASS - $name ($route) status: $status"
  return 0
}

echo ""
echo "Learner routes:"
test_route "/learn" "Dashboard" || { kill $DEV_PID 2>/dev/null; exit 1; }

echo ""
echo "Parent routes:"
test_route "/parent" "Dashboard" || { kill $DEV_PID 2>/dev/null; exit 1; }

echo ""
echo "Teacher routes:"
test_route "/teacher" "Dashboard" || { kill $DEV_PID 2>/dev/null; exit 1; }

echo ""
echo "Admin routes:"
test_route "/admin" "Dashboard" || { kill $DEV_PID 2>/dev/null; exit 1; }
test_route "/admin/users" "Users" || { kill $DEV_PID 2>/dev/null; exit 1; }

# Cleanup
kill $DEV_PID 2>/dev/null

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

- **Never skip E2E testing** - Test ALL personas before completion (learner, parent, teacher, admin)
- **Never skip COPPA checks** - Child safety is non-negotiable
- **Never skip accessibility** - WCAG 2.1 AA is required
- **Never ask the user** - Research and decide autonomously
- **Never compromise quality** - Clean architecture always
- **Never exit early** - Only when ALL beads are closed AND E2E tests pass
- **Always test dev-oauth flow** - Verify login works for each role
- **Always discover** - Create beads for everything you find
- **Always complete discoveries** - Don't just log issues, fix them
- **Always commit** - Follow session close protocol
- **Always verify** - Typecheck, lint, AND E2E test after changes

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

---

## User Story Implementation Framework

This section defines the systematic approach for implementing all 465 user stories across the platform. Each story follows a rigorous development process that ensures production-ready quality.

### Story Categories Overview

| Category | Stories | Priority | Epic Structure |
|----------|---------|----------|----------------|
| Learner Experience (Core + Grade-Specific) | 64 | P0-P1 | 5 epics by grade band |
| Parent Experience (Core + Age-Specific) | 53 | P0-P1 | 4 epics by child age |
| Teacher Experience (Core + Grade-Specific) | 57 | P1-P2 | 4 epics by student grade |
| School Admin | 24 | P2 | 1 epic |
| Platform Admin | 20 | P2 | 1 epic |
| Curriculum Marketplace | 115 | P1-P2 | 6 epics by function |
| Rating & Tag Systems | 30 | P2 | 2 epics |
| Lesson Swapping | 15 | P2 | 1 epic |
| AI Content Generation | 15 | P2 | 1 epic |
| **Onboarding Experience** | **35** | **P0-P1** | **5 epics by persona** |
| **Avatar System** | **7** | **P1** | **1 epic** |
| **Bulk Import/Export** | **10** | **P1** | **1 epic** |
| **Documentation System** | **10** | **P0** | **1 epic** |
| **MCP Server & AI Agent Support** | **10** | **P0** | **1 epic** |
| **Total** | **465** | | **30 epics** |

### Implementation Process Per Story

Every user story follows this mandatory implementation flow:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    USER STORY IMPLEMENTATION FLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. RESEARCH      Use docs-seeker, context7, WebSearch                      │
│       ↓           Research best practices for feature type                  │
│                   Check MUI, shadcn/ui documentation for UI patterns        │
│                   Review Three.js examples for 3D visualizations            │
│                                                                             │
│  2. EXPLORE       Use feature-dev:code-explorer                             │
│       ↓           Analyze existing patterns in codebase                     │
│                   Identify reusable components and utilities                │
│                   Map dependencies and integration points                   │
│                                                                             │
│  3. DESIGN        Use feature-dev:code-architect                            │
│       ↓           Create component blueprint                                │
│                   Define data models and API contracts                      │
│                   Plan 3D visualization approach (if applicable)            │
│                   Design responsive, accessible UI                          │
│                                                                             │
│  4. UI DESIGN     Use /frontend-design skill                                │
│       ↓           Generate high-quality UI components                       │
│                   Apply age-adaptive styling                                │
│                   Ensure WCAG 2.1 AA compliance                             │
│                   Create responsive layouts                                 │
│                                                                             │
│  5. IMPLEMENT     Write clean, type-safe code                               │
│       ↓           Follow existing patterns                                  │
│                   Include comprehensive error handling                      │
│                   Add loading/empty/error states                            │
│                                                                             │
│  6. VALIDATE      Data validation with Zod schemas                          │
│       ↓           Input sanitization                                        │
│                   COPPA compliance verification                             │
│                   Multi-tenant scoping                                      │
│                                                                             │
│  7. TEST          Write unit tests for utilities                            │
│       ↓           Write component tests                                     │
│                   Write API route tests                                     │
│                   Write E2E Playwright tests                                │
│                                                                             │
│  8. REVIEW        Use feature-dev:code-reviewer                             │
│       ↓           Fix all identified issues                                 │
│                   Verify accessibility                                      │
│                   Check age-appropriateness                                 │
│                                                                             │
│  9. E2E VERIFY    Run Playwright journey tests                              │
│       ↓           Verify full user flow works                               │
│                   Check cross-browser compatibility                         │
│                   Validate on mobile viewports                              │
│                                                                             │
│  10. CLOSE        Close story task in beads                                 │
│                   Document in PR                                            │
│                   Update epic progress                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Research Phase Requirements

Before implementing ANY story, conduct thorough research:

#### 1. Best Practices Research
```bash
# Use docs-seeker for library documentation
/docs-seeker "Next.js 16 server components data fetching patterns"

# Use context7 for specific library APIs
# Use mcp__context7__resolve-library-id then mcp__context7__query-docs

# Use WebSearch for industry patterns
# Search for "[feature type] best practices 2025"
```

#### 2. UI Pattern Research
```bash
# For MUI components
# Use mcp__mui-mcp__useMuiDocs for Material UI documentation

# For shadcn/ui patterns
/docs-seeker "shadcn/ui [component type] examples"

# For Three.js/R3F visualizations
/docs-seeker "react-three-fiber [visualization type] tutorial"
```

#### 3. Educational Platform Research
```markdown
□ Age-appropriate interaction patterns for target grade
□ COPPA compliance requirements for data collection
□ Accessibility patterns for educational content
□ Gamification best practices for student engagement
□ Assessment validity and reliability standards
```

### Feature-Dev Agent Usage Per Story Type

#### Learner Stories (US-L*, US-LK*, US-L12*, US-L35*, US-L68*, US-L912*)

```markdown
**code-explorer prompt:**
"Analyze the learner experience for [grade band]. I need to understand:
1. Existing dashboard components in src/app/(learner)/
2. Age-adaptive UI patterns already implemented
3. 3D visualization components in src/components/3d/
4. Progress tracking data models
5. AI tutor integration patterns
6. Activity and quiz component patterns

Focus on: [specific story requirements]
Goal: Implement [US-XXX story description]"

**code-architect prompt:**
"Design the implementation for [story]. Requirements:
- Grade level: [K/1-2/3-5/6-8/9-12]
- UI adaptation: [specific age requirements from user-stories.md]
- 3D visualization: [if applicable]
- COPPA considerations: [parental consent requirements]

Provide component breakdown, file structure, and test strategy."
```

#### Parent Stories (US-P*, US-PY*, US-PE*, US-PM*, US-PH*)

```markdown
**code-explorer prompt:**
"Analyze parent dashboard functionality. I need to understand:
1. Child account management patterns
2. Progress monitoring components
3. Parental controls implementation
4. COPPA consent flow
5. Activity reporting components
6. Communication tools

Focus on: Parent of [young child/elementary/middle schooler/high schooler]
Goal: Implement [US-XXX story description]"

**code-architect prompt:**
"Design parental control feature for [child age group]. Requirements:
- Child age range: [5-8/8-11/11-14/14-18]
- Monitoring depth: [strict/moderate/light/oversight]
- COPPA requirements: [specific consent needs]
- Privacy controls: [data access, deletion, export]

Provide component breakdown with COPPA compliance checklist."
```

#### Teacher Stories (US-T*, US-TK*, US-TE*, US-TM*, US-TH*)

```markdown
**code-explorer prompt:**
"Analyze teacher dashboard for [grade band]. I need to understand:
1. Classroom management patterns
2. Student roster components
3. Assignment creation workflows
4. Grading system implementation
5. Standards alignment tools
6. Analytics components

Focus on: Teacher of [K-2/3-5/6-8/9-12] students
Goal: Implement [US-XXX story description]"

**code-architect prompt:**
"Design teacher feature for [student grade band]. Requirements:
- Student age range: [K-2/3-5/6-8/9-12]
- Activity type: [developmental/mastery/academic/college-prep]
- Assessment format: [picture-based/written/rubric-based/AP-level]
- Reporting needs: [visual/numerical/analytics/detailed]

Provide component breakdown with differentiation strategy."
```

#### Admin Stories (US-A*, US-SA*)

```markdown
**code-explorer prompt:**
"Analyze admin functionality. I need to understand:
1. Organization management patterns
2. User administration flows
3. Billing/subscription integration
4. Analytics dashboard components
5. Audit logging implementation
6. Multi-tenant data isolation

Focus on: [Platform/School] admin features
Goal: Implement [US-XXX story description]"
```

#### Marketplace Stories (US-PC*, US-TC*, US-SC*, US-MC*)

```markdown
**code-explorer prompt:**
"Analyze curriculum marketplace. I need to understand:
1. Content discovery patterns
2. Rating/review system
3. Tag organization
4. Content creation workflows
5. AI content generation integration
6. Licensing and monetization

Focus on: [Discovery/Creation/Rating/AI/Monetization]
Goal: Implement [US-XXX story description]"
```

### Frontend Design Skill Usage

For ALL UI components, invoke the frontend-design skill:

```markdown
/frontend-design

Context: Implementing [US-XXX story]
Target: [Grade level/User type]
Requirements:
- [Specific UI requirements from user-stories.md]
- [Age-adaptive characteristics]
- [Accessibility requirements]

Create: [Component/Page/Widget description]
```

#### Age-Adaptive Design Requirements

| Grade Band | Design Requirements |
|------------|---------------------|
| K | 60px min button size, primary colors, icons only, read-aloud mandatory |
| 1-2 | 48px buttons, colorful organized layout, icons + short labels |
| 3-5 | 40px buttons, standard layout, gamification elements |
| 6-8 | Compact UI, data-dense layouts, detailed progress |
| 9-12 | Professional UI, customizable, college-prep styling |

### Data Validation Requirements

#### Zod Schema Requirements

Every form and API endpoint MUST have Zod validation:

```typescript
// Example: Learner profile update
import { z } from "zod";

export const learnerProfileSchema = z.object({
  displayName: z.string().min(1).max(50),
  avatarUrl: z.string().url().optional(),
  gradeLevel: z.number().int().min(0).max(12),
  preferredSubjects: z.array(z.string()).max(5),
  // COPPA: No PII collection without parent consent
  parentConsentVerified: z.boolean(),
});

// API route must validate
const validated = learnerProfileSchema.parse(await req.json());
```

#### Validation by Story Category

| Category | Required Validations |
|----------|---------------------|
| Learner | Grade level bounds, age verification, content filters |
| Parent | Child relationship verification, consent status |
| Teacher | Class ownership, student roster membership |
| Admin | Organization scope, role permissions |
| Marketplace | Content ownership, licensing terms |
| AI Content | Safety filtering, age-appropriateness |

### E2E Testing Requirements

Every story MUST have corresponding Playwright tests in `e2e/journeys/`:

#### Test File Mapping

| Story Prefix | Test File |
|--------------|-----------|
| US-L*, US-LK*, US-L12*, US-L35*, US-L68*, US-L912* | learner-journey.spec.ts |
| US-P*, US-PY*, US-PE*, US-PM*, US-PH* | parent-journey.spec.ts |
| US-T*, US-TK*, US-TE*, US-TM*, US-TH*, US-TL* | teacher-journey.spec.ts |
| US-A*, US-SA* | admin-journey.spec.ts |
| US-PC*, US-TC*, US-SC*, US-MC*, US-CR*, US-TG*, US-LS*, US-AI* | marketplace-journey.spec.ts |

#### Test Verification Command

```bash
# Run specific story tests
bunx playwright test --grep "US-L01" e2e/journeys/learner-journey.spec.ts

# Run all tests for a grade band
bunx playwright test --grep "US-LK" e2e/journeys/learner-journey.spec.ts

# Run full journey suite
bunx playwright test e2e/journeys/
```

### Story Completion Criteria

A story is ONLY complete when ALL of the following are verified:

```markdown
□ Research phase completed (best practices documented)
□ code-explorer analysis completed
□ code-architect blueprint created
□ /frontend-design skill used for UI components
□ Implementation follows clean architecture
□ Zod validation for all inputs
□ COPPA compliance verified (if child data)
□ Accessibility verified (WCAG 2.1 AA)
□ Age-appropriate UI verified
□ Unit tests written and passing
□ Component tests written and passing
□ API route tests written and passing
□ E2E Playwright tests written and passing
□ code-reviewer passed with no issues
□ Cross-browser compatibility verified
□ Mobile responsiveness verified
□ Story bead closed in beads system
```

---

## Epic Structure for User Stories

### Learner Experience Epics (5)

```bash
# EPIC 1: Kindergarten Learner Experience
bd create --title="[EPIC] Kindergarten Learner Experience (US-LK)" \
  --type=feature --priority=0 \
  --description="Implement all kindergarten-specific learner features. 10 stories: US-LK01-LK10. Age 5-6, extra-large UI, icon navigation, read-aloud mandatory, drag-and-drop, animated celebrations."

# EPIC 2: Grades 1-2 Learner Experience
bd create --title="[EPIC] Grades 1-2 Learner Experience (US-L12)" \
  --type=feature --priority=0 \
  --description="Implement all 1st-2nd grade learner features. 10 stories: US-L12-01 to US-L12-10. Ages 6-8, large buttons, icons with labels, read-aloud optional, star rewards."

# EPIC 3: Grades 3-5 Learner Experience
bd create --title="[EPIC] Grades 3-5 Learner Experience (US-L35)" \
  --type=feature --priority=0 \
  --description="Implement all 3rd-5th grade learner features. 10 stories: US-L35-01 to US-L35-10. Ages 8-11, standard buttons, keyboard input, points system."

# EPIC 4: Grades 6-8 Learner Experience
bd create --title="[EPIC] Grades 6-8 Learner Experience (US-L68)" \
  --type=feature --priority=1 \
  --description="Implement all middle school learner features. 10 stories: US-L68-01 to US-L68-10. Ages 11-14, compact UI, extended writing, mastery levels."

# EPIC 5: Grades 9-12 Learner Experience
bd create --title="[EPIC] Grades 9-12 Learner Experience (US-L912)" \
  --type=feature --priority=1 \
  --description="Implement all high school learner features. 10 stories: US-L912-01 to US-L912-10. Ages 14-18, professional UI, college prep, portfolio building."
```

### Parent Experience Epics (4)

```bash
# EPIC 6: Parent of Young Child (5-8)
bd create --title="[EPIC] Parent of Young Child Experience (US-PY)" \
  --type=feature --priority=0 \
  --description="Implement all parent features for young children. 10 stories: US-PY01-PY10. Strict controls, read-aloud enable, AI logging, daily summaries."

# EPIC 7: Parent of Elementary Child (8-11)
bd create --title="[EPIC] Parent of Elementary Child Experience (US-PE)" \
  --type=feature --priority=1 \
  --description="Implement all parent features for elementary children. 10 stories: US-PE01-PE10. Homework tracking, goal setting, weekly reports."

# EPIC 8: Parent of Middle Schooler (11-14)
bd create --title="[EPIC] Parent of Middle Schooler Experience (US-PM)" \
  --type=feature --priority=1 \
  --description="Implement all parent features for middle schoolers. 10 stories: US-PM01-PM10. GPA tracking, test prep monitoring, increased independence."

# EPIC 9: Parent of High Schooler (14-18)
bd create --title="[EPIC] Parent of High Schooler Experience (US-PH)" \
  --type=feature --priority=2 \
  --description="Implement all parent features for high schoolers. 10 stories: US-PH01-PH10. SAT/ACT prep, college planning, full independence with oversight."
```

### Teacher Experience Epics (4)

```bash
# EPIC 10: K-2 Teacher Experience
bd create --title="[EPIC] K-2 Teacher Experience (US-TK)" \
  --type=feature --priority=1 \
  --description="Implement all early childhood teacher features. 10 stories: US-TK01-TK10. Letter recognition, phonics, developmental tracking."

# EPIC 11: Grades 3-5 Teacher Experience
bd create --title="[EPIC] Grades 3-5 Teacher Experience (US-TE)" \
  --type=feature --priority=1 \
  --description="Implement all elementary teacher features. 10 stories: US-TE01-TE10. Multiplication mastery, reading comprehension, Common Core alignment."

# EPIC 12: Grades 6-8 Teacher Experience
bd create --title="[EPIC] Grades 6-8 Teacher Experience (US-TM)" \
  --type=feature --priority=1 \
  --description="Implement all middle school teacher features. 10 stories: US-TM01-TM10. Pre-algebra, essays with rubrics, collaborative projects."

# EPIC 13: Grades 9-12 Teacher Experience
bd create --title="[EPIC] Grades 9-12 Teacher Experience (US-TH)" \
  --type=feature --priority=2 \
  --description="Implement all high school teacher features. 10 stories: US-TH01-TH10. AP content, SAT prep, research papers, coding assignments."
```

### Admin Epics (2)

```bash
# EPIC 14: School Admin Experience
bd create --title="[EPIC] School Admin Experience (US-SA)" \
  --type=feature --priority=2 \
  --description="Implement all school admin features. 24 stories: US-SA01-SA24. Onboarding, management, curriculum, compliance, community."

# EPIC 15: Platform Admin Experience
bd create --title="[EPIC] Platform Admin Experience (US-A)" \
  --type=feature --priority=2 \
  --description="Implement all platform admin features. 20 stories: US-A01-A20. Organizations, users, content, billing, analytics, operations."
```

### Onboarding Epics (5)

The onboarding experience is critical for user adoption. Each persona has a unique onboarding flow optimized for their needs.

```bash
# EPIC: Learner Onboarding Experience
bd create --title="[EPIC] Learner Onboarding Experience (US-OL)" \
  --type=feature --priority=0 \
  --description="Complete learner onboarding flow. 10 stories: US-OL01-OL10. Age verification, grade selection, avatar creation, subject preferences, dashboard tour, first lesson, achievement introduction, AI tutor introduction, goal setting, parent connection."

# EPIC: Parent Onboarding Experience
bd create --title="[EPIC] Parent Onboarding Experience (US-OP)" \
  --type=feature --priority=0 \
  --description="Complete parent onboarding flow. 8 stories: US-OP01-OP08. Account creation, add children wizard, COPPA consent, parental controls setup, notification preferences, subscription selection, dashboard tour, child account linking."

# EPIC: Teacher Onboarding Experience
bd create --title="[EPIC] Teacher Onboarding Experience (US-OT)" \
  --type=feature --priority=0 \
  --description="Complete teacher onboarding flow. 8 stories: US-OT01-OT08. Account verification, school association, profile setup, first classroom creation, student import wizard, curriculum alignment, classroom management tour, first assignment creation."

# EPIC: School Admin Onboarding Experience
bd create --title="[EPIC] School Admin Onboarding Experience (US-OSA)" \
  --type=feature --priority=1 \
  --description="Complete school admin onboarding flow. 9 stories: US-OSA01-OSA09. Organization creation, domain verification, branding setup, SSO configuration, bulk user import, curriculum license setup, admin dashboard tour, teacher invitation, compliance settings."

# EPIC: Family Onboarding Experience
bd create --title="[EPIC] Family Onboarding Experience (US-OF)" \
  --type=feature --priority=1 \
  --description="Unified family onboarding for homeschool families. Creates parent account with children in single streamlined flow."
```

#### Onboarding User Stories

**Learner Onboarding (US-OL01-OL10)**
| Story | Title | Description | Age Adaptation |
|-------|-------|-------------|----------------|
| US-OL01 | Age verification | Verify learner age during registration for COPPA compliance | Date picker (6+), visual age selector (K-2) |
| US-OL02 | Grade level selection | Select current grade level with curriculum alignment | Visual grade cards (K-2), dropdown (3+) |
| US-OL03 | Avatar creation | Create personalized avatar with customization options | Simple presets (K-2), full customization (3+) |
| US-OL04 | Subject preferences | Select favorite subjects to personalize experience | Icon grid (K-2), checkbox list (3+) |
| US-OL05 | Dashboard tour | Interactive walkthrough of dashboard features | Animated mascot guide (K-5), tooltip tour (6+) |
| US-OL06 | First lesson | Guided first lesson experience with success celebration | Extra scaffolding (K-2), standard (3+) |
| US-OL07 | Achievement introduction | Explain badges, streaks, and progress system | Visual demo (K-2), quick overview (3+) |
| US-OL08 | AI tutor introduction | Meet the AI tutor with guided first conversation | Character introduction (K-5), feature demo (6+) |
| US-OL09 | Learning goals | Set initial learning goals with parent/teacher input | Simple goals (K-2), detailed goals (3+) |
| US-OL10 | Parent/teacher connection | Link to parent or teacher account for oversight | Parent invite email (home), class join code (school) |

**Parent Onboarding (US-OP01-OP08)**
| Story | Title | Description |
|-------|-------|-------------|
| US-OP01 | Account creation flow | Email verification, profile setup, security options |
| US-OP02 | Add children wizard | Step-by-step flow to add child accounts |
| US-OP03 | COPPA consent collection | Verifiable parental consent with clear explanation |
| US-OP04 | Parental controls setup | Configure content filters, time limits, AI restrictions |
| US-OP05 | Notification preferences | Configure alerts, reports, and communication preferences |
| US-OP06 | Subscription selection | Choose plan with clear feature comparison |
| US-OP07 | Parent dashboard tour | Interactive walkthrough of parent features |
| US-OP08 | Child account linking | Link existing child accounts or create new ones |

**Teacher Onboarding (US-OT01-OT08)**
| Story | Title | Description |
|-------|-------|-------------|
| US-OT01 | Account verification | Verify educator status and credentials |
| US-OT02 | School/org association | Link to school organization or register new one |
| US-OT03 | Teacher profile setup | Configure grade levels, subjects, and classroom preferences |
| US-OT04 | Create first classroom | Guided classroom creation with roster setup |
| US-OT05 | Student import wizard | Import students from CSV, Clever, ClassLink, or Google Classroom |
| US-OT06 | Curriculum alignment | Select standards and align with school curriculum |
| US-OT07 | Classroom management tour | Interactive walkthrough of teacher tools |
| US-OT08 | First assignment creation | Create and assign first activity with guidance |

**School Admin Onboarding (US-OSA01-OSA09)**
| Story | Title | Description |
|-------|-------|-------------|
| US-OSA01 | Organization creation | Create school/district organization profile |
| US-OSA02 | Domain verification | Verify ownership of school email domain |
| US-OSA03 | Branding setup | Configure white-label theme and logo |
| US-OSA04 | SSO configuration | Set up SAML/OIDC single sign-on |
| US-OSA05 | Bulk user import | Import all students and teachers from SIS |
| US-OSA06 | Curriculum license setup | Configure curriculum packages and access levels |
| US-OSA07 | Admin dashboard tour | Interactive walkthrough of admin features |
| US-OSA08 | Teacher invitation | Invite and provision teacher accounts |
| US-OSA09 | Compliance settings | Configure COPPA, FERPA, and state compliance |

### Avatar System Epic (1)

```bash
# EPIC: Avatar System
bd create --title="[EPIC] Avatar System (US-AV)" \
  --type=feature --priority=1 \
  --description="Complete avatar customization system. 7 stories: US-AV01-AV07. Avatar builder, preset templates, customization options, animated expressions, profile integration, achievement-unlocked items, accessibility alternatives."
```

**Avatar System Stories (US-AV01-AV07)**
| Story | Title | Description |
|-------|-------|-------------|
| US-AV01 | Avatar builder UI | Interactive avatar creation interface |
| US-AV02 | Preset templates | Age-appropriate avatar presets by grade band |
| US-AV03 | Customization options | Hair, skin, eyes, accessories, clothing options |
| US-AV04 | Animated expressions | Avatar emotions for learning feedback |
| US-AV05 | Profile integration | Display avatar throughout platform |
| US-AV06 | Achievement items | Unlock special items through achievements |
| US-AV07 | Accessibility alternatives | Text descriptions and simple icon alternatives |

### Bulk Import/Export Epic (1)

```bash
# EPIC: Bulk Import/Export System
bd create --title="[EPIC] Bulk Import/Export System (US-BIE)" \
  --type=feature --priority=1 \
  --description="Complete bulk data management. 10 stories: US-BIE01-BIE10. CSV user import, Excel roster import, teacher roster import, class assignment import, gradebook import/export, progress data export, Clever integration, ClassLink integration, Google Classroom sync, import validation/rollback."
```

**Bulk Import/Export Stories (US-BIE01-BIE10)**
| Story | Title | Description |
|-------|-------|-------------|
| US-BIE01 | CSV user import | Import users from standard CSV format |
| US-BIE02 | Excel roster import | Import from Excel with column mapping |
| US-BIE03 | Teacher roster import | Bulk import teacher accounts |
| US-BIE04 | Class assignment import | Import class rosters and assignments |
| US-BIE05 | Gradebook import/export | Two-way gradebook synchronization |
| US-BIE06 | Progress data export | Export student progress for reporting |
| US-BIE07 | Clever integration | OneRoster API integration with Clever |
| US-BIE08 | ClassLink integration | OneRoster API integration with ClassLink |
| US-BIE09 | Google Classroom sync | Bi-directional sync with Google Classroom |
| US-BIE10 | Import validation | Validation, preview, and rollback capabilities |

### Documentation System Epic (1)

```bash
# EPIC: Documentation System
bd create --title="[EPIC] Documentation System (US-DOC)" \
  --type=feature --priority=0 \
  --description="Comprehensive documentation for all users and developers. 10 stories: US-DOC01-DOC10. Learner help center, parent guide, teacher manual, admin documentation, API documentation, developer guide, architecture docs, contextual help, video tutorials, FAQ system."
```

**Documentation Stories (US-DOC01-DOC10)**
| Story | Title | Description |
|-------|-------|-------------|
| US-DOC01 | Learner help center | Age-appropriate help for students |
| US-DOC02 | Parent user guide | Comprehensive parent documentation |
| US-DOC03 | Teacher user manual | Complete teacher feature documentation |
| US-DOC04 | Admin documentation | School and platform admin guides |
| US-DOC05 | API documentation | OpenAPI spec and API reference |
| US-DOC06 | Developer guide | Setup, architecture, and contribution guide |
| US-DOC07 | Architecture documentation | System design and component diagrams |
| US-DOC08 | In-app contextual help | Tooltips, help modals, and guided tours |
| US-DOC09 | Video tutorials | Screen recordings for key workflows |
| US-DOC10 | Interactive FAQ | Searchable FAQ with AI-powered answers |

### MCP Server & AI Agent Support Epic (1)

```bash
# EPIC: MCP Server & AI Agent Support
bd create --title="[EPIC] MCP Server & AI Agent Support (US-MCP)" \
  --type=feature --priority=0 \
  --description="Model Context Protocol server for AI agent integration. 10 stories: US-MCP01-MCP10. Core MCP server, auth tools, curriculum tools, progress tools, assessment tools, classroom tools, parent tools, admin tools, llms.txt documentation, testing harness."
```

**MCP Server Stories (US-MCP01-MCP10)**
| Story | Title | Description |
|-------|-------|-------------|
| US-MCP01 | Core MCP server | Base MCP implementation with tool registration |
| US-MCP02 | Authentication tools | get-user-info, check-permissions, session context |
| US-MCP03 | Curriculum browsing | list-subjects, list-lessons, get-lesson-content |
| US-MCP04 | Progress tracking | get-progress, get-mastery-levels, update-progress |
| US-MCP05 | Assessment tools | generate-quiz, evaluate-response, get-hints |
| US-MCP06 | Classroom management | list-students, get-class-progress, assign-work |
| US-MCP07 | Parent oversight | get-child-progress, approve-activity, set-restrictions |
| US-MCP08 | Admin management | manage-users, manage-orgs, view-analytics |
| US-MCP09 | llms.txt documentation | Complete AI-readable documentation file |
| US-MCP10 | MCP testing harness | Mock AI agent and integration tests |

#### MCP Server Implementation Guide

The MCP (Model Context Protocol) server enables AI agents to interact with the platform programmatically.

**Server Architecture:**
```
src/
├── mcp/
│   ├── server.ts           # MCP server entry point
│   ├── tools/              # Tool implementations
│   │   ├── auth.ts         # Authentication tools
│   │   ├── curriculum.ts   # Curriculum browsing tools
│   │   ├── progress.ts     # Progress tracking tools
│   │   ├── assessment.ts   # Assessment tools
│   │   ├── classroom.ts    # Teacher tools
│   │   ├── parent.ts       # Parent oversight tools
│   │   └── admin.ts        # Admin tools
│   ├── resources/          # Resource providers
│   │   ├── lessons.ts      # Lesson content resources
│   │   ├── students.ts     # Student data resources
│   │   └── analytics.ts    # Analytics resources
│   └── prompts/            # Prompt templates
│       ├── tutoring.ts     # AI tutor prompts
│       └── assessment.ts   # Assessment generation prompts
├── public/
│   └── llms.txt            # AI-readable documentation
```

**Tool Categories:**

1. **Authentication Tools (US-MCP02)**
   - `get-user-info`: Get current user profile and permissions
   - `check-permissions`: Verify user can perform action
   - `get-session-context`: Get full session with org, role, children
   - `impersonate-user`: Admin tool for testing/support

2. **Curriculum Tools (US-MCP03)**
   - `list-subjects`: Get all subjects with grade filtering
   - `list-lessons`: Get lessons by subject/grade/standard
   - `get-lesson-content`: Full lesson with activities
   - `search-curriculum`: Full-text search across content
   - `get-standards-alignment`: Standards mapping for lesson

3. **Progress Tools (US-MCP04)**
   - `get-progress`: Student progress summary
   - `get-mastery-levels`: Per-standard mastery levels
   - `get-recent-activities`: Recent learning activity
   - `get-learning-path`: Recommended next steps
   - `update-progress`: Record activity completion

4. **Assessment Tools (US-MCP05)**
   - `generate-quiz`: Create quiz for topic/standard
   - `evaluate-response`: Grade student response
   - `get-hints`: Progressive hints for stuck students
   - `explain-concept`: Generate explanation
   - `adjust-difficulty`: Adaptive difficulty settings

5. **Classroom Tools (US-MCP06)**
   - `list-students`: Get class roster
   - `get-class-progress`: Aggregate class progress
   - `assign-work`: Create and assign activity
   - `send-announcement`: Post class announcement
   - `bulk-grade`: Grade multiple submissions

6. **Parent Tools (US-MCP07)**
   - `get-child-progress`: Child's learning summary
   - `get-time-reports`: Screen time analytics
   - `approve-activity`: Approve requested activity
   - `set-restrictions`: Update parental controls
   - `receive-alerts`: Get notification stream

7. **Admin Tools (US-MCP08)**
   - `manage-users`: CRUD user operations
   - `manage-organizations`: Org management
   - `view-analytics`: Platform analytics
   - `configure-settings`: System settings
   - `audit-logs`: View audit trail

**llms.txt Specification (US-MCP09):**

```markdown
# Kaelyn's Academy - AI Agent Documentation

> K-12 educational platform with interactive learning, AI tutoring, and progress tracking.

## Authentication

All API calls require authentication via session cookie or API key header.

### Get Current User
GET /api/auth/session

### Verify Permissions
POST /api/auth/check-permission
{ "action": "view_progress", "resource": "student:123" }

## Curriculum

### List Subjects
GET /api/curriculum/subjects?grade=3

### Get Lesson
GET /api/curriculum/lessons/{id}

### Search Content
GET /api/curriculum/search?q=fractions&grade=4&standard=4.NF.A.1

## Progress

### Get Student Progress
GET /api/progress/{studentId}

### Update Progress
POST /api/progress/{studentId}/activities/{activityId}
{ "score": 85, "timeSpent": 300, "completed": true }

## Assessment

### Generate Quiz
POST /api/assessment/generate
{ "topic": "multiplication", "grade": 3, "questions": 10 }

### Evaluate Response
POST /api/assessment/evaluate
{ "questionId": "123", "response": "12", "showHints": true }

## Tools

This server exposes MCP tools for AI agent integration:

- auth:get-user-info
- auth:check-permissions
- curriculum:list-subjects
- curriculum:list-lessons
- curriculum:get-lesson-content
- progress:get-progress
- progress:update-progress
- assessment:generate-quiz
- assessment:evaluate-response
- classroom:list-students
- classroom:assign-work
- parent:get-child-progress
- admin:manage-users
```

### Marketplace Epics (6)

```bash
# EPIC 16: Marketplace Discovery
bd create --title="[EPIC] Curriculum Marketplace Discovery" \
  --type=feature --priority=1 \
  --description="Implement marketplace browsing and search. Stories: US-PC01-05, US-TC01-05. Subject/grade filtering, ratings, previews."

# EPIC 17: Content Selection & Swapping
bd create --title="[EPIC] Content Selection & Lesson Swapping" \
  --type=feature --priority=2 \
  --description="Implement lesson selection and swapping. Stories: US-PC06-10, US-TC06-10, US-LS01-15. Alternative lessons, custom paths, swap analytics."

# EPIC 18: Content Creation
bd create --title="[EPIC] Curriculum Content Creation" \
  --type=feature --priority=2 \
  --description="Implement content creation tools. Stories: US-PC11-15, US-TC11-15. Lesson creation, AI assistance, material upload."

# EPIC 19: Rating & Review System
bd create --title="[EPIC] Rating & Review System (US-CR)" \
  --type=feature --priority=2 \
  --description="Implement rating and review system. 15 stories: US-CR01-15. 5-star ratings, written reviews, quality indicators."

# EPIC 20: Tag Organization System
bd create --title="[EPIC] Tag Organization System (US-TG)" \
  --type=feature --priority=2 \
  --description="Implement tag organization system. 15 stories: US-TG01-15. Subject/grade/topic tags, advanced filtering, tag management."

# EPIC 21: AI Content Generation
bd create --title="[EPIC] AI Content Generation (US-AI)" \
  --type=feature --priority=2 \
  --description="Implement AI content generation. 15 stories: US-AI01-15. Quiz generation, differentiation, hints, explanations, quality control."
```

---

## Ralph-Loop Integration

The `ralph-loop` (or `academy-loop`) skill orchestrates the implementation of all features. It processes stories in priority order, ensuring complete implementation.

### Invoking Ralph-Loop for Epics

```bash
# Process entire epic
/ralph-loop "Implement [EPIC] Kindergarten Learner Experience - all US-LK stories"

# Process specific story
/ralph-loop "Implement US-LK01: Big colorful buttons for kindergarten navigation"

# Process multiple stories
/ralph-loop "Implement US-L12-01 through US-L12-05 for 1st-2nd grade learner experience"
```

### Ralph-Loop Story Processing

For each story, ralph-loop will:

1. **Research best practices** using docs-seeker, context7, WebSearch
2. **Explore codebase** using feature-dev:code-explorer
3. **Design architecture** using feature-dev:code-architect
4. **Create UI** using /frontend-design skill
5. **Implement feature** following clean architecture
6. **Validate data** with Zod schemas
7. **Test thoroughly** with unit, component, API, and E2E tests
8. **Review code** using feature-dev:code-reviewer
9. **Verify E2E** with Playwright journey tests
10. **Close bead** only when all criteria met

### Story Processing Order

Process stories in this priority order:

```markdown
1. P0 Critical (Core Learning + COPPA Safety)
   - US-L01-07 (Core learner features)
   - US-LK01-05 (Kindergarten essentials)
   - US-P01, US-P05-06, US-P09-11 (Parent safety)
   - US-PY01-05 (Young child protection)

2. P1 High (Progress + Teacher Core + Marketplace Core)
   - US-L08-11 (Progress features)
   - US-LK06-10, US-L12-*, US-L35-* (Grade-specific learner)
   - US-T01-09 (Core teacher)
   - US-PC01-10, US-TC01-10 (Marketplace discovery)

3. P2 Medium (Communication + Admin + Curriculum Creation)
   - US-P12-13, US-T16-17 (Communication)
   - US-A01-10, US-SA01-10 (Admin core)
   - US-PC11-15, US-TC11-20, US-AI01-10 (Content creation)

4. P3 Low (Advanced + Monetization)
   - US-L912-05-10 (Advanced high school)
   - US-MC11-15, US-TC21-25 (Monetization)
```

### Epic Completion Verification

An EPIC is only complete when:

```bash
# Check all story tasks are closed
bd show <epic-id>  # Should show all tasks closed

# Run all related E2E tests
bunx playwright test --grep "<story-prefix>" e2e/journeys/

# Verify coverage
bun test --coverage --grep "<component-path>"

# Close epic
bd close <epic-id> --reason="All stories implemented and verified"
```

---

## Content Validation Testing

### Math Content Validation

```typescript
// e2e/journeys/content-validation.spec.ts
test.describe("Math Content Validation", () => {
  test("Kindergarten: counting sequences 0-20 are correct", async () => {
    // Verify every counting activity has correct sequence
  });

  test("Grades 1-2: addition within 100 yields correct answers", async () => {
    // Verify all addition quiz answers are mathematically correct
  });

  test("Grades 3-5: multiplication tables through 12 are accurate", async () => {
    // Verify multiplication practice has correct products
  });

  test("Grades 6-8: algebraic equations have verifiable solutions", async () => {
    // Verify equation solving activities have correct answers
  });

  test("Grades 9-12: quadratic formula yields correct roots", async () => {
    // Verify all quadratic problems have mathematically valid answers
  });
});
```

### Reading Content Validation

```typescript
test.describe("Reading Content Validation", () => {
  test("K-2: sight words match Dolch/Fry lists", async () => {
    // Verify sight word activities use grade-appropriate words
  });

  test("3-5: vocabulary matches grade-level Lexile", async () => {
    // Verify reading passages are within 520-1010 Lexile
  });

  test("6-8: comprehension questions have text-supported answers", async () => {
    // Verify all comprehension answers can be found in text
  });

  test("9-12: AP texts are accurately excerpted", async () => {
    // Verify primary sources are authentic
  });
});
```

### 3D Visualization Accuracy

```typescript
test.describe("3D Visualization Accuracy", () => {
  test("fraction visualizations represent correct proportions", async () => {
    // Verify 1/2 shows exactly half shaded
  });

  test("geometry shapes have correct properties", async () => {
    // Verify triangle has 3 sides, square has 4 equal sides
  });

  test("molecular structures follow correct bonding rules", async () => {
    // Verify H2O shows 2 hydrogen, 1 oxygen with correct bonds
  });
});
```

---

## Ambiguity Resolution Protocol

When encountering ambiguous requirements, research thoroughly instead of asking:

### Research Priority Order

1. **Existing Codebase**: Use code-explorer to find similar implementations
2. **Documentation**: Use docs-seeker, context7 for library patterns
3. **Industry Standards**: Use WebSearch for educational best practices
4. **Age-Appropriateness**: Reference user-stories.md grade-level tables
5. **COPPA Requirements**: Default to most protective interpretation
6. **Accessibility**: Default to WCAG 2.1 AA minimum

### Decision Documentation

Document all ambiguity resolutions in code comments:

```typescript
/**
 * Implementation Decision: US-LK03 - Counting by tapping
 *
 * Ambiguity: How many objects to count?
 * Research: Kindergarten counting typically 0-20 (Common Core K.CC.A.1)
 * Decision: Start with 1-10, unlock 11-20 after mastery
 *
 * Ambiguity: Touch feedback type?
 * Research: Young children need multi-sensory feedback
 * Decision: Visual highlight + sound + haptic (if available)
 */
```

---

## Summary: Comprehensive Implementation Approach

1. **Every story gets thorough research** before implementation
2. **Feature-dev agents are used** for exploration, architecture, and review
3. **Frontend-design skill is used** for all UI components
4. **Clean architecture is mandatory** - no shortcuts
5. **Data validation with Zod** on all inputs
6. **E2E Playwright tests** verify complete user flows
7. **Ralph-loop orchestrates** the entire implementation process
8. **Epics are only closed** when all stories are fully verified
9. **No interactive questions** - research resolves ambiguity
10. **Beads track everything** - all work is documented and traceable
