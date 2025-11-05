import { getStorage } from '../lib/storage';
import { detectSignals } from '../lib/signals';
import { assignPersonas } from '../lib/personas';
import { generateRecommendations } from '../lib/recommendations';
import { applyGuardrails } from '../lib/guardrails';
import type { TimeWindow } from '../types';

async function processAllUsers() {
  console.log('🚀 Starting user processing...\n');
  
  const storage = getStorage();
  const users = storage.getAllUsers();
  
  console.log(`📊 Found ${users.length} users\n`);
  
  let processedCount = 0;
  let skippedCount = 0;
  const startTime = Date.now();
  
  for (const user of users) {
    try {
      // Check consent
      if (!user.consentStatus.active) {
        console.log(`⏭️  Skipping ${user.firstName} ${user.lastName} (no consent)`);
        skippedCount++;
        continue;
      }
      
      console.log(`\n📝 Processing: ${user.firstName} ${user.lastName} (${user.id})`);
      
      // Get user data
      const accounts = storage.getUserAccounts(user.id);
      const transactions = storage.getUserTransactions(user.id);
      const liabilities = storage.getUserLiabilities(user.id);
      
      console.log(`   Accounts: ${accounts.length}, Transactions: ${transactions.length}, Liabilities: ${liabilities.length}`);
      
      // Detect signals for both time windows
      const windows: TimeWindow[] = ['30d', '180d'];
      
      for (const window of windows) {
        const signals = detectSignals(user, accounts, transactions, liabilities, window);
        storage.saveSignals(signals);
        console.log(`   ✅ Signals detected (${window})`);
      }
      
      // Use 180d window for persona assignment (more data)
      const signals180d = storage.getUserSignals(user.id).find(s => s.window === '180d');
      
      if (!signals180d) {
        console.log(`   ⚠️  No 180d signals found, skipping`);
        skippedCount++;
        continue;
      }
      
      // Assign personas
      const personas = assignPersonas(user.id, signals180d);
      
      if (personas.length === 0) {
        console.log(`   ⚠️  No personas matched`);
        skippedCount++;
        continue;
      }
      
      personas.forEach(persona => storage.savePersona(persona));
      console.log(`   ✅ Assigned ${personas.length} persona(s): ${personas.map(p => p.personaType).join(', ')}`);
      
      // Generate recommendations
      const recommendations = await generateRecommendations(
        user,
        signals180d,
        personas,
        5
      );
      
      console.log(`   ✅ Generated ${recommendations.length} recommendations`);
      
      // Apply guardrails and save
      let approvedCount = 0;
      for (const rec of recommendations) {
        const guardrailResult = applyGuardrails(rec, user, signals180d);
        
        if (guardrailResult.passed && guardrailResult.recommendation) {
          storage.saveRecommendation(guardrailResult.recommendation);
          approvedCount++;
        } else {
          console.log(`   ⚠️  Recommendation failed guardrails: ${rec.title}`);
        }
      }
      
      console.log(`   ✅ Saved ${approvedCount} approved recommendations`);
      
      processedCount++;
    } catch (error: any) {
      console.error(`   ❌ Error processing user ${user.id}:`, error.message);
      skippedCount++;
    }
  }
  
  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);
  const avgTime = (parseFloat(totalTime) / processedCount).toFixed(2);
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ Processing Complete!\n');
  console.log(`📊 Results:`);
  console.log(`   Total users: ${users.length}`);
  console.log(`   Processed: ${processedCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log(`   Total time: ${totalTime}s`);
  console.log(`   Avg time per user: ${avgTime}s`);
  console.log('='.repeat(60));
}

processAllUsers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

