import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { detectSignals } from '@/lib/signals';
import { assignPersonas } from '@/lib/personas';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';
import type { TimeWindow } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const storage = getStorage();
    const users = await storage.getAllUsers();
    
    let assignedCount = 0;
    let signalsCreated = 0;
    
    for (const user of users) {
      try {
        // Check if user already has personas
        const existingPersonas = await storage.getUserPersonas(user.id);
        if (existingPersonas && existingPersonas.length > 0) {
          continue; // Skip if already assigned
        }
        
        // Check if user has signals, if not create them
        let signals = await storage.getUserSignals(user.id);
        let signal180d = signals.find(s => s.window === '180d');
        
        if (!signal180d) {
          // Generate signals (pure calculation, no AI)
          const accounts = await storage.getUserAccounts(user.id);
          const transactions = await storage.getUserTransactions(user.id);
          const liabilities = await storage.getUserLiabilities(user.id);
          
          // Detect signals for both windows
          const windows: TimeWindow[] = ['30d', '180d'];
          for (const window of windows) {
            const newSignals = detectSignals(user, accounts, transactions, liabilities, window);
            await storage.saveSignals(newSignals);
          }
          
          signalsCreated++;
          
          // Re-fetch signals
          signals = await storage.getUserSignals(user.id);
          signal180d = signals.find(s => s.window === '180d');
        }
        
        if (!signal180d) {
          continue; // Skip if still no signals
        }
        
        // Assign personas based on signals (rule-based, no AI)
        const personas = assignPersonas(user.id, signal180d);
        
        if (personas.length > 0) {
          for (const persona of personas) {
            await storage.savePersona(persona);
          }
          assignedCount++;
        }
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
      }
    }
    
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

