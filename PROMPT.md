# Kaelyn's Academy - Feature Completeness Loop

This prompt drives an iterative analysis loop to identify and track all incomplete features until the educational platform is production-ready.

---

## Critical Requirements

### Beads Tracking (MANDATORY)

**ALL work MUST be tracked in beads.** This is non-negotiable.

```bash
# At session start - always prime beads context
bd prime

# Before ANY work - check existing issues
bd list --status=open
bd ready
bd stats

# During work - update status
bd update <id> --status=in_progress

# After completing work - close issues
bd close <id> --reason="Completed: <brief description>"

# At session end - sync changes
bd sync --from-main
```

**Beads Rules:**
1. Never start work without checking `bd ready` first
2. Never create duplicate issues - always search first with `bd list | grep -i "<keyword>"`
3. Always link tasks to parent epics with `bd dep add <task-id> <epic-id>`
4. Close issues immediately upon completion - do not batch
5. Use proper priority levels: P0 (critical), P1 (high), P2 (medium), P3 (low)
6. Sync beads at end of every session
7. Create beads for ALL code review issues found
8. Never end a loop iteration with open in-progress beads

### Test Coverage Requirement (>80%)

**Target: 80%+ code coverage sitewide**

This is a production-ready educational platform. Comprehensive testing is mandatory.

**Current State:** Minimal test coverage (~6 test files in src/)

**WARNING:** The first iteration of test creation will be extensive. Plan for significant effort to establish the testing foundation. Subsequent iterations will be incremental.

### Git Branch & PR Workflow (MANDATORY)

**Each loop iteration MUST use a dedicated branch with PR and code review.**

```bash
# Branch naming convention
iteration-<N>-<brief-description>

# Examples:
iteration-1-test-infrastructure
iteration-2-k2-curriculum
iteration-3-dashboard-completion
```

**Workflow per iteration:**
1. Create branch from master
2. Implement changes
3. Create PR
4. Run code review (50% confidence threshold)
5. Create beads for all review issues
6. Fix all issues
7. Re-run code review until clean
8. Merge to master

### Code Review Configuration

**IMPORTANT: Use 50% confidence threshold (not default 85%)**

The code review skill defaults to 85% confidence, but we want to catch more potential issues. Always specify the lower threshold.

```bash
# When invoking code review, use 50% threshold
# This catches more issues that might otherwise be filtered out
```

---

## Loop Execution

Run this loop until completion criteria are met:

```
while (incomplete_features_exist || test_coverage < 80%):
    1. PRIME beads context (bd prime)
    2. CHECK previous iteration completed (branches merged, beads closed)
    3. CREATE iteration branch
    4. EXAMINE current state
    5. IDENTIFY gaps and incomplete features
    6. CREATE beads for new EPICs and Tasks
    7. IMPLEMENT fixes and features
    8. WRITE tests for all changes
    9. VERIFY coverage and no duplicates
    10. UPDATE beads status
    11. CREATE PR for iteration
    12. RUN code review (50% confidence)
    13. CREATE beads for review issues
    14. FIX all review issues
    15. RE-RUN code review until clean
    16. MERGE branch to master
    17. CLOSE iteration beads
    18. CHECK completion criteria
    19. SYNC beads (bd sync --from-main)
```

---

## Phase 0: PRIME Beads Context & Verify Previous Iteration

**Always run at session start:**

```bash
# Prime beads context
bd prime

# Review current state
bd stats
bd ready
bd blocked

# Check for any in-progress work from previous sessions
bd list --status=in_progress
```

### 0.1 Verify Previous Iteration Completed

**CRITICAL: Before starting a new iteration, verify the previous one is fully complete.**

```bash
# Check for unmerged branches
git branch -a | grep "iteration-"

# Check for any iteration branches not merged to master
git log master..iteration-* --oneline 2>/dev/null

# Verify no orphaned in-progress beads
bd list --status=in_progress

# If any exist, complete them before starting new iteration
```

**If previous iteration is incomplete:**
1. Switch to the incomplete branch
2. Complete remaining work
3. Run code review
4. Fix issues
5. Merge to master
6. Close all related beads
7. Then proceed with new iteration

---

## Phase 1: CREATE Iteration Branch

```bash
# Get current iteration number
ITERATION=$(git branch -a | grep -c "iteration-" | xargs -I {} expr {} + 1)

# Create descriptive branch name
git checkout master
git pull origin master
git checkout -b "iteration-${ITERATION}-<brief-description>"

# Examples:
git checkout -b "iteration-1-test-infrastructure"
git checkout -b "iteration-2-k2-curriculum-content"
git checkout -b "iteration-3-dashboard-ui-completion"
```

---

## Phase 2: EXAMINE Current State

### 2.1 Codebase Analysis

Explore the following areas systematically:

```bash
# Check existing beads first to avoid duplicates
bd list --status=open
bd stats

# Check test coverage
bun test --coverage
```

**Areas to Examine:**

| Area | Key Paths | What to Check |
|------|-----------|---------------|
| **Pages** | `src/app/` | All routes have functional UI |
| **Components** | `src/components/` | Components are complete, not stubs |
| **API Routes** | `src/app/api/` | Endpoints return real data |
| **Database** | `src/lib/db/schema/` | Schema supports all features |
| **3D Visualizations** | `src/components/3d/` | All grade levels have visualizations |
| **AI Features** | `src/lib/ai/`, `src/lib/ax/` | Agents have UI integration |
| **Tests** | `src/__tests__/`, `e2e/` | **>80% coverage required** |
| **Curriculum Data** | `src/data/` | All grades K-12 have content |

### 2.2 Test Coverage Analysis

**Run coverage report:**

```bash
# Generate coverage report
bun test --coverage --coverage-reporter=text --coverage-reporter=html

# Check coverage thresholds
# Target: 80% statements, 80% branches, 80% functions, 80% lines
```

**Coverage Requirements by Area:**

| Area | Min Coverage | Priority |
|------|--------------|----------|
| **API Routes** | 90% | P0 |
| **Auth/COPPA** | 95% | P0 |
| **Database Queries** | 85% | P0 |
| **Business Logic** | 85% | P1 |
| **Components** | 75% | P1 |
| **Utilities** | 90% | P2 |
| **3D Visualizations** | 60% | P2 |

### 2.3 Feature Verification Checklist

For each user role, verify complete functionality:

**Learner Features:**
- [ ] Dashboard with progress visualization
- [ ] Subject browser with all grades K-12
- [ ] Lesson viewer with 3D visualizations
- [ ] Quiz taking with immediate feedback
- [ ] AI tutor conversation interface
- [ ] Practice problem generator
- [ ] Achievement display
- [ ] Profile and settings

**Parent Features:**
- [ ] Child management (add, view, switch)
- [ ] Progress monitoring dashboard
- [ ] Parental controls UI
- [ ] Screen time management
- [ ] Subject restrictions
- [ ] Recommendations view
- [ ] Communication with teachers
- [ ] Report exports

**Teacher Features:**
- [ ] Class management (create, roster)
- [ ] Student progress tracking
- [ ] Assignment creation and grading
- [ ] Report generation (CSV/PDF)
- [ ] Student notes
- [ ] Communication with parents
- [ ] Standards alignment view
- [ ] Bulk student import

**Admin Features:**
- [ ] User management
- [ ] Curriculum management
- [ ] Analytics dashboard
- [ ] AI content generation
- [ ] Blog/CMS management
- [ ] System health monitoring
- [ ] Rate limit management
- [ ] Organization management

**Platform Features:**
- [ ] Multi-tenant isolation
- [ ] COPPA compliance
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Mobile responsiveness
- [ ] Offline support (PWA)
- [ ] Internationalization
- [ ] Security headers
- [ ] Error tracking

---

## Phase 3: IDENTIFY Gaps

### 3.1 Classification Criteria

Classify each gap by severity:

| Priority | Criteria | Examples |
|----------|----------|----------|
| **P0** | Launch blocker, security, compliance, <50% test coverage | Empty grade levels, auth vulnerabilities, untested API routes |
| **P1** | Core feature incomplete, <70% test coverage | Dashboard UI shells, missing API tests |
| **P2** | Important for adoption, <80% test coverage | Bulk import, component tests |
| **P3** | Nice-to-have improvements | Performance optimizations, snapshot tests |

### 3.2 Gap Detection Patterns

Look for these indicators of incomplete features:

```typescript
// Placeholder patterns to search for:
"TODO"
"FIXME"
"NOT IMPLEMENTED"
"placeholder"
"mock"
"stub"
"coming soon"
"under construction"
```

```bash
# Search commands
rg -i "todo|fixme|not implemented" src/
rg "placeholder|mock|stub" src/app/

# Find files without corresponding tests
find src -name "*.ts" -o -name "*.tsx" | while read f; do
  test_file="${f%.ts*}.test.${f##*.}"
  [ ! -f "$test_file" ] && echo "Missing test: $f"
done
```

### 3.3 UI Completeness Check

For each page route, verify:
1. Real data from API (not hardcoded)
2. Loading states
3. Error states
4. Empty states
5. Mobile layout
6. Accessibility

### 3.4 Test Gap Analysis

**Identify missing tests:**

```bash
# List all source files
find src -name "*.ts" -o -name "*.tsx" | grep -v test | grep -v __tests__

# List all test files
find src -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts"

# Check for untested API routes
ls src/app/api/**/route.ts | wc -l
ls src/__tests__/api/**/*.test.ts 2>/dev/null | wc -l
```

---

## Phase 4: CREATE Beads

### 4.1 Check for Duplicates First

```bash
# Search existing beads before creating
bd list --status=open | grep -i "<keyword>"

# Check if similar work exists
bd list --status=open --type=task | grep -i "test"
bd list --status=open --type=epic | grep -i "coverage"
```

### 4.2 Epic Creation Template

```bash
bd create \
  --title="<Feature Area> Epic" \
  --type=epic \
  --priority=<0-3> \
  --body="<Description>

**Current State:**
- What exists today
- Current test coverage: X%

**Required Features:**
- Feature 1
- Feature 2

**Test Requirements:**
- Unit tests for all functions
- Integration tests for API routes
- E2E tests for user flows

**Acceptance Criteria:**
- [ ] Feature complete
- [ ] Test coverage > 80%
- [ ] All tests passing
- [ ] Code review passed"
```

### 4.3 Task Creation Template

```bash
bd create \
  --title="<Specific Task>" \
  --type=task \
  --priority=<0-3> \
  --body="<Description>

**Implementation Details:**
- Step 1
- Step 2

**Files to Modify:**
- path/to/file1.ts
- path/to/file2.tsx

**Test Requirements:**
- [ ] Unit tests for new functions
- [ ] Integration test if API route
- [ ] Update E2E if user-facing

**Acceptance Criteria:**
- [ ] Feature works as expected
- [ ] Tests written and passing
- [ ] Coverage maintained/improved
- [ ] Code review passed"
```

### 4.4 Test-Specific Task Template

```bash
bd create \
  --title="Add tests for <component/route/feature>" \
  --type=task \
  --priority=1 \
  --body="Add comprehensive test coverage for <target>.

**Current Coverage:** X%
**Target Coverage:** 80%+

**Test Types Required:**
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests (if applicable)

**Files to Test:**
- src/path/to/file.ts

**Test Cases:**
- Happy path
- Error handling
- Edge cases
- Authorization checks
- Input validation"
```

### 4.5 Code Review Issue Template

```bash
bd create \
  --title="[Code Review] <issue description>" \
  --type=bug \
  --priority=<0-2> \
  --body="Issue found during code review.

**File:** <path/to/file.ts>
**Line:** <line number>
**Confidence:** <percentage>%

**Issue:**
<description of the problem>

**Suggested Fix:**
<how to resolve>

**Category:** <security|performance|maintainability|correctness|style>"
```

### 4.6 Add Dependencies

```bash
# Task depends on Epic
bd dep add <task-id> <epic-id>

# Task depends on another Task
bd dep add <dependent-task> <blocking-task>

# Test task depends on implementation task
bd dep add <test-task-id> <impl-task-id>
```

---

## Phase 5: IMPLEMENT and TEST

### 5.1 Implementation Workflow

```bash
# 1. Claim the work
bd update <task-id> --status=in_progress

# 2. Implement the feature/fix
# ... coding ...

# 3. Write tests BEFORE moving on
bun test src/__tests__/path/to/test.ts

# 4. Check coverage impact
bun test --coverage

# 5. Commit changes (do NOT close bead yet - wait for code review)
git add .
git commit -m "feat: <description>"
```

### 5.2 Test Writing Guidelines

**Test Structure:**

```
src/
├── __tests__/
│   ├── api/           # API route integration tests
│   │   ├── auth/
│   │   ├── learner/
│   │   ├── parent/
│   │   ├── teacher/
│   │   └── admin/
│   ├── components/    # Component unit tests
│   │   ├── ui/
│   │   ├── 3d/
│   │   └── dashboard/
│   ├── lib/           # Library function tests
│   │   ├── db/
│   │   ├── auth/
│   │   └── ai/
│   ├── hooks/         # Custom hook tests
│   └── utils/         # Utility function tests
├── e2e/               # End-to-end tests (Playwright)
│   ├── auth.spec.ts
│   ├── learner.spec.ts
│   ├── parent.spec.ts
│   ├── teacher.spec.ts
│   └── admin.spec.ts
```

**Test Types by Priority:**

| Priority | Test Type | When Required |
|----------|-----------|---------------|
| **P0** | API Integration | All API routes |
| **P0** | Auth/COPPA | All auth flows |
| **P0** | Multi-tenant | All tenant-scoped queries |
| **P1** | Component Unit | All interactive components |
| **P1** | Hook Tests | All custom hooks |
| **P1** | E2E Critical Path | Login, signup, core flows |
| **P2** | Utility Unit | All utility functions |
| **P2** | Snapshot | UI components |
| **P3** | Performance | Critical rendering paths |

### 5.3 First Iteration Test Setup (EXTENSIVE)

**WARNING:** The first iteration requires significant effort to establish testing infrastructure.

**Initial Setup Tasks:**

1. **Configure test environment**
   ```bash
   # vitest.config.ts - ensure proper setup
   # Setup test database
   # Configure mocks for external services
   ```

2. **Create test utilities**
   - Database seeding helpers
   - Authentication mocks
   - API request helpers
   - Component render helpers

3. **Establish patterns**
   - API route test template
   - Component test template
   - E2E test template
   - Mock patterns for AI/external services

4. **Priority order for initial tests:**
   ```
   1. Auth/COPPA flows (security critical)
   2. API routes (business logic)
   3. Database queries (data integrity)
   4. Core components (user experience)
   5. E2E critical paths (integration)
   ```

---

## Phase 6: CREATE PR and CODE REVIEW

### 6.1 Create Pull Request

```bash
# Ensure all changes are committed
git status

# Push branch to remote
git push -u origin <branch-name>

# Create PR using gh CLI
gh pr create \
  --title "Iteration N: <brief description>" \
  --body "## Summary
- Feature 1 implemented
- Feature 2 implemented
- Tests added for X, Y, Z

## Test Coverage
- Before: X%
- After: Y%

## Beads Addressed
- <bead-id-1>: <title>
- <bead-id-2>: <title>

## Checklist
- [ ] All tests passing
- [ ] Coverage > 80%
- [ ] No linting errors
- [ ] Code review completed"
```

### 6.2 Run Code Review (50% Confidence Threshold)

**IMPORTANT: Lower the confidence threshold to 50% to catch more issues.**

```bash
# Invoke code review with 50% confidence threshold
# The default is 85%, but we want to be more thorough

# Use the code-reviewer agent with explicit threshold
# Focus on: security, performance, maintainability, correctness
```

**Code Review Focus Areas:**

| Category | Priority | Description |
|----------|----------|-------------|
| **Security** | P0 | XSS, SQL injection, auth bypass, data exposure |
| **Correctness** | P0 | Logic errors, race conditions, null handling |
| **Performance** | P1 | N+1 queries, memory leaks, unnecessary renders |
| **Maintainability** | P1 | Code duplication, complex functions, poor naming |
| **Style** | P2 | Formatting, conventions, documentation |

### 6.3 Create Beads for Review Issues

**For EVERY issue found in code review, create a bead:**

```bash
# For each issue found:
bd create \
  --title="[Code Review] <issue summary>" \
  --type=bug \
  --priority=<0-2 based on category> \
  --body="**File:** <path>
**Line:** <number>
**Confidence:** <X>%
**Category:** <security|correctness|performance|maintainability|style>

**Issue:**
<description>

**Suggested Fix:**
<recommendation>

**Iteration:** <N>"
```

**Priority Mapping:**
- Security issues → P0
- Correctness issues → P0
- Performance issues → P1
- Maintainability issues → P1
- Style issues → P2

### 6.4 Fix All Review Issues

```bash
# For each review issue bead:

# 1. Mark as in-progress
bd update <issue-id> --status=in_progress

# 2. Fix the issue
# ... coding ...

# 3. Commit the fix
git add .
git commit -m "fix: <issue description> (review issue)"

# 4. Close the bead
bd close <issue-id> --reason="Fixed: <brief description>"
```

### 6.5 Re-run Code Review Until Clean

```bash
# After fixing all issues, re-run code review
# Repeat until no new issues are found

# Loop:
while code_review_has_issues:
    1. Run code review (50% confidence)
    2. If issues found:
       - Create beads for new issues
       - Fix issues
       - Commit fixes
    3. Else:
       - Proceed to merge
```

---

## Phase 7: MERGE Branch

### 7.1 Pre-Merge Verification

```bash
# Verify all checks pass
bun test
bun run lint
bun run typecheck
bun test --coverage  # Must be > 80%

# Verify all iteration beads are closed
bd list --status=open | grep "iteration-${ITERATION}"
# Should return empty

# Verify no review issues remain open
bd list --status=open | grep "\[Code Review\]"
# Should return empty or only issues from other iterations
```

### 7.2 Merge to Master

```bash
# Update master
git checkout master
git pull origin master

# Merge iteration branch
git merge --no-ff <branch-name> -m "Merge iteration N: <description>"

# Push to remote
git push origin master

# Delete iteration branch (optional, but recommended)
git branch -d <branch-name>
git push origin --delete <branch-name>
```

### 7.3 Post-Merge Cleanup

```bash
# Close any remaining iteration-specific beads
bd close <id1> <id2> --reason="Iteration N complete, merged to master"

# Sync beads
bd sync --from-main

# Verify clean state
bd list --status=in_progress  # Should be empty
git branch -a | grep "iteration-"  # Should only show future iterations
```

---

## Phase 8: VERIFY and CHECK Completion

### 8.1 No Duplicates

After creating beads:

```bash
# Check for similar titles
bd list --status=open | sort | uniq -d

# Review recent creations
bd list --status=open | head -20
```

### 8.2 Coverage Verification

```bash
# Run full test suite with coverage
bun test --coverage

# Verify coverage thresholds
# Must be > 80% for:
# - Statements
# - Branches
# - Functions
# - Lines

# Generate HTML report for detailed analysis
bun test --coverage --coverage-reporter=html
open coverage/index.html
```

### 8.3 All Tests Passing

```bash
# Run all tests
bun test

# Run E2E tests
bun run test:e2e

# Run type checking
bun run typecheck

# Run linting
bun run lint
```

### 8.4 Branch and Bead Verification

**CRITICAL: Before ending ANY loop iteration, verify:**

```bash
# 1. All iteration branches merged
git branch -a | grep "iteration-"
# Should only show current or future iterations, not past

# 2. No orphaned branches
git log master..origin/iteration-* --oneline 2>/dev/null
# Should return empty

# 3. No in-progress beads
bd list --status=in_progress
# Should return empty

# 4. All code review issues closed
bd list --status=open | grep "\[Code Review\]"
# Should return empty for current iteration

# 5. Beads synced
bd sync --status
```

---

## Phase 9: CHECK Completion Criteria

### 9.1 Exit Conditions

The loop is COMPLETE when ALL of the following are true:

```
[ ] All pages have functional UI (no shells/placeholders)
[ ] All API routes return real data
[ ] All grades K-12 have curriculum content
[ ] All 3D visualizations exist for core concepts
[ ] All user roles have complete feature sets
[ ] Test coverage > 80% sitewide
[ ] All tests passing (unit, integration, E2E)
[ ] No P0 or P1 issues remaining in beads
[ ] COPPA compliance fully implemented and tested
[ ] Security hardening complete and tested
[ ] Health/monitoring endpoints exist and tested
[ ] All iteration branches merged to master
[ ] No in-progress beads remaining
[ ] All code review issues resolved
[ ] Beads synced and up to date
[ ] No placeholders, TODOs, or stubs in codebase
[ ] Feature completeness search returns no gaps
```

### 9.2 Completion Promise

**CRITICAL: Only output `IAMFINALLYDONE` when the loop is truly complete.**

When ALL exit conditions are verified:

```bash
# Final verification before completion promise
bd list --status=open | grep -E "\[P0\]|\[P1\]"  # Must be empty
bd list --status=in_progress                      # Must be empty
bun test --coverage                               # Must be > 80%
rg -i "todo|fixme|placeholder|stub" src/          # Must be empty or only false positives
git branch -a | grep "iteration-"                 # All merged/deleted

# If ALL checks pass, output:
echo "IAMFINALLYDONE"
```

**DO NOT output `IAMFINALLYDONE` if:**
- Any beads are still open (P0, P1, or in-progress)
- Any iteration branches are unmerged
- Test coverage is below 80%
- Any placeholders or incomplete features exist
- Any code review issues are unresolved

**The completion promise signals:**
- The site is feature-complete
- All tests pass with >80% coverage
- All beads are closed
- All branches are merged
- No technical debt remains

### 9.3 Verification Commands

```bash
# Check test coverage
bun test --coverage

# Check remaining high-priority issues
bd list --status=open | grep -E "\[P0\]|\[P1\]"

# Check blocked work
bd blocked

# Get overall stats
bd stats

# Verify all tests pass
bun test && bun run test:e2e

# Verify branches
git branch -a | grep "iteration-"

# Verify no in-progress beads
bd list --status=in_progress

# Check for remaining placeholders/stubs
rg -i "todo|fixme|placeholder|stub|not implemented" src/
```

### 9.4 Continue Loop If

- Test coverage < 80%
- Any tests failing
- Any P0 or P1 issues exist in beads
- Any core feature is incomplete
- Any user role lacks essential functionality
- Security/compliance gaps exist
- Any iteration branches not merged
- Any in-progress beads exist
- Any code review issues unresolved
- Beads not synced

---

## Phase 10: SYNC Beads

**Always at session end:**

```bash
# Sync beads to main
bd sync --from-main

# Verify sync status
bd sync --status

# Final stats check
bd stats

# Verify clean state for next iteration
bd list --status=in_progress  # Should be empty
git status  # Should be clean on master
```

---

## Comprehensive Test Suite Requirements

### Unit Tests

**Required for:**
- All utility functions (`src/lib/utils/`)
- All custom hooks (`src/hooks/`)
- All validation schemas (`src/lib/validation/`)
- All business logic functions
- All data transformations

**Coverage Target:** 90%

### Integration Tests

**Required for:**
- All API routes (`src/app/api/`)
- Database queries (`src/lib/db/`)
- Authentication flows
- Multi-tenant isolation
- COPPA consent flows

**Coverage Target:** 85%

### Component Tests

**Required for:**
- All interactive components
- Form components with validation
- Dashboard widgets
- Navigation components
- Modal/dialog components

**Coverage Target:** 75%

### E2E Tests (Playwright)

**Required flows:**
- User registration and login
- COPPA parental consent flow
- Learner lesson completion
- Quiz taking and scoring
- Parent child management
- Teacher class management
- Admin user management
- Multi-tenant switching

**Coverage:** All critical user journeys

### Accessibility Tests

**Required:**
- axe-core automated checks
- Keyboard navigation verification
- Screen reader compatibility
- Color contrast validation
- Focus management

### Performance Tests

**Required for:**
- 3D visualization rendering
- Large data set handling
- API response times
- Initial page load

---

## Feature Requirements Reference

### K-12 Educational Platform Core Features

**Curriculum & Content:**
- Standards alignment (Common Core, NGSS)
- Grade-appropriate content K-12
- Multi-subject support (Math, Reading, Science, History, Technology)
- 3D interactive visualizations for concepts
- Quiz and exercise activities
- Progressive difficulty

**Learning Experience:**
- Adaptive difficulty adjustment
- AI tutoring with streaming responses
- Practice problem generation
- Immediate feedback on answers
- Progress tracking with mastery levels
- Achievement/badge system
- Streak tracking

**Classroom Management:**
- Class creation and roster management
- Assignment creation and distribution
- Submission and grading workflow
- Student notes and observations
- Standards-aligned reporting
- Bulk import/export

**Family Management:**
- Multiple child profiles per family
- Parental consent (COPPA)
- Parental controls (screen time, content)
- Progress monitoring
- Activity reports

**Communication:**
- Parent-teacher messaging
- In-app notifications
- Email notifications
- Progress alerts

**Administration:**
- Multi-tenant organization support
- User management
- Curriculum management
- Analytics and reporting
- AI content generation
- System monitoring

**Compliance & Security:**
- COPPA compliance with verifiable parental consent
- FERPA considerations for schools
- Data export (GDPR)
- Security headers (CSP, HSTS)
- Rate limiting
- Input validation

**Accessibility:**
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- High contrast mode
- Large text option
- Reduced motion option
- Age-adaptive UI (K-2 vs 9-12)

**Technical:**
- PWA with offline support
- Mobile responsiveness
- GraphQL API
- REST API
- Real-time updates
- Error tracking
- Health monitoring

---

## Loop Execution Log

Track each iteration with beads references:

```markdown
### Iteration N - [DATE]

**Branch:** iteration-N-<description>
**PR:** #<number>

**Beads Status (Start):**
- `bd stats` output
- Open: X, Blocked: Y, Ready: Z

**Examined:**
- Areas reviewed
- Current test coverage: X%

**Identified:**
- Gap 1: Description
- Gap 2: Description
- Test gaps: [list untested areas]

**Created (beads):**
- Epic: <id> - <title>
- Task: <id> - <title>
- Test Task: <id> - <title>

**Implemented:**
- Feature 1
- Feature 2
- Tests added for X, Y, Z

**Code Review (50% confidence):**
- Issues found: X
- Issues fixed: X
- Review iterations: N

**Code Review Issues Created:**
- <id> - <issue description>
- <id> - <issue description>

**Closed (beads):**
- <id> - <reason>

**Test Coverage Change:**
- Before: X%
- After: Y%
- Delta: +Z%

**Branch Status:**
- [ ] All commits pushed
- [ ] PR created
- [ ] Code review passed
- [ ] Merged to master
- [ ] Branch deleted

**Beads Status (End):**
- Open: X, Blocked: Y, Ready: Z
- In-progress: 0 (MUST be 0)

**Remaining:**
- P0 issues: X
- P1 issues: Y
- Ready to work: Z
- Coverage gap: X% to 80%

**Continue?** [YES/NO]
**Reason:** [Why continuing or stopping]

**Next Iteration Priority:**
1. Task to tackle first
2. Tests to write
```

---

## Quick Start

```bash
# 1. Prime beads context
bd prime

# 2. Verify previous iteration complete
git branch -a | grep "iteration-"
bd list --status=in_progress

# 3. Create iteration branch
git checkout master && git pull
git checkout -b "iteration-N-<description>"

# 4. Check current state
bd stats
bd ready
bun test --coverage

# 5. Review open work
bd list --status=open --type=epic
bd list --status=open --type=task | head -20

# 6. Claim and start work
bd update <task-id> --status=in_progress

# 7. Implement + write tests
# ... coding and testing ...

# 8. Verify coverage
bun test --coverage

# 9. Commit changes
git add . && git commit -m "feat: <description>"

# 10. Create PR
git push -u origin <branch-name>
gh pr create --title "Iteration N: <description>" --body "..."

# 11. Run code review (50% confidence threshold)
# Use code-reviewer agent

# 12. Create beads for review issues
bd create --title="[Code Review] <issue>" --type=bug --priority=1 ...

# 13. Fix all issues
# ... fix, commit, repeat code review until clean ...

# 14. Merge to master
git checkout master && git merge --no-ff <branch-name>
git push origin master

# 15. Close iteration beads
bd close <id1> <id2> --reason="Iteration N complete"

# 16. Sync beads
bd sync --from-main
bd stats
```

---

## Notes

- **ALWAYS** check `bd list` before creating to avoid duplicates
- **ALWAYS** update beads status as you work
- **ALWAYS** write tests for any code changes
- **ALWAYS** sync beads at session end
- **ALWAYS** create a branch for each iteration
- **ALWAYS** run code review with 50% confidence threshold
- **ALWAYS** create beads for all code review issues
- **ALWAYS** verify previous iteration is merged before starting new one
- **NEVER** end an iteration with in-progress beads
- **NEVER** leave iteration branches unmerged
- Use parallel task creation for efficiency
- Link all tasks to parent epics with `bd dep add`
- Mark epics complete only when all child tasks are done
- Prioritize P0 security/compliance issues first
- First test iteration will be extensive - plan accordingly
- Content creation (K-2) is a launch blocker
- Target 80% coverage - no exceptions for production
- Code review catches issues early - embrace the 50% threshold
