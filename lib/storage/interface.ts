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
  getUser(userId: string): User | null;
  getAllUsers(filters?: FilterParams, search?: SearchParams): User[];
  getUserCount(): number;

  // Account operations
  getUserAccounts(userId: string): Account[];
  getAccount(accountId: string): Account | null;

  // Transaction operations
  getUserTransactions(userId: string, limit?: number): Transaction[];
  getAccountTransactions(accountId: string, limit?: number): Transaction[];

  // Liability operations
  getUserLiabilities(userId: string): Liability[];

  // Signal operations
  getUserSignals(userId: string): SignalResult[];
  saveSignals(signals: SignalResult): void;

  // Persona operations
  getUserPersonas(userId: string): PersonaAssignment[];
  savePersona(persona: PersonaAssignment): void;

  // Recommendation operations
  getUserRecommendations(userId: string): Recommendation[];
  getRecommendation(recommendationId: string): Recommendation | null;
  getAllRecommendations(filters?: FilterParams): Recommendation[];
  saveRecommendation(recommendation: Recommendation): void;
  updateRecommendation(recommendationId: string, updates: Partial<Recommendation>): void;

  // Consent operations
  getConsent(userId: string): Consent | null;
  saveConsent(consent: Consent): void;
  revokeConsent(userId: string): void;

  // Operator operations
  saveOperatorAction(action: OperatorAction): void;
  getOperatorActions(limit?: number): OperatorAction[];

  // Metrics
  getSystemMetrics(): SystemMetrics;

  // Bulk operations
  bulkUpdateRecommendations(recommendationIds: string[], updates: Partial<Recommendation>): void;
}

