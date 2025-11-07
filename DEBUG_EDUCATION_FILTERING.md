# Debug Prompt: Education Article Filtering Not Working Correctly

## Problem Statement

Users with HIGH_UTILIZATION personas (high credit card usage) are NOT seeing relevant debt/credit articles in their education section. Similarly, other personas aren't seeing their relevant content. The filtering logic appears to be too strict or has bugs.

## System Architecture

### How Article Matching Should Work

```
User → Has Personas (HIGH_UTILIZATION, etc.) → Has Signals (credit usage %, subscriptions, etc.)
                    ↓
        Match Articles to User
                    ↓
    Check 1: Does article's recommendedFor include user's persona? ✓
    Check 2: Does user meet article's requiredSignals? ✓
                    ↓
        Show Article to User
```

## Code Structure

### 1. Article Definitions (`lib/constants/education-articles.ts`)

Example article that should show for HIGH_UTILIZATION users:

```typescript
{
  id: 'debt-payoff-strategies',
  slug: 'debt-payoff-strategies',
  title: 'Debt Payoff Strategies That Actually Work',
  category: 'debt_payoff',
  difficulty: 'beginner',
  readTime: 8,
  icon: '🎯',
  bgColor: 'bg-red-100',
  
  // WHO should see this article
  recommendedFor: ['HIGH_UTILIZATION'],
  
  // WHEN they should see it (signal requirements)
  requiredSignals: {
    minCreditUtilization: 0.3,  // User must have >= 30% credit usage
  },
  
  summary: 'Learn proven strategies to pay down debt faster...',
  content: { /* full article content */ },
}
```

Another example - Credit Score article:

```typescript
{
  id: 'credit-score-improvement',
  slug: 'credit-score-improvement',
  title: 'How to Boost Your Credit Score',
  category: 'credit_management',
  
  recommendedFor: ['HIGH_UTILIZATION'],
  
  requiredSignals: {
    minCreditUtilization: 0.3,  // Must have >= 30% credit usage
  },
  
  summary: 'Your credit score affects everything from loan rates...',
}
```

**ALL 6 Articles:**
1. debt-payoff-strategies (HIGH_UTILIZATION, minCreditUtilization: 0.3)
2. credit-score-improvement (HIGH_UTILIZATION, minCreditUtilization: 0.3)
3. emergency-fund-basics (SAVINGS_BUILDER, LOW_INCOME_STABILIZER, VARIABLE_INCOME_BUDGETER)
4. subscription-audit-guide (SUBSCRIPTION_HEAVY, hasSubscriptions: true)
5. variable-income-budgeting (VARIABLE_INCOME_BUDGETER, hasVariableIncome: true)
6. investing-for-beginners (SAVINGS_BUILDER, hasSavings: true)

### 2. Matching Logic (`lib/education/matching.ts`)

#### Main Function:

```typescript
export function matchArticlesForUser(
  user: User,
  signals: SignalResult | null,
  personas: PersonaAssignment[]
): UserArticleRecommendation[] {
  // If no signals, show only emergency fund and budgeting
  if (!signals) {
    return EDUCATION_ARTICLES
      .filter(article => 
        article.category === 'emergency_fund' || 
        article.category === 'budgeting'
      )
      .slice(0, 4)
      .map(article => ({
        article,
        relevanceScore: 0.5,
        reason: 'Essential financial literacy for everyone',
      }));
  }

  const recommendations: UserArticleRecommendation[] = [];
  const personaTypes = personas.map(p => p.personaType);
  const hasPersonas = personas.length > 0;

  // Loop through all articles
  for (const article of EDUCATION_ARTICLES) {
    // Calculate relevance based on whether user has personas
    const score = hasPersonas 
      ? calculateRelevanceScore(article, personaTypes, signals)  // WITH personas
      : calculateSignalBasedRelevance(article, signals);         // WITHOUT personas
    
    if (score > 0) {
      const reason = hasPersonas
        ? generateRecommendationReason(article, personas[0].personaType, signals)
        : generateSignalBasedReason(article, signals);
      
      recommendations.push({
        article,
        relevanceScore: score,
        reason,
      });
    }
  }

  recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return recommendations;
}
```

#### For Users WITH Personas:

```typescript
function calculateRelevanceScore(
  article: EducationArticle,
  userPersonas: string[],
  signals: SignalResult
): number {
  let score = 0;

  // Step 1: Check if user's persona matches article's recommendedFor
  const hasMatchingPersona = article.recommendedFor.some(persona => 
    userPersonas.includes(persona)
  );
  
  if (!hasMatchingPersona) {
    return 0; // FILTER OUT - persona doesn't match
  }

  score += 0.5; // Base score for persona match

  // Step 2: Check required signals
  if (article.requiredSignals) {
    const { requiredSignals } = article;

    // Credit utilization check
    if (requiredSignals.minCreditUtilization !== undefined) {
      const avgUtilization = calculateAverageCreditUtilization(signals);
      if (avgUtilization >= requiredSignals.minCreditUtilization) {
        score += 0.3; // User meets requirement
      } else {
        return 0; // FILTER OUT - user doesn't have high enough credit usage
      }
    }

    // Similar checks for subscriptions, income, etc...
  }

  return Math.min(score, 1);
}
```

#### Credit Utilization Calculation:

```typescript
function calculateAverageCreditUtilization(signals: SignalResult): number {
  if (signals.creditSignals.cards.length === 0) return 0;
  
  let totalLimit = 0;
  let totalUsed = 0;

  for (const card of signals.creditSignals.cards) {
    totalLimit += card.limit;
    totalUsed += card.balance;
  }

  return totalLimit > 0 ? totalUsed / totalLimit : 0;
}
```

### 3. Signal Data Structure (`types/signal.ts`)

```typescript
export interface SignalResult {
  userId: string;
  window: TimeWindow; // '30d' or '180d'
  
  subscriptionSignals: {
    totalRecurringCount: number;
    monthlyRecurringSpend: number;
    // ...
  };
  
  savingsSignals: {
    currentSavingsBalance: number;
    growthRate: number;
    emergencyFundCoverage: number;
    // ...
  };
  
  creditSignals: {
    cards: CreditCardSignal[];
    averageUtilization: number;
  };
  
  incomeSignals: {
    hasPayrollPattern: boolean;
    estimatedAnnualIncome: number;
    // ...
  };
}

export interface CreditCardSignal {
  accountId: string;
  limit: number;
  balance: number;
  utilization: number;  // balance / limit
  monthlyPayment: number;
}
```

### 4. Usage in User Dashboard (`app/user/[userId]/page.tsx`)

```typescript
// Get personalized article recommendations
const articleRecommendations = user 
  ? getArticleRecommendationsWithReasons(user, signal180d || null, personas, 6) 
  : [];

// Display in Education view
{activeView === 'education' && (
  <div className="grid gap-6 md:grid-cols-2">
    {articleRecommendations.map((rec, index) => (
      <div key={rec.article.id}>
        <h3>{rec.article.title}</h3>
        <p className="text-purple-700">{rec.reason}</p>
        <Button onClick={() => handleReadArticle(rec.article)}>
          Read Full Article →
        </Button>
      </div>
    ))}
  </div>
)}
```

## Example Scenarios

### Scenario 1: User with HIGH_UTILIZATION Persona

**User Data:**
```javascript
{
  id: 'user_123',
  personas: [
    { personaType: 'HIGH_UTILIZATION', priority: 1 }
  ],
  signals: {
    creditSignals: {
      cards: [
        { accountId: 'acc_1', limit: 5000, balance: 4000, utilization: 0.8 }
      ],
      averageUtilization: 0.8  // 80% utilization
    },
    subscriptionSignals: {
      totalRecurringCount: 3
    }
  }
}
```

**Expected Articles:**
- ✅ "Debt Payoff Strategies" (HIGH_UTILIZATION + 80% > 30% requirement)
- ✅ "How to Boost Your Credit Score" (HIGH_UTILIZATION + 80% > 30%)
- ✅ "Building an Emergency Fund" (universal - no strict requirements)

**What Actually Shows:** ❓ (This is what we need to debug)

### Scenario 2: User with SUBSCRIPTION_HEAVY Persona

**User Data:**
```javascript
{
  personas: [
    { personaType: 'SUBSCRIPTION_HEAVY', priority: 1 }
  ],
  signals: {
    subscriptionSignals: {
      totalRecurringCount: 8  // Has 8 subscriptions
    },
    creditSignals: {
      cards: [],
      averageUtilization: 0  // No credit cards
    }
  }
}
```

**Expected Articles:**
- ✅ "Subscription Audit Guide" (SUBSCRIPTION_HEAVY + 8 >= 5 requirement)
- ✅ "Building an Emergency Fund" (universal)

**Should NOT Show:**
- ❌ "Debt Payoff Strategies" (requires minCreditUtilization: 0.3, user has 0%)

## Potential Issues to Investigate

### Issue 1: Signal Data Missing or Malformed

Check if signals are properly calculated and saved:

```sql
-- In database
SELECT user_id, window, data->'creditSignals'->'averageUtilization' 
FROM signals 
WHERE window = '180d';
```

Possible problems:
- `signals.creditSignals.cards` is empty array
- `calculateAverageCreditUtilization()` returns 0 even when user has high usage
- Signal data structure doesn't match TypeScript interface

### Issue 2: Persona Assignment Not Working

Check if personas are properly assigned:

```sql
SELECT user_id, persona_type, priority 
FROM personas 
ORDER BY user_id, priority;
```

Possible problems:
- User has HIGH_UTILIZATION persona but signal data says 0% utilization (mismatch!)
- Personas assigned but not being fetched in the UI

### Issue 3: Filtering Logic Too Strict

Current logic:
```typescript
if (avgUtilization >= requiredSignals.minCreditUtilization) {
  score += 0.3;
} else {
  return 0; // COMPLETELY FILTERS OUT the article
}
```

Possible problem:
- If `avgUtilization` is even slightly below 0.3, article is completely hidden
- Maybe users with 0.29 (29%) should still see debt articles?

### Issue 4: Array/Object Access Errors

```typescript
// If this returns 0 incorrectly:
calculateAverageCreditUtilization(signals)

// Check:
console.log('Cards:', signals.creditSignals.cards);
console.log('Total limit:', totalLimit);
console.log('Total used:', totalUsed);
console.log('Utilization:', totalUsed / totalLimit);
```

### Issue 5: Article Configuration Wrong

Check `EDUCATION_ARTICLES` array:
- Are `recommendedFor` arrays correct?
- Are `requiredSignals` thresholds too high/low?
- Typos in persona names? ('HIGH_UTILIZATION' vs 'High_Utilization')

## What I Need You to Do

1. **Analyze the matching logic** in `lib/education/matching.ts`
   - Is the filtering too strict?
   - Are there edge cases that filter out valid matches?

2. **Check signal calculation** 
   - Does `calculateAverageCreditUtilization()` work correctly?
   - What if user has no credit cards but has HIGH_UTILIZATION persona?

3. **Review article requirements**
   - Are the thresholds realistic? (0.3 = 30% utilization)
   - Should some articles have no signal requirements?

4. **Identify the bug** causing HIGH_UTILIZATION users not to see debt articles

5. **Propose a fix** with code changes

## Files to Review

```
lib/
├── education/
│   └── matching.ts              ← Main matching logic
├── constants/
│   └── education-articles.ts    ← Article definitions
├── signals/
│   ├── index.ts                 ← Signal detection
│   └── credit.ts                ← Credit signal calculation
└── personas/
    └── assignment.ts            ← Persona assignment

types/
├── education.ts                 ← Article interfaces
└── signal.ts                    ← Signal interfaces

app/user/[userId]/page.tsx       ← Usage in UI
```

## Debug Checklist

- [ ] User has HIGH_UTILIZATION persona assigned
- [ ] User's signals show credit utilization >= 30%
- [ ] Article's `recommendedFor` includes 'HIGH_UTILIZATION'
- [ ] Article's `requiredSignals.minCreditUtilization` is 0.3 or less
- [ ] `calculateRelevanceScore()` is being called with correct parameters
- [ ] `calculateAverageCreditUtilization()` returns correct value
- [ ] No early return/filter statements blocking valid matches
- [ ] `recommendations` array contains the article after filtering
- [ ] UI is actually displaying the recommendations

## Expected Solution

The fix should ensure:
1. Users with HIGH_UTILIZATION persona see debt/credit articles
2. Users with 0% credit usage DON'T see debt/credit articles
3. Filtering is based on actual signal data, not just persona
4. Edge cases are handled (empty arrays, null values, etc.)

Please analyze the code and identify where the filtering is going wrong!

