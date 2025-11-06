import type { User, SignalResult, PersonaAssignment } from '@/types';
import type { EducationArticle, UserArticleRecommendation } from '@/types/education';
import { EDUCATION_ARTICLES } from '@/lib/constants/education-articles';

/**
 * Matches education articles to a user based on their persona and financial signals
 * Returns articles sorted by relevance score
 */
export function matchArticlesForUser(
  user: User,
  signals: SignalResult | null,
  personas: PersonaAssignment[]
): UserArticleRecommendation[] {
  if (!signals || personas.length === 0) {
    // Return generic beginner articles if no persona/signals
    return EDUCATION_ARTICLES
      .filter(article => article.difficulty === 'beginner')
      .slice(0, 4)
      .map(article => ({
        article,
        relevanceScore: 0.5,
        reason: 'Recommended for all users',
      }));
  }

  const recommendations: UserArticleRecommendation[] = [];
  const primaryPersona = personas[0];
  const personaTypes = personas.map(p => p.personaType);

  for (const article of EDUCATION_ARTICLES) {
    const score = calculateRelevanceScore(article, personaTypes, signals);
    
    if (score > 0) {
      const reason = generateRecommendationReason(article, primaryPersona.personaType, signals);
      recommendations.push({
        article,
        relevanceScore: score,
        reason,
      });
    }
  }

  // Sort by relevance score, highest first
  recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return recommendations;
}

/**
 * Calculates how relevant an article is to a user
 * Returns a score from 0 (not relevant) to 1 (highly relevant)
 */
function calculateRelevanceScore(
  article: EducationArticle,
  userPersonas: string[],
  signals: SignalResult
): number {
  let score = 0;

  // Base score: Does user's persona match article's recommended personas?
  const hasMatchingPersona = article.recommendedFor.some(persona => 
    userPersonas.includes(persona)
  );
  
  if (!hasMatchingPersona) {
    return 0; // Not relevant if persona doesn't match
  }

  score += 0.5; // Base score for persona match

  // Bonus points for matching specific signals
  if (article.requiredSignals) {
    const { requiredSignals } = article;

    // Credit utilization signals
    if (requiredSignals.minCreditUtilization !== undefined) {
      const avgUtilization = calculateAverageCreditUtilization(signals);
      if (avgUtilization >= requiredSignals.minCreditUtilization) {
        score += 0.2;
      }
    }

    if (requiredSignals.maxCreditUtilization !== undefined) {
      const avgUtilization = calculateAverageCreditUtilization(signals);
      if (avgUtilization <= requiredSignals.maxCreditUtilization) {
        score += 0.2;
      }
    }

    // Subscription signals
    if (requiredSignals.hasSubscriptions && signals.subscriptionSignals.totalRecurringCount >= 5) {
      score += 0.15;
    }

    // Savings signals
    if (requiredSignals.hasSavings && signals.savingsSignals.currentSavingsBalance > 1000) {
      score += 0.15;
    }

    // Income signals
    if (requiredSignals.hasVariableIncome && !signals.incomeSignals.hasPayrollPattern) {
      score += 0.2;
    }

    if (requiredSignals.maxIncome !== undefined) {
      const annualIncome = signals.incomeSignals.estimatedAnnualIncome;
      if (annualIncome <= requiredSignals.maxIncome) {
        score += 0.15;
      }
    }
  }

  return Math.min(score, 1); // Cap at 1.0
}

/**
 * Generates a human-readable reason for why this article is recommended
 */
function generateRecommendationReason(
  article: EducationArticle,
  primaryPersona: string,
  signals: SignalResult
): string {
  const reasons: string[] = [];

  // Persona-based reasons
  if (primaryPersona === 'HIGH_UTILIZATION') {
    if (article.category === 'debt_payoff') {
      reasons.push('Your credit utilization could benefit from a structured payoff plan');
    } else if (article.category === 'credit_management') {
      reasons.push('Learn strategies to improve your credit score');
    }
  } else if (primaryPersona === 'SAVINGS_BUILDER') {
    if (article.category === 'investing') {
      reasons.push('You\'re building savings—time to make that money grow');
    } else if (article.category === 'emergency_fund') {
      reasons.push('Build a stronger financial foundation');
    }
  } else if (primaryPersona === 'SUBSCRIPTION_HEAVY') {
    if (article.category === 'subscriptions') {
      const count = signals.subscriptionSignals.totalRecurringCount;
      reasons.push(`You have ${count} recurring subscriptions—find hidden savings`);
    }
  } else if (primaryPersona === 'VARIABLE_INCOME_BUDGETER') {
    if (article.category === 'budgeting') {
      reasons.push('Master budgeting strategies designed for variable income');
    } else if (article.category === 'emergency_fund') {
      reasons.push('Variable income makes emergency funds even more critical');
    }
  } else if (primaryPersona === 'LOW_INCOME_STABILIZER') {
    if (article.category === 'emergency_fund') {
      reasons.push('Build financial stability on any budget');
    }
  }

  // Signal-based reasons
  if (signals.creditSignals.cards.length > 0) {
    const avgUtil = calculateAverageCreditUtilization(signals);
    if (avgUtil > 0.7 && article.category === 'debt_payoff') {
      reasons.push('High credit utilization detected');
    }
  }

  if (signals.savingsSignals.currentSavingsBalance > 5000 && article.category === 'investing') {
    reasons.push('Your savings are ready for the next level');
  }

  return reasons[0] || 'Recommended based on your financial profile';
}

/**
 * Helper: Calculate average credit utilization across all cards
 */
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

/**
 * Get top N article recommendations for a user
 */
export function getTopArticles(
  user: User,
  signals: SignalResult | null,
  personas: PersonaAssignment[],
  count: number = 6
): EducationArticle[] {
  const recommendations = matchArticlesForUser(user, signals, personas);
  return recommendations.slice(0, count).map(rec => rec.article);
}

/**
 * Get article recommendations with reasons (for display)
 */
export function getArticleRecommendationsWithReasons(
  user: User,
  signals: SignalResult | null,
  personas: PersonaAssignment[],
  count: number = 6
): UserArticleRecommendation[] {
  const recommendations = matchArticlesForUser(user, signals, personas);
  return recommendations.slice(0, count);
}

