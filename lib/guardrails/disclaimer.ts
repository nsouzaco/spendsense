import type { Recommendation, GuardrailResult } from '@/types';
import { STANDARD_DISCLAIMER } from '@/lib/constants/disclaimers';

export function checkDisclaimerGuardrail(recommendation: Recommendation): GuardrailResult {
  const hasDisclaimer = recommendation.disclaimer && 
                        recommendation.disclaimer.length > 0;
  
  const isStandardDisclaimer = recommendation.disclaimer === STANDARD_DISCLAIMER;
  
  return {
    name: 'Disclaimer Check',
    passed: hasDisclaimer && isStandardDisclaimer,
    reason: !hasDisclaimer 
      ? 'Missing required disclaimer'
      : !isStandardDisclaimer
      ? 'Disclaimer does not match standard template'
      : 'Standard disclaimer present',
  };
}

export function ensureDisclaimer(recommendation: Recommendation): Recommendation {
  if (!recommendation.disclaimer || recommendation.disclaimer.length === 0) {
    recommendation.disclaimer = STANDARD_DISCLAIMER;
  }
  
  return recommendation;
}

