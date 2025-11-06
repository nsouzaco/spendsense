import type { PersonaAssignment, SignalResult } from '@/types';
import { PERSONA_CRITERIA } from './criteria';

export function assignPersonas(
  userId: string,
  signals: SignalResult
): PersonaAssignment[] {
  const assignments: PersonaAssignment[] = [];
  
  // Check each persona criteria
  for (const criteria of PERSONA_CRITERIA) {
    if (criteria.checkCriteria(signals)) {
      const { rationale, matchedCriteria } = criteria.generateRationale(signals);
      
      assignments.push({
        userId,
        personaType: criteria.personaType,
        assignedAt: new Date().toISOString(),
        rationale,
        matchedCriteria,
        priority: criteria.priority,
      });
    }
  }
  
  // Sort by priority (lower number = higher priority)
  assignments.sort((a, b) => a.priority - b.priority);
  
  // FALLBACK: If no personas matched, find the most appropriate one
  if (assignments.length === 0) {
    // Determine fallback based on available data
    const { creditSignals, savingsSignals, incomeSignals, subscriptionSignals } = signals;
    
    // Priority order for fallback assignment:
    // 1. If has credit cards with moderate usage (40-70%) → HIGH_UTILIZATION
    if (creditSignals.cards.length > 0 && creditSignals.averageUtilization >= 0.40) {
      assignments.push({
        userId,
        personaType: 'HIGH_UTILIZATION',
        assignedAt: new Date().toISOString(),
        rationale: `Credit card utilization at ${Math.round(creditSignals.averageUtilization * 100)}% suggests focus on credit management.`,
        matchedCriteria: [`Average utilization: ${Math.round(creditSignals.averageUtilization * 100)}%`],
        priority: 1,
      });
    }
    // 2. If has subscriptions → SUBSCRIPTION_HEAVY
    else if (subscriptionSignals.totalRecurringCount >= 2) {
      assignments.push({
        userId,
        personaType: 'SUBSCRIPTION_HEAVY',
        assignedAt: new Date().toISOString(),
        rationale: `${subscriptionSignals.totalRecurringCount} recurring subscriptions detected, totaling $${subscriptionSignals.monthlyRecurringSpend.toFixed(2)}/month.`,
        matchedCriteria: [`${subscriptionSignals.totalRecurringCount} active subscriptions`],
        priority: 3,
      });
    }
    // 3. If has decent savings → SAVINGS_BUILDER
    else if (savingsSignals.currentSavingsBalance > 1000) {
      assignments.push({
        userId,
        personaType: 'SAVINGS_BUILDER',
        assignedAt: new Date().toISOString(),
        rationale: `Savings balance of $${savingsSignals.currentSavingsBalance.toFixed(2)} shows positive financial habits.`,
        matchedCriteria: [`Savings balance: $${savingsSignals.currentSavingsBalance.toFixed(2)}`],
        priority: 4,
      });
    }
    // 4. If moderate income → VARIABLE_INCOME_BUDGETER (default)
    else {
      assignments.push({
        userId,
        personaType: 'VARIABLE_INCOME_BUDGETER',
        assignedAt: new Date().toISOString(),
        rationale: `Financial profile suggests focus on budgeting and cash flow management. Estimated annual income: $${incomeSignals.estimatedAnnualIncome.toFixed(0)}.`,
        matchedCriteria: [`Income tracking and budgeting focus`],
        priority: 2,
      });
    }
  }
  
  return assignments;
}

export function getPrimaryPersona(assignments: PersonaAssignment[]): PersonaAssignment | null {
  if (assignments.length === 0) return null;
  
  // Return highest priority persona (already sorted)
  return assignments[0];
}

export * from './criteria';

