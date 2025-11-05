import { checkConsentGuardrail, validateConsentBeforeRecommendations } from '@/lib/guardrails/consent';
import type { User } from '@/types';

describe('Consent Guardrails', () => {
  const createMockUser = (hasConsent: boolean): User => ({
    id: 'user_1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    dateOfBirth: '1990-01-01',
    phone: '+15551234567',
    address: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      country: 'US',
    },
    createdAt: '2024-01-01T00:00:00Z',
    consentStatus: {
      active: hasConsent,
      grantedAt: hasConsent ? '2024-01-01T00:00:00Z' : undefined,
    },
  });

  test('passes when user has active consent', () => {
    const user = createMockUser(true);
    const result = checkConsentGuardrail(user);

    expect(result.passed).toBe(true);
    expect(result.reason).toContain('active consent');
  });

  test('fails when user has no consent', () => {
    const user = createMockUser(false);
    const result = checkConsentGuardrail(user);

    expect(result.passed).toBe(false);
    expect(result.reason).toContain('consent required');
  });

  test('validateConsentBeforeRecommendations returns correct boolean', () => {
    const userWithConsent = createMockUser(true);
    const userWithoutConsent = createMockUser(false);

    expect(validateConsentBeforeRecommendations(userWithConsent)).toBe(true);
    expect(validateConsentBeforeRecommendations(userWithoutConsent)).toBe(false);
  });
});

