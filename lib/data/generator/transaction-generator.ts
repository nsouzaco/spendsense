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

export function generateTransactions(
  userId: string,
  accounts: Account[],
  transactionIndexStart: number,
  random: SeededRandom,
  incomeLevel: 'low' | 'medium' | 'high'
): Transaction[] {
  const transactions: Transaction[] = [];
  let transactionIndex = transactionIndexStart;

  const checkingAccount = accounts.find(a => a.subtype === 'checking');
  const creditAccounts = accounts.filter(a => a.type === 'credit');

  if (!checkingAccount) return transactions;

  // Generate income (payroll) - varies by income level
  const incomeFrequency = random.choice(['biweekly', 'monthly'] as const);
  const incomeAmount = incomeLevel === 'low'
    ? random.nextFloat(1500, 2500)
    : incomeLevel === 'medium'
    ? random.nextFloat(2500, 5000)
    : random.nextFloat(5000, 8000);

  // Generate income transactions over 180 days
  let currentDate = daysAgo(180);
  while (new Date(currentDate) < new Date()) {
    transactions.push({
      id: generateId('txn', transactionIndex++),
      accountId: checkingAccount.id,
      userId,
      amount: Math.round(incomeAmount * 100) / 100,
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
  }

  // Determine subscription count based on random distribution
  const subscriptionCount = random.nextInt(0, 6); // 0-6 subscriptions
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

