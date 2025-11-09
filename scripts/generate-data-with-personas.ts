import { writeFileSync } from 'fs';
import { join } from 'path';
import { generateSyntheticData } from '../lib/data/generator';
import { detectSignals } from '../lib/signals';
import { assignPersonas } from '../lib/personas';
import type { SignalResult, PersonaAssignment } from '../types';

console.log('🎲 Generating synthetic data with personas...\n');

const dataset = generateSyntheticData(150, 42); // 150 users, seed 42

console.log('✅ Generated:');
console.log(`   - ${dataset.metadata.userCount} users`);
console.log(`   - ${dataset.metadata.accountCount} accounts`);
console.log(`   - ${dataset.metadata.transactionCount} transactions`);
console.log(`   - ${dataset.metadata.liabilityCount} liabilities`);

console.log('\n🔍 Calculating signals and personas...');

const allSignals: SignalResult[] = [];
const allPersonas: PersonaAssignment[] = [];

// Process each user
for (const user of dataset.users) {
  console.log(`   Processing ${user.id}...`);
  
  // Get user's transactions and accounts
  const userTransactions = dataset.transactions.filter(t => t.userId === user.id);
  const userAccounts = dataset.accounts.filter(a => a.userId === user.id);
  
  // Detect signals for 30d and 180d windows
  const signals30d = detectSignals(user, userTransactions, userAccounts, '30d');
  const signals180d = detectSignals(user, userTransactions, userAccounts, '180d');
  
  allSignals.push(signals30d, signals180d);
  
  // Assign personas based on 180d signals (more comprehensive)
  const personas = assignPersonas(user, signals180d);
  allPersonas.push(...personas);
}

console.log(`\n✅ Calculated:`);
console.log(`   - ${allSignals.length} signal results`);
console.log(`   - ${allPersonas.length} persona assignments`);

// Add signals and personas to the dataset
const enrichedDataset = {
  ...dataset,
  signals: allSignals,
  personas: allPersonas,
  metadata: {
    ...dataset.metadata,
    signalCount: allSignals.length,
    personaCount: allPersonas.length,
    generatedAt: new Date().toISOString(),
    includesPersonas: true,
  }
};

const outputPath = join(process.cwd(), 'data', 'synthetic-users.json');
writeFileSync(outputPath, JSON.stringify(enrichedDataset, null, 2));

console.log(`\n📦 Saved to: ${outputPath}`);
console.log('✨ Data generation complete with personas!');

