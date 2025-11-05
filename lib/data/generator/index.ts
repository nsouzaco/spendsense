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

    // Determine income level for this user
    // Ensure good distribution: ~20% low, ~50% medium, ~30% high
    let incomeLevel: 'low' | 'medium' | 'high';
    const roll = random.next();
    if (roll < 0.2) {
      incomeLevel = 'low';
    } else if (roll < 0.7) {
      incomeLevel = 'medium';
    } else {
      incomeLevel = 'high';
    }

    // Generate accounts for this user
    const userAccounts = generateAccounts(user.id, accountIndex, random);
    accounts.push(...userAccounts);
    accountIndex += userAccounts.length;

    // Generate transactions for this user
    const userTransactions = generateTransactions(
      user.id,
      userAccounts,
      transactionIndex,
      random,
      incomeLevel
    );
    transactions.push(...userTransactions);
    transactionIndex += userTransactions.length;

    // Generate liabilities for this user
    const userLiabilities = generateLiabilities(
      user.id,
      userAccounts,
      liabilityIndex,
      random
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

