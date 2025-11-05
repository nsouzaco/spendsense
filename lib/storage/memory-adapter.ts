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
import type { StorageAdapter } from './interface';

export class MemoryStorageAdapter implements StorageAdapter {
  private users: Map<string, User> = new Map();
  private accounts: Map<string, Account> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private liabilities: Map<string, Liability> = new Map();
  private signals: Map<string, SignalResult[]> = new Map();
  private personas: Map<string, PersonaAssignment[]> = new Map();
  private recommendations: Map<string, Recommendation> = new Map();
  private consents: Map<string, Consent> = new Map();
  private operatorActions: OperatorAction[] = [];

  // Indexes for faster lookups
  private accountsByUser: Map<string, string[]> = new Map();
  private transactionsByUser: Map<string, string[]> = new Map();
  private transactionsByAccount: Map<string, string[]> = new Map();
  private liabilitiesByUser: Map<string, string[]> = new Map();
  private recommendationsByUser: Map<string, string[]> = new Map();

  constructor(data?: {
    users: User[];
    accounts: Account[];
    transactions: Transaction[];
    liabilities: Liability[];
  }) {
    if (data) {
      this.loadData(data);
    }
  }

  private loadData(data: {
    users: User[];
    accounts: Account[];
    transactions: Transaction[];
    liabilities: Liability[];
  }) {
    // Load users
    data.users.forEach(user => {
      this.users.set(user.id, user);
      // Initialize consent from user
      this.consents.set(user.id, {
        userId: user.id,
        active: user.consentStatus.active,
        grantedAt: user.consentStatus.grantedAt,
      });
    });

    // Load accounts
    data.accounts.forEach(account => {
      this.accounts.set(account.id, account);
      if (!this.accountsByUser.has(account.userId)) {
        this.accountsByUser.set(account.userId, []);
      }
      this.accountsByUser.get(account.userId)!.push(account.id);
    });

    // Load transactions
    data.transactions.forEach(transaction => {
      this.transactions.set(transaction.id, transaction);
      
      if (!this.transactionsByUser.has(transaction.userId)) {
        this.transactionsByUser.set(transaction.userId, []);
      }
      this.transactionsByUser.get(transaction.userId)!.push(transaction.id);

      if (!this.transactionsByAccount.has(transaction.accountId)) {
        this.transactionsByAccount.set(transaction.accountId, []);
      }
      this.transactionsByAccount.get(transaction.accountId)!.push(transaction.id);
    });

    // Load liabilities
    data.liabilities.forEach(liability => {
      this.liabilities.set(liability.id, liability);
      if (!this.liabilitiesByUser.has(liability.userId)) {
        this.liabilitiesByUser.set(liability.userId, []);
      }
      this.liabilitiesByUser.get(liability.userId)!.push(liability.id);
    });
  }

  // User operations
  async getUser(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  async getAllUsers(filters?: FilterParams, search?: SearchParams): Promise<User[]> {
    let users = Array.from(this.users.values());

    // Apply filters
    if (filters) {
      users = users.filter(user => {
        if (filters.hasConsent !== undefined) {
          const consent = this.consents.get(user.id);
          if (consent?.active !== filters.hasConsent) return false;
        }

        if (filters.persona && filters.persona.length > 0) {
          const personas = this.personas.get(user.id) || [];
          const hasMatchingPersona = personas.some(p =>
            filters.persona!.includes(p.personaType)
          );
          if (!hasMatchingPersona) return false;
        }

        return true;
      });
    }

    // Apply search
    if (search?.query) {
      const query = search.query.toLowerCase();
      users = users.filter(user => {
        return (
          user.id.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query)
        );
      });
    }

    return users;
  }

  async getUserCount(): Promise<number> {
    return this.users.size;
  }

  // Account operations
  async getUserAccounts(userId: string): Promise<Account[]> {
    const accountIds = this.accountsByUser.get(userId) || [];
    return accountIds.map(id => this.accounts.get(id)!).filter(Boolean);
  }

  async getAccount(accountId: string): Promise<Account | null> {
    return this.accounts.get(accountId) || null;
  }

  // Transaction operations
  async getUserTransactions(userId: string, limit?: number): Promise<Transaction[]> {
    const transactionIds = this.transactionsByUser.get(userId) || [];
    let transactions = transactionIds.map(id => this.transactions.get(id)!).filter(Boolean);
    
    // Sort by date descending
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (limit) {
      transactions = transactions.slice(0, limit);
    }

    return transactions;
  }

  async getAccountTransactions(accountId: string, limit?: number): Promise<Transaction[]> {
    const transactionIds = this.transactionsByAccount.get(accountId) || [];
    let transactions = transactionIds.map(id => this.transactions.get(id)!).filter(Boolean);
    
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (limit) {
      transactions = transactions.slice(0, limit);
    }

    return transactions;
  }

  // Liability operations
  async getUserLiabilities(userId: string): Promise<Liability[]> {
    const liabilityIds = this.liabilitiesByUser.get(userId) || [];
    return liabilityIds.map(id => this.liabilities.get(id)!).filter(Boolean);
  }

  // Signal operations
  async getUserSignals(userId: string): Promise<SignalResult[]> {
    return this.signals.get(userId) || [];
  }

  async saveSignals(signals: SignalResult): Promise<void> {
    const existing = this.signals.get(signals.userId) || [];
    const updated = existing.filter(s => s.window !== signals.window);
    updated.push(signals);
    this.signals.set(signals.userId, updated);
  }

  // Persona operations
  async getUserPersonas(userId: string): Promise<PersonaAssignment[]> {
    return this.personas.get(userId) || [];
  }

  async savePersona(persona: PersonaAssignment): Promise<void> {
    const existing = this.personas.get(persona.userId) || [];
    existing.push(persona);
    this.personas.set(persona.userId, existing);
  }

  // Recommendation operations
  async getUserRecommendations(userId: string): Promise<Recommendation[]> {
    const recommendationIds = this.recommendationsByUser.get(userId) || [];
    return recommendationIds.map(id => this.recommendations.get(id)!).filter(Boolean);
  }

  async getRecommendation(recommendationId: string): Promise<Recommendation | null> {
    return this.recommendations.get(recommendationId) || null;
  }

  async getAllRecommendations(filters?: FilterParams): Promise<Recommendation[]> {
    let recs = Array.from(this.recommendations.values());

    if (filters?.persona && filters.persona.length > 0) {
      recs = recs.filter(rec => filters.persona!.includes(rec.personaType));
    }

    return recs;
  }

  async saveRecommendation(recommendation: Recommendation): Promise<void> {
    this.recommendations.set(recommendation.id, recommendation);
    
    if (!this.recommendationsByUser.has(recommendation.userId)) {
      this.recommendationsByUser.set(recommendation.userId, []);
    }
    this.recommendationsByUser.get(recommendation.userId)!.push(recommendation.id);
  }

  async updateRecommendation(recommendationId: string, updates: Partial<Recommendation>): Promise<void> {
    const existing = this.recommendations.get(recommendationId);
    if (existing) {
      this.recommendations.set(recommendationId, { ...existing, ...updates });
    }
  }

  // Consent operations
  async getConsent(userId: string): Promise<Consent | null> {
    return this.consents.get(userId) || null;
  }

  async saveConsent(consent: Consent): Promise<void> {
    this.consents.set(consent.userId, consent);
  }

  async revokeConsent(userId: string): Promise<void> {
    const existing = this.consents.get(userId);
    if (existing) {
      this.consents.set(userId, {
        ...existing,
        active: false,
        revokedAt: new Date().toISOString(),
      });
    }
  }

  // Operator operations
  async saveOperatorAction(action: OperatorAction): Promise<void> {
    this.operatorActions.push(action);
  }

  async getOperatorActions(limit?: number): Promise<OperatorAction[]> {
    const actions = [...this.operatorActions].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return limit ? actions.slice(0, limit) : actions;
  }

  // Metrics
  async getSystemMetrics(): Promise<SystemMetrics> {
    const totalUsers = this.users.size;
    const usersWithConsent = Array.from(this.consents.values()).filter(c => c.active).length;
    const usersWithPersona = Array.from(this.personas.keys()).length;
    
    const allRecommendations = Array.from(this.recommendations.values());
    const recommendationsByStatus = {
      pending: allRecommendations.filter(r => r.status === 'pending').length,
      approved: allRecommendations.filter(r => r.status === 'approved').length,
      rejected: allRecommendations.filter(r => r.status === 'rejected').length,
      flagged: allRecommendations.filter(r => r.status === 'flagged').length,
    };

    return {
      totalUsers,
      usersWithConsent,
      usersWithPersona,
      coveragePercentage: totalUsers > 0 ? (usersWithPersona / totalUsers) * 100 : 0,
      totalRecommendations: allRecommendations.length,
      averageRecommendationsPerUser: usersWithPersona > 0 
        ? allRecommendations.length / usersWithPersona 
        : 0,
      recommendationsByStatus,
      averageLatency: 0, // Will be calculated during processing
      errorCount: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  // Bulk operations
  async bulkUpdateRecommendations(recommendationIds: string[], updates: Partial<Recommendation>): Promise<void> {
    for (const id of recommendationIds) {
      await this.updateRecommendation(id, updates);
    }
  }
}

