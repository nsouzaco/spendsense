'use client';

import { useMemo } from 'react';
import type { Transaction } from '@/types';

interface SpendingChartProps {
  transactions: Transaction[];
  days?: number;
}

export function SpendingChart({ transactions, days = 30 }: SpendingChartProps) {
  const data = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    // Filter transactions within the date range
    const filtered = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= startDate && txDate <= now;
    });

    // Group by date
    const dailyData = new Map<string, { income: number; expenses: number }>();
    
    filtered.forEach(tx => {
      const date = tx.date;
      if (!dailyData.has(date)) {
        dailyData.set(date, { income: 0, expenses: 0 });
      }
      
      const day = dailyData.get(date)!;
      if (tx.transactionType === 'credit') {
        day.income += tx.amount;
      } else {
        day.expenses += Math.abs(tx.amount);
      }
    });

    // Convert to array and sort
    return Array.from(dailyData.entries())
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, days]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/40">
        <p className="text-sm font-light tracking-tight">No transaction data available</p>
      </div>
    );
  }

  const maxValue = Math.max(
    ...data.map(d => Math.max(d.income, d.expenses))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm font-light tracking-tight text-white/70">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm font-light tracking-tight text-white/70">Expenses</span>
          </div>
        </div>
        <p className="text-xs font-light tracking-tight text-white/50">Last {days} days</p>
      </div>

      <div className="relative h-64 flex items-end gap-1">
        {data.slice(-days).map((day, index) => {
          const incomeHeight = (day.income / maxValue) * 100;
          const expenseHeight = (day.expenses / maxValue) * 100;
          
          return (
            <div key={index} className="flex-1 flex flex-col-reverse gap-1 group">
              {/* Income bar */}
              <div 
                className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t transition-all hover:from-green-500 hover:to-green-300"
                style={{ height: `${incomeHeight}%` }}
                title={`Income: $${day.income.toFixed(2)}`}
              />
              {/* Expense bar */}
              <div 
                className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t transition-all hover:from-red-500 hover:to-red-300"
                style={{ height: `${expenseHeight}%` }}
                title={`Expenses: $${day.expenses.toFixed(2)}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

