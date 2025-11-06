'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { SignalResult, Account } from '@/types';

interface StatCardsProps {
  signals: SignalResult;
  accounts: Account[];
}

export function StatCards({ signals, accounts }: StatCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalBalance = accounts
    .filter(a => a.type === 'depository')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const creditUtilization = signals.creditSignals.highestUtilization * 100;
  const emergencyFund = signals.savingsSignals.emergencyFundCoverage;
  const monthlyIncome = signals.incomeSignals.estimatedAnnualIncome / 12;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Balance */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-light tracking-tight text-white/60">Total Balance</p>
            <p className="text-3xl font-extralight tracking-tight text-white">
              {formatCurrency(totalBalance)}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-300">
                {accounts.filter(a => a.type === 'depository').length} accounts
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Utilization */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-light tracking-tight text-white/60">Credit Usage</p>
              <Badge
                variant="outline"
                className={`${
                  creditUtilization > 50
                    ? 'border-red-500/30 bg-red-500/10 text-red-300'
                    : creditUtilization > 30
                    ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300'
                    : 'border-green-500/30 bg-green-500/10 text-green-300'
                }`}
              >
                {creditUtilization > 50 ? 'High' : creditUtilization > 30 ? 'Medium' : 'Good'}
              </Badge>
            </div>
            <p className="text-3xl font-extralight tracking-tight text-white">
              {creditUtilization.toFixed(0)}%
            </p>
            <Progress value={creditUtilization} className="h-2 bg-white/10" />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Fund */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-light tracking-tight text-white/60">Emergency Fund</p>
            <p className="text-3xl font-extralight tracking-tight text-white">
              {emergencyFund.toFixed(1)} <span className="text-xl text-white/60">months</span>
            </p>
            <p className="text-xs font-light tracking-tight text-white/50">
              {formatCurrency(signals.savingsSignals.currentSavingsBalance)} saved
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-light tracking-tight text-white/60">Est. Monthly Income</p>
            <p className="text-3xl font-extralight tracking-tight text-white">
              {formatCurrency(monthlyIncome)}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-300">
                {signals.incomeSignals.paymentFrequency || 'variable'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

