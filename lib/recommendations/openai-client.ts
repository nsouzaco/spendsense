import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
  if (openaiClient) return openaiClient;
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    console.warn('⚠️  OpenAI API key not configured. Using fallback content generation.');
    return null;
  }
  
  try {
    openaiClient = new OpenAI({ apiKey });
    return openaiClient;
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
    return null;
  }
}

export async function generateEducationalContent(
  prompt: string,
  maxRetries: number = 3
): Promise<string> {
  const client = getOpenAIClient();
  
  if (!client) {
    // Fallback: return a placeholder
    return `Educational content would be generated here based on your specific financial situation. Please configure your OpenAI API key to enable AI-generated personalized content.`;
  }
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a financial education expert who creates clear, empowering, and jargon-free content. 
            Always use supportive language and avoid any shaming or judgmental phrasing. 
            Focus on education and actionable advice, not product sales.
            Keep content concise and practical.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });
      
      return completion.choices[0]?.message?.content || 'Failed to generate content.';
    } catch (error: any) {
      if (attempt < maxRetries - 1) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
      
      console.error('OpenAI API error after retries:', error);
      return 'Unable to generate personalized content at this time. Please try again later.';
    }
  }
  
  return 'Unable to generate content.';
}

