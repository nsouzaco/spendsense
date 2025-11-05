import type { Recommendation, User, SignalResult, GuardrailResult, PartnerOffer } from '@/types';

// Explicitly excluded product types
const EXCLUDED_PRODUCT_TYPES = [
  'payday_loan',
  'title_loan',
  'predatory_lender',
  'high_interest_installment',
];

export function checkEligibilityGuardrail(
  recommendation: Recommendation,
  user: User,
  signals: SignalResult
): GuardrailResult {
  const issues: string[] = [];
  
  // Check partner offers for excluded products
  const hasExcludedProducts = recommendation.partnerOffers.some(offer => 
    EXCLUDED_PRODUCT_TYPES.includes(offer.type as string)
  );
  
  if (hasExcludedProducts) {
    issues.push('Contains excluded predatory product types');
  }
  
  // Validate income requirements for credit products
  recommendation.partnerOffers.forEach(offer => {
    if (offer.type === 'balance_transfer_card') {
      // Balance transfer cards typically require minimum income
      if (signals.incomeSignals.estimatedAnnualIncome < 25000) {
        if (offer.eligibility.eligible) {
          issues.push(`${offer.name}: Income requirement not met`);
        }
      }
    }
  });
  
  // Check for duplicate account recommendations
  if (recommendation.category === 'Savings Optimization' && 
      signals.savingsSignals.currentSavingsBalance > 50000) {
    issues.push('User may already have optimized savings accounts');
  }
  
  const passed = issues.length === 0;
  
  return {
    name: 'Eligibility Check',
    passed,
    reason: passed 
      ? 'All eligibility criteria met'
      : `Eligibility issues: ${issues.join('; ')}`,
  };
}

export function filterEligibleOffers(
  offers: PartnerOffer[],
  user: User,
  signals: SignalResult
): PartnerOffer[] {
  return offers.filter(offer => {
    // Exclude predatory products
    if (EXCLUDED_PRODUCT_TYPES.includes(offer.type as string)) {
      return false;
    }
    
    // Additional filtering can be added here
    return true;
  });
}

