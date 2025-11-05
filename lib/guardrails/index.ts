import type { Recommendation, User, SignalResult, GuardrailResult } from '@/types';
import { checkConsentGuardrail, validateConsentBeforeRecommendations } from './consent';
import { checkEligibilityGuardrail, filterEligibleOffers } from './eligibility';
import { validateRecommendationTone } from './tone';
import { checkDisclaimerGuardrail, ensureDisclaimer } from './disclaimer';

export interface GuardrailsResult {
  passed: boolean;
  results: GuardrailResult[];
  recommendation?: Recommendation;
}

export function applyGuardrails(
  recommendation: Recommendation,
  user: User,
  signals: SignalResult
): GuardrailsResult {
  const results: GuardrailResult[] = [];
  
  // 1. Consent check
  const consentResult = checkConsentGuardrail(user);
  results.push(consentResult);
  
  if (!consentResult.passed) {
    return {
      passed: false,
      results,
    };
  }
  
  // 2. Eligibility check
  const eligibilityResult = checkEligibilityGuardrail(recommendation, user, signals);
  results.push(eligibilityResult);
  
  // 3. Tone validation
  const toneResults = validateRecommendationTone(
    recommendation.title,
    recommendation.description,
    recommendation.rationale,
    recommendation.educationalContent
  );
  results.push(...toneResults);
  
  // 4. Disclaimer check (and ensure it's present)
  recommendation = ensureDisclaimer(recommendation);
  const disclaimerResult = checkDisclaimerGuardrail(recommendation);
  results.push(disclaimerResult);
  
  // 5. Filter partner offers for excluded products
  recommendation.partnerOffers = filterEligibleOffers(
    recommendation.partnerOffers,
    user,
    signals
  );
  
  // Update decision trace with guardrail results
  recommendation.decisionTrace.guardrailsPassed = results;
  
  // Overall pass if all critical guardrails pass
  const allPassed = results.every(r => r.passed);
  
  return {
    passed: allPassed,
    results,
    recommendation,
  };
}

export function validateUserForProcessing(user: User): boolean {
  return validateConsentBeforeRecommendations(user);
}

export * from './consent';
export * from './eligibility';
export * from './tone';
export * from './disclaimer';

