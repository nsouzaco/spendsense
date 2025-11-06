'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Transaction } from '@/types';

interface CategoryBarChartProps {
  transactions: Transaction[];
}

const chartConfig = {
  amount: {
    label: 'Spending',
    color: 'hsl(271, 91%, 65%)',
  },
};

const categoryIcons: Record<string, string> = {
  'Food and Drink': '🍔',
  'Shops': '🛍️',
  'Travel': '✈️',
  'Recreation': '🎮',
  'Service': '🔧',
};

export function CategoryBarChart({ transactions }: CategoryBarChartProps) {
  const chartData = useMemo(() => {
    // Only count expenses (debit transactions)
    const expenses = transactions.filter(t => t.transactionType === 'debit');
    
    const categoryTotals = new Map<string, number>();
    
    expenses.forEach(tx => {
      const category = tx.category.primary;
      categoryTotals.set(category, (categoryTotals.get(category) || 0) + Math.abs(tx.amount));
    });

    // Convert to array and sort
    return Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount),
        fill: `var(--color-amount)`,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const totalSpending = chartData.reduce((sum, cat) => sum + cat.amount, 0);

  if (chartData.length === 0) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="p-12">
          <div className="flex items-center justify-center text-white/40">
            <p className="text-sm font-light tracking-tight">No spending data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white font-extralight">Spending by Category</CardTitle>
        <CardDescription className="text-white/60">
          Total: ${totalSpending.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-white/10" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-white/60"
              tickFormatter={(value) => `$${value}`}
            />
            <YAxis
              dataKey="category"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-white/60"
              tickFormatter={(value) => `${categoryIcons[value] || ''} ${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent className="border-white/20 bg-black/90 backdrop-blur-xl" hideLabel />}
            />
            <Bar dataKey="amount" fill="var(--color-amount)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

