# Technical Context

## Technology Stack

### Core Framework
- **Next.js 14+**: App Router architecture for file-based routing and server components
- **React 18+**: Modern React with hooks and server/client components
- **TypeScript**: Type safety across entire codebase

### UI Layer
- **shadcn/ui**: Modern component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for UI elements

### Storage Strategy
Dual storage backend with environment-based switching:

#### Local Development (In-Memory)
- JSON-based in-memory store
- Fast and zero-config for development
- Seeded from pre-generated JSON file
- Ideal for rapid iteration and testing
- Environment: `STORAGE_MODE=memory`

#### Production Deployment (PostgreSQL)
- **@vercel/postgres**: Vercel-optimized PostgreSQL client
- Fully async Promise-based operations
- Persistent database with ACID guarantees
- Seeded with 75 users, 150 accounts, 8,218 transactions
- Environment: `STORAGE_MODE=postgres`
- Connection via `DATABASE_URL` environment variable

#### Storage Abstraction
- **StorageAdapter Interface**: All methods return `Promise<T>`
- Both adapters (Memory & PostgreSQL) implement same async interface
- All 11 API routes use `await` for storage operations
- Seamless switching via environment variable
- Enables easy migration to other databases (e.g., MySQL, MongoDB)

### AI Integration
- **OpenAI API**: GPT-4 for generating personalized educational content
- **Use Cases**:
  - Generate recommendation rationales
  - Create persona-specific educational articles
  - Produce plain-language explanations
- **Guardrails**: Tone checking, content validation, educational focus

### Data Generation
- **Synthetic Data**: 50-100 realistic user profiles
- **Faker.js or similar**: Generate realistic names, dates, amounts
- **Deterministic Seeding**: Fixed random seed for reproducibility
- **Plaid-style Schema**: Matches real financial data structure

## Project Structure

```
spendsense/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── users/
│   │   ├── recommendations/
│   │   ├── consent/
│   │   └── operator/
│   ├── user/                     # End user dashboard
│   ├── operator/                 # Operator dashboard
│   └── layout.tsx
├── lib/                          # Core business logic
│   ├── data/
│   │   ├── generator.ts          # Synthetic data generation
│   │   └── storage.ts            # Storage abstraction layer
│   ├── signals/
│   │   ├── subscriptions.ts
│   │   ├── savings.ts
│   │   ├── credit.ts
│   │   └── income.ts
│   ├── personas/
│   │   └── assignment.ts         # Persona assignment logic
│   ├── recommendations/
│   │   ├── engine.ts             # Recommendation generation
│   │   └── content.ts            # AI content generation
│   ├── guardrails/
│   │   ├── consent.ts
│   │   ├── eligibility.ts
│   │   └── tone.ts
│   └── evaluation/
│       └── metrics.ts
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── user/                     # User dashboard components
│   └── operator/                 # Operator dashboard components
├── types/                        # TypeScript types
│   ├── user.ts
│   ├── transaction.ts
│   ├── signal.ts
│   └── recommendation.ts
├── tests/                        # Test files
│   ├── signals.test.ts
│   ├── personas.test.ts
│   └── recommendations.test.ts
├── data/                         # Generated data files
│   └── synthetic-users.json
├── memory-bank/                  # Project documentation
└── public/                       # Static assets
```

## Development Setup

### Prerequisites
- Node.js 18+ (LTS)
- npm or pnpm
- Git

### Environment Variables
```env
# OpenAI API
OPENAI_API_KEY=sk-...

# Storage Configuration
STORAGE_MODE=memory|postgres

# Database (postgres mode only)
DATABASE_URL=postgres://...
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NO_SSL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
POSTGRES_USER=default
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=verceldb
```

### Installation
```bash
npm install
npm run dev      # Start development server
npm run build    # Build for production
npm test         # Run test suite
```

## Technical Constraints

### Serverless Considerations
- Function execution time limits (10s Hobby, 60s Pro)
- Cold start latency for database connections
- Memory limits (1GB Hobby, 3GB Pro)
- Connection pooling important for PostgreSQL

**Solution**: PostgreSQL with connection pooling via Vercel Postgres, async operations for scalability

### OpenAI API Rate Limits
- TPM (Tokens Per Minute) limits vary by tier
- Need to batch/queue requests for 50-100 users
- Implement retry logic with exponential backoff

**Solution**: Generate content during seeding, cache in database/memory

### Data Privacy
- No real user data (synthetic only for MVP)
- PII handling considerations for future
- Consent tracking required even for synthetic data

**Solution**: Implement consent architecture from day 1

## Key Dependencies

```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "@vercel/postgres": "^0.10.0",
  "openai": "^4.0.0",
  "tailwindcss": "^3.4.0",
  "@radix-ui/react-*": "Latest",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0",
  "zod": "^3.22.0",
  "jest": "^29.0.0",
  "@testing-library/react": "^14.0.0",
  "geist": "^1.2.0"
}
```

### Typography
- **Geist Mono**: Default body font (extralight/light weights)
- **Geist Semibold**: Logo and emphasis text
- **Tracking**: `tracking-tight` throughout for modern aesthetic

## Testing Strategy

### Unit Tests
- Signal detection functions
- Persona assignment logic
- Eligibility checks
- Consent management

### Integration Tests
- API endpoint responses
- Storage layer operations
- End-to-end recommendation generation

### Test Data
- Use same deterministic seed as main data generation
- Smaller dataset (10-20 users) for speed
- Cover edge cases (no income, maxed credit, etc.)

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Recommendation Generation | < 5s per user | Server-side timing |
| Page Load (User Dashboard) | < 2s | Lighthouse |
| Page Load (Operator Dashboard) | < 3s | Lighthouse |
| API Response Time | < 500ms | Average across endpoints |
| Test Suite Execution | < 30s | Jest total time |

## Security Considerations

### MVP Scope (Synthetic Data Only)
- No real authentication (simple role selection)
- No password storage
- No PII encryption (no real data)
- Basic session management

### Future Production Requirements
- OAuth 2.0 or similar for real authentication
- PII encryption at rest and in transit
- Audit logging of all data access
- GDPR/CCPA compliance for consent management
- Rate limiting and DDoS protection

## Deployment Strategy

### Local Development
```bash
npm run dev
# Uses SQLite at ./dev.db
# Full CRUD operations
# Hot reload enabled
```

### Vercel Deployment
```bash
vercel deploy
# Uses PostgreSQL (STORAGE_MODE=postgres)
# Requires DATABASE_URL environment variable
# Automatic HTTPS and CDN
# Run seed-postgres script after first deploy
```

### Database Seeding
```bash
# Seed PostgreSQL database
npm run seed-postgres

# Migrate schema (if needed)
npm run migrate-postgres
```

## Known Limitations & Trade-offs

### Storage Approach
- **Decision**: PostgreSQL for production with async architecture
- **Benefit**: Persistent data, ACID guarantees, production-ready
- **Trade-off**: Slightly more complex setup than in-memory
- **Result**: Scalable, reliable storage with environment-based switching

### Data Volume
- **Limitation**: 50-100 synthetic users only
- **Reason**: OpenAI API cost and MVP scope
- **Future**: Scale to thousands with batch processing

### Authentication
- **Limitation**: Simple role selection, no real auth
- **Reason**: Focus on core functionality for MVP
- **Future**: Implement proper OAuth 2.0

### Real-time Updates
- **Limitation**: No WebSocket or real-time sync
- **Reason**: Adds complexity, not critical for MVP
- **Future**: Add real-time dashboard updates for operators

