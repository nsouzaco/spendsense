import type { Liability, CreditCardDetails, LoanDetails, Account } from '@/types';
import { SeededRandom, generateId, daysAgo, addDays } from './utils';

export function generateLiabilities(
  userId: string,
  accounts: Account[],
  liabilityIndexStart: number,
  random: SeededRandom
): Liability[] {
  const liabilities: Liability[] = [];
  let liabilityIndex = liabilityIndexStart;

  const creditAccounts = accounts.filter(a => a.type === 'credit');

  // Generate credit card liabilities
  for (const account of creditAccounts) {
    const balance = account.currentBalance;
    const limit = account.creditLimit || 5000;
    const utilization = balance / limit;

    // APR varies based on utilization (higher utilization tends to have higher APR)
    const apr = random.nextFloat(12, 25);
    
    // Minimum payment (typically 2-3% of balance or $25, whichever is greater)
    const minimumPaymentAmount = Math.max(25, balance * 0.025);
    
    // Some users pay more than minimum
    const lastPaymentAmount = random.boolean(0.6)
      ? random.nextFloat(minimumPaymentAmount, balance * 0.5)
      : minimumPaymentAmount;

    // 10% chance of being overdue
    const isOverdue = random.boolean(0.1);

    const details: CreditCardDetails = {
      apr: Math.round(apr * 100) / 100,
      minimumPaymentAmount: Math.round(minimumPaymentAmount * 100) / 100,
      lastPaymentAmount: Math.round(lastPaymentAmount * 100) / 100,
      lastPaymentDate: daysAgo(random.nextInt(5, 30)),
      nextPaymentDueDate: addDays(new Date().toISOString().split('T')[0], random.nextInt(5, 25)),
      isOverdue,
    };

    liabilities.push({
      id: generateId('liab', liabilityIndex++),
      userId,
      accountId: account.id,
      type: 'credit_card',
      details,
    });
  }

  // 30% have a mortgage
  if (random.boolean(0.3)) {
    const originalPrincipal = random.nextFloat(150000, 500000);
    const remainingPrincipal = random.nextFloat(originalPrincipal * 0.5, originalPrincipal * 0.95);
    const interestRate = random.nextFloat(3, 6);
    const loanTerm = 360; // 30 years in months
    const monthlyPayment = (remainingPrincipal * (interestRate / 100 / 12)) / 
      (1 - Math.pow(1 + interestRate / 100 / 12, -loanTerm));

    const details: LoanDetails = {
      interestRate: Math.round(interestRate * 100) / 100,
      originationDate: daysAgo(random.nextInt(365, 3650)),
      originalPrincipal: Math.round(originalPrincipal * 100) / 100,
      remainingPrincipal: Math.round(remainingPrincipal * 100) / 100,
      nextPaymentDueDate: addDays(new Date().toISOString().split('T')[0], random.nextInt(5, 25)),
      minimumPaymentAmount: Math.round(monthlyPayment * 100) / 100,
      isOverdue: random.boolean(0.05),
      loanTerm,
    };

    liabilities.push({
      id: generateId('liab', liabilityIndex++),
      userId,
      accountId: generateId('acc', 9999), // Placeholder for loan account
      type: 'mortgage',
      details,
    });
  }

  // 25% have student loans
  if (random.boolean(0.25)) {
    const originalPrincipal = random.nextFloat(15000, 80000);
    const remainingPrincipal = random.nextFloat(originalPrincipal * 0.3, originalPrincipal * 0.9);
    const interestRate = random.nextFloat(4, 7);
    const loanTerm = 120; // 10 years in months
    const monthlyPayment = (remainingPrincipal * (interestRate / 100 / 12)) / 
      (1 - Math.pow(1 + interestRate / 100 / 12, -loanTerm));

    const details: LoanDetails = {
      interestRate: Math.round(interestRate * 100) / 100,
      originationDate: daysAgo(random.nextInt(365, 2555)),
      originalPrincipal: Math.round(originalPrincipal * 100) / 100,
      remainingPrincipal: Math.round(remainingPrincipal * 100) / 100,
      nextPaymentDueDate: addDays(new Date().toISOString().split('T')[0], random.nextInt(5, 25)),
      minimumPaymentAmount: Math.round(monthlyPayment * 100) / 100,
      isOverdue: random.boolean(0.08),
      loanTerm,
    };

    liabilities.push({
      id: generateId('liab', liabilityIndex++),
      userId,
      accountId: generateId('acc', 9998), // Placeholder for loan account
      type: 'student_loan',
      details,
    });
  }

  return liabilities;
}

