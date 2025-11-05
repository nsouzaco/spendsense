import type {
  User,
  Account,
  Transaction,
  Liability,
  SignalResult,
  PersonaAssignment,
  Recommendation,
  Consent,
  OperatorAction,
  SystemMetrics,
  FilterParams,
  SearchParams,
} from '@/types';

export interface StorageAdapter {
  // User operations
  getUser(userId: string): Promise<User | null>;
  getAllUsers(filters?: FilterParams, search?: SearchParams): Promise<User[]>;
  getUserCount(): Promise<number>;

  // Account operations
  getUserAccounts(userId: string): Promise<Account[]>;
  getAccount(accountId: string): Promise<Account | null>;

  // Transaction operations
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  getAccountTransactions(accountId: string, limit?: number): Promise<Transaction[]>;

  // Liability operations
  getUserLiabilities(userId: string): Promise<Liability[]>;

  // Signal operations
  getUserSignals(userId: string): Promise<SignalResult[]>;
  saveSignals(signals: SignalResult): Promise<void>;

  // Persona operations
  getUserPersonas(userId: string): Promise<PersonaAssignment[]>;
  savePersona(persona: PersonaAssignment): Promise<void>;

  // Recommendation operations
  getUserRecommendations(userId: string): Promise<Recommendation[]>;
  getRecommendation(recommendationId: string): Promise<Recommendation | null>;
  getAllRecommendations(filters?: FilterParams): Promise<Recommendation[]>;
  saveRecommendation(recommendation: Recommendation): Promise<void>;
  updateRecommendation(recommendationId: string, updates: Partial<Recommendation>): Promise<void>;

  // Consent operations
  getConsent(userId: string): Promise<Consent | null>;
  saveConsent(consent: Consent): Promise<void>;
  revokeConsent(userId: string): Promise<void>;

  // Operator operations
  saveOperatorAction(action: OperatorAction): Promise<void>;
  getOperatorActions(limit?: number): Promise<OperatorAction[]>;

  // Metrics
  getSystemMetrics(): Promise<SystemMetrics>;

  // Bulk operations
  bulkUpdateRecommendations(recommendationIds: string[], updates: Partial<Recommendation>): Promise<void>;
}

