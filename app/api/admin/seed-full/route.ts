import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { detectSignals } from '@/lib/signals';
import { assignPersonas } from '@/lib/personas';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';
import type { TimeWindow } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const storage = getStorage();
    
    console.log('🌱 Starting full database population...');
    
    // Get all users
    const users = await storage.getAllUsers();
    
    let signalsCount = 0;
    let personasCount = 0;
    let usersProcessed = 0;
    let errors: string[] = [];

    for (const user of users) {
      try {
        // Check if user already has signals and personas
        const existingSignals = await storage.getUserSignals(user.id);
        const existingPersonas = await storage.getUserPersonas(user.id);
        
        // Skip if already processed
        if (existingSignals.length > 0 && existingPersonas.length > 0) {
          console.log(`⏭️  User ${user.id} already has signals and personas, skipping...`);
          continue;
        }

        // Get user's data
        const accounts = await storage.getUserAccounts(user.id);
        const transactions = await storage.getUserTransactions(user.id);
        const liabilities = await storage.getUserLiabilities(user.id);

        // Generate signals for both time windows if missing
        if (existingSignals.length === 0) {
          const windows: TimeWindow[] = ['30d', '180d'];
          for (const window of windows) {
            const signals = detectSignals(user, accounts, transactions, liabilities, window);
            await storage.saveSignals(signals);
            signalsCount++;
          }
          console.log(`✅ Generated signals for user ${user.id}`);
        }

        // Get 180d signals for persona assignment
        const allSignals = await storage.getUserSignals(user.id);
        const signal180d = allSignals.find(s => s.window === '180d');

        // Assign personas if missing
        if (existingPersonas.length === 0 && signal180d) {
          const personas = assignPersonas(user.id, signal180d);
          
          if (personas.length > 0) {
            for (const persona of personas) {
              await storage.savePersona(persona);
              personasCount++;
            }
            console.log(`✅ Assigned ${personas.length} personas for user ${user.id}`);
          }
        }

        usersProcessed++;
        
      } catch (error) {
        const errorMsg = `Error processing user ${user.id}: ${error}`;
        console.error(`⚠️  ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log('✨ Full database population complete!');

    return NextResponse.json(createApiResponse({
      success: true,
      message: `Successfully populated database with signals and personas`,
      stats: {
        totalUsers: users.length,
        usersProcessed,
        signalsGenerated: signalsCount,
        personasAssigned: personasCount,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors : undefined
    }));
    
  } catch (error) {
    console.error('❌ Error during full seeding:', error);
    return handleApiError(error);
  }
}

