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
  // If we have signals but no personas, match based on signals alone
  if (!signals) {
    // No data at all - show universal beginner content
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

  for (const article of EDUCATION_ARTICLES) {
    // Calculate relevance based on signals and personas (if available)
    const score = hasPersonas 
      ? calculateRelevanceScore(article, personaTypes, signals)
      : calculateSignalBasedRelevance(article, signals);
    
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
 * Calculate relevance based purely on signals (when no persona is assigned)
 */
function calculateSignalBasedRelevance(
  article: EducationArticle,
  signals: SignalResult
): number {
  let score = 0;

  // Check if article's required signals match user's actual signals
  if (article.requiredSignals) {
    const { requiredSignals } = article;

    // Credit utilization check
    if (requiredSignals.minCreditUtilization !== undefined || requiredSignals.maxCreditUtilization !== undefined) {
      const avgUtilization = calculateAverageCreditUtilization(signals);
      
      // Only match if user meets the criteria
      if (requiredSignals.minCreditUtilization !== undefined) {
        if (avgUtilization >= requiredSignals.minCreditUtilization) {
          score += 0.6; // Strong match
        } else {
          return 0; // User doesn't have this issue - don't recommend
        }
      }
      
      if (requiredSignals.maxCreditUtilization !== undefined) {
        if (avgUtilization <= requiredSignals.maxCreditUtilization) {
          score += 0.4;
        }
      }
    }

    // Subscription check
    if (requiredSignals.hasSubscriptions !== undefined) {
      const hasMany = signals.subscriptionSignals.totalRecurringCount >= 5;
      if (requiredSignals.hasSubscriptions && hasMany) {
        score += 0.6;
      } else if (requiredSignals.hasSubscriptions && !hasMany) {
        return 0; // User doesn't have many subscriptions
      }
    }

    // Savings check
    if (requiredSignals.hasSavings !== undefined) {
      const hasSavings = signals.savingsSignals.currentSavingsBalance > 1000;
      if (requiredSignals.hasSavings && hasSavings) {
        score += 0.5;
      } else if (requiredSignals.hasSavings && !hasSavings) {
        // Still show but lower score
        score += 0.2;
      }
    }

    // Variable income check
    if (requiredSignals.hasVariableIncome !== undefined) {
      const hasVariable = !signals.incomeSignals.hasPayrollPattern;
      if (requiredSignals.hasVariableIncome && hasVariable) {
        score += 0.6;
      } else if (requiredSignals.hasVariableIncome && !hasVariable) {
        return 0; // User has steady income
      }
    }

    // Income check
    if (requiredSignals.maxIncome !== undefined) {
      const annualIncome = signals.incomeSignals.estimatedAnnualIncome;
      if (annualIncome <= requiredSignals.maxIncome) {
        score += 0.4;
      }
    }
  } else {
    // No required signals - article is universally relevant
    score = 0.5;
  }

  return Math.min(score, 1);
}

/**
 * Generate reason based on signals alone (no persona)
 */
function generateSignalBasedReason(
  article: EducationArticle,
  signals: SignalResult
): string {
  // Emergency fund articles
  if (article.category === 'emergency_fund') {
    const months = signals.savingsSignals.emergencyFundCoverage;
    if (months < 3) {
      return `You have ${months.toFixed(1)} months of emergency savings - build your safety net`;
    }
    return 'Strengthen your financial foundation';
  }

  // Debt/credit articles
  if (article.category === 'debt_payoff' || article.category === 'credit_management') {
    const avgUtil = calculateAverageCreditUtilization(signals);
    if (avgUtil > 0.3) {
      return `Your credit utilization is ${(avgUtil * 100).toFixed(0)}% - reduce it to improve your score`;
    }
    return 'Learn credit management best practices';
  }

  // Subscription articles
  if (article.category === 'subscriptions') {
    const count = signals.subscriptionSignals.totalRecurringCount;
    if (count >= 5) {
      return `You have ${count} recurring subscriptions - find potential savings`;
    }
    return 'Manage your recurring expenses effectively';
  }

  // Budgeting articles
  if (article.category === 'budgeting') {
    if (!signals.incomeSignals.hasPayrollPattern) {
      return 'Variable income requires special budgeting strategies';
    }
    return 'Master your monthly budget';
  }

  // Investing articles
  if (article.category === 'investing') {
    if (signals.savingsSignals.currentSavingsBalance > 5000) {
      return 'Your savings are ready to start growing';
    }
    return 'Learn the basics of investing';
  }

  return 'Recommended based on your financial profile';
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

