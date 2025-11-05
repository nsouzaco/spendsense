import type { Account, Transaction, SavingsSignals } from '@/types';
import { filterTransactionsByDateRange, getDateRange } from './utils';

const SAVINGS_SUBTYPES = ['savings', 'money market', 'cash management', 'hsa'];

export function calculateSavingsSignals(
  accounts: Account[],
  transactions: Transaction[],
  windowDays: number
): SavingsSignals {
  // Get savings-like accounts
  const savingsAccounts = accounts.filter(a => SAVINGS_SUBTYPES.includes(a.subtype));
  
  if (savingsAccounts.length === 0) {
    return {
      netInflow: 0,
      growthRate: 0,
      emergencyFundCoverage: 0,
      averageMonthlyExpenses: 0,
      currentSavingsBalance: 0,
    };
  }
  
  // Calculate current savings balance
  const currentSavingsBalance = savingsAccounts.reduce(
    (sum, acc) => sum + acc.currentBalance,
    0
  );
  
  // Get transactions to/from savings accounts
  const savingsAccountIds = new Set(savingsAccounts.map(a => a.id));
  const savingsTransactions = transactions.filter(t => savingsAccountIds.has(t.accountId));
  
  // Filter by date range
  const { startDate, endDate } = getDateRange(windowDays);
  const filteredTxns = filterTransactionsByDateRange(savingsTransactions, startDate, endDate);
  
  // Calculate net inflow (positive = money in, negative = money out)
  const netInflow = filteredTxns.reduce((sum, t) => {
    return sum + (t.transactionType === 'credit' ? t.amount : -Math.abs(t.amount));
  }, 0);
  
  // Calculate growth rate
  // Estimate starting balance by subtracting net inflow from current balance
  const startingBalance = Math.max(currentSavingsBalance - netInflow, 0);
  const growthRate = startingBalance > 0
    ? ((currentSavingsBalance - startingBalance) / startingBalance) * 100
    : netInflow > 0 ? 100 : 0;
  
  // Calculate average monthly expenses
  const allDebits = transactions.filter(
    t => t.transactionType === 'debit' && 
    !savingsAccountIds.has(t.accountId) && // Exclude transfers to savings
    t.category.primary !== 'Transfer'
  );
  
  const filteredDebits = filterTransactionsByDateRange(allDebits, startDate, endDate);
  const totalExpenses = Math.abs(filteredDebits.reduce((sum, t) => sum + t.amount, 0));
  const averageMonthlyExpenses = (totalExpenses / windowDays) * 30;
  
  // Calculate emergency fund coverage in months
  const emergencyFundCoverage = averageMonthlyExpenses > 0
    ? currentSavingsBalance / averageMonthlyExpenses
    : 0;
  
  return {
    netInflow: Math.round(netInflow * 100) / 100,
    growthRate: Math.round(growthRate * 100) / 100,
    emergencyFundCoverage: Math.round(emergencyFundCoverage * 10) / 10,
    averageMonthlyExpenses: Math.round(averageMonthlyExpenses * 100) / 100,
    currentSavingsBalance: Math.round(currentSavingsBalance * 100) / 100,
  };
}

