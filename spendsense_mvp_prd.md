# SpendSense MVP - Product Requirements Document

## Executive Summary

SpendSense is a web-based financial education platform that ingests Plaid-style transaction data, detects behavioral spending patterns, assigns users to financial personas, and delivers personalized education recommendations with clear guardrails around consent and eligibility. The MVP will be a full-stack Next.js application deployable locally with SQLite or to Vercel with in-memory storage, featuring separate dashboards for end users and operators.

## Project Scope & Timeline

- **Duration**: 2-day sprint
- **Team**: Solo developer using Cursor with Next.js, React, shadcn/ui, and OpenAI API
- **Deployment**: Dual-target (local SQLite + Vercel in-memory)
- **Tech Stack**: Next.js API routes, React frontend with shadcn/ui, SQLite (local), in-memory JSON (Vercel), OpenAI for content generation

## Core Requirements

### 1. Authentication & Routing

Implement a simple login screen that allows users to select their role before entering the application.

**User Types:**
- End User: Sees personalized financial dashboard with recommendations
- Operator: Sees admin dashboard for reviewing signals, recommendations, and managing the system

The routing must be conditional based on selected role and persist through the session. Both user and operator views must be protected from unauthorized access.

### 2. Synthetic Data Generation

Generate 50-100 synthetic users with random distribution across financial situations to create a realistic demo dataset.

**Accounts Structure:**
Include account types (checking, savings, credit card, money market, HSA) with realistic balances, available funds, credit limits, and currency codes. Exclude business accounts.

**Transactions Structure:**
Generate realistic transaction history with dates, amounts, merchant names, payment channels, and personal finance categories (primary and detailed). Include both pending and cleared transactions.

**Liabilities Structure:**
Include credit card details (APRs, minimum payments, overdue status, next payment dates) and loan details (mortgages/student loans with interest rates and payment schedules).

**Distribution:**
- Randomize income levels (targeting mix including < $30k/year segment)
- Vary credit utilization patterns across users
- Include diverse subscription spending levels
- Distribute savings behaviors across spectrum
- Ensure income stability varies (payroll frequency, gaps)

**Data Format:**
Data must be loadable from JSON files for easy seeding. The dataset should be deterministic (use fixed seed for reproducibility) and contain no real PII.

### 3. Behavioral Signal Detection

Compute the following signals per user across two time windows: 30-day and 180-day.

**Subscription Signals:**
Detect recurring merchants appearing at least 3 times within 90 days with monthly or weekly cadence. Calculate monthly recurring spend and subscription share of total spend.

**Savings Signals:**
Calculate net inflow to savings-like accounts (savings, money market, cash management, HSA). Compute growth rate and emergency fund coverage ratio (savings balance divided by average monthly expenses).

**Credit Signals:**
Calculate credit utilization per card (balance divided by limit). Flag utilization thresholds at 30%, 50%, and 80%. Detect minimum-payment-only behavior, interest charges, and overdue status.

**Income Stability Signals:**
Detect payroll ACH patterns. Calculate payment frequency, variability, and cash-flow buffer in months. Flag income gaps exceeding 45 days.

All signals must be computed programmatically and stored for each user per time window.

### 4. Persona Assignment System

Assign each user to one or more of five financial personas based on detected behavioral signals. Each persona has clear, documented criteria and primary educational focus.

**Persona 1: High Utilization**
Criteria: Any credit card with utilization ≥50%, OR interest charges > 0, OR minimum-payment-only behavior detected, OR overdue status flagged.
Focus: Reduce utilization and interest charges, payment planning, autopay education.

**Persona 2: Variable Income Budgeter**
Criteria: Median pay gap > 45 days AND cash-flow buffer < 1 month.
Focus: Percent-based budgeting, emergency fund fundamentals, income smoothing strategies.

**Persona 3: Subscription-Heavy**
Criteria: Recurring merchants ≥3 AND (monthly recurring spend ≥$50 in 30d OR subscription share ≥10%).
Focus: Subscription audit, cancellation/negotiation tactics, bill alert setup.

**Persona 4: Savings Builder**
Criteria: Savings growth rate ≥2% over window OR net savings inflow ≥$200/month, AND all credit card utilizations < 30%.
Focus: Goal setting, automation, APY optimization (HYSA/CD basics).

**Persona 5: Low Income Stabilizer**
Criteria: Annual income < $30,000 OR average monthly income < $2,500.
Focus: Micro-budgeting, building emergency fund on limited income, accessing assistance programs, credit building on constrained budget.

**Prioritization Logic:**
If a user matches multiple personas, prioritize in order: High Utilization → Variable Income Budgeter → Subscription-Heavy → Savings Builder → Low Income Stabilizer. Document the prioritization rationale.

### 5. Personalization & Recommendations Engine

Generate 3-5 education recommendations per user per time window, mapped to their assigned persona and detected signals.

**Recommendation Structure:**
Each recommendation must include: a specific education item, mapped persona, concrete data rationale explaining why the recommendation applies, and a plain-language explanation without financial jargon.

**Rationale Format:**
Rationales must cite specific data points from the user's profile. Example: "Your Visa ending in 4523 is at 68% utilization ($3,400 of $5,000 limit). Bringing this below 30% could improve your credit score and reduce interest charges of $87/month."

**Content Generation:**
Use OpenAI API to generate personalized education content (articles, tips, checklists) tailored to each persona and user's specific signals. Content must be plain-language, educational, and empowering. Ensure LLM output is quality-checked for tone and accuracy.

**Partner Offers:**
Include 1-3 realistic partner offers per user with eligibility checks. Examples: balance transfer credit cards (high utilization), high-yield savings accounts (emergency fund building), budgeting apps (variable income), subscription management tools (subscription-heavy).

**Disclaimer:**
Every recommendation must include: "This is educational content, not financial advice. Consult a licensed advisor for personalized guidance."

### 6. Consent & Eligibility Guardrails

**Consent Management:**
Require explicit opt-in before processing any user data. Allow users to revoke consent at any time. Track consent status per user in the system. Never generate recommendations without active consent.

**Eligibility Checks:**
Validate that recommended products match user eligibility criteria. Check minimum income and credit requirements. Filter offers based on existing accounts (don't recommend savings account if user already has one). Explicitly exclude harmful products (payday loans, predatory lenders).

**Tone Guardrails:**
All generated content must avoid shaming language and judgmental phrasing. Use empowering, educational, neutral, and supportive tone. No phrases like "you're overspending." Review LLM outputs for tone violations.

**Disclosure Compliance:**
Every recommendation and educational item must include the standard disclaimer about educational content vs. financial advice.

### 7. End User Dashboard

Create a personalized dashboard for end users showing their financial profile and recommendations.

**Layout & Components:**
Display user's assigned persona(s) with clear explanation of why they were assigned. Show key financial signals in an easy-to-understand format (utilization gauges, savings progress, income stability indicators). Display 3-5 personalized recommendations with rationales, partner offers with eligibility status, and consent status with ability to revoke.

**Interactivity:**
Users should be able to view recommendation details, understand the rationale behind each recommendation, and click through to partner offers. Include feedback mechanism to rate recommendation helpfulness.

**Styling:**
Build with shadcn/ui components for a polished, modern interface. Ensure accessibility and responsive design for web.

### 8. Operator Dashboard

Create an administrative dashboard for operators to review signals, manage recommendations, and oversee system health.

**Core Views:**
User list with search capability. User detail view showing all detected signals (30d and 180d windows), assigned persona(s) with reasoning, and generated recommendations with full decision traces.

**Search & Filtering:**
Implement search by user name, user ID, or email. Filter users by assigned persona, income level, or signal threshold (e.g., "all users with > 50% credit utilization"). Filter recommendations by status (approved, pending, rejected).

**Bulk Actions:**
Operators should be able to approve or reject multiple recommendations simultaneously. Batch operations must log who performed the action and timestamp.

**Recommendation Management:**
Display each recommendation with full decision trace explaining why it was generated. Allow operators to override or flag recommendations for further review. Provide ability to approve before recommendations are shown to users (if audit workflow is desired).

**Monitoring:**
Show system health metrics (total users processed, coverage percentage, average latency, error count). Display audit log of all operator actions.

### 9. Storage & Environment Handling

**Local Development (SQLite):**
When running locally, use SQLite as the persistent database. All user data, consent records, signals, personas, recommendations, and operator actions must be stored in SQLite. Database should initialize on first run with schema.

**Vercel Deployment (In-Memory):**
When deployed to Vercel, use in-memory JSON storage seeded from a pre-generated JSON file. Data persists for the session but resets on redeploy. This approach avoids filesystem issues on serverless.

**Environment Detection:**
Implement conditional logic to detect deployment environment and use appropriate storage backend. Both backends must expose the same API interface so business logic remains unchanged.

**Data Seeding:**
Generate a deterministic synthetic dataset JSON file that seeds both local and deployed instances. This ensures consistent demo data across deployments.

### 10. API Endpoints

Build a REST API using Next.js API routes with the following endpoints:

**Authentication:**
POST /api/auth/login - Accept user type (user or operator) and user credentials. Return session token.

**User Profile:**
GET /api/users/{userId} - Return user's basic profile, assigned persona(s), and consent status.
GET /api/users/{userId}/signals - Return detected behavioral signals for 30d and 180d windows.
GET /api/users/{userId}/recommendations - Return personalized recommendations with rationales and partner offers.

**Recommendations:**
GET /api/recommendations - Get all recommendations (operator use).
POST /api/recommendations/{recommendationId}/approve - Operator approves recommendation.
POST /api/recommendations/{recommendationId}/reject - Operator rejects recommendation.
POST /api/recommendations/{recommendationId}/flag - Flag recommendation for review.

**Consent:**
POST /api/consent - Record user consent opt-in.
POST /api/consent/revoke - Record user consent revocation.
GET /api/consent/{userId} - Check current consent status.

**Operator:**
GET /api/operator/users - List all users with filtering and search.
GET /api/operator/recommendations - List all recommendations with filtering.
GET /api/operator/audit-log - Retrieve audit log of operator actions.
POST /api/operator/bulk-action - Perform bulk approve/reject on recommendations.

**Feedback:**
POST /api/feedback - Record user feedback on recommendations.

All endpoints must validate authorization and enforce consent requirements.

### 11. Evaluation & Metrics

Build an evaluation system that measures MVP success across key dimensions.

**Coverage Metric:**
Calculate percentage of users with assigned persona and at least 3 detected behaviors. Target: 100%.

**Explainability Metric:**
Calculate percentage of recommendations that include plain-language rationales citing specific user data. Target: 100%.

**Latency Metric:**
Measure time to generate recommendations per user in milliseconds. Target: < 5 seconds per user.

**Auditability Metric:**
Calculate percentage of recommendations with complete decision traces. Target: 100%.

**Code Quality Metric:**
Implement and pass at least 10 unit and integration tests covering core functions. Ensure all tests pass before submission.

**Fairness Analysis:**
If synthetic data includes demographic information, perform basic demographic parity analysis. Document any significant disparities in recommendation rates or persona assignment across demographic groups.

**Output:**
Generate JSON/CSV metrics file with all measurements. Write 1-2 page summary report explaining results, any gaps, and recommendations for improvement. Include per-user decision traces for sample users.

### 12. Code Quality & Documentation

**Modular Structure:**
Organize codebase into clear modules: data ingestion, feature engineering, persona assignment, recommendation engine, guardrails, UI components, API routes, and evaluation.

**Setup & Deployment:**
Provide one-command setup with package.json for dependencies. Include clear README with setup instructions, running locally vs. deploying to Vercel, and basic usage examples.

**Documentation:**
Document data model and schema. Maintain decision log explaining key architectural and design choices. Explicitly document system limitations and design trade-offs. Include standard "not financial advice" disclaimer prominently in codebase and UI.

**Testing:**
Implement at least 10 unit and integration tests covering core business logic (signal detection, persona assignment, recommendation generation, guardrails). Use deterministic seeds for reproducible tests. All tests must pass.

**Determinism:**
Ensure synthetic data generation uses fixed random seed for reproducibility. This enables consistent testing and demo behavior across runs.

## Success Criteria

| Category | Metric | Target |
|----------|--------|--------|
| Coverage | Users with assigned persona + ≥3 behaviors | 100% |
| Explainability | Recommendations with rationales | 100% |
| Latency | Time to generate recommendations per user | < 5 seconds |
| Auditability | Recommendations with decision traces | 100% |
| Code Quality | Passing unit/integration tests | ≥10 tests |
| Documentation | Schema and decision log clarity | Complete |

## Submission Deliverables

- GitHub repository with clean commit history
- Technical writeup (1-2 pages) covering architecture decisions and trade-offs
- Documentation of AI tools and OpenAI prompts used
- README with setup and deployment instructions
- Performance metrics and benchmark results (JSON/CSV)
- Test cases and validation results
- Data model and schema documentation
- Evaluation report with metrics summary and fairness analysis

## Key Principles

- **Transparency over sophistication**: Every recommendation must be explainable and auditable
- **User control over automation**: Consent-first, users can revoke at any time
- **Education over sales**: Focus is financial literacy, not product pushes
- **Fairness built in**: No shaming language, accessible to all income levels
- **Plain language**: Avoid jargon, speak to users at their level