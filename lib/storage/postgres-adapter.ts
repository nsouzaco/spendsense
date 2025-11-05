import { sql } from '@vercel/postgres';
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

export class PostgresStorageAdapter implements StorageAdapter {
  // User operations
  async getUser(userId: string): Promise<User | null> {
    const result = await sql`SELECT * FROM users WHERE id = ${userId}`;
    return result.rows[0] ? this.parseUser(result.rows[0]) : null;
  }

  async getAllUsers(filters?: FilterParams, search?: SearchParams): Promise<User[]> {
    let query = 'SELECT * FROM users WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.hasConsent !== undefined) {
      query += ` AND consent_active = $${paramIndex++}`;
      params.push(filters.hasConsent);
    }

    if (search?.query) {
      query += ` AND (email ILIKE $${paramIndex++} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`;
      const searchPattern = `%${search.query}%`;
      params.push(searchPattern, searchPattern, searchPattern);
      paramIndex++;
    }

    const result = await sql.query(query, params);
    return result.rows.map(row => this.parseUser(row));
  }

  getUserCount(): Promise<number> {
    return sql`SELECT COUNT(*) as count FROM users`.then(r => parseInt(r.rows[0].count));
  }

  // Account operations
  async getUserAccounts(userId: string): Promise<Account[]> {
    const result = await sql`SELECT * FROM accounts WHERE user_id = ${userId}`;
    return result.rows.map(row => this.parseAccount(row));
  }

  async getAccount(accountId: string): Promise<Account | null> {
    const result = await sql`SELECT * FROM accounts WHERE id = ${accountId}`;
    return result.rows[0] ? this.parseAccount(result.rows[0]) : null;
  }

  // Transaction operations
  async getUserTransactions(userId: string, limit?: number): Promise<Transaction[]> {
    const result = limit
      ? await sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY date DESC LIMIT ${limit}`
      : await sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY date DESC`;
    return result.rows.map(row => this.parseTransaction(row));
  }

  async getAccountTransactions(accountId: string, limit?: number): Promise<Transaction[]> {
    const result = limit
      ? await sql`SELECT * FROM transactions WHERE account_id = ${accountId} ORDER BY date DESC LIMIT ${limit}`
      : await sql`SELECT * FROM transactions WHERE account_id = ${accountId} ORDER BY date DESC`;
    return result.rows.map(row => this.parseTransaction(row));
  }

  // Liability operations
  async getUserLiabilities(userId: string): Promise<Liability[]> {
    const result = await sql`SELECT * FROM liabilities WHERE user_id = ${userId}`;
    return result.rows.map(row => this.parseLiability(row));
  }

  // Signal operations
  async getUserSignals(userId: string): Promise<SignalResult[]> {
    const result = await sql`SELECT * FROM signals WHERE user_id = ${userId} ORDER BY timestamp DESC`;
    return result.rows.map(row => JSON.parse(row.data));
  }

  async saveSignals(signals: SignalResult): Promise<void> {
    await sql`
      INSERT INTO signals (user_id, window, timestamp, data)
      VALUES (${signals.userId}, ${signals.window}, ${signals.timestamp}, ${JSON.stringify(signals)})
      ON CONFLICT (user_id, window) DO UPDATE SET
        timestamp = ${signals.timestamp},
        data = ${JSON.stringify(signals)}
    `;
  }

  // Persona operations
  async getUserPersonas(userId: string): Promise<PersonaAssignment[]> {
    const result = await sql`SELECT * FROM personas WHERE user_id = ${userId} ORDER BY assigned_at DESC`;
    return result.rows.map(row => JSON.parse(row.data));
  }

  async savePersona(persona: PersonaAssignment): Promise<void> {
    await sql`
      INSERT INTO personas (user_id, persona_type, assigned_at, data)
      VALUES (${persona.userId}, ${persona.personaType}, ${persona.assignedAt}, ${JSON.stringify(persona)})
    `;
  }

  // Recommendation operations
  async getUserRecommendations(userId: string): Promise<Recommendation[]> {
    const result = await sql`SELECT * FROM recommendations WHERE user_id = ${userId} ORDER BY created_at DESC`;
    return result.rows.map(row => JSON.parse(row.data));
  }

  async getRecommendation(recommendationId: string): Promise<Recommendation | null> {
    const result = await sql`SELECT * FROM recommendations WHERE id = ${recommendationId}`;
    return result.rows[0] ? JSON.parse(result.rows[0].data) : null;
  }

  async getAllRecommendations(filters?: FilterParams): Promise<Recommendation[]> {
    let query = 'SELECT * FROM recommendations WHERE 1=1';
    const params: any[] = [];

    if (filters?.persona && filters.persona.length > 0) {
      query += ` AND persona_type = ANY($1)`;
      params.push(filters.persona);
    }

    query += ' ORDER BY created_at DESC';
    const result = await sql.query(query, params);
    return result.rows.map(row => JSON.parse(row.data));
  }

  async saveRecommendation(recommendation: Recommendation): Promise<void> {
    await sql`
      INSERT INTO recommendations (id, user_id, persona_type, created_at, data)
      VALUES (
        ${recommendation.id},
        ${recommendation.userId},
        ${recommendation.personaType},
        ${recommendation.createdAt},
        ${JSON.stringify(recommendation)}
      )
      ON CONFLICT (id) DO UPDATE SET
        data = ${JSON.stringify(recommendation)}
    `;
  }

  async updateRecommendation(recommendationId: string, updates: Partial<Recommendation>): Promise<void> {
    const existing = await this.getRecommendation(recommendationId);
    if (existing) {
      const updated = { ...existing, ...updates };
      await this.saveRecommendation(updated);
    }
  }

  // Consent operations
  async getConsent(userId: string): Promise<Consent | null> {
    const result = await sql`SELECT * FROM consents WHERE user_id = ${userId}`;
    return result.rows[0] ? JSON.parse(result.rows[0].data) : null;
  }

  async saveConsent(consent: Consent): Promise<void> {
    await sql`
      INSERT INTO consents (user_id, active, data)
      VALUES (${consent.userId}, ${consent.active}, ${JSON.stringify(consent)})
      ON CONFLICT (user_id) DO UPDATE SET
        active = ${consent.active},
        data = ${JSON.stringify(consent)}
    `;
  }

  async revokeConsent(userId: string): Promise<void> {
    const existing = await this.getConsent(userId);
    if (existing) {
      const revoked = {
        ...existing,
        active: false,
        revokedAt: new Date().toISOString(),
      };
      await this.saveConsent(revoked);
    }
  }

  // Operator operations
  async saveOperatorAction(action: OperatorAction): Promise<void> {
    await sql`
      INSERT INTO operator_actions (id, action_type, timestamp, data)
      VALUES (${action.id}, ${action.actionType}, ${action.timestamp}, ${JSON.stringify(action)})
    `;
  }

  async getOperatorActions(limit?: number): Promise<OperatorAction[]> {
    const result = limit
      ? await sql`SELECT * FROM operator_actions ORDER BY timestamp DESC LIMIT ${limit}`
      : await sql`SELECT * FROM operator_actions ORDER BY timestamp DESC`;
    return result.rows.map(row => JSON.parse(row.data));
  }

  // Metrics
  async getSystemMetrics(): Promise<SystemMetrics> {
    const totalUsers = await this.getUserCount();
    const consentsResult = await sql`SELECT COUNT(*) as count FROM consents WHERE active = true`;
    const usersWithConsent = parseInt(consentsResult.rows[0].count);
    
    const personasResult = await sql`SELECT COUNT(DISTINCT user_id) as count FROM personas`;
    const usersWithPersona = parseInt(personasResult.rows[0].count);
    
    const recsResult = await sql`SELECT COUNT(*) as count FROM recommendations`;
    const totalRecommendations = parseInt(recsResult.rows[0].count);

    const statusCounts = await sql`
      SELECT 
        data->>'status' as status,
        COUNT(*) as count
      FROM recommendations
      GROUP BY data->>'status'
    `;

    const recommendationsByStatus: any = {
      pending: 0,
      approved: 0,
      rejected: 0,
      flagged: 0,
    };

    statusCounts.rows.forEach(row => {
      recommendationsByStatus[row.status] = parseInt(row.count);
    });

    return {
      totalUsers,
      usersWithConsent,
      usersWithPersona,
      coveragePercentage: totalUsers > 0 ? (usersWithPersona / totalUsers) * 100 : 0,
      totalRecommendations,
      averageRecommendationsPerUser: usersWithPersona > 0 ? totalRecommendations / usersWithPersona : 0,
      recommendationsByStatus,
      averageLatency: 0,
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

  // Helper parsers
  private parseUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      dateOfBirth: row.date_of_birth,
      phone: row.phone,
      address: row.address ? JSON.parse(row.address) : undefined,
      createdAt: row.created_at,
      consentStatus: {
        active: row.consent_active,
        grantedAt: row.consent_granted_at,
        revokedAt: row.consent_revoked_at,
      },
    };
  }

  private parseAccount(row: any): Account {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      officialName: row.official_name,
      type: row.type,
      subtype: row.subtype,
      mask: row.mask,
      currentBalance: parseFloat(row.current_balance),
      availableBalance: row.available_balance ? parseFloat(row.available_balance) : undefined,
      creditLimit: row.credit_limit ? parseFloat(row.credit_limit) : undefined,
      currencyCode: row.currency_code,
      isoCurrencyCode: row.iso_currency_code,
    };
  }

  private parseTransaction(row: any): Transaction {
    return {
      id: row.id,
      accountId: row.account_id,
      userId: row.user_id,
      amount: parseFloat(row.amount),
      date: row.date,
      authorizedDate: row.authorized_date,
      name: row.name,
      merchantName: row.merchant_name,
      category: JSON.parse(row.category),
      paymentChannel: row.payment_channel,
      pending: row.pending,
      transactionType: row.transaction_type,
      isoCurrencyCode: row.iso_currency_code,
    };
  }

  private parseLiability(row: any): Liability {
    return {
      id: row.id,
      userId: row.user_id,
      accountId: row.account_id,
      type: row.type,
      details: JSON.parse(row.details),
    };
  }
}

