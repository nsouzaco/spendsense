import type { Transaction, IncomeSignals } from '@/types';
import { getDaysBetween, calculateStandardDeviation, calculateMedian } from './utils';

export function calculateIncomeSignals(
  transactions: Transaction[],
  windowDays: number
): IncomeSignals {
  // Filter to income/payroll transactions
  const incomeTransactions = transactions.filter(
    t => t.transactionType === 'credit' &&
    (t.category.primary === 'Income' || t.category.detailed === 'Payroll')
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  if (incomeTransactions.length === 0) {
    return {
      hasPayrollPattern: false,
      averagePayment: 0,
      paymentVariability: 0,
      cashFlowBuffer: 0,
      hasIncomeGap: false,
      longestGapDays: 0,
      estimatedAnnualIncome: 0,
    };
  }
  
  // Has payroll pattern if at least 2 income transactions
  const hasPayrollPattern = incomeTransactions.length >= 2;
  
  // Calculate average payment
  const payments = incomeTransactions.map(t => t.amount);
  const averagePayment = payments.reduce((sum, p) => sum + p, 0) / payments.length;
  
  // Calculate payment variability (coefficient of variation)
  const stdDev = calculateStandardDeviation(payments);
  const paymentVariability = averagePayment > 0 ? stdDev / averagePayment : 0;
  
  // Determine payment frequency
  let paymentFrequency: 'weekly' | 'biweekly' | 'monthly' | 'variable' = 'variable';
  const gaps: number[] = [];
  
  for (let i = 1; i < incomeTransactions.length; i++) {
    gaps.push(getDaysBetween(incomeTransactions[i - 1].date, incomeTransactions[i].date));
  }
  
  if (gaps.length > 0) {
    const medianGap = calculateMedian(gaps);
    
    if (medianGap >= 5 && medianGap <= 10) {
      paymentFrequency = 'weekly';
    } else if (medianGap >= 12 && medianGap <= 16) {
      paymentFrequency = 'biweekly';
    } else if (medianGap >= 25 && medianGap <= 35) {
      paymentFrequency = 'monthly';
    }
  }
  
  // Calculate cash flow buffer
  // Estimate monthly income
  const monthlyIncome = paymentFrequency === 'weekly'
    ? averagePayment * 4.33
    : paymentFrequency === 'biweekly'
    ? averagePayment * 2.17
    : averagePayment;
  
  // Estimate monthly expenses (from all debit transactions)
  const debits = transactions.filter(t => t.transactionType === 'debit');
  const totalExpenses = Math.abs(debits.reduce((sum, t) => sum + t.amount, 0));
  const monthlyExpenses = (totalExpenses / windowDays) * 30;
  
  // Cash flow buffer in months
  const cashFlowBuffer = monthlyExpenses > 0
    ? (monthlyIncome - monthlyExpenses) / monthlyExpenses
    : 0;
  
  // Check for income gaps
  const longestGapDays = gaps.length > 0 ? Math.max(...gaps) : 0;
  const hasIncomeGap = longestGapDays > 45;
  
  // Estimate annual income
  const estimatedAnnualIncome = monthlyIncome * 12;
  
  return {
    hasPayrollPattern,
    paymentFrequency,
    averagePayment: Math.round(averagePayment * 100) / 100,
    paymentVariability: Math.round(paymentVariability * 1000) / 1000,
    cashFlowBuffer: Math.round(cashFlowBuffer * 100) / 100,
    hasIncomeGap,
    longestGapDays,
    estimatedAnnualIncome: Math.round(estimatedAnnualIncome * 100) / 100,
  };
}

