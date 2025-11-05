import { assignPersonas } from '@/lib/personas/assignment';
import type { SignalResult } from '@/types';

describe('Persona Assignment', () => {
  const createMockSignals = (overrides: Partial<SignalResult> = {}): SignalResult => ({
    userId: 'user_1',
    window: '180d',
    timestamp: new Date().toISOString(),
    subscriptionSignals: {
      recurringMerchants: [],
      monthlyRecurringSpend: 0,
      subscriptionShare: 0,
      totalRecurringCount: 0,
    },
    savingsSignals: {
      netInflow: 0,
      growthRate: 0,
      emergencyFundCoverage: 0,
      averageMonthlyExpenses: 2000,
      currentSavingsBalance: 0,
    },
    creditSignals: {
      cards: [],
      averageUtilization: 0,
      highestUtilization: 0,
      hasMinimumPaymentOnly: false,
      totalInterestCharges: 0,
      hasOverdue: false,
    },
    incomeSignals: {
      hasPayrollPattern: true,
      paymentFrequency: 'monthly',
      averagePayment: 3000,
      paymentVariability: 0.1,
      cashFlowBuffer: 1,
      hasIncomeGap: false,
      longestGapDays: 30,
      estimatedAnnualIncome: 36000,
    },
    ...overrides,
  });

  test('assigns High Utilization persona for high credit utilization', () => {
    const signals = createMockSignals({
      creditSignals: {
        cards: [
          {
            accountId: 'acc_1',
            cardMask: '1234',
            utilization: 0.75,
            balance: 7500,
            limit: 10000,
            isMinimumPaymentOnly: false,
            interestCharges: 0,
            isOverdue: false,
          },
        ],
        averageUtilization: 0.75,
        highestUtilization: 0.75,
        hasMinimumPaymentOnly: false,
        totalInterestCharges: 0,
        hasOverdue: false,
      },
    });

    const personas = assignPersonas('user_1', signals);

    expect(personas).toHaveLength(1);
    expect(personas[0].personaType).toBe('HIGH_UTILIZATION');
  });

  test('assigns Low Income Stabilizer for low income', () => {
    const signals = createMockSignals({
      incomeSignals: {
        hasPayrollPattern: true,
        paymentFrequency: 'monthly',
        averagePayment: 2000,
        paymentVariability: 0.1,
        cashFlowBuffer: 0.5,
        hasIncomeGap: false,
        longestGapDays: 30,
        estimatedAnnualIncome: 24000, // < $30k
      },
    });

    const personas = assignPersonas('user_1', signals);

    expect(personas.some(p => p.personaType === 'LOW_INCOME_STABILIZER')).toBe(true);
  });

  test('assigns Subscription-Heavy persona for many subscriptions', () => {
    const signals = createMockSignals({
      subscriptionSignals: {
        recurringMerchants: [
          {
            merchantName: 'Netflix',
            occurrences: 6,
            averageAmount: 15.99,
            totalAmount: 95.94,
            cadence: 'monthly',
            lastDate: '2024-06-01',
          },
          {
            merchantName: 'Spotify',
            occurrences: 6,
            averageAmount: 9.99,
            totalAmount: 59.94,
            cadence: 'monthly',
            lastDate: '2024-06-01',
          },
          {
            merchantName: 'Gym',
            occurrences: 6,
            averageAmount: 29.99,
            totalAmount: 179.94,
            cadence: 'monthly',
            lastDate: '2024-06-01',
          },
        ],
        monthlyRecurringSpend: 55.97,
        subscriptionShare: 15,
        totalRecurringCount: 3,
      },
    });

    const personas = assignPersonas('user_1', signals);

    expect(personas.some(p => p.personaType === 'SUBSCRIPTION_HEAVY')).toBe(true);
  });

  test('prioritizes personas correctly when multiple match', () => {
    const signals = createMockSignals({
      creditSignals: {
        cards: [
          {
            accountId: 'acc_1',
            cardMask: '1234',
            utilization: 0.6,
            balance: 6000,
            limit: 10000,
            isMinimumPaymentOnly: false,
            interestCharges: 50,
            isOverdue: false,
          },
        ],
        averageUtilization: 0.6,
        highestUtilization: 0.6,
        hasMinimumPaymentOnly: false,
        totalInterestCharges: 50,
        hasOverdue: false,
      },
      incomeSignals: {
        hasPayrollPattern: true,
        paymentFrequency: 'monthly',
        averagePayment: 2000,
        paymentVariability: 0.1,
        cashFlowBuffer: 0.5,
        hasIncomeGap: false,
        longestGapDays: 30,
        estimatedAnnualIncome: 24000,
      },
    });

    const personas = assignPersonas('user_1', signals);

    // High Utilization should come first (priority 1) over Low Income (priority 5)
    expect(personas[0].personaType).toBe('HIGH_UTILIZATION');
    expect(personas[0].priority).toBeLessThan(personas[personas.length - 1].priority);
  });

  test('assigns no personas when no criteria match', () => {
    const signals = createMockSignals({
      // All default values - no criteria should match
    });

    const personas = assignPersonas('user_1', signals);

    expect(personas).toHaveLength(0);
  });
});

