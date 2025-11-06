'use client';

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Transaction } from '@/types';

interface IncomeExpenseChartProps {
  transactions: Transaction[];
  days?: number;
}

const chartConfig = {
  income: {
    label: 'Income',
    color: 'hsl(142, 76%, 36%)',
  },
  expenses: {
    label: 'Expenses',
    color: 'hsl(0, 72%, 51%)',
  },
};

export function IncomeExpenseChart({ transactions, days = 30 }: IncomeExpenseChartProps) {
  const chartData = useMemo(() => {
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
      .map(([date, values]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...values,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-days);
  }, [transactions, days]);

  const totals = useMemo(() => {
    const income = chartData.reduce((sum, d) => sum + d.income, 0);
    const expenses = chartData.reduce((sum, d) => sum + d.expenses, 0);
    return { income, expenses, net: income - expenses };
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="p-12">
          <div className="flex items-center justify-center text-white/40">
            <p className="text-sm font-light tracking-tight">No transaction data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white font-extralight">Income vs Expenses</CardTitle>
        <CardDescription className="text-white/60">
          Last {days} days - Net: <span className={`font-medium ${totals.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${Math.abs(totals.net).toFixed(0)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-expenses)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-expenses)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-white/10" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-white/60"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-white/60"
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" className="border-white/20 bg-black/90 backdrop-blur-xl" />}
            />
            <Area
              dataKey="income"
              type="monotone"
              fill="url(#fillIncome)"
              fillOpacity={0.4}
              stroke="var(--color-income)"
              strokeWidth={2}
            />
            <Area
              dataKey="expenses"
              type="monotone"
              fill="url(#fillExpenses)"
              fillOpacity={0.4}
              stroke="var(--color-expenses)"
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent className="text-white/70" />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

