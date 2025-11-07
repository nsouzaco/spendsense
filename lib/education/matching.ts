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
    const SAFE_CATEGORIES = new Set(['emergency_fund', 'budgeting']);
    return EDUCATION_ARTICLES
      .filter(article => SAFE_CATEGORIES.has(article.category))
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

  // ✅ Treat empty/undefined recommendedFor as universal
  const isUniversal = !article.recommendedFor || article.recommendedFor.length === 0;

  const hasMatchingPersona = isUniversal
    ? true
    : article.recommendedFor.some(persona => userPersonas.includes(persona));

  if (!hasMatchingPersona) {
    // ❗ Don't hide universal content; hide only persona-targeted content that doesn't match
    return 0;
  }

  // Base score for persona match (or universal)
  score += isUniversal ? 0.3 : 0.5;

  // Step 2: Check required signals via a robust helper
  if (article.requiredSignals) {
    if (!meetsRequiredSignals(article.requiredSignals, signals)) {
      // Hard gate ONLY when the article explicitly requires those signals
      return 0;
    }
    // If meets requirements, add weight
    score += 0.3;
  }

  return Math.min(score, 1); // Cap at 1.0
}

/**
 * Check if user meets all required signals for an article
 * Returns true only if ALL requirements are met
 */
function meetsRequiredSignals(
  requiredSignals: NonNullable<EducationArticle['requiredSignals']>,
  signals: SignalResult
): boolean {
  // Credit utilization gate
  if (typeof requiredSignals.minCreditUtilization === 'number') {
    const utilization = getUserCreditUtilization(signals);
    if (!(utilization >= requiredSignals.minCreditUtilization)) {
      return false;
    }
  }

  if (typeof requiredSignals.maxCreditUtilization === 'number') {
    const utilization = getUserCreditUtilization(signals);
    if (!(utilization <= requiredSignals.maxCreditUtilization)) {
      return false;
    }
  }

  // Subscriptions gate
  if (requiredSignals.hasSubscriptions === true) {
    const count = signals?.subscriptionSignals?.totalRecurringCount ?? 0;
    if (!(count > 0)) {
      return false;
    }
  }

  // Variable income gate
  if (requiredSignals.hasVariableIncome === true) {
    const hasPayroll = signals?.incomeSignals?.hasPayrollPattern ?? false;
    // Variable income = no steady payroll pattern
    if (hasPayroll) {
      return false;
    }
  }

  // Savings gate
  if (requiredSignals.hasSavings === true) {
    const balance = signals?.savingsSignals?.currentSavingsBalance ?? 0;
    if (!(balance > 0)) {
      return false;
    }
  }

  // Income gate
  if (typeof requiredSignals.maxIncome === 'number') {
    const annualIncome = signals?.incomeSignals?.estimatedAnnualIncome ?? Infinity;
    if (!(annualIncome <= requiredSignals.maxIncome)) {
      return false;
    }
  }

  return true;
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
  const avgUtil = getUserCreditUtilization(signals);
  if (avgUtil > 0.7 && article.category === 'debt_payoff') {
    reasons.push('High credit utilization detected');
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
  // Use the same robust signal checking
  if (article.requiredSignals) {
    if (!meetsRequiredSignals(article.requiredSignals, signals)) {
      return 0; // Hard gate - user doesn't meet requirements
    }
    return 0.7; // Strong relevance if requirements are met
  }
  
  // No required signals - article is universally relevant
  return 0.5;
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
    const avgUtil = getUserCreditUtilization(signals);
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
 * Get user's credit utilization - robust calculation
 * Prefers persisted averageUtilization if valid, otherwise computes from cards
 */
function getUserCreditUtilization(signals: SignalResult): number {
  // First, try to use the persisted average from signals
  const avg = signals?.creditSignals?.averageUtilization;
  if (typeof avg === 'number' && Number.isFinite(avg) && avg >= 0) {
    return avg; // e.g., 0.8 for 80% utilization
  }

  // Fallback: calculate from individual cards
  const cards = signals?.creditSignals?.cards || [];
  if (!Array.isArray(cards) || cards.length === 0) {
    return 0;
  }

  let totalLimit = 0;
  let totalUsed = 0;

  for (const card of cards) {
    const limit = Number(card?.limit) || 0;
    const balance = Number(card?.balance) || 0;
    totalLimit += limit;
    totalUsed += balance;
  }

  return totalLimit > 0 ? totalUsed / totalLimit : 0;
}

/**
 * @deprecated Use getUserCreditUtilization instead
 */
function calculateAverageCreditUtilization(signals: SignalResult): number {
  return getUserCreditUtilization(signals);
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

