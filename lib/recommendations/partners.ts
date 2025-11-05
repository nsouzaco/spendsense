import type { PartnerOffer, SignalResult, User, OfferType } from '@/types';
import { generateId } from '@/lib/data/generator/utils';

export function matchPartnerOffers(
  user: User,
  signals: SignalResult,
  personaType: string
): PartnerOffer[] {
  const offers: PartnerOffer[] = [];
  
  // Balance Transfer Cards (for High Utilization)
  if (personaType === 'HIGH_UTILIZATION' && signals.creditSignals.highestUtilization >= 0.5) {
    offers.push({
      id: generateId('offer', offers.length),
      name: 'Balance Transfer Credit Card',
      description: '0% APR for 18 months on balance transfers. Transfer your high-interest balances and save on interest charges.',
      type: 'balance_transfer_card',
      eligibility: checkBalanceTransferEligibility(user, signals),
      eligibilityCriteria: ['Credit score 670+', 'Annual income $25,000+', 'No recent bankruptcies'],
      ctaText: 'Learn More',
      ctaUrl: '#',
    });
  }
  
  // High-Yield Savings (for Savings Builder or Low Income)
  if (personaType === 'SAVINGS_BUILDER' || personaType === 'LOW_INCOME_STABILIZER') {
    offers.push({
      id: generateId('offer', offers.length),
      name: 'High-Yield Savings Account',
      description: 'Earn 4.5% APY on your savings. FDIC insured up to $250,000. No minimum balance required.',
      type: 'high_yield_savings',
      eligibility: checkSavingsAccountEligibility(user, signals),
      eligibilityCriteria: ['18 years or older', 'U.S. resident', 'No existing HYSA'],
      ctaText: 'Open Account',
      ctaUrl: '#',
    });
  }
  
  // Budgeting Apps (for Variable Income or Subscription Heavy)
  if (personaType === 'VARIABLE_INCOME_BUDGETER' || personaType === 'SUBSCRIPTION_HEAVY') {
    offers.push({
      id: generateId('offer', offers.length),
      name: 'YNAB (You Need A Budget)',
      description: 'Proven budgeting app designed for variable income. Track every dollar and break the paycheck-to-paycheck cycle.',
      type: 'budgeting_app',
      eligibility: { eligible: true, reasons: ['Available to all users'] },
      eligibilityCriteria: ['None - available to all'],
      ctaText: 'Try Free for 34 Days',
      ctaUrl: '#',
    });
  }
  
  // Subscription Manager (for Subscription Heavy)
  if (personaType === 'SUBSCRIPTION_HEAVY') {
    offers.push({
      id: generateId('offer', offers.length),
      name: 'Truebill Subscription Manager',
      description: 'Automatically track, manage, and cancel unwanted subscriptions. Get alerts before renewals.',
      type: 'subscription_manager',
      eligibility: { eligible: true, reasons: ['Available to all users'] },
      eligibilityCriteria: ['None - available to all'],
      ctaText: 'Start Managing',
      ctaUrl: '#',
    });
  }
  
  // Financial Counseling (for any persona with financial stress)
  const hasFinancialStress = 
    signals.creditSignals.hasOverdue ||
    signals.incomeSignals.cashFlowBuffer < 0 ||
    (signals.incomeSignals.estimatedAnnualIncome < 30000 && signals.creditSignals.highestUtilization > 0.7);
  
  if (hasFinancialStress) {
    offers.push({
      id: generateId('offer', offers.length),
      name: 'Free Financial Counseling',
      description: 'Connect with a certified financial counselor for free, confidential guidance. Non-profit service available to all income levels.',
      type: 'financial_counseling',
      eligibility: { eligible: true, reasons: ['Available to all income levels'] },
      eligibilityCriteria: ['None - free service'],
      ctaText: 'Find a Counselor',
      ctaUrl: '#',
    });
  }
  
  return offers;
}

function checkBalanceTransferEligibility(user: User, signals: SignalResult) {
  const reasons: string[] = [];
  let eligible = true;
  
  // Estimate if income is sufficient (very rough estimate)
  if (signals.incomeSignals.estimatedAnnualIncome < 25000) {
    eligible = false;
    reasons.push('Minimum annual income requirement not met');
  } else {
    reasons.push('Income requirement met');
  }
  
  // Check if utilization is high enough to benefit
  if (signals.creditSignals.highestUtilization >= 0.3) {
    reasons.push('High enough utilization to benefit from balance transfer');
  }
  
  return { eligible, reasons };
}

function checkSavingsAccountEligibility(user: User, signals: SignalResult) {
  const reasons: string[] = [];
  let eligible = true;
  
  // Check if user already has significant savings accounts
  if (signals.savingsSignals.currentSavingsBalance > 10000) {
    reasons.push('You may already have a high-yield savings account');
  } else {
    reasons.push('Good candidate for high-yield savings');
  }
  
  return { eligible, reasons };
}

