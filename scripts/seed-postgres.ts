import 'dotenv/config';
import { sql } from '@vercel/postgres';
import syntheticData from '../data/synthetic-users.json';

async function seed() {
  console.log('🌱 Seeding Postgres database...');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await sql`TRUNCATE TABLE operator_actions, recommendations, personas, signals, liabilities, transactions, accounts, consents, users CASCADE`;

    // Insert users
    console.log('👥 Inserting users...');
    for (const user of syntheticData.users) {
      await sql`
        INSERT INTO users (
          id, email, first_name, last_name, date_of_birth, phone, address,
          created_at, consent_active, consent_granted_at
        ) VALUES (
          ${user.id},
          ${user.email},
          ${user.firstName},
          ${user.lastName},
          ${user.dateOfBirth},
          ${user.phone || null},
          ${user.address ? JSON.stringify(user.address) : null},
          ${user.createdAt},
          ${user.consentStatus.active},
          ${user.consentStatus.grantedAt || null}
        )
      `;
    }
    console.log(`✅ Inserted ${syntheticData.users.length} users`);

    // Insert accounts
    console.log('💳 Inserting accounts...');
    for (const account of syntheticData.accounts) {
      await sql`
        INSERT INTO accounts (
          id, user_id, name, official_name, type, subtype, mask,
          current_balance, available_balance, credit_limit, currency_code, iso_currency_code
        ) VALUES (
          ${account.id},
          ${account.userId},
          ${account.name},
          ${account.officialName},
          ${account.type},
          ${account.subtype},
          ${account.mask},
          ${account.currentBalance},
          ${account.availableBalance || null},
          ${account.creditLimit || null},
          ${account.currencyCode},
          ${account.isoCurrencyCode}
        )
      `;
    }
    console.log(`✅ Inserted ${syntheticData.accounts.length} accounts`);

    // Insert transactions
    console.log('💸 Inserting transactions...');
    let transactionCount = 0;
    for (const tx of syntheticData.transactions) {
      await sql`
        INSERT INTO transactions (
          id, account_id, user_id, amount, date, authorized_date,
          name, merchant_name, category, payment_channel, pending,
          transaction_type, iso_currency_code
        ) VALUES (
          ${tx.id},
          ${tx.accountId},
          ${tx.userId},
          ${tx.amount},
          ${tx.date},
          ${tx.authorizedDate || null},
          ${tx.name},
          ${tx.merchantName || null},
          ${JSON.stringify(tx.category)},
          ${tx.paymentChannel},
          ${tx.pending},
          ${tx.transactionType},
          ${tx.isoCurrencyCode}
        )
      `;
      transactionCount++;
      if (transactionCount % 1000 === 0) {
        console.log(`   Processed ${transactionCount} transactions...`);
      }
    }
    console.log(`✅ Inserted ${syntheticData.transactions.length} transactions`);

    // Insert liabilities
    console.log('📊 Inserting liabilities...');
    for (const liability of syntheticData.liabilities) {
      await sql`
        INSERT INTO liabilities (
          id, user_id, account_id, type, details
        ) VALUES (
          ${liability.id},
          ${liability.userId},
          ${liability.accountId},
          ${liability.type},
          ${JSON.stringify(liability.details)}
        )
      `;
    }
    console.log(`✅ Inserted ${syntheticData.liabilities.length} liabilities`);

    console.log('\n✅ Database seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Users: ${syntheticData.users.length}`);
    console.log(`   Accounts: ${syntheticData.accounts.length}`);
    console.log(`   Transactions: ${syntheticData.transactions.length}`);
    console.log(`   Liabilities: ${syntheticData.liabilities.length}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();

