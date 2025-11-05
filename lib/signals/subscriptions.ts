import type { Transaction, SubscriptionSignals, RecurringMerchant } from '@/types';
import { groupTransactionsByMerchant, getDaysBetween } from './utils';
import { SUBSCRIPTION_THRESHOLDS } from '@/lib/constants/signals';

export function calculateSubscriptionSignals(
  transactions: Transaction[],
  windowDays: number
): SubscriptionSignals {
  // Filter to debit transactions only
  const debits = transactions.filter(t => t.transactionType === 'debit' && t.amount < 0);
  
  // Group by merchant
  const grouped = groupTransactionsByMerchant(debits);
  
  const recurringMerchants: RecurringMerchant[] = [];
  
  // Detect recurring patterns
  grouped.forEach((txns, merchant) => {
    // Need at least 3 occurrences to consider it recurring
    if (txns.length >= SUBSCRIPTION_THRESHOLDS.MIN_OCCURRENCES) {
      // Sort by date
      const sorted = txns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calculate gaps between transactions
      const gaps: number[] = [];
      for (let i = 1; i < sorted.length; i++) {
        gaps.push(getDaysBetween(sorted[i - 1].date, sorted[i].date));
      }
      
      // Check if gaps are consistent (within 5 days of each other)
      const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
      const isConsistent = gaps.every(gap => Math.abs(gap - avgGap) <= 5);
      
      if (isConsistent) {
        // Determine cadence
        let cadence: 'weekly' | 'monthly' = 'monthly';
        if (avgGap >= 20 && avgGap <= 35) {
          cadence = 'monthly';
        } else if (avgGap >= 5 && avgGap <= 10) {
          cadence = 'weekly';
        }
        
        const totalAmount = Math.abs(txns.reduce((sum, t) => sum + t.amount, 0));
        const averageAmount = totalAmount / txns.length;
        
        recurringMerchants.push({
          merchantName: merchant,
          occurrences: txns.length,
          averageAmount: Math.round(averageAmount * 100) / 100,
          totalAmount: Math.round(totalAmount * 100) / 100,
          cadence,
          lastDate: sorted[sorted.length - 1].date,
        });
      }
    }
  });
  
  // Calculate monthly recurring spend
  const monthlyRecurringSpend = recurringMerchants.reduce((sum, rm) => {
    if (rm.cadence === 'monthly') {
      return sum + rm.averageAmount;
    } else {
      // Weekly subscriptions * 4.33 (avg weeks per month)
      return sum + (rm.averageAmount * 4.33);
    }
  }, 0);
  
  // Calculate total spend in window
  const totalSpend = Math.abs(debits.reduce((sum, t) => sum + t.amount, 0));
  
  // Calculate subscription share
  const subscriptionShare = totalSpend > 0
    ? (monthlyRecurringSpend * (windowDays / 30) / totalSpend) * 100
    : 0;
  
  return {
    recurringMerchants,
    monthlyRecurringSpend: Math.round(monthlyRecurringSpend * 100) / 100,
    subscriptionShare: Math.round(subscriptionShare * 100) / 100,
    totalRecurringCount: recurringMerchants.length,
  };
}

