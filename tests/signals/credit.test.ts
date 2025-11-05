import { calculateCreditSignals } from '@/lib/signals/credit';
import type { Account, Liability, CreditCardDetails } from '@/types';

describe('Credit Signal Detection', () => {
  const createCreditCard = (id: string, balance: number, limit: number): Account => ({
    id,
    userId: 'user_1',
    name: 'Credit Card',
    officialName: 'Test Credit Card',
    type: 'credit',
    subtype: 'credit card',
    mask: '1234',
    currentBalance: balance,
    availableBalance: limit - balance,
    creditLimit: limit,
    currencyCode: 'USD',
    isoCurrencyCode: 'USD',
  });

  const createLiability = (accountId: string, apr: number, isOverdue: boolean): Liability => ({
    id: `liab_${accountId}`,
    userId: 'user_1',
    accountId,
    type: 'credit_card',
    details: {
      apr,
      minimumPaymentAmount: 25,
      lastPaymentAmount: 25,
      lastPaymentDate: '2024-01-15',
      nextPaymentDueDate: '2024-02-15',
      isOverdue,
    } as CreditCardDetails,
  });

  test('calculates utilization correctly', () => {
    const accounts = [createCreditCard('acc_1', 2500, 5000)]; // 50% utilization
    const liabilities = [createLiability('acc_1', 15.99, false)];

    const result = calculateCreditSignals(accounts, liabilities);

    expect(result.cards).toHaveLength(1);
    expect(result.cards[0].utilization).toBeCloseTo(0.5, 2);
  });

  test('calculates average utilization for multiple cards', () => {
    const accounts = [
      createCreditCard('acc_1', 2500, 5000), // 50%
      createCreditCard('acc_2', 3000, 10000), // 30%
    ];
    const liabilities = [
      createLiability('acc_1', 15.99, false),
      createLiability('acc_2', 18.99, false),
    ];

    const result = calculateCreditSignals(accounts, liabilities);

    expect(result.averageUtilization).toBeCloseTo(0.4, 2); // (0.5 + 0.3) / 2
  });

  test('detects overdue status', () => {
    const accounts = [createCreditCard('acc_1', 1000, 5000)];
    const liabilities = [createLiability('acc_1', 19.99, true)];

    const result = calculateCreditSignals(accounts, liabilities);

    expect(result.hasOverdue).toBe(true);
  });

  test('handles users with no credit cards', () => {
    const accounts: Account[] = [];
    const liabilities: Liability[] = [];

    const result = calculateCreditSignals(accounts, liabilities);

    expect(result.cards).toHaveLength(0);
    expect(result.averageUtilization).toBe(0);
    expect(result.hasOverdue).toBe(false);
  });

  test('calculates interest charges', () => {
    const accounts = [createCreditCard('acc_1', 5000, 10000)];
    const liabilities = [createLiability('acc_1', 18, false)]; // 18% APR

    const result = calculateCreditSignals(accounts, liabilities);

    const monthlyRate = 0.18 / 12;
    const expectedInterest = 5000 * monthlyRate;

    expect(result.totalInterestCharges).toBeCloseTo(expectedInterest, 2);
  });
});

