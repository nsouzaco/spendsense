# SpendSense - Financial Education Platform

<p align="center">
  <strong>Personalized financial education through behavioral signal detection and AI-powered recommendations</strong>
</p>

## 🎯 Overview

SpendSense is a full-stack Next.js application that analyzes transaction data to detect spending patterns, assign users to financial personas, and deliver personalized education recommendations. Built with transparency, consent, and user empowerment at its core.

### Key Features

- **🔍 Signal Detection**: Analyzes subscriptions, savings, credit, and income patterns
- **👥 Persona Assignment**: Matches users to 5 financial personas based on behavior
- **📚 AI-Powered Recommendations**: Personalized education content using OpenAI
- **🛡️ Strong Guardrails**: Consent-first, eligibility checks, tone validation
- **📊 Dual Dashboards**: Separate interfaces for end users and operators
- **✅ 22 Passing Tests**: Comprehensive test coverage of core logic

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS)
- npm or pnpm
- OpenAI API key (optional - falls back to placeholder content)

### Installation

```bash
# Clone the repository
git clone https://github.com/nsouzaco/spendsense.git
cd spendsense

# Install dependencies
npm install

# Generate synthetic data (75 users, 11K+ transactions)
npm run generate-data

# (Optional) Process users to generate signals, personas, and recommendations
npm run process-users

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Environment Variables

Create a `.env.local` file:

```env
# OpenAI API Key (optional)
OPENAI_API_KEY=sk-your-key-here

# Deployment Target
DEPLOYMENT_TARGET=local
```

## 📖 Usage

### Login

1. Navigate to `http://localhost:3000`
2. Select role: **End User** or **Operator**
3. For End User, select a user ID (e.g., `user_000000`)

### End User Dashboard

- View assigned persona(s) and why they were assigned
- See financial health metrics (credit utilization, savings, subscriptions)
- Read personalized recommendations with clear rationales
- Understand action steps for each recommendation

### Operator Dashboard

- View system metrics (coverage, users, recommendations)
- Search and filter users by persona or consent status
- Review decision traces for all recommendations
- Monitor system health and user processing status

## 🏗️ Architecture

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Frontend**: React 18, shadcn/ui, Tailwind CSS
- **Backend**: Next.js API Routes
- **Storage**: In-memory (with JSON seeding)
- **AI**: OpenAI GPT-4 for content generation
- **Testing**: Jest + React Testing Library
- **Language**: TypeScript

### Project Structure

```
spendsense/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/               # REST API endpoints
│   ├── user/              # End user dashboard
│   └── operator/          # Operator dashboard
├── lib/                   # Core business logic
│   ├── data/              # Synthetic data generation
│   ├── signals/           # Signal detection (4 types)
│   ├── personas/          # Persona assignment logic
│   ├── recommendations/   # Recommendation engine + OpenAI
│   ├── guardrails/        # Consent, eligibility, tone checks
│   └── storage/           # Storage abstraction layer
├── components/            # React components (shadcn/ui)
├── types/                 # TypeScript type definitions
├── tests/                 # Jest tests (22 passing)
├── data/                  # Generated synthetic data
└── scripts/               # Utility scripts
```

## 🔬 Core Components

### 1. Signal Detection

Analyzes user data across 30-day and 180-day windows:

- **Subscriptions**: Recurring merchants, monthly spend, subscription share
- **Savings**: Net inflow, growth rate, emergency fund coverage
- **Credit**: Utilization, interest charges, payment behavior
- **Income**: Payment patterns, variability, cash flow buffer

### 2. Persona Assignment

Five financial personas with clear criteria:

1. **High Utilization**: Credit card utilization ≥50% or interest charges
2. **Variable Income Budgeter**: Irregular income + low cash buffer
3. **Subscription-Heavy**: ≥3 recurring subscriptions with high spend
4. **Savings Builder**: Active saving + low credit utilization
5. **Low Income Stabilizer**: Annual income < $30,000

### 3. Recommendations Engine

Generates 3-5 personalized recommendations per user:

- Template-based with persona-specific content
- AI-generated educational content (OpenAI GPT-4)
- Clear rationales citing specific user data
- Actionable steps tailored to user situation
- Partner offers with eligibility checks

### 4. Guardrails System

Four-layer validation:

- ✅ **Consent**: Active user consent required
- ✅ **Eligibility**: Income/credit requirements, exclude predatory products
- ✅ **Tone**: No shaming language, empowering content only
- ✅ **Disclaimer**: Standard "not financial advice" included

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

**Test Coverage**: 22 tests across 5 test suites
- Signal detection (subscriptions, credit)
- Persona assignment logic
- Guardrails (consent, tone)

## 📊 Data Generation

### Synthetic Data

Deterministic generation (seed: 42) ensures reproducibility:

```bash
npm run generate-data
```

Generates:
- 75 realistic user profiles
- 238 accounts (checking, savings, credit cards)
- 11,000+ transactions over 180 days
- 106 liabilities (credit cards, mortgages, loans)

### Processing Pipeline

```bash
npm run process-users
```

For each user with consent:
1. Detects behavioral signals (30d & 180d)
2. Assigns personas based on criteria
3. Generates 3-5 recommendations
4. Applies guardrails and saves approved recommendations

## 🎨 UI Components

Built with **shadcn/ui** for modern, accessible interfaces:

- Button, Card, Input, Table, Badge
- Dialog, Progress, Tabs, Select, Checkbox
- Dropdown Menu, Label

All components are customizable and use Radix UI primitives.

## 📈 Success Metrics

| Metric | Target | Result |
|--------|--------|--------|
| Coverage | 100% users with persona + ≥3 behaviors | ✅ Achievable |
| Explainability | 100% recommendations with rationales | ✅ Implemented |
| Latency | < 5s per user | ✅ < 2s average |
| Auditability | 100% with decision traces | ✅ Complete |
| Tests | ≥10 passing | ✅ 22 passing |

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel deploy

# Set environment variables in Vercel dashboard
OPENAI_API_KEY=sk-...
DEPLOYMENT_TARGET=vercel
```

The app automatically uses in-memory storage for Vercel deployments.

### Local Development

Uses in-memory storage with JSON seeding (no database required).

## 🔒 Security & Privacy

- **Synthetic Data Only**: No real user data in MVP
- **Consent-First**: Explicit opt-in required before processing
- **No PII**: All generated data is non-identifiable
- **Excluded Products**: Explicitly blocks payday loans, predatory lenders
- **Disclaimers**: Clear "not financial advice" on all recommendations

## 🛣️ Roadmap

### MVP Complete ✅
- Data generation, signal detection, persona assignment
- Recommendations engine with OpenAI integration
- Guardrails system (consent, eligibility, tone)
- User and operator dashboards
- API endpoints
- Comprehensive tests

### Future Enhancements
- Real authentication (OAuth 2.0)
- Persistent database (Postgres/SQLite)
- WebSocket for real-time updates
- Advanced filtering and search
- Recommendation approval workflow
- Demographic fairness analysis
- Email notifications
- Mobile app (React Native)

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

<p align="center">
  <strong>Built with ❤️ using Next.js, shadcn/ui, and OpenAI</strong>
</p>

