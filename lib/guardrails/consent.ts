import type { User, GuardrailResult } from '@/types';

export function checkConsentGuardrail(user: User): GuardrailResult {
  const hasActiveConsent = user.consentStatus.active;
  
  return {
    name: 'Consent Check',
    passed: hasActiveConsent,
    reason: hasActiveConsent 
      ? 'User has active consent'
      : 'User consent required before processing',
  };
}

export function validateConsentBeforeRecommendations(user: User): boolean {
  return user.consentStatus.active;
}

