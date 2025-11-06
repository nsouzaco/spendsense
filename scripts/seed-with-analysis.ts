import 'dotenv/config';
import { sql } from '@vercel/postgres';
import syntheticData from '../data/synthetic-users.json';
import { detectSignals } from '../lib/signals';
import { assignPersonas } from '../lib/personas';
import type { TimeWindow, User, Account, Transaction, Liability } from '../types';

async function seedWithAnalysis() {
  console.log('🌱 Starting comprehensive database seeding with analysis...\n');

  try {
    // Step 1: Clear existing data
    console.log('🗑️  Clearing existing data...');
    await sql`TRUNCATE TABLE operator_actions, recommendations, personas, signals, liabilities, transactions, accounts, consents, users CASCADE`;
    console.log('✅ Database cleared\n');

    // Step 2: Insert users
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
    console.log(`✅ Inserted ${syntheticData.users.length} users\n`);

    // Step 3: Insert accounts
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
    console.log(`✅ Inserted ${syntheticData.accounts.length} accounts\n`);

    // Step 4: Insert transactions
    console.log('💸 Inserting transactions...');
    for (const tx of syntheticData.transactions) {
      await sql`
        INSERT INTO transactions (
          id, account_id, amount, date, name, merchant_name,
          category_primary, category_detailed, transaction_type, pending, iso_currency_code
        ) VALUES (
          ${tx.id},
          ${tx.accountId},
          ${tx.amount},
          ${tx.date},
          ${tx.name},
          ${tx.merchantName || null},
          ${tx.category.primary},
          ${tx.category.detailed},
          ${tx.transactionType},
          ${tx.pending},
          ${tx.isoCurrencyCode}
        )
      `;
    }
    console.log(`✅ Inserted ${syntheticData.transactions.length} transactions\n`);

    // Step 5: Insert liabilities
    console.log('💰 Inserting liabilities...');
    // Create a set of valid account IDs
    const validAccountIds = new Set(syntheticData.accounts.map(acc => acc.id));
    
    // Only insert liabilities with valid account references
    const validLiabilities = syntheticData.liabilities.filter(l => validAccountIds.has(l.accountId));
    
    for (const liability of validLiabilities) {
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
    console.log(`✅ Inserted ${validLiabilities.length} liabilities (${syntheticData.liabilities.length - validLiabilities.length} skipped due to invalid account references)\n`);

    // Step 6: Generate signals and assign personas
    console.log('🔍 Generating signals and assigning personas...\n');
    
    let signalsCount = 0;
    let personasCount = 0;
    let usersProcessed = 0;

    for (const userData of syntheticData.users) {
      try {
        // Reconstruct user object
        const user: User = {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          dateOfBirth: userData.dateOfBirth,
          phone: userData.phone || '',
          address: userData.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'US'
          },
          createdAt: userData.createdAt,
          consentStatus: userData.consentStatus
        };

        // Get user's accounts
        const userAccounts: Account[] = syntheticData.accounts.filter(
          a => a.userId === user.id
        );

        // Get user's transactions
        const userTransactions: Transaction[] = syntheticData.transactions.filter(
          t => userAccounts.some(a => a.id === t.accountId)
        );

        // Get user's liabilities
        const userLiabilities: Liability[] = syntheticData.liabilities.filter(
          l => l.userId === user.id
        );

        // Generate signals for both time windows
        const windows: TimeWindow[] = ['30d', '180d'];
        for (const window of windows) {
          const signals = detectSignals(
            user,
            userAccounts,
            userTransactions,
            userLiabilities,
            window
          );

          // Save signals to database
          await sql`
            INSERT INTO signals (user_id, window, data)
            VALUES (${signals.userId}, ${signals.window}, ${JSON.stringify(signals)})
          `;
          signalsCount++;
        }

        // Get 180d signals for persona assignment
        const signals180d = detectSignals(
          user,
          userAccounts,
          userTransactions,
          userLiabilities,
          '180d'
        );

        // Assign personas (rule-based, no AI)
        const personas = assignPersonas(user.id, signals180d);

        if (personas.length > 0) {
          for (const persona of personas) {
            await sql`
              INSERT INTO personas (user_id, data)
              VALUES (${persona.userId}, ${JSON.stringify(persona)})
            `;
            personasCount++;
          }
        }

        usersProcessed++;
        if (usersProcessed % 10 === 0) {
          console.log(`   Processed ${usersProcessed}/${syntheticData.users.length} users...`);
        }
      } catch (error) {
        console.error(`   ⚠️  Error processing user ${userData.id}:`, error);
      }
    }

    console.log(`\n✅ Generated ${signalsCount} signals for ${usersProcessed} users`);
    console.log(`✅ Assigned ${personasCount} personas\n`);

    // Summary
    console.log('=' .repeat(60));
    console.log('✨ Database seeding complete!\n');
    console.log('📊 Summary:');
    console.log(`   Users: ${syntheticData.users.length}`);
    console.log(`   Accounts: ${syntheticData.accounts.length}`);
    console.log(`   Transactions: ${syntheticData.transactions.length}`);
    console.log(`   Liabilities: ${syntheticData.liabilities.length}`);
    console.log(`   Signals: ${signalsCount}`);
    console.log(`   Personas: ${personasCount}`);
    console.log('\n🚀 Ready for operator dashboard analysis!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seedWithAnalysis();

