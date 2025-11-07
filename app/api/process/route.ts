import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { generateRecommendations } from '@/lib/recommendations';
import { applyGuardrails } from '@/lib/guardrails';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';

/**
 * POST /api/process
 * Generates AI recommendations for users with consent
 * 
 * NOTE: This endpoint assumes signals and personas are already calculated
 * and saved in the database. Run `npm run calculate-profiles` first.
 */
export async function POST(request: NextRequest) {
  try {
    const storage = getStorage();
    const users = await storage.getAllUsers();
    
    let processedCount = 0;
    let skippedCount = 0;
    let errors = 0;
    
    for (const user of users) {
      try {
        // Skip users without active consent
        if (!user.consentStatus.active) {
          skippedCount++;
          continue;
        }
        
        // Get pre-calculated signals and personas from database
        const allSignals = await storage.getUserSignals(user.id);
        const signals180d = allSignals.find(s => s.window === '180d');
        
        if (!signals180d) {
          console.warn(`No signals found for user ${user.id}. Run calculate-profiles script.`);
          skippedCount++;
          continue;
        }
        
        const personas = await storage.getUserPersonas(user.id);
        
        if (personas.length === 0) {
          console.warn(`No personas found for user ${user.id}. Run calculate-profiles script.`);
          skippedCount++;
          continue;
        }
        
        // Check if recommendations already exist
        const existingRecs = await storage.getUserRecommendations(user.id);
        if (existingRecs.length > 0) {
          console.log(`User ${user.id} already has recommendations, skipping...`);
          skippedCount++;
          continue;
        }
        
        // Generate AI-powered recommendations
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
        skipped: skippedCount,
        total: users.length,
        errors,
        message: processedCount > 0 
          ? `Generated recommendations for ${processedCount} users`
          : 'No new recommendations generated. Users may already have recommendations or missing profiles.',
      })
    );
  } catch (error) {
    return handleApiError(error);
  }
}

