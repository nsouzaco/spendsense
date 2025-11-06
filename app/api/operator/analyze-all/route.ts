import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { detectSignals } from '@/lib/signals';
import { assignPersonas } from '@/lib/personas';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';
import type { TimeWindow } from '@/types';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [Analyze-All] Starting user analysis...');
    
    const storage = getStorage();
    const users = await storage.getAllUsers();
    console.log(`📊 Total users to process: ${users.length}`);
    
    let assignedCount = 0;
    let signalsCreated = 0;
    
    for (const user of users) {
      try {
        console.log(`\n👤 Processing user: ${user.id}`);
        
        // Check if user already has personas
        const existingPersonas = await storage.getUserPersonas(user.id);
        console.log(`  - Existing personas: ${existingPersonas.length}`);
        
        if (existingPersonas && existingPersonas.length > 0) {
          console.log(`  ⏭️  User ${user.id} already has personas, skipping...`);
          continue; // Skip if already assigned
        }
        
        // Check if user has signals, if not create them
        let signals = await storage.getUserSignals(user.id);
        let signal180d = signals.find(s => s.window === '180d');
        console.log(`  - Existing signals: ${signals.length}`);
        
        if (!signal180d) {
          console.log(`  🔍 Generating signals for user ${user.id}...`);
          
          // Generate signals (pure calculation, no AI)
          const accounts = await storage.getUserAccounts(user.id);
          const transactions = await storage.getUserTransactions(user.id);
          const liabilities = await storage.getUserLiabilities(user.id);
          
          console.log(`    - Accounts: ${accounts.length}, Transactions: ${transactions.length}, Liabilities: ${liabilities.length}`);
          
          // Detect signals for both windows
          const windows: TimeWindow[] = ['30d', '180d'];
          for (const window of windows) {
            const newSignals = detectSignals(user, accounts, transactions, liabilities, window);
            await storage.saveSignals(newSignals);
            console.log(`    ✅ Saved ${window} signals`);
          }
          
          signalsCreated++;
          
          // Re-fetch signals
          signals = await storage.getUserSignals(user.id);
          signal180d = signals.find(s => s.window === '180d');
        }
        
        if (!signal180d) {
          console.log(`  ⚠️  No 180d signals found for user ${user.id}, skipping...`);
          continue; // Skip if still no signals
        }
        
        // Assign personas based on signals (rule-based, no AI)
        console.log(`  🎭 Assigning personas for user ${user.id}...`);
        const personas = assignPersonas(user.id, signal180d);
        console.log(`    - Generated ${personas.length} personas`);
        
        if (personas.length > 0) {
          for (const persona of personas) {
            console.log(`      - ${persona.personaType} (priority: ${persona.priority})`);
            await storage.savePersona(persona);
          }
          assignedCount++;
          console.log(`    ✅ Saved personas for user ${user.id}`);
        }
      } catch (error) {
        console.error(`❌ Error processing user ${user.id}:`, error);
      }
    }
    
    console.log('\n✨ [Analyze-All] Complete!');
    console.log(`📊 Summary: ${assignedCount} users analyzed, ${signalsCreated} new signals created`);
    
    return NextResponse.json(createApiResponse({
      message: `Successfully analyzed ${assignedCount} users`,
      assignedCount,
      signalsCreated,
      totalUsers: users.length,
    }));
  } catch (error) {
    return handleApiError(error);
  }
}

