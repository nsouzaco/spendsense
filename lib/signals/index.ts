import type { SignalResult, User, Account, Transaction, Liability, TimeWindow } from '@/types';
import { calculateSubscriptionSignals } from './subscriptions';
import { calculateSavingsSignals } from './savings';
import { calculateCreditSignals } from './credit';
import { calculateIncomeSignals } from './income';
import { filterTransactionsByDateRange, getDateRange } from './utils';

export function detectSignals(
  user: User,
  accounts: Account[],
  transactions: Transaction[],
  liabilities: Liability[],
  window: TimeWindow
): SignalResult {
  const windowDays = window === '30d' ? 30 : 180;
  const { startDate, endDate } = getDateRange(windowDays);
  
  // Filter transactions by date range
  const filteredTransactions = filterTransactionsByDateRange(transactions, startDate, endDate);
  
  // Calculate all signals
  const subscriptionSignals = calculateSubscriptionSignals(filteredTransactions, windowDays);
  const savingsSignals = calculateSavingsSignals(accounts, filteredTransactions, windowDays);
  const creditSignals = calculateCreditSignals(accounts, liabilities);
  const incomeSignals = calculateIncomeSignals(filteredTransactions, windowDays);
  
  return {
    userId: user.id,
    window,
    timestamp: new Date().toISOString(),
    subscriptionSignals,
    savingsSignals,
    creditSignals,
    incomeSignals,
  };
}

export * from './subscriptions';
export * from './savings';
export * from './credit';
export * from './income';
export * from './utils';

