import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';
import { generateEducationalContent } from '@/lib/recommendations/openai-client';

/**
 * POST /api/users/[userId]/summary
 * Generates a personalized AI summary for the user based on their existing data
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const storage = getStorage();
    const userId = params.userId;
    
    // Fetch all user data
    const user = await storage.getUser(userId);
    if (!user) {
      return NextResponse.json(
        createApiResponse(undefined, {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }),
        { status: 404 }
      );
    }
    
    // Check consent
    if (!user.consentStatus.active) {
      return NextResponse.json(
        createApiResponse(undefined, {
          code: 'CONSENT_REQUIRED',
          message: 'User consent required'
        }),
        { status: 403 }
      );
    }
    
    const accounts = await storage.getUserAccounts(userId);
    const transactions = await storage.getUserTransactions(userId);
    const signals = await storage.getUserSignals(userId);
    const personas = await storage.getUserPersonas(userId);
    const recommendations = await storage.getUserRecommendations(userId);
    
    // Get 180d signals for summary
    const signals180d = signals.find(s => s.window === '180d');
    
    // Build context for AI
    const totalBalance = accounts
      .filter(a => a.type === 'depository')
      .reduce((sum, a) => sum + a.currentBalance, 0);
    
    const creditCards = accounts.filter(a => a.subtype === 'credit card');
    const totalCreditLimit = creditCards.reduce((sum, a) => sum + (a.creditLimit || 0), 0);
    const totalCreditUsed = creditCards.reduce((sum, a) => sum + Math.abs(a.currentBalance), 0);
    const creditUtilization = totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0;
    
    const recentTransactions = transactions
      .filter(t => new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .length;
    
    const primaryPersona = personas.length > 0 ? personas[0] : null;
    
    // Create personalized prompt
    const prompt = `
Create a warm, personalized financial summary for ${user.firstName}.

THEIR FINANCIAL SNAPSHOT:
- Total Balance: $${totalBalance.toFixed(2)}
- Credit Utilization: ${creditUtilization.toFixed(1)}%
- Recent Transactions (30 days): ${recentTransactions}
- Primary Financial Profile: ${primaryPersona?.personaType || 'Not yet analyzed'}
${signals180d ? `
- Subscriptions: ${signals180d.subscriptionSignals.totalRecurringCount} recurring
- Savings Balance: $${signals180d.savingsSignals.currentSavingsBalance.toFixed(2)}
- Income Stability: ${signals180d.incomeSignals.hasPayrollPattern ? 'Steady' : 'Variable'}
` : ''}
- Active Recommendations: ${recommendations.length}

TONE & STYLE:
- Address them directly as "you" 
- Be warm, supportive, and encouraging
- Acknowledge both strengths and opportunities
- No jargon or financial buzzwords
- 3-4 short paragraphs maximum
- Focus on actionable insights

AVOID:
- Shaming or judgmental language
- Overwhelming with numbers
- Generic advice
- Product pitches

Generate a personalized summary that makes them feel understood and empowered.
    `.trim();
    
    // Generate AI summary
    const summary = await generateEducationalContent(prompt);
    
    return NextResponse.json(
      createApiResponse({
        summary,
        generatedAt: new Date().toISOString()
      })
    );
  } catch (error) {
    console.error('Error generating summary:', error);
    return handleApiError(error);
  }
}

