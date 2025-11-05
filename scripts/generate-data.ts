import { writeFileSync } from 'fs';
import { join } from 'path';
import { generateSyntheticData } from '../lib/data/generator';

console.log('🎲 Generating synthetic data...\n');

const dataset = generateSyntheticData(75, 42); // 75 users, seed 42

console.log('✅ Generated:');
console.log(`   - ${dataset.metadata.userCount} users`);
console.log(`   - ${dataset.metadata.accountCount} accounts`);
console.log(`   - ${dataset.metadata.transactionCount} transactions`);
console.log(`   - ${dataset.metadata.liabilityCount} liabilities`);

const outputPath = join(process.cwd(), 'data', 'synthetic-users.json');
writeFileSync(outputPath, JSON.stringify(dataset, null, 2));

console.log(`\n📦 Saved to: ${outputPath}`);
console.log('✨ Data generation complete!');

