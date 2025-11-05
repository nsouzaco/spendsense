import type { RecommendationTemplate, User, SignalResult, PersonaType } from '@/types';

// High Utilization Templates
const highUtilizationTemplates: RecommendationTemplate[] = [
  {
    id: 'hu_1',
    personaType: 'HIGH_UTILIZATION',
    category: 'Credit Management',
    title: 'Reduce Credit Card Utilization',
    descriptionTemplate: 'Lower your credit utilization to improve your credit score and reduce interest charges.',
    priority: 1,
    
    eligibilityCriteria: (user, signals) => {
      return signals.creditSignals.highestUtilization >= 0.5;
    },
    
    generateRationale: (user, signals) => {
      const highCard = signals.creditSignals.cards
        .sort((a, b) => b.utilization - a.utilization)[0];
      
      return `Your credit card ending in ${highCard.cardMask} has ${Math.round(highCard.utilization * 100)}% utilization ($${highCard.balance.toFixed(2)} of $${highCard.limit.toFixed(2)}). High utilization negatively impacts your credit score and increases interest costs. Aim to bring utilization below 30%.`;
    },
    
    generateActionItems: (user, signals) => {
      const highCard = signals.creditSignals.cards
        .sort((a, b) => b.utilization - a.utilization)[0];
      const targetBalance = highCard.limit * 0.3;
      const paydownAmount = highCard.balance - targetBalance;
      
      return [
        `Pay down $${paydownAmount.toFixed(2)} to reach 30% utilization`,
        'Consider making multiple payments per month to keep utilization low',
        'Set up automatic payments to avoid missed payments',
        'Track your utilization weekly using your card issuer\'s app',
      ];
    },
    
    matchPartnerOffers: (user, signals) => [],
  },
  {
    id: 'hu_2',
    personaType: 'HIGH_UTILIZATION',
    category: 'Payment Strategy',
    title: 'Move Beyond Minimum Payments',
    descriptionTemplate: 'Increase your payment amounts to reduce principal and save on interest.',
    priority: 2,
    
    eligibilityCriteria: (user, signals) => {
      return signals.creditSignals.hasMinimumPaymentOnly;
    },
    
    generateRationale: (user, signals) => {
      return `You\'re paying approximately $${signals.creditSignals.totalInterestCharges.toFixed(2)} per month in interest. By paying more than the minimum, you can reduce the principal balance faster and save significantly on interest charges over time.`;
    },
    
    generateActionItems: (user, signals) => {
      const extraPayment = Math.max(50, signals.creditSignals.totalInterestCharges * 2);
      return [
        `Try to pay an extra $${extraPayment.toFixed(2)} above the minimum each month`,
        'Use the avalanche method: focus extra payments on the highest APR card first',
        'Set up bi-weekly payments to make 13 months of payments per year',
        'Round up payments (e.g., pay $100 instead of $85.50)',
      ];
    },
    
    matchPartnerOffers: (user, signals) => [],
  },
];

// Variable Income Budgeter Templates
const variableIncomeTemplates: RecommendationTemplate[] = [
  {
    id: 'vib_1',
    personaType: 'VARIABLE_INCOME_BUDGETER',
    category: 'Income Smoothing',
    title: 'Build a Cash Flow Buffer',
    descriptionTemplate: 'Create a buffer account to smooth out irregular income.',
    priority: 1,
    
    eligibilityCriteria: (user, signals) => {
      return signals.incomeSignals.hasIncomeGap;
    },
    
    generateRationale: (user, signals) => {
      return `Your income shows gaps of up to ${signals.incomeSignals.longestGapDays} days with a cash flow buffer of only ${signals.incomeSignals.cashFlowBuffer.toFixed(1)} months. Building a buffer helps you handle irregular income without stress.`;
    },
    
    generateActionItems: (user, signals) => {
      const monthlyExpenses = signals.savingsSignals.averageMonthlyExpenses;
      const targetBuffer = monthlyExpenses * 1.5;
      
      return [
        `Build a buffer of $${targetBuffer.toFixed(2)} (1.5 months of expenses)`,
        'Deposit all income into the buffer account first',
        'Pay yourself a consistent "salary" from the buffer each week',
        'During high-income months, build the buffer; during low months, draw from it',
      ];
    },
    
    matchPartnerOffers: (user, signals) => [],
  },
  {
    id: 'vib_2',
    personaType: 'VARIABLE_INCOME_BUDGETER',
    category: 'Budgeting Strategy',
    title: 'Use Percent-Based Budgeting',
    descriptionTemplate: 'Budget based on percentages rather than fixed dollar amounts.',
    priority: 2,
    
    eligibilityCriteria: (user, signals) => {
      return signals.incomeSignals.paymentVariability > 0.2;
    },
    
    generateRationale: (user, signals) => {
      return `With variable income (${Math.round(signals.incomeSignals.paymentVariability * 100)}% variability), percent-based budgeting adapts automatically to your income fluctuations.`;
    },
    
    generateActionItems: (user, signals) => {
      return [
        'Allocate 50% of each payment to needs (housing, food, utilities)',
        'Allocate 20% to savings and debt paydown',
        'Allocate 30% to wants and discretionary spending',
        'Adjust percentages during lean months (e.g., 60% needs, 10% savings, 30% wants)',
      ];
    },
    
    matchPartnerOffers: (user, signals) => [],
  },
];

// Subscription-Heavy Templates
const subscriptionHeavyTemplates: RecommendationTemplate[] = [
  {
    id: 'sh_1',
    personaType: 'SUBSCRIPTION_HEAVY',
    category: 'Subscription Audit',
    title: 'Audit Your Subscriptions',
    descriptionTemplate: 'Review all recurring subscriptions and cancel unused services.',
    priority: 1,
    
    eligibilityCriteria: (user, signals) => {
      return signals.subscriptionSignals.totalRecurringCount >= 3;
    },
    
    generateRationale: (user, signals) => {
      const topSubs = signals.subscriptionSignals.recurringMerchants
        .sort((a, b) => b.averageAmount - a.averageAmount)
        .slice(0, 3);
      
      return `You have ${signals.subscriptionSignals.totalRecurringCount} subscriptions totaling $${signals.subscriptionSignals.monthlyRecurringSpend.toFixed(2)}/month. Top subscriptions: ${topSubs.map(s => s.merchantName).join(', ')}. Many people have subscriptions they rarely use.`;
    },
    
    generateActionItems: (user, signals) => {
      return [
        'List all subscriptions with renewal dates',
        'For each subscription, ask: "Have I used this in the last month?"',
        'Cancel subscriptions you haven\'t used recently',
        'Negotiate annual plans for subscriptions you keep (often 20-30% savings)',
        'Set calendar reminders 1 week before annual renewals',
      ];
    },
    
    matchPartnerOffers: (user, signals) => [],
  },
];

// Savings Builder Templates
const savingsBuilderTemplates: RecommendationTemplate[] = [
  {
    id: 'sb_1',
    personaType: 'SAVINGS_BUILDER',
    category: 'Savings Optimization',
    title: 'Maximize Your Savings APY',
    descriptionTemplate: 'Move savings to high-yield accounts for better returns.',
    priority: 1,
    
    eligibilityCriteria: (user, signals) => {
      return signals.savingsSignals.currentSavingsBalance > 1000;
    },
    
    generateRationale: (user, signals) => {
      const currentBalance = signals.savingsSignals.currentSavingsBalance;
      const lowAPY = 0.01; // 0.01%
      const highAPY = 0.045; // 4.5%
      const annualDifference = currentBalance * (highAPY - lowAPY);
      
      return `With $${currentBalance.toFixed(2)} in savings, switching from a traditional savings account (0.01% APY) to a high-yield savings account (4.5% APY) could earn you an extra $${annualDifference.toFixed(2)} per year.`;
    },
    
    generateActionItems: (user, signals) => {
      return [
        'Research FDIC-insured high-yield savings accounts (current rates 4-5%)',
        'Compare fees, minimum balances, and withdrawal limits',
        'Open the new account and initiate transfer',
        'Consider CD laddering for funds you won\'t need for 6-12 months',
      ];
    },
    
    matchPartnerOffers: (user, signals) => [],
  },
];

// Low Income Stabilizer Templates
const lowIncomeTemplates: RecommendationTemplate[] = [
  {
    id: 'lis_1',
    personaType: 'LOW_INCOME_STABILIZER',
    category: 'Micro-Budgeting',
    title: 'Build Micro-Emergency Fund',
    descriptionTemplate: 'Start with a small, achievable emergency fund goal.',
    priority: 1,
    
    eligibilityCriteria: (user, signals) => {
      return signals.savingsSignals.emergencyFundCoverage < 0.5;
    },
    
    generateRationale: (user, signals) => {
      return `Your current emergency fund covers ${signals.savingsSignals.emergencyFundCoverage.toFixed(1)} months of expenses. Even a small emergency fund of $500-$1000 can prevent financial crises and avoid high-interest debt.`;
    },
    
    generateActionItems: (user, signals) => {
      return [
        'Set an initial goal of $500 (covers most minor emergencies)',
        'Save $20-$50 per paycheck, even if it feels small',
        'Use "found money" (tax refunds, rebates, gifts) for the fund',
        'Keep it in a separate savings account to avoid spending it',
        'Celebrate milestones: $100, $250, $500',
      ];
    },
    
    matchPartnerOffers: (user, signals) => [],
  },
];

export const ALL_RECOMMENDATION_TEMPLATES: RecommendationTemplate[] = [
  ...highUtilizationTemplates,
  ...variableIncomeTemplates,
  ...subscriptionHeavyTemplates,
  ...savingsBuilderTemplates,
  ...lowIncomeTemplates,
];

