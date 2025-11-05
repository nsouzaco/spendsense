import type { Recommendation, User, SignalResult, PersonaAssignment, RecommendationStatus } from '@/types';
import { ALL_RECOMMENDATION_TEMPLATES } from './templates';
import { matchPartnerOffers } from './partners';
import { generateEducationalContent } from './openai-client';
import { STANDARD_DISCLAIMER } from '@/lib/constants/disclaimers';
import { generateId } from '@/lib/data/generator/utils';

export async function generateRecommendations(
  user: User,
  signals: SignalResult,
  personas: PersonaAssignment[],
  targetCount: number = 5
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];
  
  if (personas.length === 0) {
    console.warn(`No personas assigned for user ${user.id}`);
    return recommendations;
  }
  
  // Get primary persona
  const primaryPersona = personas[0];
  
  // Find matching templates for this persona
  const matchingTemplates = ALL_RECOMMENDATION_TEMPLATES
    .filter(template => template.personaType === primaryPersona.personaType)
    .filter(template => template.eligibilityCriteria(user, signals))
    .sort((a, b) => a.priority - b.priority);
  
  // Generate recommendations from templates
  for (let i = 0; i < Math.min(targetCount, matchingTemplates.length); i++) {
    const template = matchingTemplates[i];
    
    try {
      const recommendation = await generateRecommendationFromTemplate(
        user,
        signals,
        primaryPersona.personaType,
        template
      );
      
      recommendations.push(recommendation);
    } catch (error) {
      console.error(`Failed to generate recommendation from template ${template.id}:`, error);
    }
  }
  
  // If we don't have enough recommendations, add more from secondary personas
  if (recommendations.length < targetCount && personas.length > 1) {
    for (let i = 1; i < personas.length && recommendations.length < targetCount; i++) {
      const secondaryPersona = personas[i];
      
      const secondaryTemplates = ALL_RECOMMENDATION_TEMPLATES
        .filter(template => template.personaType === secondaryPersona.personaType)
        .filter(template => template.eligibilityCriteria(user, signals))
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 1); // Just take top 1 from each secondary persona
      
      for (const template of secondaryTemplates) {
        if (recommendations.length >= targetCount) break;
        
        try {
          const recommendation = await generateRecommendationFromTemplate(
            user,
            signals,
            secondaryPersona.personaType,
            template
          );
          
          recommendations.push(recommendation);
        } catch (error) {
          console.error(`Failed to generate recommendation from template ${template.id}:`, error);
        }
      }
    }
  }
  
  return recommendations;
}

async function generateRecommendationFromTemplate(
  user: User,
  signals: SignalResult,
  personaType: string,
  template: any
): Promise<Recommendation> {
  const startTime = Date.now();
  
  // Generate rationale
  const rationale = template.generateRationale(user, signals);
  
  // Generate action items
  const actionItems = template.generateActionItems(user, signals);
  
  // Generate educational content using AI
  const prompt = `
Create brief, empowering financial education content for someone who needs help with: ${template.title}.

Context: ${rationale}

Focus on:
- Clear, jargon-free language
- Actionable, practical advice
- Supportive, non-judgmental tone
- 2-3 paragraphs maximum

Avoid:
- Shaming language
- Complex financial jargon
- Product pitches
  `.trim();
  
  const educationalContent = await generateEducationalContent(prompt);
  
  // Match partner offers
  const partnerOffers = matchPartnerOffers(user, signals, personaType);
  
  // Get signals used for decision trace
  const signalsUsed: string[] = [];
  if (signals.creditSignals.cards.length > 0) signalsUsed.push('credit_utilization');
  if (signals.incomeSignals.hasPayrollPattern) signalsUsed.push('income_patterns');
  if (signals.subscriptionSignals.totalRecurringCount > 0) signalsUsed.push('subscriptions');
  if (signals.savingsSignals.currentSavingsBalance > 0) signalsUsed.push('savings_balance');
  
  const latency = Date.now() - startTime;
  
  const recommendation: Recommendation = {
    id: generateId('rec', Date.now()),
    userId: user.id,
    personaType: personaType as any,
    category: template.category,
    title: template.title,
    description: template.descriptionTemplate,
    rationale,
    educationalContent,
    actionItems,
    partnerOffers,
    disclaimer: STANDARD_DISCLAIMER,
    createdAt: new Date().toISOString(),
    status: 'pending' as RecommendationStatus,
    decisionTrace: {
      timestamp: new Date().toISOString(),
      personaMatched: personaType as any,
      signalsUsed,
      templateApplied: template.id,
      guardrailsPassed: [], // Will be populated by guardrails
      aiPromptUsed: prompt,
      confidence: 0.85, // Could be calculated based on signal strength
    },
  };
  
  return recommendation;
}

export * from './templates';
export * from './partners';
export * from './openai-client';

