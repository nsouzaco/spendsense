import type { Account, AccountType, AccountSubtype } from '@/types';
import { SeededRandom, generateId } from './utils';

interface AccountTemplate {
  type: AccountType;
  subtype: AccountSubtype;
  name: string;
  officialName: string;
  balanceRange: [number, number];
  creditLimitRange?: [number, number];
}

const ACCOUNT_TEMPLATES: AccountTemplate[] = [
  {
    type: 'depository',
    subtype: 'checking',
    name: 'Plaid Checking',
    officialName: 'Plaid Gold Standard 0% Interest Checking',
    balanceRange: [100, 5000],
  },
  {
    type: 'depository',
    subtype: 'savings',
    name: 'Plaid Savings',
    officialName: 'Plaid Silver Standard 0.1% Interest Saving',
    balanceRange: [500, 15000],
  },
  {
    type: 'depository',
    subtype: 'money market',
    name: 'Money Market',
    officialName: 'High Yield Money Market Account',
    balanceRange: [1000, 25000],
  },
  {
    type: 'depository',
    subtype: 'hsa',
    name: 'Health Savings Account',
    officialName: 'HSA',
    balanceRange: [200, 5000],
  },
  {
    type: 'credit',
    subtype: 'credit card',
    name: 'Plaid Credit Card',
    officialName: 'Plaid Diamond 12.5% APR Interest Credit Card',
    balanceRange: [0, 8000],
    creditLimitRange: [2000, 15000],
  },
];

export type FinancialProfile = 
  | 'savings_builder'
  | 'variable_income'
  | 'low_income'
  | 'high_credit'
  | 'subscription_heavy';

export function generateAccounts(
  userId: string, 
  accountIndexStart: number, 
  random: SeededRandom,
  financialProfile?: FinancialProfile
): Account[] {
  const accounts: Account[] = [];
  let accountIndex = accountIndexStart;

  // Everyone gets checking
  accounts.push(createAccount(userId, accountIndex++, ACCOUNT_TEMPLATES[0], random, financialProfile));

  // Savings account distribution based on profile
  if (financialProfile === 'savings_builder' || financialProfile === 'high_credit') {
    // Savings builders always have savings, high credit users usually do
    accounts.push(createAccount(userId, accountIndex++, ACCOUNT_TEMPLATES[1], random, financialProfile));
  } else if (financialProfile === 'low_income') {
    // Low income: 50% have savings
    if (random.boolean(0.5)) {
      accounts.push(createAccount(userId, accountIndex++, ACCOUNT_TEMPLATES[1], random, financialProfile));
    }
  } else {
    // Others: 80% have savings
    if (random.boolean(0.8)) {
      accounts.push(createAccount(userId, accountIndex++, ACCOUNT_TEMPLATES[1], random, financialProfile));
    }
  }

  // Credit card distribution based on profile
  if (financialProfile === 'high_credit' || financialProfile === 'subscription_heavy') {
    // High credit and subscription heavy always have credit cards
    accounts.push(createAccount(userId, accountIndex++, ACCOUNT_TEMPLATES[4], random, financialProfile));
    
    // 50% chance of second credit card
    if (random.boolean(0.5)) {
      accounts.push(createAccount(userId, accountIndex++, ACCOUNT_TEMPLATES[4], random, financialProfile));
    }
  } else if (financialProfile !== 'savings_builder') {
    // Others: 60% have credit card (except savings builders who have lower rate)
    if (random.boolean(0.4)) {
      accounts.push(createAccount(userId, accountIndex++, ACCOUNT_TEMPLATES[4], random, financialProfile));
    }
  }

  return accounts;
}

function createAccount(
  userId: string,
  index: number,
  template: AccountTemplate,
  random: SeededRandom,
  financialProfile?: FinancialProfile
): Account {
  let balance = random.nextFloat(template.balanceRange[0], template.balanceRange[1]);
  let creditLimit = template.creditLimitRange
    ? random.nextFloat(template.creditLimitRange[0], template.creditLimitRange[1])
    : undefined;

  // Adjust balances based on financial profile
  if (template.subtype === 'savings') {
    if (financialProfile === 'savings_builder') {
      balance = random.nextFloat(8000, 25000); // High savings
    } else if (financialProfile === 'low_income') {
      balance = random.nextFloat(200, 1500); // Low savings
    }
  }

  // For credit cards, set utilization based on profile
  let currentBalance = balance;
  if (template.type === 'credit' && creditLimit) {
    if (financialProfile === 'high_credit') {
      // 70-95% utilization
      currentBalance = creditLimit * random.nextFloat(0.70, 0.95);
    } else if (financialProfile === 'savings_builder') {
      // 5-20% utilization
      currentBalance = creditLimit * random.nextFloat(0.05, 0.20);
    } else if (financialProfile === 'subscription_heavy') {
      // 30-50% utilization
      currentBalance = creditLimit * random.nextFloat(0.30, 0.50);
    } else {
      // 20-50% utilization
      currentBalance = Math.min(balance, creditLimit * random.nextFloat(0.20, 0.50));
    }
  }

  const mask = String(random.nextInt(1000, 9999));

  return {
    id: generateId('acc', index),
    userId,
    name: template.name,
    officialName: template.officialName,
    type: template.type,
    subtype: template.subtype,
    mask,
    currentBalance: Math.round(currentBalance * 100) / 100,
    availableBalance: template.type === 'credit' && creditLimit
      ? Math.round((creditLimit - currentBalance) * 100) / 100
      : Math.round(currentBalance * 100) / 100,
    creditLimit: creditLimit ? Math.round(creditLimit * 100) / 100 : undefined,
    currencyCode: 'USD',
    isoCurrencyCode: 'USD',
  };
}

