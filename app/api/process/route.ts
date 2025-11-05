import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { detectSignals } from '@/lib/signals';
import { assignPersonas } from '@/lib/personas';
import { generateRecommendations } from '@/lib/recommendations';
import { applyGuardrails } from '@/lib/guardrails';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';
import type { TimeWindow } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const storage = getStorage();
    const users = await storage.getAllUsers();
    
    let processedCount = 0;
    let errors = 0;
    
    for (const user of users) {
      try {
        if (!user.consentStatus.active) continue;
        
        const accounts = await storage.getUserAccounts(user.id);
        const transactions = await storage.getUserTransactions(user.id);
        const liabilities = await storage.getUserLiabilities(user.id);
        
        // Detect signals for both windows
        const windows: TimeWindow[] = ['30d', '180d'];
        for (const window of windows) {
          const signals = detectSignals(user, accounts, transactions, liabilities, window);
          await storage.saveSignals(signals);
        }
        
        // Get 180d signals for persona assignment
        const allSignals = await storage.getUserSignals(user.id);
        const signals180d = allSignals.find(s => s.window === '180d');
        if (!signals180d) continue;
        
        // Assign personas
        const personas = assignPersonas(user.id, signals180d);
        if (personas.length === 0) continue;
        
        for (const persona of personas) {
          await storage.savePersona(persona);
        }
        
        // Generate recommendations
        const recommendations = await generateRecommendations(user, signals180d, personas, 5);
        
        // Apply guardrails and save
        for (const rec of recommendations) {
          const guardrailResult = applyGuardrails(rec, user, signals180d);
          if (guardrailResult.passed && guardrailResult.recommendation) {
            await storage.saveRecommendation(guardrailResult.recommendation);
          }
        }
        
        processedCount++;
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        errors++;
      }
    }
    
    return NextResponse.json(
      createApiResponse({
        processed: processedCount,
        total: users.length,
        errors,
      })
    );
  } catch (error) {
    return handleApiError(error);
  }
}

