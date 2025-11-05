import { calculateSubscriptionSignals } from '@/lib/signals/subscriptions';
import type { Transaction } from '@/types';

describe('Subscription Signal Detection', () => {
  const createTransaction = (
    id: string,
    merchantName: string,
    amount: number,
    date: string
  ): Transaction => ({
    id,
    accountId: 'acc_1',
    userId: 'user_1',
    amount,
    date,
    name: merchantName,
    merchantName,
    category: { primary: 'Service', detailed: 'Streaming Services' },
    paymentChannel: 'online',
    pending: false,
    transactionType: 'debit',
    isoCurrencyCode: 'USD',
  });

  test('detects recurring merchants with 3+ occurrences', () => {
    const transactions: Transaction[] = [
      createTransaction('1', 'Netflix', -15.99, '2024-01-15'),
      createTransaction('2', 'Netflix', -15.99, '2024-02-15'),
      createTransaction('3', 'Netflix', -15.99, '2024-03-15'),
      createTransaction('4', 'Spotify', -9.99, '2024-01-20'),
      createTransaction('5', 'Spotify', -9.99, '2024-02-20'),
    ];

    const result = calculateSubscriptionSignals(transactions, 90);

    expect(result.totalRecurringCount).toBe(1); // Only Netflix has 3+ occurrences
    expect(result.recurringMerchants).toHaveLength(1);
    expect(result.recurringMerchants[0].merchantName).toBe('Netflix');
  });

  test('calculates monthly recurring spend correctly', () => {
    const transactions: Transaction[] = [
      createTransaction('1', 'Netflix', -15.99, '2024-01-15'),
      createTransaction('2', 'Netflix', -15.99, '2024-02-15'),
      createTransaction('3', 'Netflix', -15.99, '2024-03-15'),
    ];

    const result = calculateSubscriptionSignals(transactions, 90);

    expect(result.monthlyRecurringSpend).toBeCloseTo(15.99, 2);
  });

  test('handles users with no subscriptions', () => {
    const transactions: Transaction[] = [
      createTransaction('1', 'Walmart', -50.00, '2024-01-15'),
      createTransaction('2', 'Target', -30.00, '2024-02-15'),
    ];

    const result = calculateSubscriptionSignals(transactions, 90);

    expect(result.totalRecurringCount).toBe(0);
    expect(result.recurringMerchants).toHaveLength(0);
    expect(result.monthlyRecurringSpend).toBe(0);
  });

  test('correctly identifies monthly cadence', () => {
    const transactions: Transaction[] = [
      createTransaction('1', 'Netflix', -15.99, '2024-01-15'),
      createTransaction('2', 'Netflix', -15.99, '2024-02-15'),
      createTransaction('3', 'Netflix', -15.99, '2024-03-15'),
      createTransaction('4', 'Netflix', -15.99, '2024-04-15'),
    ];

    const result = calculateSubscriptionSignals(transactions, 120);

    expect(result.recurringMerchants[0].cadence).toBe('monthly');
  });
});

