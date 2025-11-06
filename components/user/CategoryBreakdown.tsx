'use client';

import { useMemo } from 'react';
import type { Transaction } from '@/types';

interface CategoryBreakdownProps {
  transactions: Transaction[];
}

const categoryIcons: Record<string, string> = {
  'Food and Drink': '🍔',
  'Shops': '🛍️',
  'Travel': '✈️',
  'Recreation': '🎮',
  'Service': '🔧',
  'Income': '💰',
};

const categoryColors: Record<string, string> = {
  'Food and Drink': 'from-orange-500 to-orange-400',
  'Shops': 'from-pink-500 to-pink-400',
  'Travel': 'from-blue-500 to-blue-400',
  'Recreation': 'from-purple-500 to-purple-400',
  'Service': 'from-green-500 to-green-400',
  'Income': 'from-emerald-500 to-emerald-400',
};

export function CategoryBreakdown({ transactions }: CategoryBreakdownProps) {
  const categoryData = useMemo(() => {
    // Only count expenses (debit transactions)
    const expenses = transactions.filter(t => t.transactionType === 'debit');
    
    const categoryTotals = new Map<string, number>();
    let total = 0;
    
    expenses.forEach(tx => {
      const category = tx.category.primary;
      categoryTotals.set(category, (categoryTotals.get(category) || 0) + Math.abs(tx.amount));
      total += Math.abs(tx.amount);
    });

    // Convert to array and calculate percentages
    return Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / total) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const totalSpending = categoryData.reduce((sum, cat) => sum + cat.amount, 0);

  if (categoryData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/40">
        <p className="text-sm font-light tracking-tight">No spending data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total */}
      <div className="text-center">
        <p className="text-sm font-light tracking-tight text-white/60 mb-2">Total Spending</p>
        <p className="text-4xl font-extralight tracking-tight text-white">
          ${totalSpending.toFixed(2)}
        </p>
      </div>

      {/* Progress bars */}
      <div className="space-y-3">
        {categoryData.map((cat) => (
          <div key={cat.category} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-lg">{categoryIcons[cat.category] || '📊'}</span>
                <span className="text-sm font-light tracking-tight text-white/80">{cat.category}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-light tracking-tight text-white">${cat.amount.toFixed(0)}</p>
                <p className="text-xs font-light tracking-tight text-white/50">{cat.percentage.toFixed(1)}%</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${categoryColors[cat.category] || 'from-gray-500 to-gray-400'}`}
                style={{ width: `${cat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

