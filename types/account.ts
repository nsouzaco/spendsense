export type AccountType = 
  | 'depository'
  | 'credit'
  | 'loan'
  | 'investment';

export type AccountSubtype = 
  | 'checking'
  | 'savings'
  | 'money market'
  | 'cd'
  | 'cash management'
  | 'hsa'
  | 'credit card'
  | 'mortgage'
  | 'student'
  | 'auto';

export interface Account {
  id: string;
  userId: string;
  name: string;
  officialName: string;
  type: AccountType;
  subtype: AccountSubtype;
  mask: string; // Last 4 digits
  currentBalance: number;
  availableBalance?: number;
  creditLimit?: number;
  currencyCode: string;
  isoCurrencyCode: string;
}

