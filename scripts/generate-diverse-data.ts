import { writeFileSync } from 'fs';
import { join } from 'path';
import { generateSyntheticData } from '../lib/data/generator';
import type { Account } from '../types';

console.log('🎲 Generating diverse financial profile data...\n');

// Generate base dataset with 150 users
const dataset = generateSyntheticData(150, 12345); // New seed for different patterns

console.log('✅ Generated base data:');
console.log(`   - ${dataset.metadata.userCount} users`);
console.log(`   - ${dataset.metadata.accountCount} accounts`);
console.log(`   - ${dataset.metadata.transactionCount} transactions`);
console.log(`   - ${dataset.metadata.liabilityCount} liabilities`);

// Post-process to create diverse financial profiles
console.log('\n🎨 Diversifying financial profiles...');

let savingsBuilders = 0;
let variableIncome = 0;
let lowIncome = 0;
let highCredit = 0;
let subscriptionHeavy = 0;

dataset.users.forEach((user, index) => {
  const userAccounts = dataset.accounts.filter(a => a.userId === user.id);
  const creditCards = userAccounts.filter(a => a.type === 'credit');
  const savingsAccounts = userAccounts.filter(a => a.subtype === 'savings');
  const userTransactions = dataset.transactions.filter(t => t.userId === user.id);
  const incomeTransactions = userTransactions.filter(t => t.transactionType === 'credit' && t.category.primary === 'Income');
  
  // Determine profile type based on index distribution
  const profileType = Math.floor((index / 150) * 5); // 0-4
  
  switch(profileType) {
    case 0: // 0-30: Savings Builders (20%)
      savingsBuilders++;
      // Low credit utilization
      creditCards.forEach(card => {
        if (card.creditLimit) {
          card.currentBalance = Math.round(card.creditLimit * 0.15 * 100) / 100; // 15% utilization
          card.availableBalance = Math.round((card.creditLimit - card.currentBalance) * 100) / 100;
        }
      });
      // Good savings balance
      savingsAccounts.forEach(savings => {
        savings.currentBalance = Math.round((8000 + Math.random() * 12000) * 100) / 100; // $8k-$20k
        savings.availableBalance = savings.currentBalance;
      });
      break;
      
    case 1: // 31-60: Variable Income (20%)
      variableIncome++;
      // Make income irregular by varying amounts significantly
      incomeTransactions.forEach((tx, i) => {
        const variability = 0.3 + Math.random() * 0.4; // 30-70% variation
        const base = Math.abs(tx.amount);
        tx.amount = i % 3 === 0
          ? Math.round(base * (1 + variability) * 100) / 100
          : i % 3 === 1
          ? Math.round(base * (1 - variability) * 100) / 100
          : Math.round(base * 100) / 100;
      });
      // Create income gaps
      if (incomeTransactions.length > 2) {
        // Remove some income transactions to create gaps
        for (let i = incomeTransactions.length - 1; i > 0; i -= 3) {
          const indexInArray = dataset.transactions.indexOf(incomeTransactions[i]);
          if (indexInArray !== -1) {
            dataset.transactions.splice(indexInArray, 1);
          }
        }
      }
      break;
      
    case 2: // 61-90: Limited Income (20%)
      lowIncome++;
      // Lower all income amounts
      incomeTransactions.forEach(tx => {
        tx.amount = Math.round((1200 + Math.random() * 800) * 100) / 100; // $1200-$2000 per paycheck
      });
      // Lower savings balances
      savingsAccounts.forEach(savings => {
        savings.currentBalance = Math.round((200 + Math.random() * 800) * 100) / 100; // $200-$1000
        savings.availableBalance = savings.currentBalance;
      });
      break;
      
    case 3: // 91-120: High Credit Usage (20%)
      highCredit++;
      // High credit utilization
      creditCards.forEach(card => {
        if (card.creditLimit) {
          card.currentBalance = Math.round(card.creditLimit * (0.70 + Math.random() * 0.25) * 100) / 100; // 70-95%
          card.availableBalance = Math.round((card.creditLimit - card.currentBalance) * 100) / 100;
        }
      });
      break;
      
    case 4: // 121-150: Subscription Heavy (20%)
      subscriptionHeavy++;
      // Add more subscription transactions
      const subscriptionMerchants = [
        { name: 'Netflix', amount: 15.99, category: { primary: 'Service', detailed: 'Streaming Services' } },
        { name: 'Spotify', amount: 9.99, category: { primary: 'Service', detailed: 'Streaming Services' } },
        { name: 'Adobe', amount: 52.99, category: { primary: 'Service', detailed: 'Software' } },
        { name: 'Microsoft 365', amount: 6.99, category: { primary: 'Service', detailed: 'Software' } },
        { name: 'iCloud', amount: 0.99, category: { primary: 'Service', detailed: 'Software' } },
        { name: 'Peloton', amount: 44.00, category: { primary: 'Recreation', detailed: 'Gyms and Fitness Centers' } },
        { name: 'NYTimes', amount: 17.00, category: { primary: 'Service', detailed: 'Subscription' } },
        { name: 'HelloFresh', amount: 59.99, category: { primary: 'Food and Drink', detailed: 'Groceries' } },
      ];
      
      // Add 5-8 subscriptions
      const numSubs = 5 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numSubs && i < subscriptionMerchants.length; i++) {
        const sub = subscriptionMerchants[i];
        // Add 6 monthly occurrences
        for (let month = 0; month < 6; month++) {
          const daysAgo = 30 + month * 30; // Monthly cadence
          const date = new Date();
          date.setDate(date.getDate() - daysAgo);
          
          dataset.transactions.push({
            id: `txn_sub_${index}_${i}_${month}`,
            accountId: creditCards[0]?.id || userAccounts[0].id,
            userId: user.id,
            amount: -sub.amount,
            date: date.toISOString().split('T')[0],
            authorizedDate: date.toISOString().split('T')[0],
            name: sub.name,
            merchantName: sub.name,
            category: sub.category,
            paymentChannel: 'online',
            pending: false,
            transactionType: 'debit',
            isoCurrencyCode: 'USD',
          });
        }
      }
      break;
  }
});

console.log('\n📊 Profile Distribution:');
console.log(`   - Savings Builders: ${savingsBuilders}`);
console.log(`   - Variable Income: ${variableIncome}`);
console.log(`   - Limited Income: ${lowIncome}`);
console.log(`   - High Credit Usage: ${highCredit}`);
console.log(`   - Subscription Heavy: ${subscriptionHeavy}`);

// Update metadata
dataset.metadata.transactionCount = dataset.transactions.length;

const outputPath = join(process.cwd(), 'data', 'synthetic-users.json');
writeFileSync(outputPath, JSON.stringify(dataset, null, 2));

console.log(`\n📦 Saved to: ${outputPath}`);
console.log('✨ Diverse data generation complete!');

