import type { Account, Liability, CreditCardDetails, CreditSignals, CreditCardSignal } from '@/types';
import { CREDIT_THRESHOLDS } from '@/lib/constants/signals';

export function calculateCreditSignals(
  accounts: Account[],
  liabilities: Liability[]
): CreditSignals {
  // Get credit card accounts
  const creditCards = accounts.filter(a => a.type === 'credit' && a.subtype === 'credit card');
  
  if (creditCards.length === 0) {
    return {
      cards: [],
      averageUtilization: 0,
      highestUtilization: 0,
      hasMinimumPaymentOnly: false,
      totalInterestCharges: 0,
      hasOverdue: false,
    };
  }
  
  const cardSignals: CreditCardSignal[] = [];
  
  creditCards.forEach(card => {
    const liability = liabilities.find(l => l.accountId === card.id && l.type === 'credit_card');
    
    if (!liability) return;
    
    const details = liability.details as CreditCardDetails;
    const balance = card.currentBalance;
    const limit = card.creditLimit || 5000;
    const utilization = balance / limit;
    
    // Check if user is only making minimum payments
    // If last payment was within 10% of minimum, consider it minimum-only
    const isMinimumPaymentOnly = details.lastPaymentAmount
      ? Math.abs(details.lastPaymentAmount - details.minimumPaymentAmount) / details.minimumPaymentAmount < 0.1
      : false;
    
    // Estimate monthly interest charges
    const monthlyInterestRate = details.apr / 100 / 12;
    const interestCharges = balance * monthlyInterestRate;
    
    cardSignals.push({
      accountId: card.id,
      cardMask: card.mask,
      utilization: Math.round(utilization * 1000) / 1000,
      balance: Math.round(balance * 100) / 100,
      limit: Math.round(limit * 100) / 100,
      isMinimumPaymentOnly,
      interestCharges: Math.round(interestCharges * 100) / 100,
      isOverdue: details.isOverdue,
    });
  });
  
  // Calculate aggregate metrics
  const averageUtilization = cardSignals.length > 0
    ? cardSignals.reduce((sum, card) => sum + card.utilization, 0) / cardSignals.length
    : 0;
  
  const highestUtilization = cardSignals.length > 0
    ? Math.max(...cardSignals.map(card => card.utilization))
    : 0;
  
  const hasMinimumPaymentOnly = cardSignals.some(card => card.isMinimumPaymentOnly);
  
  const totalInterestCharges = cardSignals.reduce((sum, card) => sum + card.interestCharges, 0);
  
  const hasOverdue = cardSignals.some(card => card.isOverdue);
  
  return {
    cards: cardSignals,
    averageUtilization: Math.round(averageUtilization * 1000) / 1000,
    highestUtilization: Math.round(highestUtilization * 1000) / 1000,
    hasMinimumPaymentOnly,
    totalInterestCharges: Math.round(totalInterestCharges * 100) / 100,
    hasOverdue,
  };
}

