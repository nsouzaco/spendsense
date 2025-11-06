import type { User, Account, Transaction, Liability } from '@/types';
import { SeededRandom } from './utils';
import { generateUser } from './user-generator';
import { generateAccounts } from './account-generator';
import { generateTransactions } from './transaction-generator';
import { generateLiabilities } from './liability-generator';

export interface SyntheticDataset {
  users: User[];
  accounts: Account[];
  transactions: Transaction[];
  liabilities: Liability[];
  metadata: {
    generatedAt: string;
    seed: number;
    userCount: number;
    accountCount: number;
    transactionCount: number;
    liabilityCount: number;
  };
}

export type FinancialProfile = 
  | 'savings_builder'    // Low credit, high savings, regular deposits
  | 'variable_income'    // Irregular income, income gaps
  | 'low_income'         // Lower salary
  | 'high_credit'        // High credit utilization
  | 'subscription_heavy'; // Many subscriptions

export function generateSyntheticData(
  userCount: number = 75,
  seed: number = 42
): SyntheticDataset {
  const random = new SeededRandom(seed);
  
  const users: User[] = [];
  const accounts: Account[] = [];
  const transactions: Transaction[] = [];
  const liabilities: Liability[] = [];
  
  let accountIndex = 0;
  let transactionIndex = 0;
  let liabilityIndex = 0;

  for (let i = 0; i < userCount; i++) {
    // Generate user
    const user = generateUser(i, random);
    users.push(user);

    // Determine financial profile - EQUAL distribution across 5 types
    let financialProfile: FinancialProfile;
    let incomeLevel: 'low' | 'medium' | 'high';
    
    const profileIndex = i % 5; // Cycle through 0,1,2,3,4
    
    switch(profileIndex) {
      case 0:
        financialProfile = 'savings_builder';
        incomeLevel = 'high';
        break;
      case 1:
        financialProfile = 'variable_income';
        incomeLevel = 'medium';
        break;
      case 2:
        financialProfile = 'low_income';
        incomeLevel = 'low';
        break;
      case 3:
        financialProfile = 'high_credit';
        incomeLevel = 'medium';
        break;
      case 4:
        financialProfile = 'subscription_heavy';
        incomeLevel = 'medium';
        break;
      default:
        financialProfile = 'savings_builder';
        incomeLevel = 'medium';
    }

    // Generate accounts for this user
    const userAccounts = generateAccounts(user.id, accountIndex, random, financialProfile);
    accounts.push(...userAccounts);
    accountIndex += userAccounts.length;

    // Generate transactions for this user
    const userTransactions = generateTransactions(
      user.id,
      userAccounts,
      transactionIndex,
      random,
      incomeLevel,
      financialProfile
    );
    transactions.push(...userTransactions);
    transactionIndex += userTransactions.length;

    // Generate liabilities for this user
    const userLiabilities = generateLiabilities(
      user.id,
      userAccounts,
      liabilityIndex,
      random,
      financialProfile
    );
    liabilities.push(...userLiabilities);
    liabilityIndex += userLiabilities.length;
  }

  return {
    users,
    accounts,
    transactions,
    liabilities,
    metadata: {
      generatedAt: new Date().toISOString(),
      seed,
      userCount: users.length,
      accountCount: accounts.length,
      transactionCount: transactions.length,
      liabilityCount: liabilities.length,
    },
  };
}

