# System Patterns & Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────────────┐      ┌───────────────────────┐   │
│  │  User Dashboard      │      │  Operator Dashboard   │   │
│  │  - Persona Display   │      │  - User Search        │   │
│  │  - Recommendations   │      │  - Signal Review      │   │
│  │  - Consent Control   │      │  - Bulk Actions       │   │
│  └──────────────────────┘      └───────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Layer (Next.js)                    │
│  /api/auth  /api/users  /api/recommendations  /api/operator │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │
│  │  Signals   │  │  Personas  │  │  Recommendations    │   │
│  │  Engine    │→ │  Assignor  │→ │  Engine             │   │
│  └────────────┘  └────────────┘  └─────────────────────┘   │
│                                            ↓                 │
│                                   ┌─────────────────────┐   │
│                                   │  Guardrails         │   │
│                                   │  - Consent Check    │   │
│                                   │  - Eligibility      │   │
│                                   │  - Tone Validation  │   │
│                                   └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Storage Abstraction                     │
│                    (Fully Async Interface)                   │
│                                                               │
│    ┌──────────────────┐         ┌────────────────────┐     │
│    │  Memory Adapter  │         │  Postgres Adapter  │     │
│    │  (Development)   │         │  (Production)      │     │
│    │  Promise-based   │         │  @vercel/postgres  │     │
│    └──────────────────┘         └────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │  OpenAI API        │
                    │  (Content Gen)     │
                    └────────────────────┘
```

## Core Data Flow

### 1. Data Ingestion & Signal Detection

```
Synthetic Data → Storage → Signal Detection (30d & 180d windows)
                                    │
                                    ├─→ Subscription Signals
                                    ├─→ Savings Signals
                                    ├─→ Credit Signals
                                    └─→ Income Signals
```

**Pattern**: Pipeline architecture with independent signal calculators
- Each signal calculator is isolated and testable
- Signals computed in parallel where possible
- Results stored with time window metadata

### 2. Persona Assignment

```
Detected Signals → Persona Criteria Matching → Prioritization → Assignment
```

**Pattern**: Rules engine with priority system
- Each persona has clear, documented criteria
- Multiple personas can match
- Priority order: High Utilization → Variable Income → Subscription → Savings → Low Income
- Assignment includes rationale for auditability

### 3. Recommendation Generation

```
Assigned Persona + Signals → Recommendation Engine → Guardrails → Storage
                                        │
                                        ├─→ OpenAI API (content generation)
                                        ├─→ Partner matching
                                        └─→ Rationale building
```

**Pattern**: Template + AI hybrid
- Templates define recommendation structure per persona
- AI generates personalized content and rationales
- Guardrails validate before storage
- Decision trace logged for auditability

### 4. User Summary Generation (On-Demand)

```
User Data (accounts, transactions, signals, personas, recommendations)
                        │
                        ▼
                Generate AI Summary
                        │
                        ▼
                 Display to User
```

**Pattern**: Simple AI-only endpoint
- `/api/users/[userId]/summary` endpoint generates personalized text
- Uses OpenAI to create 3-4 paragraph financial snapshot
- Triggered by "✨ Generate My Summary" button
- No data processing - only reads existing data and creates narrative
- Warm, supportive tone that acknowledges strengths and opportunities
- Can be regenerated/refreshed anytime

## Key Design Patterns

### Storage Abstraction Pattern

```typescript
interface StorageAdapter {
  getUser(userId: string): Promise<User | null>;
  getUserSignals(userId: string): Promise<Signals | null>;
  saveRecommendation(rec: Recommendation): Promise<void>;
  saveUser(user: User): Promise<void>;
  getAllUsers(): Promise<User[]>;
  // ... all methods return Promise<T>
}

class MemoryStorageAdapter implements StorageAdapter {
  // In-memory JSON store (fast, zero-config)
  async getUser(userId: string): Promise<User | null> { }
  async saveUser(user: User): Promise<void> { }
  // ... fully async
}

class PostgresStorageAdapter implements StorageAdapter {
  // PostgreSQL via @vercel/postgres
  async getUser(userId: string): Promise<User | null> { }
  async saveUser(user: User): Promise<void> { }
  // ... fully async with SQL queries
}

// Factory pattern for instantiation
function getStorageAdapter(): StorageAdapter {
  const mode = process.env.STORAGE_MODE || 'memory';
  return mode === 'postgres'
    ? new PostgresStorageAdapter()
    : new MemoryStorageAdapter();
}
```

**Why**: 
- Enables dual deployment targets with zero business logic changes
- Async interface prepares for scalability (database connections, network I/O)
- Easy to add new storage backends (MongoDB, DynamoDB, etc.)
- All API routes use `await` consistently

### Signal Calculator Pattern

```typescript
interface SignalCalculator {
  calculate(user: User, window: TimeWindow): SignalResult;
}

class SubscriptionSignalCalculator implements SignalCalculator { }
class SavingsSignalCalculator implements SignalCalculator { }
// ... etc
```

**Why**: 
- Each signal type is isolated and independently testable
- Easy to add new signal types
- Parallel computation possible

### Guardrails Chain Pattern

```typescript
type GuardrailCheck = (rec: Recommendation, user: User) => GuardrailResult;

const guardrails: GuardrailCheck[] = [
  checkConsent,
  checkEligibility,
  validateTone,
  checkDisclaimer
];

function applyGuardrails(rec: Recommendation, user: User): boolean {
  for (const check of guardrails) {
    const result = check(rec, user);
    if (!result.passed) {
      logViolation(result);
      return false;
    }
  }
  return true;
}
```

**Why**: 
- Composable validation logic
- Easy to add new guardrails
- Clear audit trail of failures

### Recommendation Template Pattern

```typescript
interface RecommendationTemplate {
  personaType: PersonaType;
  category: string;
  eligibilityCriteria: (user: User) => boolean;
  generateRationale: (user: User, signals: Signals) => string;
  generateContent: (user: User) => Promise<string>; // Uses OpenAI
}

const templates: RecommendationTemplate[] = [
  {
    personaType: 'HIGH_UTILIZATION',
    category: 'Credit Management',
    eligibilityCriteria: (user) => user.signals.creditUtil > 0.5,
    // ... implementation
  },
  // ... more templates
];
```

**Why**:
- Structured approach to recommendation generation
- Clear mapping to personas
- Testable eligibility logic
- Flexible content generation

## Component Architecture

### User Dashboard Components

```
UserDashboard
├── PersonaCard
│   └── PersonaExplanation
├── SignalsOverview
│   ├── CreditUtilizationGauge
│   ├── SavingsProgress
│   └── IncomeStabilityIndicator
├── RecommendationsList
│   └── RecommendationCard
│       ├── Rationale
│       ├── EducationalContent
│       └── ActionButton
├── PartnerOffers
│   └── OfferCard
└── ConsentControl
```

### Operator Dashboard Components

```
OperatorDashboard
├── SearchBar
├── FilterPanel
│   ├── PersonaFilter
│   ├── IncomeFilter
│   └── SignalFilter
├── UserList
│   └── UserRow (click → UserDetail)
├── UserDetail
│   ├── SignalsTable
│   ├── PersonaAssignment
│   └── RecommendationsList
├── RecommendationManagement
│   ├── DecisionTrace
│   ├── ApproveButton
│   ├── RejectButton
│   └── FlagButton
└── SystemMetrics
    ├── CoverageMetric
    ├── LatencyMetric
    └── AuditLog
```

## API Design Patterns

### RESTful Conventions
- `GET` for reading data
- `POST` for creating/actions (approve, reject, consent)
- Consistent response format:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null
  }
  ```

### Authorization Middleware
```typescript
function requireAuth(handler: ApiHandler, role?: 'user' | 'operator') {
  return async (req, res) => {
    const session = await getSession(req); // Now async
    if (!session || (role && session.role !== role)) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    return handler(req, res);
  };
}

// Usage
export default requireAuth(userDashboardHandler, 'user');
```

### Consent Enforcement
```typescript
function requireConsent(handler: ApiHandler) {
  return async (req, res) => {
    const userId = req.query.userId;
    const storage = getStorageAdapter();
    const consent = await storage.getConsent(userId); // Async
    if (!consent?.active) {
      return res.status(403).json({ 
        success: false, 
        error: 'User consent required' 
      });
    }
    return handler(req, res);
  };
}
```

### Async API Route Pattern
```typescript
export async function GET(request: Request) {
  try {
    const storage = getStorageAdapter();
    const userId = request.nextUrl.searchParams.get('userId');
    
    // All storage operations use await
    const user = await storage.getUser(userId);
    const signals = await storage.getUserSignals(userId);
    const recommendations = await storage.getRecommendations(userId);
    
    return Response.json({
      success: true,
      data: { user, signals, recommendations }
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

## Error Handling Strategy

### Layered Error Handling
1. **Input Validation**: Zod schemas at API boundary
2. **Business Logic**: Domain-specific errors with context
3. **Storage Layer**: Database/storage errors
4. **External APIs**: OpenAI API errors with retry logic

### Error Types
```typescript
class ConsentRequiredError extends Error { }
class EligibilityCheckFailedError extends Error { }
class ToneViolationError extends Error { }
class StorageError extends Error { }
```

### Logging Strategy
```typescript
// Development: console.log with context
logger.debug('Signal calculated', { userId, signal, window });

// Production: Structured logging (future)
logger.info({ 
  event: 'recommendation_generated',
  userId,
  personaType,
  latencyMs 
});
```

## Performance Optimization Patterns

### Caching Strategy
- **User Signals**: Cache for session duration (signals don't change in demo)
- **Recommendations**: Cache until consent revoked
- **AI-generated content**: Pre-generate during data seeding

### Batch Processing
```typescript
// Generate recommendations for all users at startup
async function seedRecommendations() {
  const users = getAllUsers();
  for (const user of users) {
    const signals = detectSignals(user);
    const personas = assignPersonas(signals);
    const recs = await generateRecommendations(user, personas, signals);
    saveRecommendations(user.id, recs);
  }
}
```

### Parallel Computation
```typescript
// Calculate all signal types in parallel
const [subscriptions, savings, credit, income] = await Promise.all([
  calculateSubscriptionSignals(user, window),
  calculateSavingsSignals(user, window),
  calculateCreditSignals(user, window),
  calculateIncomeSignals(user, window)
]);
```

## Testing Patterns

### Unit Test Structure
```typescript
describe('SignalCalculator', () => {
  describe('calculateSubscriptionSignals', () => {
    it('detects recurring merchants with 3+ occurrences', () => { });
    it('calculates monthly recurring spend', () => { });
    it('handles users with no subscriptions', () => { });
  });
});
```

### Test Data Builders
```typescript
class UserBuilder {
  private user: Partial<User> = {};
  
  withIncome(annual: number) {
    // ... set income
    return this;
  }
  
  withCreditCard(limit: number, balance: number) {
    // ... add credit card
    return this;
  }
  
  build(): User { return this.user as User; }
}

// Usage
const user = new UserBuilder()
  .withIncome(25000)
  .withCreditCard(5000, 4000)
  .build();
```

## Decision Log

### Why Next.js App Router?
- Modern file-based routing
- Server components for better performance
- Built-in API routes
- Excellent Vercel integration

### Why In-Memory for Local Development?
- Zero-config setup
- Fast iteration and testing
- No database installation required
- Perfect for rapid prototyping

### Why PostgreSQL for Production?
- Persistent data across deployments
- ACID guarantees for data integrity
- Vercel-optimized with connection pooling
- Production-ready and scalable
- Familiar SQL interface

### Why Async Storage Interface?
- Prepares for network I/O and database operations
- Enables connection pooling and efficient resource usage
- Consistent pattern across all API routes
- Future-proof for distributed systems
- Proper error handling with try/catch

### Why Dual Storage Abstraction?
- Best of both worlds (fast local dev + production database)
- Forces clean architecture (business logic decoupled from storage)
- Easy to swap backends via environment variable
- Demonstrates production-ready architectural thinking
- Zero code changes needed between environments

### Why OpenAI for Content Generation?
- High-quality natural language
- Can follow tone guidelines
- Personalization at scale
- Time-efficient for MVP

### Why shadcn/ui?
- Modern, accessible components
- Full control (copy-paste, not npm package)
- Excellent TypeScript support
- Fast development velocity

