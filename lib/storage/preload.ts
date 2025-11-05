import 'dotenv/config';
import { getStorage } from './index';
import { detectSignals } from '@/lib/signals';
import { assignPersonas } from '@/lib/personas';
import { generateRecommendations } from '@/lib/recommendations';
import { applyGuardrails } from '@/lib/guardrails';
import type { TimeWindow } from '@/types';

let preloading = false;
let preloaded = false;

export async function preloadData() {
  if (preloading || preloaded) return;
  
  preloading = true;
  console.log('🔄 Preloading user data and generating recommendations...');
  
  try {
    const storage = getStorage();
    await storage.initialize();
    
    const users = storage.getAllUsers();
    const usersToProcess = users.filter(u => u.consentStatus.active).slice(0, 10); // Limit to first 10 for faster loading
    
    let processed = 0;
    
    for (const user of usersToProcess) {
      try {
        const accounts = storage.getUserAccounts(user.id);
        const transactions = storage.getUserTransactions(user.id);
        const liabilities = storage.getUserLiabilities(user.id);
        
        // Detect signals for both windows
        const windows: TimeWindow[] = ['30d', '180d'];
        for (const window of windows) {
          const signals = detectSignals(user, accounts, transactions, liabilities, window);
          storage.saveSignals(signals);
        }
        
        // Get 180d signals for persona assignment
        const signals180d = storage.getUserSignals(user.id).find(s => s.window === '180d');
        if (!signals180d) continue;
        
        // Assign personas
        const personas = assignPersonas(user.id, signals180d);
        if (personas.length === 0) continue;
        
        personas.forEach(persona => storage.savePersona(persona));
        
        // Generate recommendations
        const recommendations = await generateRecommendations(user, signals180d, personas, 5);
        
        // Apply guardrails and save
        for (const rec of recommendations) {
          const guardrailResult = applyGuardrails(rec, user, signals180d);
          if (guardrailResult.passed && guardrailResult.recommendation) {
            storage.saveRecommendation(guardrailResult.recommendation);
          }
        }
        
        processed++;
        console.log(`✓ Processed ${user.firstName} ${user.lastName} (${processed}/${usersToProcess.length})`);
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
      }
    }
    
    preloaded = true;
    console.log(`✅ Preload complete! ${processed} users ready.`);
  } catch (error) {
    console.error('Preload error:', error);
  } finally {
    preloading = false;
  }
}

export function isPreloaded() {
  return preloaded;
}

