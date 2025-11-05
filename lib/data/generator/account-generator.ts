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

export function generateAccounts(userId: string, accountIndexStart: number, random: SeededRandom): Account[] {
  const accounts: Account[] = [];
  let accountIndex = accountIndexStart;

  // Everyone gets checking
  accounts.push(createAccount(userId, accountIndex++, ACCOUNT_TEMPLATES[0], random));

  // 80% have savings
  if (random.boolean(0.8)) {
    accounts.push(createAccount(userId, accountIndex++, ACCOUNT_TEMPLATES[1], random));
  }

  // 30% have money market
  if (random.boolean(0.3)) {
    accounts.push(createAccount(userId, accountIndex++, ACCOUNT_TEMPLATES[2], random));
  }

  // 20% have HSA
  if (random.boolean(0.2)) {
    accounts.push(createAccount(userId, accountIndex++, ACCOUNT_TEMPLATES[3], random));
  }

  // 70% have at least one credit card
  if (random.boolean(0.7)) {
    accounts.push(createAccount(userId, accountIndex++, ACCOUNT_TEMPLATES[4], random));
    
    // 30% have a second credit card
    if (random.boolean(0.3)) {
      accounts.push(createAccount(userId, accountIndex++, ACCOUNT_TEMPLATES[4], random));
    }
  }

  return accounts;
}

function createAccount(
  userId: string,
  index: number,
  template: AccountTemplate,
  random: SeededRandom
): Account {
  const balance = random.nextFloat(template.balanceRange[0], template.balanceRange[1]);
  const creditLimit = template.creditLimitRange
    ? random.nextFloat(template.creditLimitRange[0], template.creditLimitRange[1])
    : undefined;

  // For credit cards, balance should be less than limit
  const currentBalance = template.type === 'credit' && creditLimit
    ? Math.min(balance, creditLimit)
    : balance;

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

