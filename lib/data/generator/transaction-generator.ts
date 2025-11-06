import type { Transaction, Account, Category, PaymentChannel } from '@/types';
import { SeededRandom, generateId, daysAgo, addDays } from './utils';
import { TRANSACTION_CATEGORIES, COMMON_SUBSCRIPTION_MERCHANTS } from '@/lib/constants/categories';

interface TransactionTemplate {
  category: Category;
  merchantNames: string[];
  amountRange: [number, number];
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
  isSubscription?: boolean;
}

const TRANSACTION_TEMPLATES: TransactionTemplate[] = [
  // Subscriptions
  {
    category: { primary: 'Service', detailed: 'Streaming Services' },
    merchantNames: ['Netflix', 'Spotify', 'Hulu', 'Disney+', 'HBO Max'],
    amountRange: [9.99, 19.99],
    frequency: 'monthly',
    isSubscription: true,
  },
  {
    category: { primary: 'Service', detailed: 'Software' },
    merchantNames: ['Adobe', 'Microsoft 365', 'iCloud', 'Dropbox', 'Google One'],
    amountRange: [4.99, 52.99],
    frequency: 'monthly',
    isSubscription: true,
  },
  {
    category: { primary: 'Recreation', detailed: 'Gyms and Fitness Centers' },
    merchantNames: ['Planet Fitness', 'LA Fitness', 'Peloton', 'ClassPass'],
    amountRange: [29.99, 99.99],
    frequency: 'monthly',
    isSubscription: true,
  },
  // Regular expenses
  {
    category: { primary: 'Food and Drink', detailed: 'Groceries' },
    merchantNames: ['Whole Foods', 'Trader Joes', 'Safeway', 'Walmart', 'Target'],
    amountRange: [40, 150],
    frequency: 'weekly',
  },
  {
    category: { primary: 'Food and Drink', detailed: 'Restaurants' },
    merchantNames: ['Chipotle', 'Panera', 'Olive Garden', 'Local Restaurant'],
    amountRange: [15, 60],
    frequency: 'weekly',
  },
  {
    category: { primary: 'Food and Drink', detailed: 'Coffee Shop' },
    merchantNames: ['Starbucks', 'Dunkin', 'Local Coffee Shop'],
    amountRange: [4, 8],
    frequency: 'daily',
  },
  {
    category: { primary: 'Travel', detailed: 'Gas Stations' },
    merchantNames: ['Shell', 'Chevron', 'BP', 'Exxon'],
    amountRange: [30, 70],
    frequency: 'weekly',
  },
  {
    category: { primary: 'Shops', detailed: 'General Merchandise' },
    merchantNames: ['Amazon', 'Target', 'Walmart', 'Costco'],
    amountRange: [20, 200],
    frequency: 'occasional',
  },
  {
    category: { primary: 'Service', detailed: 'Phone' },
    merchantNames: ['Verizon', 'AT&T', 'T-Mobile', 'Sprint'],
    amountRange: [60, 120],
    frequency: 'monthly',
  },
  {
    category: { primary: 'Service', detailed: 'Internet' },
    merchantNames: ['Comcast', 'Spectrum', 'AT&T Internet', 'Verizon FiOS'],
    amountRange: [50, 100],
    frequency: 'monthly',
  },
];

const INCOME_TEMPLATE = {
  category: { primary: 'Income', detailed: 'Payroll' },
  merchantNames: ['Direct Deposit', 'Payroll'],
  amountRange: [1500, 8000],
};

export type FinancialProfile = 
  | 'savings_builder'
  | 'variable_income'
  | 'low_income'
  | 'high_credit'
  | 'subscription_heavy';

export function generateTransactions(
  userId: string,
  accounts: Account[],
  transactionIndexStart: number,
  random: SeededRandom,
  incomeLevel: 'low' | 'medium' | 'high',
  financialProfile?: FinancialProfile
): Transaction[] {
  const transactions: Transaction[] = [];
  let transactionIndex = transactionIndexStart;

  const checkingAccount = accounts.find(a => a.subtype === 'checking');
  const creditAccounts = accounts.filter(a => a.type === 'credit');

  if (!checkingAccount) return transactions;

  // Generate income (payroll) - varies by income level
  const incomeFrequency = random.choice(['biweekly', 'monthly'] as const);
  const incomeAmount = incomeLevel === 'low'
    ? random.nextFloat(1200, 2000) // Lower for low_income profile
    : incomeLevel === 'medium'
    ? random.nextFloat(2500, 4500)
    : random.nextFloat(5000, 7500);

  // Generate income transactions over 180 days
  let currentDate = daysAgo(180);
  let incomeTransactionCount = 0;
  
  while (new Date(currentDate) < new Date()) {
    // Skip some income for variable_income profile (create gaps)
    if (financialProfile === 'variable_income' && incomeTransactionCount > 2 && random.boolean(0.25)) {
      currentDate = addDays(currentDate, incomeFrequency === 'biweekly' ? 14 : 30);
      incomeTransactionCount++;
      continue;
    }
    
    // Variable income amounts
    let finalIncome = incomeAmount;
    if (financialProfile === 'variable_income') {
      const variability = random.nextFloat(-0.35, 0.45); // -35% to +45% variation
      finalIncome = incomeAmount * (1 + variability);
    }
    
    transactions.push({
      id: generateId('txn', transactionIndex++),
      accountId: checkingAccount.id,
      userId,
      amount: Math.round(finalIncome * 100) / 100,
      date: currentDate,
      name: random.choice(INCOME_TEMPLATE.merchantNames),
      merchantName: 'Employer',
      category: INCOME_TEMPLATE.category,
      paymentChannel: 'other',
      pending: false,
      transactionType: 'credit',
      isoCurrencyCode: 'USD',
    });

    // Next income date
    currentDate = addDays(currentDate, incomeFrequency === 'biweekly' ? 14 : 30);
    incomeTransactionCount++;
  }

  // Determine subscription count based on financial profile
  let subscriptionCount: number;
  if (financialProfile === 'subscription_heavy') {
    subscriptionCount = random.nextInt(6, 9); // 6-8 subscriptions
  } else if (financialProfile === 'savings_builder') {
    subscriptionCount = random.nextInt(1, 3); // 1-2 subscriptions
  } else {
    subscriptionCount = random.nextInt(0, 4); // 0-3 subscriptions
  }
  const activeSubscriptions = random.sample(
    TRANSACTION_TEMPLATES.filter(t => t.isSubscription),
    Math.min(subscriptionCount, TRANSACTION_TEMPLATES.filter(t => t.isSubscription).length)
  );

  // Generate subscription transactions
  for (const template of activeSubscriptions) {
    const merchant = random.choice(template.merchantNames);
    const amount = random.nextFloat(template.amountRange[0], template.amountRange[1]);
    const useCredit = creditAccounts.length > 0 && random.boolean(0.6);
    const account = useCredit ? random.choice(creditAccounts) : checkingAccount;

    // Generate monthly occurrences over 180 days
    let subDate = daysAgo(180);
    while (new Date(subDate) < new Date()) {
      transactions.push({
        id: generateId('txn', transactionIndex++),
        accountId: account.id,
        userId,
        amount: -Math.round(amount * 100) / 100,
        date: subDate,
        name: merchant,
        merchantName: merchant,
        category: template.category,
        paymentChannel: 'online',
        pending: false,
        transactionType: 'debit',
        isoCurrencyCode: 'USD',
      });
      subDate = addDays(subDate, 30);
    }
  }

  // Generate regular transactions
  const regularTemplates = TRANSACTION_TEMPLATES.filter(t => !t.isSubscription);
  
  for (let day = 0; day < 180; day++) {
    const date = daysAgo(180 - day);
    
    for (const template of regularTemplates) {
      let shouldGenerate = false;
      
      if (template.frequency === 'daily' && random.boolean(0.3)) {
        shouldGenerate = true;
      } else if (template.frequency === 'weekly' && day % 7 === 0 && random.boolean(0.7)) {
        shouldGenerate = true;
      } else if (template.frequency === 'monthly' && day % 30 === 0 && random.boolean(0.9)) {
        shouldGenerate = true;
      } else if (template.frequency === 'occasional' && random.boolean(0.02)) {
        shouldGenerate = true;
      }

      if (shouldGenerate) {
        const merchant = random.choice(template.merchantNames);
        const amount = random.nextFloat(template.amountRange[0], template.amountRange[1]);
        const useCredit = creditAccounts.length > 0 && random.boolean(0.4);
        const account = useCredit ? random.choice(creditAccounts) : checkingAccount;

        transactions.push({
          id: generateId('txn', transactionIndex++),
          accountId: account.id,
          userId,
          amount: -Math.round(amount * 100) / 100,
          date,
          name: merchant,
          merchantName: merchant,
          category: template.category,
          paymentChannel: random.choice(['online', 'in store'] as PaymentChannel[]),
          pending: day > 177 && random.boolean(0.1), // Some recent transactions pending
          transactionType: 'debit',
          isoCurrencyCode: 'USD',
        });
      }
    }
  }

  return transactions;
}

