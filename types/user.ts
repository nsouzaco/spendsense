export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone?: string;
  address?: Address;
  createdAt: string;
  consentStatus: ConsentStatus;
  consentDate?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ConsentStatus {
  active: boolean;
  grantedAt?: string;
  revokedAt?: string;
}

export interface UserProfile {
  user: User;
  accounts: Account[];
  transactions: Transaction[];
  liabilities: Liability[];
  signals: SignalResult[];
  personas: PersonaAssignment[];
  recommendations: Recommendation[];
}

// Re-export types needed in user context
import type { Account } from './account';
import type { Transaction } from './transaction';
import type { Liability } from './liability';
import type { SignalResult } from './signal';
import type { PersonaAssignment } from './persona';
import type { Recommendation } from './recommendation';

