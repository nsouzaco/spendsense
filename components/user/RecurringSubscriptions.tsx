'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { SignalResult, Transaction } from '@/types';

interface RecurringSubscriptionsProps {
  signals?: SignalResult;
  transactions: Transaction[];
}

const merchantIcons: Record<string, string> = {
  'Spotify': '🎵',
  'Netflix': '📺',
  'Hulu': '🎬',
  'Disney': '🏰',
  'Amazon': '📦',
  'Apple': '🍎',
  'Microsoft': '💻',
  'Adobe': '🎨',
  'Gym': '💪',
  'Insurance': '🛡️',
};

// Helper function to detect recurring subscriptions from transactions
function detectRecurringFromTransactions(transactions: Transaction[]) {
  // Only look at last 6 months of debit transactions
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const recentTransactions = transactions.filter(t => 
    t.transactionType === 'debit' && 
    new Date(t.date) >= sixMonthsAgo
  );

  // Group by merchant name
  const merchantGroups: Record<string, Transaction[]> = {};
  recentTransactions.forEach(t => {
    const merchant = t.merchantName || t.name;
    if (!merchantGroups[merchant]) {
      merchantGroups[merchant] = [];
    }
    merchantGroups[merchant].push(t);
  });

  // Find recurring merchants (3+ transactions with similar amounts)
  const recurringMerchants = Object.entries(merchantGroups)
    .filter(([_, txns]) => txns.length >= 3)
    .map(([merchant, txns]) => {
      const amounts = txns.map(t => Math.abs(t.amount));
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const totalAmount = amounts.reduce((a, b) => a + b, 0);
      
      // Check if amounts are similar (within 20% variance)
      const variance = amounts.every(amt => 
        Math.abs(amt - avgAmount) / avgAmount < 0.2
      );
      
      if (!variance) return null;

      // Sort by date
      const sortedTxns = [...txns].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Calculate average days between transactions
      const daysBetween = [];
      for (let i = 1; i < sortedTxns.length; i++) {
        const days = Math.abs(
          (new Date(sortedTxns[i].date).getTime() - new Date(sortedTxns[i-1].date).getTime()) / (1000 * 60 * 60 * 24)
        );
        daysBetween.push(days);
      }
      const avgDays = daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length;

      // Determine cadence
      const cadence = avgDays <= 10 ? 'weekly' : 'monthly';

      return {
        merchantName: merchant,
        occurrences: txns.length,
        averageAmount: avgAmount,
        totalAmount: totalAmount,
        cadence: cadence as 'weekly' | 'monthly',
        lastDate: sortedTxns[sortedTxns.length - 1].date,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .sort((a, b) => b.averageAmount - a.averageAmount);

  // Calculate monthly recurring spend (for weekly, multiply by ~4.3)
  const monthlyRecurringSpend = recurringMerchants.reduce((sum, m) => {
    const monthlyAmount = m.cadence === 'weekly' ? m.averageAmount * 4.3 : m.averageAmount;
    return sum + monthlyAmount;
  }, 0);

  // Calculate total spending
  const totalSpending = recentTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const subscriptionShare = totalSpending > 0 ? (monthlyRecurringSpend / (totalSpending / 6)) * 100 : 0;

  return {
    recurringMerchants,
    monthlyRecurringSpend,
    subscriptionShare,
    totalRecurringCount: recurringMerchants.length,
  };
}

export function RecurringSubscriptions({ signals, transactions }: RecurringSubscriptionsProps) {
  // Try to use signals first, fall back to transaction detection
  const subscriptions = signals?.subscriptionSignals || detectRecurringFromTransactions(transactions);

  if (subscriptions.totalRecurringCount === 0) {
    return (
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="p-12">
          <div className="flex items-center justify-center text-gray-500">
            <p className="text-sm">No recurring subscriptions detected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMerchantIcon = (name: string) => {
    const key = Object.keys(merchantIcons).find(k =>
      name.toLowerCase().includes(k.toLowerCase())
    );
    return key ? merchantIcons[key] : '🔄';
  };

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900 font-semibold">Recurring Subscriptions</CardTitle>
        <CardDescription className="text-gray-600">
          {subscriptions.totalRecurringCount} active subscriptions • ${subscriptions.monthlyRecurringSpend.toFixed(0)}/month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total spending indicator */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Monthly Recurring Spend</span>
              <span className="text-lg font-semibold text-gray-900">
                ${subscriptions.monthlyRecurringSpend.toFixed(2)}
              </span>
            </div>
            <Progress
              value={subscriptions.subscriptionShare}
              className="h-2 bg-gray-200"
            />
            <p className="text-xs text-gray-500 mt-2">
              {subscriptions.subscriptionShare.toFixed(1)}% of total spending
            </p>
          </div>

          {/* Subscription list */}
          <div className="space-y-3">
            {subscriptions.recurringMerchants.slice(0, 8).map((merchant, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getMerchantIcon(merchant.merchantName)}</div>
                  <div>
                    <p className="font-medium text-gray-900">{merchant.merchantName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="border-gray-300 bg-white text-gray-700 text-xs">
                        {merchant.cadence}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {merchant.occurrences}x
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ${merchant.averageAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    ${merchant.totalAmount.toFixed(0)} total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

