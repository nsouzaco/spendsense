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
  signals: SignalResult;
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
  const subscriptions = signals.subscriptionSignals;

  if (!subscriptions || subscriptions.totalRecurringCount === 0) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="p-12">
          <div className="flex items-center justify-center text-white/40">
            <p className="text-sm font-light tracking-tight">No recurring subscriptions detected</p>
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
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white font-extralight">Recurring Subscriptions</CardTitle>
        <CardDescription className="text-white/60">
          {subscriptions.totalRecurringCount} active subscriptions • ${subscriptions.monthlyRecurringSpend.toFixed(0)}/month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total spending indicator */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-light text-white/70">Monthly Recurring Spend</span>
              <span className="text-lg font-extralight text-white">
                ${subscriptions.monthlyRecurringSpend.toFixed(2)}
              </span>
            </div>
            <Progress
              value={subscriptions.subscriptionShare}
              className="h-2 bg-white/10"
            />
            <p className="text-xs font-light text-white/50 mt-2">
              {subscriptions.subscriptionShare.toFixed(1)}% of total spending
            </p>
          </div>

          {/* Subscription list */}
          <div className="space-y-3">
            {subscriptions.recurringMerchants.slice(0, 8).map((merchant, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getMerchantIcon(merchant.merchantName)}</div>
                  <div>
                    <p className="font-light text-white">{merchant.merchantName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="border-white/20 bg-white/5 text-white/60 text-xs">
                        {merchant.cadence}
                      </Badge>
                      <span className="text-xs font-light text-white/50">
                        {merchant.occurrences}x
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-light text-white">
                    ${merchant.averageAmount.toFixed(2)}
                  </p>
                  <p className="text-xs font-light text-white/50">
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

