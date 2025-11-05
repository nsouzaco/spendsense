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
Dual storage backend for different deployment targets:

#### Local Development (SQLite)
- **better-sqlite3**: Synchronous SQLite for Node.js
- Persistent database file
- Full CRUD operations
- Transaction support

#### Vercel Deployment (In-Memory)
- JSON-based in-memory store
- Seeded from pre-generated JSON file
- Session-based persistence (resets on redeploy)
- Avoids serverless filesystem limitations

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

# Deployment Target
DEPLOYMENT_TARGET=local|vercel

# Database (local only)
DATABASE_URL=file:./dev.db
```

### Installation
```bash
npm install
npm run dev      # Start development server
npm run build    # Build for production
npm test         # Run test suite
```

## Technical Constraints

### Serverless Limitations
- No persistent filesystem on Vercel
- Function execution time limits (10s Hobby, 60s Pro)
- Cold start latency
- Memory limits (1GB Hobby, 3GB Pro)

**Solution**: In-memory storage with pre-seeded data for Vercel deployments

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
  "better-sqlite3": "^9.0.0",
  "openai": "^4.0.0",
  "tailwindcss": "^3.4.0",
  "@radix-ui/react-*": "Latest",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0",
  "zod": "^3.22.0",
  "jest": "^29.0.0",
  "@testing-library/react": "^14.0.0"
}
```

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
# Uses in-memory storage
# Seeded from data/synthetic-users.json
# Automatic HTTPS and CDN
```

## Known Limitations & Trade-offs

### Storage Approach
- **Trade-off**: In-memory storage on Vercel vs. external database
- **Decision**: Accept session-only persistence for MVP simplicity
- **Future**: Migrate to Vercel Postgres or external database for production

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

