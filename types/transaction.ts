export type PaymentChannel = 
  | 'online'
  | 'in store'
  | 'other';

export interface Category {
  primary: string;
  detailed: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  userId: string;
  amount: number;
  date: string;
  authorizedDate?: string;
  name: string;
  merchantName?: string;
  category: Category;
  paymentChannel: PaymentChannel;
  pending: boolean;
  transactionType: 'credit' | 'debit';
  isoCurrencyCode: string;
}

