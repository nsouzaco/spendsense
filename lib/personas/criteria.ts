import type { SignalResult, PersonaCriteria, PersonaType } from '@/types';
import {
  CREDIT_THRESHOLDS,
  INCOME_THRESHOLDS,
  SUBSCRIPTION_THRESHOLDS,
  SAVINGS_THRESHOLDS,
} from '@/lib/constants/signals';
import { PERSONA_NAMES, PERSONA_DESCRIPTIONS, PERSONA_FOCUS, PERSONA_PRIORITY } from '@/lib/constants/personas';

// High Utilization Persona
const highUtilizationCriteria: PersonaCriteria = {
  personaType: 'HIGH_UTILIZATION',
  name: PERSONA_NAMES.HIGH_UTILIZATION,
  description: PERSONA_DESCRIPTIONS.HIGH_UTILIZATION,
  focus: PERSONA_FOCUS.HIGH_UTILIZATION,
  priority: PERSONA_PRIORITY.HIGH_UTILIZATION,
  
  checkCriteria: (signals: SignalResult) => {
    const { creditSignals } = signals;
    
    // Must have at least one credit card
    if (creditSignals.cards.length === 0) return false;
    
    // Any credit card with utilization ≥70% (raised from 50%)
    const hasHighUtilization = creditSignals.cards.some(
      card => card.utilization >= 0.70
    );
    
    // High interest charges (> $50/month, not just any amount)
    const hasHighInterestCharges = creditSignals.totalInterestCharges > 50;
    
    // Minimum-payment-only behavior
    const hasMinimumPaymentOnly = creditSignals.hasMinimumPaymentOnly;
    
    // Overdue status
    const hasOverdue = creditSignals.hasOverdue;
    
    // Require EITHER very high utilization OR multiple bad behaviors
    return hasHighUtilization || (hasMinimumPaymentOnly && hasHighInterestCharges) || hasOverdue;
  },
  
  generateRationale: (signals: SignalResult) => {
    const { creditSignals } = signals;
    const matchedCriteria: string[] = [];
    let rationale = '';
    
    const highUtilCards = creditSignals.cards.filter(c => c.utilization >= CREDIT_THRESHOLDS.MEDIUM);
    
    if (highUtilCards.length > 0) {
      const card = highUtilCards[0];
      matchedCriteria.push(`Credit card utilization of ${Math.round(card.utilization * 100)}%`);
      rationale += `Your card ending in ${card.cardMask} has ${Math.round(card.utilization * 100)}% utilization ($${card.balance.toFixed(2)} of $${card.limit.toFixed(2)} limit). `;
    }
    
    if (creditSignals.totalInterestCharges > 0) {
      matchedCriteria.push('Interest charges detected');
      rationale += `You're paying approximately $${creditSignals.totalInterestCharges.toFixed(2)} per month in interest. `;
    }
    
    if (creditSignals.hasMinimumPaymentOnly) {
      matchedCriteria.push('Minimum payment only behavior');
      rationale += 'Recent payments suggest you may be making minimum payments only. ';
    }
    
    if (creditSignals.hasOverdue) {
      matchedCriteria.push('Overdue payment status');
      rationale += 'You have at least one overdue payment. ';
    }
    
    rationale += 'Reducing credit utilization and managing payments can improve your financial health and credit score.';
    
    return { rationale, matchedCriteria };
  },
};

// Variable Income Budgeter Persona
const variableIncomeBudgeterCriteria: PersonaCriteria = {
  personaType: 'VARIABLE_INCOME_BUDGETER',
  name: PERSONA_NAMES.VARIABLE_INCOME_BUDGETER,
  description: PERSONA_DESCRIPTIONS.VARIABLE_INCOME_BUDGETER,
  focus: PERSONA_FOCUS.VARIABLE_INCOME_BUDGETER,
  priority: PERSONA_PRIORITY.VARIABLE_INCOME_BUDGETER,
  
  checkCriteria: (signals: SignalResult) => {
    const { incomeSignals } = signals;
    
    // High income variability (>25%) OR has income gaps
    const highVariability = incomeSignals.paymentVariability > 0.25;
    const hasIncomeGap = incomeSignals.hasIncomeGap;
    
    return highVariability || hasIncomeGap;
  },
  
  generateRationale: (signals: SignalResult) => {
    const { incomeSignals } = signals;
    const matchedCriteria: string[] = [];
    
    matchedCriteria.push(`Income gap of ${incomeSignals.longestGapDays} days`);
    matchedCriteria.push(`Cash flow buffer: ${incomeSignals.cashFlowBuffer.toFixed(2)} months`);
    
    const rationale = `Your income pattern shows irregular payments with gaps up to ${incomeSignals.longestGapDays} days, and your current cash flow buffer is ${incomeSignals.cashFlowBuffer.toFixed(2)} months. Variable income requires specialized budgeting strategies to smooth out cash flow and build financial stability.`;
    
    return { rationale, matchedCriteria };
  },
};

// Subscription-Heavy Persona
const subscriptionHeavyCriteria: PersonaCriteria = {
  personaType: 'SUBSCRIPTION_HEAVY',
  name: PERSONA_NAMES.SUBSCRIPTION_HEAVY,
  description: PERSONA_DESCRIPTIONS.SUBSCRIPTION_HEAVY,
  focus: PERSONA_FOCUS.SUBSCRIPTION_HEAVY,
  priority: PERSONA_PRIORITY.SUBSCRIPTION_HEAVY,
  
  checkCriteria: (signals: SignalResult) => {
    const { subscriptionSignals } = signals;
    const window = signals.window;
    
    // Recurring merchants ≥3
    const hasEnoughSubscriptions = subscriptionSignals.totalRecurringCount >= SUBSCRIPTION_THRESHOLDS.MIN_OCCURRENCES;
    
    // AND (monthly recurring spend ≥$50 in 30d OR subscription share ≥10%)
    const highSpend = window === '30d'
      ? subscriptionSignals.monthlyRecurringSpend >= SUBSCRIPTION_THRESHOLDS.MIN_MONTHLY_SPEND
      : true; // Don't check for 180d window
    
    const highShare = subscriptionSignals.subscriptionShare >= SUBSCRIPTION_THRESHOLDS.MIN_SHARE_PERCENTAGE;
    
    return hasEnoughSubscriptions && (highSpend || highShare);
  },
  
  generateRationale: (signals: SignalResult) => {
    const { subscriptionSignals } = signals;
    const matchedCriteria: string[] = [];
    
    matchedCriteria.push(`${subscriptionSignals.totalRecurringCount} recurring subscriptions`);
    matchedCriteria.push(`$${subscriptionSignals.monthlyRecurringSpend.toFixed(2)} monthly recurring spend`);
    matchedCriteria.push(`${subscriptionSignals.subscriptionShare.toFixed(1)}% of total spending`);
    
    const topSubs = subscriptionSignals.recurringMerchants
      .sort((a, b) => b.averageAmount - a.averageAmount)
      .slice(0, 3)
      .map(s => `${s.merchantName} ($${s.averageAmount.toFixed(2)}/${s.cadence})`)
      .join(', ');
    
    const rationale = `You have ${subscriptionSignals.totalRecurringCount} recurring subscriptions totaling $${subscriptionSignals.monthlyRecurringSpend.toFixed(2)} per month (${subscriptionSignals.subscriptionShare.toFixed(1)}% of your spending). Top subscriptions: ${topSubs}. Auditing and managing subscriptions can free up significant monthly cash flow.`;
    
    return { rationale, matchedCriteria };
  },
};

// Savings Builder Persona
const savingsBuilderCriteria: PersonaCriteria = {
  personaType: 'SAVINGS_BUILDER',
  name: PERSONA_NAMES.SAVINGS_BUILDER,
  description: PERSONA_DESCRIPTIONS.SAVINGS_BUILDER,
  focus: PERSONA_FOCUS.SAVINGS_BUILDER,
  priority: PERSONA_PRIORITY.SAVINGS_BUILDER,
  
  checkCriteria: (signals: SignalResult) => {
    const { savingsSignals, creditSignals } = signals;
    
    // Has savings balance > $5000 OR growing at good rate
    const hasSavings = savingsSignals.currentSavingsBalance > 5000;
    const monthlyInflow = (savingsSignals.netInflow / (signals.window === '30d' ? 30 : 180)) * 30;
    const goodGrowth = savingsSignals.growthRate >= SAVINGS_THRESHOLDS.MIN_GROWTH_RATE;
    const goodInflow = monthlyInflow >= SAVINGS_THRESHOLDS.MIN_MONTHLY_INFLOW;
    
    // AND all credit card utilizations < 40%
    const lowUtilization = creditSignals.cards.length === 0 ||
      creditSignals.cards.every(card => card.utilization < 0.40);
    
    return (hasSavings || goodGrowth || goodInflow) && lowUtilization;
  },
  
  generateRationale: (signals: SignalResult) => {
    const { savingsSignals } = signals;
    const matchedCriteria: string[] = [];
    
    if (savingsSignals.growthRate >= SAVINGS_THRESHOLDS.MIN_GROWTH_RATE) {
      matchedCriteria.push(`${savingsSignals.growthRate.toFixed(1)}% savings growth rate`);
    }
    
    const monthlyInflow = (savingsSignals.netInflow / (signals.window === '30d' ? 30 : 180)) * 30;
    if (monthlyInflow >= SAVINGS_THRESHOLDS.MIN_MONTHLY_INFLOW) {
      matchedCriteria.push(`$${monthlyInflow.toFixed(2)} average monthly savings`);
    }
    
    matchedCriteria.push('Low credit utilization');
    
    const rationale = `You're actively building savings with a current balance of $${savingsSignals.currentSavingsBalance.toFixed(2)} and ${savingsSignals.emergencyFundCoverage.toFixed(1)} months of emergency fund coverage. Your credit utilization is well-managed. You're in a strong position to optimize your savings strategy with higher-yield options and automated saving.`;
    
    return { rationale, matchedCriteria };
  },
};

// Low Income Stabilizer Persona
const lowIncomeStabilizerCriteria: PersonaCriteria = {
  personaType: 'LOW_INCOME_STABILIZER',
  name: PERSONA_NAMES.LOW_INCOME_STABILIZER,
  description: PERSONA_DESCRIPTIONS.LOW_INCOME_STABILIZER,
  focus: PERSONA_FOCUS.LOW_INCOME_STABILIZER,
  priority: PERSONA_PRIORITY.LOW_INCOME_STABILIZER,
  
  checkCriteria: (signals: SignalResult) => {
    const { incomeSignals } = signals;
    
    // Annual income < $30,000 OR average monthly income < $2,500
    const monthlyIncome = incomeSignals.estimatedAnnualIncome / 12;
    
    return incomeSignals.estimatedAnnualIncome < INCOME_THRESHOLDS.LOW_INCOME_ANNUAL ||
           monthlyIncome < INCOME_THRESHOLDS.LOW_INCOME_MONTHLY;
  },
  
  generateRationale: (signals: SignalResult) => {
    const { incomeSignals } = signals;
    const matchedCriteria: string[] = [];
    
    const monthlyIncome = incomeSignals.estimatedAnnualIncome / 12;
    
    matchedCriteria.push(`Estimated annual income: $${incomeSignals.estimatedAnnualIncome.toFixed(0)}`);
    matchedCriteria.push(`Average monthly income: $${monthlyIncome.toFixed(0)}`);
    
    const rationale = `With an estimated annual income of $${incomeSignals.estimatedAnnualIncome.toFixed(0)} ($${monthlyIncome.toFixed(0)}/month), strategic budgeting and financial management are crucial. Micro-budgeting techniques, building emergency savings on a limited income, and awareness of assistance programs can help maximize your financial stability and progress.`;
    
    return { rationale, matchedCriteria };
  },
};

// Export all criteria
export const PERSONA_CRITERIA: PersonaCriteria[] = [
  highUtilizationCriteria,
  variableIncomeBudgeterCriteria,
  subscriptionHeavyCriteria,
  savingsBuilderCriteria,
  lowIncomeStabilizerCriteria,
];

