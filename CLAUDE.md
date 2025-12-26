# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Kaelyn's Academy** - A comprehensive K-12 educational platform with interactive 3D visualizations, AI tutoring, and multi-tenant support for schools and families.

## Non-Negotiables

### Technology Stack (MANDATORY)

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.x | Framework |
| React | 19.2.x | UI Library |
| TypeScript | 5.7.x | Type Safety |
| Auth.js | v5 (beta) | Authentication |
| Drizzle ORM | 0.45.x | Database ORM |
| Neon | PostgreSQL | Database |
| Three.js | r182 | 3D Visualizations |
| React Three Fiber | Latest | React + Three.js |
| shadcn/ui | Latest (canary) | UI Components |
| Tailwind CSS | v4 | Styling |
| Vercel AI SDK | Latest | AI Streaming |

### Package Managers (INHERITED FROM GLOBAL)

- **ALWAYS use `bun`** for all JS/TS operations
- **NEVER use** `npm`, `yarn`, or `pnpm`

### Architecture Requirements

1. **Multi-Tenant Architecture**
   - Every database query MUST include organization scope
   - White-label theming per organization
   - Data isolation between tenants is MANDATORY

2. **COPPA Compliance**
   - Children under 13 MUST have parental consent
   - No direct data collection from children without consent
   - Parental controls for all child accounts

3. **Accessibility (WCAG 2.1 AA)**
   - All interactive elements MUST be keyboard accessible
   - Screen reader support is MANDATORY
   - Color contrast ratios MUST meet AA standards
   - Age-adaptive UI for different grade levels

4. **Security**
   - All API routes MUST validate authentication
   - Role-based access control on all endpoints
   - Input sanitization on all user inputs
   - Rate limiting on AI endpoints

### Code Quality Standards

1. **Type Safety**
   - No `any` types allowed
   - Strict TypeScript configuration
   - Zod validation for all external data

2. **Component Architecture**
   - Server Components by default
   - Client Components only for interactivity
   - Atomic design principles (atoms → molecules → organisms)

3. **3D Visualizations**
   - Every concept MUST have a Three.js visualization
   - Visualizations MUST be accessible (alt descriptions)
   - Progressive loading for 3D assets
   - Fallback for devices without WebGL

4. **AI Integration**
   - Multi-provider abstraction layer (Claude, OpenAI, Gemini)
   - Streaming responses for real-time tutoring
   - Age-appropriate content filtering
   - Rate limiting per user/organization

### Database Schema Rules

1. **Required Fields on ALL Tables**
   - `id` (UUID primary key)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)
   - `organization_id` (for multi-tenant tables)

2. **Soft Deletes**
   - Use `deleted_at` instead of hard deletes
   - Maintain audit trail for compliance

3. **Progress Tracking**
   - Per-activity granularity
   - Track: attempts, time_spent, score, mastery_level

### API Design

1. **REST API**
   - RESTful endpoints for CRUD operations
   - Consistent response format: `{ data, error, meta }`
   - Proper HTTP status codes

2. **GraphQL**
   - Pothos for type-safe schema
   - DataLoader for N+1 prevention
   - Persisted queries for production

### Testing Requirements

- Unit tests for utility functions
- Integration tests for API routes
- E2E tests for critical user flows
- Accessibility tests (axe-core)

### Frontend Design (USE /frontend-design SKILL)

When creating UI components or pages:
- MUST invoke `/frontend-design` skill
- Follow age-adaptive design principles
- Support theme customization per organization
- Implement responsive design (mobile-first)

## Environment Variables

Required in `.env`:
```
# Domain
NEXT_PUBLIC_APP_URL=https://kaelyns.academy
NEXT_PUBLIC_APP_NAME="Kaelyn's Academy"

# Database (Neon)
DATABASE_URL=

# Auth Providers (hide button if not configured)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_FACEBOOK_ID=
AUTH_FACEBOOK_SECRET=
AUTH_APPLE_ID=
AUTH_APPLE_SECRET=
AUTH_MICROSOFT_ENTRA_ID=
AUTH_MICROSOFT_ENTRA_SECRET=

# AI Providers
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_AI_API_KEY=

# Email (Resend)
RESEND_API_KEY=
```

## Project Structure

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

## Commands

```bash
bun dev              # Start development server
bun build            # Build for production
bun test             # Run tests
bun lint             # Lint code
bun db:push          # Push schema to Neon
bun db:studio        # Open Drizzle Studio
bun db:generate      # Generate migrations
```

## Curriculum Structure

- **Grades**: K, 1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th, 10th, 11th, 12th
- **Subjects**: Math, Reading (US English), History, Science, Technology
- **Science Disciplines**: Physical Science, Life Science, Earth Science, Chemistry, Physics, Biology
- **Standards Support**: Common Core (Math, ELA), NGSS (Science), Custom

## Grade Level UI Adaptations

| Grade Level | UI Characteristics |
|-------------|-------------------|
| K-2 | Large buttons, icons, read-aloud, simplified nav, bright colors |
| 3-5 | Medium elements, guided navigation, gamification elements |
| 6-8 | Standard UI, more text, achievement systems |
| 9-12 | Full feature set, advanced tools, college prep features |
