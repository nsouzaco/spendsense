import type { GuardrailResult } from '@/types';

// Prohibited phrases that indicate shaming or judgmental language
const PROHIBITED_PHRASES = [
  'overspending',
  'bad with money',
  'poor financial decisions',
  'irresponsible',
  'wasteful',
  'foolish',
  'stupid',
  'dumb decision',
  'you should have',
  'you need to',
  'you must',
  'financial mistake',
  'bad habit',
  'poor choice',
];

// Required empowering terms (should have at least some of these)
const EMPOWERING_TERMS = [
  'opportunity',
  'can help',
  'consider',
  'might benefit',
  'could improve',
  'option',
  'strategy',
  'approach',
];

export function checkToneGuardrail(content: string): GuardrailResult {
  const lowerContent = content.toLowerCase();
  const issues: string[] = [];
  
  // Check for prohibited phrases
  const foundProhibited = PROHIBITED_PHRASES.filter(phrase => 
    lowerContent.includes(phrase.toLowerCase())
  );
  
  if (foundProhibited.length > 0) {
    issues.push(`Contains shaming language: ${foundProhibited.join(', ')}`);
  }
  
  // Check for overly prescriptive language (too many "must" statements)
  const mustCount = (lowerContent.match(/\bmust\b/g) || []).length;
  if (mustCount > 2) {
    issues.push('Contains overly prescriptive language');
  }
  
  // Check for empowering language
  const hasEmpoweringLanguage = EMPOWERING_TERMS.some(term =>
    lowerContent.includes(term.toLowerCase())
  );
  
  if (!hasEmpoweringLanguage) {
    issues.push('Lacks empowering, supportive language');
  }
  
  const passed = issues.length === 0;
  
  return {
    name: 'Tone Validation',
    passed,
    reason: passed
      ? 'Content uses appropriate, empowering tone'
      : `Tone issues: ${issues.join('; ')}`,
  };
}

export function validateRecommendationTone(
  title: string,
  description: string,
  rationale: string,
  educationalContent: string
): GuardrailResult[] {
  const results: GuardrailResult[] = [];
  
  // Check each text component
  const allContent = `${title} ${description} ${rationale} ${educationalContent}`;
  
  results.push(checkToneGuardrail(allContent));
  
  return results;
}

