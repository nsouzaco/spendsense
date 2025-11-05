import type {
  User,
  Account,
  Transaction,
  Liability,
  SignalResult,
  Persona,
  Recommendation,
  IStorage,
} from '@/types';

export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private accounts: Map<string, Account> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private liabilities: Map<string, Liability> = new Map();
  private signals: Map<string, SignalResult> = new Map();
  private personas: Map<string, Persona> = new Map();
  private recommendations: Map<string, Recommendation> = new Map();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const syntheticData = await import('@/data/synthetic-users.json');
      const data = syntheticData.default || syntheticData;

      // Load users
      data.users?.forEach((user: User) => {
        this.users.set(user.id, user);
      });

      // Load accounts
      data.accounts?.forEach((account: Account) => {
        this.accounts.set(account.id, account);
      });

      // Load transactions
      data.transactions?.forEach((tx: Transaction) => {
        this.transactions.set(tx.id, tx);
      });

      // Load liabilities
      data.liabilities?.forEach((liability: Liability) => {
        this.liabilities.set(liability.id, liability);
      });

      this.initialized = true;
      console.log(`✅ Loaded ${this.users.size} users, ${this.accounts.size} accounts, ${this.transactions.size} transactions`);
    } catch (error) {
      console.error('Failed to load synthetic data:', error);
    }
  }

  // Users
  saveUser(user: User): void {
    this.users.set(user.id, user);
  }

  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Accounts
  saveAccount(account: Account): void {
    this.accounts.set(account.id, account);
  }

  getUserAccounts(userId: string): Account[] {
    return Array.from(this.accounts.values()).filter((a) => a.userId === userId);
  }

  // Transactions
  saveTransaction(transaction: Transaction): void {
    this.transactions.set(transaction.id, transaction);
  }

  getUserTransactions(userId: string): Transaction[] {
    const userAccountIds = new Set(
      Array.from(this.accounts.values())
        .filter((a) => a.userId === userId)
        .map((a) => a.id)
    );

    return Array.from(this.transactions.values()).filter((t) =>
      userAccountIds.has(t.accountId)
    );
  }

  // Liabilities
  saveLiability(liability: Liability): void {
    this.liabilities.set(liability.id, liability);
  }

  getUserLiabilities(userId: string): Liability[] {
    return Array.from(this.liabilities.values()).filter((l) => l.userId === userId);
  }

  // Signals
  saveSignals(signals: SignalResult): void {
    const key = `${signals.userId}_${signals.window}`;
    this.signals.set(key, signals);
  }

  getUserSignals(userId: string): SignalResult[] {
    return Array.from(this.signals.values()).filter((s) => s.userId === userId);
  }

  // Personas
  savePersona(persona: Persona): void {
    this.personas.set(persona.id, persona);
  }

  getUserPersonas(userId: string): Persona[] {
    return Array.from(this.personas.values()).filter((p) => p.userId === userId);
  }

  // Recommendations
  saveRecommendation(recommendation: Recommendation): void {
    this.recommendations.set(recommendation.id, recommendation);
  }

  getUserRecommendations(userId: string): Recommendation[] {
    return Array.from(this.recommendations.values()).filter(
      (r) => r.userId === userId
    );
  }

  getAllRecommendations(): Recommendation[] {
    return Array.from(this.recommendations.values());
  }

  // Consent
  updateConsent(userId: string, active: boolean): void {
    const user = this.users.get(userId);
    if (user) {
      user.consentStatus.active = active;
      user.consentStatus.lastModified = new Date();
      if (!active) {
        user.consentStatus.revokedAt = new Date();
      }
      this.users.set(userId, user);
    }
  }
}
