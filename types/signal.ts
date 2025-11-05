export type SignalType = 
  | 'subscription'
  | 'savings'
  | 'credit'
  | 'income';

export type TimeWindow = '30d' | '180d';

export interface SignalResult {
  userId: string;
  window: TimeWindow;
  timestamp: string;
  subscriptionSignals: SubscriptionSignals;
  savingsSignals: SavingsSignals;
  creditSignals: CreditSignals;
  incomeSignals: IncomeSignals;
}

export interface SubscriptionSignals {
  recurringMerchants: RecurringMerchant[];
  monthlyRecurringSpend: number;
  subscriptionShare: number; // Percentage of total spend
  totalRecurringCount: number;
}

export interface RecurringMerchant {
  merchantName: string;
  occurrences: number;
  averageAmount: number;
  totalAmount: number;
  cadence: 'weekly' | 'monthly';
  lastDate: string;
}

export interface SavingsSignals {
  netInflow: number;
  growthRate: number; // Percentage
  emergencyFundCoverage: number; // In months
  averageMonthlyExpenses: number;
  currentSavingsBalance: number;
}

export interface CreditSignals {
  cards: CreditCardSignal[];
  averageUtilization: number;
  highestUtilization: number;
  hasMinimumPaymentOnly: boolean;
  totalInterestCharges: number;
  hasOverdue: boolean;
}

export interface CreditCardSignal {
  accountId: string;
  cardMask: string;
  utilization: number;
  balance: number;
  limit: number;
  isMinimumPaymentOnly: boolean;
  interestCharges: number;
  isOverdue: boolean;
}

export interface IncomeSignals {
  hasPayrollPattern: boolean;
  paymentFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'variable';
  averagePayment: number;
  paymentVariability: number; // Coefficient of variation
  cashFlowBuffer: number; // In months
  hasIncomeGap: boolean;
  longestGapDays: number;
  estimatedAnnualIncome: number;
}

