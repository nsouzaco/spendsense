import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function migrate() {
  console.log('🔄 Running Postgres migrations...');

  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        date_of_birth DATE NOT NULL,
        phone VARCHAR(50),
        address JSONB,
        created_at TIMESTAMP NOT NULL,
        consent_active BOOLEAN DEFAULT false,
        consent_granted_at TIMESTAMP,
        consent_revoked_at TIMESTAMP
      )
    `;
    console.log('✅ Created users table');

    // Create accounts table
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        official_name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        subtype VARCHAR(50) NOT NULL,
        mask VARCHAR(10) NOT NULL,
        current_balance DECIMAL(15, 2) NOT NULL,
        available_balance DECIMAL(15, 2),
        credit_limit DECIMAL(15, 2),
        currency_code VARCHAR(10) NOT NULL,
        iso_currency_code VARCHAR(10) NOT NULL
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id)`;
    console.log('✅ Created accounts table');

    // Create transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(255) PRIMARY KEY,
        account_id VARCHAR(255) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(15, 2) NOT NULL,
        date DATE NOT NULL,
        authorized_date DATE,
        name VARCHAR(255) NOT NULL,
        merchant_name VARCHAR(255),
        category JSONB NOT NULL,
        payment_channel VARCHAR(50) NOT NULL,
        pending BOOLEAN DEFAULT false,
        transaction_type VARCHAR(20) NOT NULL,
        iso_currency_code VARCHAR(10) NOT NULL
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC)`;
    console.log('✅ Created transactions table');

    // Create liabilities table
    await sql`
      CREATE TABLE IF NOT EXISTS liabilities (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        account_id VARCHAR(255) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        details JSONB NOT NULL
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_liabilities_user ON liabilities(user_id)`;
    console.log('✅ Created liabilities table');

    // Create signals table
    await sql`
      CREATE TABLE IF NOT EXISTS signals (
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "window" VARCHAR(10) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        data JSONB NOT NULL,
        PRIMARY KEY (user_id, "window")
      )
    `;
    console.log('✅ Created signals table');

    // Create personas table
    await sql`
      CREATE TABLE IF NOT EXISTS personas (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        persona_type VARCHAR(100) NOT NULL,
        assigned_at TIMESTAMP NOT NULL,
        data JSONB NOT NULL
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_personas_user ON personas(user_id)`;
    console.log('✅ Created personas table');

    // Create recommendations table
    await sql`
      CREATE TABLE IF NOT EXISTS recommendations (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        persona_type VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        data JSONB NOT NULL
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id)`;
    console.log('✅ Created recommendations table');

    // Create consents table
    await sql`
      CREATE TABLE IF NOT EXISTS consents (
        user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        active BOOLEAN DEFAULT false,
        data JSONB NOT NULL
      )
    `;
    console.log('✅ Created consents table');

    // Create operator_actions table
    await sql`
      CREATE TABLE IF NOT EXISTS operator_actions (
        id VARCHAR(255) PRIMARY KEY,
        action_type VARCHAR(100) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        data JSONB NOT NULL
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_operator_actions_timestamp ON operator_actions(timestamp DESC)`;
    console.log('✅ Created operator_actions table');

    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();

