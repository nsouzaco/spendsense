'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { SignalResult, Account } from '@/types';

interface StatCardsProps {
  signals?: SignalResult;
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

  // Calculate credit utilization from accounts if signals not available
  const creditAccounts = accounts.filter(a => a.type === 'credit');
  const totalCreditUsed = creditAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalCreditLimit = creditAccounts.reduce((sum, a) => sum + (a.creditLimit || 0), 0);
  const calculatedUtilization = totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0;
  
  const creditUtilization = signals ? signals.creditSignals.highestUtilization * 100 : calculatedUtilization;
  const emergencyFund = signals?.savingsSignals.emergencyFundCoverage || 0;
  const monthlyIncome = signals ? signals.incomeSignals.estimatedAnnualIncome / 12 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Balance */}
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Total Balance</p>
            <p className="text-3xl font-semibold text-gray-900">
              {formatCurrency(totalBalance)}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
                {accounts.filter(a => a.type === 'depository').length} accounts
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Utilization */}
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-600">Credit Usage</p>
              <Badge
                variant="outline"
                className={`${
                  creditUtilization > 50
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : creditUtilization > 30
                    ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
                    : 'border-green-300 bg-green-50 text-green-700'
                }`}
              >
                {creditUtilization > 50 ? 'High' : creditUtilization > 30 ? 'Medium' : 'Good'}
              </Badge>
            </div>
            <p className="text-3xl font-semibold text-gray-900">
              {creditUtilization.toFixed(0)}%
            </p>
            <Progress value={creditUtilization} className="h-2 bg-gray-200" />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Fund */}
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Emergency Fund</p>
            {signals ? (
              <>
                <p className="text-3xl font-semibold text-gray-900">
                  {emergencyFund.toFixed(1)} <span className="text-xl text-gray-600">months</span>
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(signals.savingsSignals.currentSavingsBalance)} saved
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl font-semibold text-gray-400">--</p>
                <p className="text-xs text-gray-500">Click "Generate Insights" to analyze</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Est. Monthly Income</p>
            {signals ? (
              <>
                <p className="text-3xl font-semibold text-gray-900">
                  {formatCurrency(monthlyIncome)}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">
                    {signals.incomeSignals.paymentFrequency || 'variable'}
                  </Badge>
                </div>
              </>
            ) : (
              <>
                <p className="text-3xl font-semibold text-gray-400">--</p>
                <p className="text-xs text-gray-500">Click "Generate Insights" to analyze</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

