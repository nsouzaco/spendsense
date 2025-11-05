export interface Liability {
  id: string;
  userId: string;
  accountId: string;
  type: 'credit_card' | 'mortgage' | 'student_loan' | 'auto_loan';
  details: CreditCardDetails | LoanDetails;
}

export interface CreditCardDetails {
  apr: number;
  minimumPaymentAmount: number;
  lastPaymentAmount?: number;
  lastPaymentDate?: string;
  nextPaymentDueDate?: string;
  isOverdue: boolean;
}

export interface LoanDetails {
  interestRate: number;
  originationDate: string;
  originalPrincipal: number;
  remainingPrincipal: number;
  nextPaymentDueDate?: string;
  minimumPaymentAmount: number;
  isOverdue: boolean;
  loanTerm: number; // in months
}

