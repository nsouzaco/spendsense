/**
 * Pre-calculate and save user signals and personas to database
 * This should be run once after seeding users, accounts, and transactions
 * 
 * Usage: npm run calculate-profiles
 */

import 'dotenv/config';
import { getStorage } from '../lib/storage';
import { detectSignals } from '../lib/signals';
import { assignPersonas } from '../lib/personas';
import type { TimeWindow } from '../types';

async function calculateUserProfiles() {
  console.log('🧮 Starting user profile calculation...\n');
  console.log('This will calculate signals and assign personas for all users.');
  console.log('===============================================================\n');
  
  const storage = getStorage();
  
  // Get all users
  const users = await storage.getAllUsers();
  console.log(`📊 Found ${users.length} users to process\n`);
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  const startTime = Date.now();
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const progress = `[${i + 1}/${users.length}]`;
    
    try {
      console.log(`${progress} Processing: ${user.firstName} ${user.lastName} (${user.id})`);
      
      // Get user's financial data
      const accounts = await storage.getUserAccounts(user.id);
      const transactions = await storage.getUserTransactions(user.id);
      const liabilities = await storage.getUserLiabilities(user.id);
      
      console.log(`         → ${accounts.length} accounts, ${transactions.length} transactions, ${liabilities.length} liabilities`);
      
      // Check if signals already exist
      const existingSignals = await storage.getUserSignals(user.id);
      if (existingSignals.length > 0) {
        console.log(`         ⏭️  Signals already exist, skipping calculation`);
      } else {
        // Calculate signals for both time windows
        const windows: TimeWindow[] = ['30d', '180d'];
        
        for (const window of windows) {
          const signals = detectSignals(user, accounts, transactions, liabilities, window);
          await storage.saveSignals(signals);
        }
        
        console.log(`         ✅ Signals calculated (30d & 180d)`);
      }
      
      // Get 180d signals for persona assignment
      const allSignals = await storage.getUserSignals(user.id);
      const signals180d = allSignals.find(s => s.window === '180d');
      
      if (!signals180d) {
        console.log(`         ⚠️  No 180d signals found, skipping persona assignment`);
        skipCount++;
        continue;
      }
      
      // Check if personas already exist
      const existingPersonas = await storage.getUserPersonas(user.id);
      if (existingPersonas.length > 0) {
        console.log(`         ⏭️  Personas already assigned: ${existingPersonas.map(p => p.personaType).join(', ')}`);
        successCount++;
        continue;
      }
      
      // Assign personas based on 180d signals
      const personas = assignPersonas(user.id, signals180d);
      
      if (personas.length === 0) {
        console.log(`         ⚠️  No personas matched criteria`);
        skipCount++;
        continue;
      }
      
      // Save personas to database
      for (const persona of personas) {
        await storage.savePersona(persona);
      }
      
      console.log(`         ✅ Personas assigned: ${personas.map(p => p.personaType).join(', ')}`);
      successCount++;
      
    } catch (error) {
      console.error(`         ❌ Error processing user ${user.id}:`, error);
      errorCount++;
    }
    
    console.log(''); // Empty line for readability
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n===============================================================');
  console.log('📊 Profile Calculation Complete!');
  console.log('===============================================================');
  console.log(`✅ Successfully processed: ${successCount} users`);
  console.log(`⏭️  Skipped: ${skipCount} users`);
  console.log(`❌ Errors: ${errorCount} users`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log('===============================================================\n');
  
  if (successCount > 0) {
    console.log('🎉 User profiles have been saved to the database!');
    console.log('   You can now remove on-demand calculation from API routes.\n');
  }
  
  process.exit(errorCount > 0 ? 1 : 0);
}

// Run the script
calculateUserProfiles().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

