# SpendSense MVP - Implementation Tasks

## Overview
This document contains the ordered task list for building SpendSense MVP over a 2-day sprint. Tasks are organized by phase and dependencies.

---

## Phase 1: Foundation & Project Setup (2-3 hours)

### 1.1 Next.js Project Initialization
- [ ] Initialize Next.js 14+ project with TypeScript and App Router
- [ ] Configure `tsconfig.json` with strict mode
- [ ] Set up folder structure: `/app`, `/lib`, `/components`, `/types`, `/tests`, `/data`
- [ ] Install core dependencies: `react`, `next`, `typescript`

### 1.2 UI Framework Setup
- [ ] Install Tailwind CSS
- [ ] Install shadcn/ui CLI and initialize
- [ ] Configure `tailwind.config.ts` with shadcn theme
- [ ] Add required shadcn components: `button`, `card`, `input`, `table`, `badge`, `dialog`, `progress`, `tabs`, `select`, `checkbox`
- [ ] Install Lucide React for icons
- [ ] Create `components/ui` folder with base components

### 1.3 Additional Dependencies
- [ ] Install `better-sqlite3` and `@types/better-sqlite3`
- [ ] Install OpenAI SDK: `openai`
- [ ] Install validation: `zod`
- [ ] Install utilities: `clsx`, `tailwind-merge`, `class-variance-authority`
- [ ] Install testing: `jest`, `@testing-library/react`, `@testing-library/jest-dom`
- [ ] Install dev dependencies: `@types/node`, `@types/react`

### 1.4 Configuration Files
- [ ] Create `.env.example` with required environment variables
- [ ] Create `.env.local` with actual API keys (gitignored)
- [ ] Configure Jest with `jest.config.js`
- [ ] Set up test utilities in `tests/setup.ts`
- [ ] Create `next.config.js` with necessary configurations

---

## Phase 2: Type Definitions & Data Models (1-2 hours)

### 2.1 Core Types
- [ ] Create `types/user.ts`: User, UserProfile, UserMetadata
- [ ] Create `types/account.ts`: Account, AccountType, AccountSubtype
- [ ] Create `types/transaction.ts`: Transaction, PaymentChannel, Category
- [ ] Create `types/liability.ts`: Liability, CreditCard, Loan
- [ ] Create `types/signal.ts`: Signal, SignalType, TimeWindow, SignalResult
- [ ] Create `types/persona.ts`: Persona, PersonaType, PersonaCriteria
- [ ] Create `types/recommendation.ts`: Recommendation, RecommendationTemplate, PartnerOffer
- [ ] Create `types/consent.ts`: Consent, ConsentStatus
- [ ] Create `types/api.ts`: ApiResponse, ErrorResponse

### 2.2 Enums & Constants
- [ ] Create `lib/constants/personas.ts`: Persona types and priorities
- [ ] Create `lib/constants/signals.ts`: Signal thresholds and windows
- [ ] Create `lib/constants/categories.ts`: Financial categories mapping
- [ ] Create `lib/constants/disclaimers.ts`: Legal disclaimers text

---

## Phase 3: Data Generation & Storage (3-4 hours)

### 3.1 Synthetic Data Generator
- [ ] Create `lib/data/generator/user-generator.ts`: Generate user profiles
- [ ] Create `lib/data/generator/account-generator.ts`: Generate accounts with realistic balances
- [ ] Create `lib/data/generator/transaction-generator.ts`: Generate transaction history
- [ ] Create `lib/data/generator/liability-generator.ts`: Generate credit cards and loans
- [ ] Create `lib/data/generator/index.ts`: Main generator coordinating all generators
- [ ] Implement deterministic seeding (fixed random seed)
- [ ] Generate 50-100 users with diverse financial situations
- [ ] Export to `data/synthetic-users.json`

### 3.2 Storage Abstraction Layer
- [ ] Create `lib/storage/interface.ts`: StorageAdapter interface
- [ ] Create `lib/storage/sqlite-adapter.ts`: SQLite implementation
  - [ ] Implement schema creation
  - [ ] Implement CRUD operations for users, signals, personas, recommendations
  - [ ] Implement consent tracking
  - [ ] Implement operator actions logging
- [ ] Create `lib/storage/memory-adapter.ts`: In-memory implementation
  - [ ] Load from JSON on initialization
  - [ ] Implement same interface as SQLite adapter
- [ ] Create `lib/storage/index.ts`: Factory function to select adapter based on env
- [ ] Create database schema SQL file: `lib/storage/schema.sql`

### 3.3 Data Seeding
- [ ] Create `scripts/generate-data.ts`: Run data generation
- [ ] Create `scripts/seed-database.ts`: Seed SQLite database
- [ ] Add npm scripts for data generation and seeding
- [ ] Generate initial dataset and commit to repo

---

## Phase 4: Signal Detection (3-4 hours)

### 4.1 Signal Infrastructure
- [ ] Create `lib/signals/types.ts`: Signal calculator interfaces
- [ ] Create `lib/signals/utils.ts`: Helper functions (date ranges, filtering)
- [ ] Create `lib/signals/index.ts`: Main signal detection orchestrator

### 4.2 Individual Signal Calculators
- [ ] Create `lib/signals/subscriptions.ts`:
  - [ ] Detect recurring merchants (≥3 occurrences in 90 days)
  - [ ] Calculate monthly recurring spend
  - [ ] Calculate subscription share of total spend
- [ ] Create `lib/signals/savings.ts`:
  - [ ] Calculate net inflow to savings accounts
  - [ ] Calculate savings growth rate
  - [ ] Calculate emergency fund coverage ratio
- [ ] Create `lib/signals/credit.ts`:
  - [ ] Calculate credit utilization per card
  - [ ] Detect minimum-payment-only behavior
  - [ ] Detect interest charges
  - [ ] Flag overdue status
- [ ] Create `lib/signals/income.ts`:
  - [ ] Detect payroll ACH patterns
  - [ ] Calculate payment frequency and variability
  - [ ] Calculate cash-flow buffer
  - [ ] Flag income gaps > 45 days

### 4.3 Time Window Support
- [ ] Implement 30-day window calculations
- [ ] Implement 180-day window calculations
- [ ] Store signals with window metadata

---

## Phase 5: Persona Assignment (2 hours)

### 5.1 Persona Logic
- [ ] Create `lib/personas/criteria.ts`: Define criteria for each persona
  - [ ] High Utilization criteria
  - [ ] Variable Income Budgeter criteria
  - [ ] Subscription-Heavy criteria
  - [ ] Savings Builder criteria
  - [ ] Low Income Stabilizer criteria
- [ ] Create `lib/personas/assignment.ts`:
  - [ ] Implement persona matching logic
  - [ ] Implement prioritization logic
  - [ ] Generate assignment rationale
- [ ] Create `lib/personas/index.ts`: Main persona assignment function

---

## Phase 6: Recommendations Engine (4-5 hours)

### 6.1 Recommendation Templates
- [ ] Create `lib/recommendations/templates/high-utilization.ts`
- [ ] Create `lib/recommendations/templates/variable-income.ts`
- [ ] Create `lib/recommendations/templates/subscription-heavy.ts`
- [ ] Create `lib/recommendations/templates/savings-builder.ts`
- [ ] Create `lib/recommendations/templates/low-income.ts`
- [ ] Create `lib/recommendations/templates/index.ts`: Template registry

### 6.2 Content Generation
- [ ] Create `lib/recommendations/openai.ts`: OpenAI integration
  - [ ] Configure OpenAI client
  - [ ] Create prompts for educational content
  - [ ] Implement tone guidelines in prompts
  - [ ] Add retry logic with exponential backoff
- [ ] Create `lib/recommendations/rationale.ts`: Generate data-backed rationales
- [ ] Create `lib/recommendations/content.ts`: Generate educational articles

### 6.3 Partner Offers
- [ ] Create `lib/recommendations/partners.ts`:
  - [ ] Define partner offer templates
  - [ ] Implement eligibility checks
  - [ ] Match offers to personas

### 6.4 Main Engine
- [ ] Create `lib/recommendations/engine.ts`:
  - [ ] Generate 3-5 recommendations per user
  - [ ] Map to assigned personas
  - [ ] Include concrete data rationales
  - [ ] Generate plain-language explanations
  - [ ] Attach partner offers

---

## Phase 7: Guardrails (2-3 hours)

### 7.1 Consent Management
- [ ] Create `lib/guardrails/consent.ts`:
  - [ ] Check consent status
  - [ ] Validate active consent before processing
  - [ ] Block recommendations without consent
  - [ ] Track consent timestamps

### 7.2 Eligibility Checks
- [ ] Create `lib/guardrails/eligibility.ts`:
  - [ ] Validate minimum income requirements
  - [ ] Check credit requirements
  - [ ] Filter based on existing accounts
  - [ ] Exclude harmful products (payday loans)

### 7.3 Tone Validation
- [ ] Create `lib/guardrails/tone.ts`:
  - [ ] Define prohibited phrases (shaming language)
  - [ ] Validate AI-generated content
  - [ ] Flag tone violations
  - [ ] Ensure empowering language

### 7.4 Disclaimer Management
- [ ] Create `lib/guardrails/disclaimers.ts`:
  - [ ] Attach standard disclaimer to all recommendations
  - [ ] Ensure compliance with all outputs

### 7.5 Guardrails Orchestrator
- [ ] Create `lib/guardrails/index.ts`:
  - [ ] Chain all guardrails
  - [ ] Log violations
  - [ ] Return validation results

---

## Phase 8: API Endpoints (3-4 hours)

### 8.1 Authentication
- [ ] Create `app/api/auth/login/route.ts`: Simple role-based login
- [ ] Create `app/api/auth/logout/route.ts`: Session cleanup
- [ ] Create `lib/auth/session.ts`: Session management utilities

### 8.2 User Endpoints
- [ ] Create `app/api/users/[userId]/route.ts`: Get user profile
- [ ] Create `app/api/users/[userId]/signals/route.ts`: Get signals
- [ ] Create `app/api/users/[userId]/recommendations/route.ts`: Get recommendations

### 8.3 Recommendations Endpoints
- [ ] Create `app/api/recommendations/route.ts`: List all (operator)
- [ ] Create `app/api/recommendations/[id]/approve/route.ts`: Approve recommendation
- [ ] Create `app/api/recommendations/[id]/reject/route.ts`: Reject recommendation
- [ ] Create `app/api/recommendations/[id]/flag/route.ts`: Flag for review

### 8.4 Consent Endpoints
- [ ] Create `app/api/consent/route.ts`: Grant consent (POST) and check status (GET)
- [ ] Create `app/api/consent/revoke/route.ts`: Revoke consent

### 8.5 Operator Endpoints
- [ ] Create `app/api/operator/users/route.ts`: List/search/filter users
- [ ] Create `app/api/operator/recommendations/route.ts`: List/filter recommendations
- [ ] Create `app/api/operator/audit-log/route.ts`: Get audit trail
- [ ] Create `app/api/operator/bulk-action/route.ts`: Bulk approve/reject

### 8.6 Feedback Endpoint
- [ ] Create `app/api/feedback/route.ts`: Record user feedback

### 8.7 API Middleware
- [ ] Create `lib/api/middleware.ts`:
  - [ ] Authorization middleware
  - [ ] Consent enforcement middleware
  - [ ] Error handling middleware
  - [ ] Request validation (Zod schemas)

---

## Phase 9: User Dashboard Frontend (4-5 hours)

### 9.1 Layout & Navigation
- [ ] Create `app/layout.tsx`: Root layout with providers
- [ ] Create `app/page.tsx`: Login/role selection page
- [ ] Create `app/user/layout.tsx`: User dashboard layout
- [ ] Create `components/nav/user-nav.tsx`: User navigation

### 9.2 Dashboard Components
- [ ] Create `components/user/persona-card.tsx`: Display assigned persona(s)
- [ ] Create `components/user/persona-explanation.tsx`: Why persona was assigned
- [ ] Create `components/user/signals-overview.tsx`: Key signals display
- [ ] Create `components/user/credit-gauge.tsx`: Credit utilization gauge
- [ ] Create `components/user/savings-progress.tsx`: Savings visualization
- [ ] Create `components/user/income-indicator.tsx`: Income stability indicator

### 9.3 Recommendations
- [ ] Create `components/user/recommendations-list.tsx`: List of recommendations
- [ ] Create `components/user/recommendation-card.tsx`: Individual recommendation
- [ ] Create `components/user/rationale-display.tsx`: Show data-backed rationale
- [ ] Create `components/user/educational-content.tsx`: Display AI-generated content
- [ ] Create `components/user/action-button.tsx`: CTA for recommendations

### 9.4 Partner Offers
- [ ] Create `components/user/partner-offers.tsx`: Partner offers section
- [ ] Create `components/user/offer-card.tsx`: Individual offer card
- [ ] Create `components/user/eligibility-badge.tsx`: Eligibility status

### 9.5 Consent Control
- [ ] Create `components/user/consent-control.tsx`: Manage consent
- [ ] Create `components/user/consent-dialog.tsx`: Consent explanation dialog

### 9.6 Main Dashboard Page
- [ ] Create `app/user/[userId]/page.tsx`: Main user dashboard
- [ ] Integrate all components
- [ ] Implement data fetching
- [ ] Add loading states
- [ ] Add error handling

---

## Phase 10: Operator Dashboard Frontend (5-6 hours)

### 10.1 Layout & Navigation
- [ ] Create `app/operator/layout.tsx`: Operator dashboard layout
- [ ] Create `components/nav/operator-nav.tsx`: Operator navigation

### 10.2 User Management
- [ ] Create `components/operator/search-bar.tsx`: User search
- [ ] Create `components/operator/filter-panel.tsx`: Filters (persona, income, signals)
- [ ] Create `components/operator/user-list.tsx`: User list table
- [ ] Create `components/operator/user-row.tsx`: Individual user row

### 10.3 User Detail View
- [ ] Create `components/operator/user-detail.tsx`: User detail container
- [ ] Create `components/operator/signals-table.tsx`: All signals display
- [ ] Create `components/operator/persona-assignment.tsx`: Persona with reasoning
- [ ] Create `components/operator/recommendations-list.tsx`: User's recommendations

### 10.4 Recommendation Management
- [ ] Create `components/operator/decision-trace.tsx`: Show decision trace
- [ ] Create `components/operator/recommendation-actions.tsx`: Approve/reject/flag buttons
- [ ] Create `components/operator/bulk-actions.tsx`: Bulk operation controls

### 10.5 System Metrics
- [ ] Create `components/operator/metrics-dashboard.tsx`: System health metrics
- [ ] Create `components/operator/coverage-metric.tsx`: Coverage percentage
- [ ] Create `components/operator/latency-metric.tsx`: Performance metrics
- [ ] Create `components/operator/audit-log.tsx`: Operator actions log

### 10.6 Main Operator Pages
- [ ] Create `app/operator/page.tsx`: Operator dashboard home
- [ ] Create `app/operator/users/page.tsx`: Users list page
- [ ] Create `app/operator/users/[userId]/page.tsx`: User detail page
- [ ] Create `app/operator/recommendations/page.tsx`: Recommendations management
- [ ] Create `app/operator/metrics/page.tsx`: System metrics page

---

## Phase 11: Testing (3-4 hours)

### 11.1 Unit Tests - Signals
- [ ] Create `tests/signals/subscriptions.test.ts`
- [ ] Create `tests/signals/savings.test.ts`
- [ ] Create `tests/signals/credit.test.ts`
- [ ] Create `tests/signals/income.test.ts`

### 11.2 Unit Tests - Personas
- [ ] Create `tests/personas/assignment.test.ts`
- [ ] Create `tests/personas/prioritization.test.ts`

### 11.3 Unit Tests - Recommendations
- [ ] Create `tests/recommendations/engine.test.ts`
- [ ] Create `tests/recommendations/templates.test.ts`

### 11.4 Unit Tests - Guardrails
- [ ] Create `tests/guardrails/consent.test.ts`
- [ ] Create `tests/guardrails/eligibility.test.ts`
- [ ] Create `tests/guardrails/tone.test.ts`

### 11.5 Integration Tests
- [ ] Create `tests/integration/api-endpoints.test.ts`
- [ ] Create `tests/integration/storage.test.ts`

### 11.6 Test Data & Utilities
- [ ] Create `tests/utils/builders.ts`: Test data builders
- [ ] Create `tests/utils/fixtures.ts`: Test fixtures

### 11.7 Ensure Coverage
- [ ] Verify ≥10 tests passing
- [ ] Run test suite and fix failures
- [ ] Document test results

---

## Phase 12: Evaluation & Metrics (2-3 hours)

### 12.1 Metrics Calculation
- [ ] Create `lib/evaluation/coverage.ts`: Calculate coverage metric
- [ ] Create `lib/evaluation/explainability.ts`: Calculate explainability metric
- [ ] Create `lib/evaluation/latency.ts`: Measure latency
- [ ] Create `lib/evaluation/auditability.ts`: Check auditability
- [ ] Create `lib/evaluation/code-quality.ts`: Test metrics

### 12.2 Fairness Analysis
- [ ] Create `lib/evaluation/fairness.ts`: Demographic parity analysis (if applicable)

### 12.3 Reporting
- [ ] Create `scripts/generate-metrics.ts`: Generate metrics JSON/CSV
- [ ] Create evaluation summary document
- [ ] Generate per-user decision traces for sample users
- [ ] Document any gaps and improvement recommendations

---

## Phase 13: Documentation (2-3 hours)

### 13.1 README
- [ ] Write comprehensive README.md:
  - [ ] Project overview
  - [ ] Setup instructions (one-command setup)
  - [ ] Local development guide
  - [ ] Vercel deployment guide
  - [ ] Environment variables
  - [ ] Running tests
  - [ ] Project structure explanation

### 13.2 Technical Documentation
- [ ] Create `docs/architecture.md`: Architecture overview with diagrams
- [ ] Create `docs/data-model.md`: Complete data model and schema
- [ ] Create `docs/api.md`: API endpoints documentation
- [ ] Create `docs/decision-log.md`: Key architectural decisions

### 13.3 Technical Writeup
- [ ] Write 1-2 page technical writeup:
  - [ ] Architecture decisions
  - [ ] Trade-offs made
  - [ ] Challenges encountered
  - [ ] Solutions implemented

### 13.4 AI Tools Documentation
- [ ] Document OpenAI prompts used
- [ ] Document AI tool usage (Cursor, etc.)
- [ ] Document AI-generated content review process

---

## Phase 14: Deployment & Polish (2-3 hours)

### 14.1 Local Testing
- [ ] Test complete local setup from scratch
- [ ] Verify all features work locally
- [ ] Test with SQLite database
- [ ] Fix any issues discovered

### 14.2 Vercel Deployment
- [ ] Create `vercel.json` configuration
- [ ] Set environment variables in Vercel
- [ ] Deploy to Vercel
- [ ] Test deployed version
- [ ] Verify in-memory storage works correctly

### 14.3 Final Polish
- [ ] Fix any UI bugs or inconsistencies
- [ ] Ensure responsive design works on mobile
- [ ] Add loading states where missing
- [ ] Improve error messages
- [ ] Add helpful user feedback

### 14.4 Demo Materials
- [ ] Create demo video or screenshots
- [ ] Prepare demo walkthrough script
- [ ] Test complete user journey
- [ ] Test complete operator journey

---

## Phase 15: Submission Preparation (1-2 hours)

### 15.1 Repository Cleanup
- [ ] Clean commit history
- [ ] Remove any debug code
- [ ] Remove unused files
- [ ] Verify `.gitignore` is complete

### 15.2 Final Checks
- [ ] Verify all success criteria met
- [ ] Ensure all tests pass
- [ ] Verify metrics meet targets
- [ ] Check all documentation is complete

### 15.3 Submission Deliverables
- [ ] GitHub repository with clean commit history ✓
- [ ] Technical writeup (1-2 pages) ✓
- [ ] AI tools documentation ✓
- [ ] README with setup instructions ✓
- [ ] Performance metrics (JSON/CSV) ✓
- [ ] Test results ✓
- [ ] Data model documentation ✓
- [ ] Evaluation report ✓

---

## Success Criteria Checklist

- [ ] **Coverage**: 100% of users have assigned persona + ≥3 detected behaviors
- [ ] **Explainability**: 100% of recommendations have plain-language rationales citing specific data
- [ ] **Latency**: < 5 seconds per user for recommendation generation
- [ ] **Auditability**: 100% of recommendations have complete decision traces
- [ ] **Code Quality**: ≥10 passing unit/integration tests

---

## Priority Levels

**P0 (Critical)**: Must have for MVP to function
**P1 (High)**: Important for core functionality
**P2 (Medium)**: Nice to have, can defer if time constrained
**P3 (Low)**: Polish and optimization

Most tasks above are P0-P1. If time becomes constrained, focus on:
1. Core data flow (data generation → signals → personas → recommendations)
2. Basic UI for both dashboards
3. Essential API endpoints
4. Minimum viable testing (≥10 tests)

---

## Estimated Timeline

| Phase | Hours | Priority |
|-------|-------|----------|
| Phase 1: Foundation | 2-3 | P0 |
| Phase 2: Types | 1-2 | P0 |
| Phase 3: Data & Storage | 3-4 | P0 |
| Phase 4: Signals | 3-4 | P0 |
| Phase 5: Personas | 2 | P0 |
| Phase 6: Recommendations | 4-5 | P0 |
| Phase 7: Guardrails | 2-3 | P0 |
| Phase 8: API | 3-4 | P0 |
| Phase 9: User UI | 4-5 | P1 |
| Phase 10: Operator UI | 5-6 | P1 |
| Phase 11: Testing | 3-4 | P0 |
| Phase 12: Evaluation | 2-3 | P1 |
| Phase 13: Documentation | 2-3 | P1 |
| Phase 14: Deployment | 2-3 | P1 |
| Phase 15: Submission | 1-2 | P0 |
| **Total** | **41-54** | |

Note: This is aggressive for a 2-day sprint (48 hours). Plan for ~16-18 hours per day or prioritize ruthlessly.

