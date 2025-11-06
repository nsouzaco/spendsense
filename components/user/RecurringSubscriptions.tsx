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
import type { SignalResult } from '@/types';

interface RecurringSubscriptionsProps {
  signals?: SignalResult;
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

export function RecurringSubscriptions({ signals }: RecurringSubscriptionsProps) {
  const subscriptions = signals?.subscriptionSignals;

  if (!signals || !subscriptions || subscriptions.totalRecurringCount === 0) {
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

