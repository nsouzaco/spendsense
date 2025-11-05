import type { PersonaType } from './persona';
import type { SignalResult } from './signal';
import type { User } from './user';

export interface Recommendation {
  id: string;
  userId: string;
  personaType: PersonaType;
  category: string;
  title: string;
  description: string;
  rationale: string; // Data-backed explanation
  educationalContent: string; // AI-generated content
  actionItems: string[];
  partnerOffers: PartnerOffer[];
  disclaimer: string;
  createdAt: string;
  status: RecommendationStatus;
  decisionTrace: DecisionTrace;
}

export type RecommendationStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'flagged';

export interface PartnerOffer {
  id: string;
  name: string;
  description: string;
  type: OfferType;
  eligibility: EligibilityStatus;
  eligibilityCriteria: string[];
  ctaText: string;
  ctaUrl?: string;
}

export type OfferType = 
  | 'balance_transfer_card'
  | 'high_yield_savings'
  | 'budgeting_app'
  | 'subscription_manager'
  | 'financial_counseling';

export interface EligibilityStatus {
  eligible: boolean;
  reasons: string[];
}

export interface DecisionTrace {
  timestamp: string;
  personaMatched: PersonaType;
  signalsUsed: string[];
  templateApplied: string;
  guardrailsPassed: GuardrailResult[];
  aiPromptUsed?: string;
  confidence: number;
}

export interface GuardrailResult {
  name: string;
  passed: boolean;
  reason?: string;
}

export interface RecommendationTemplate {
  id: string;
  personaType: PersonaType;
  category: string;
  title: string;
  descriptionTemplate: string;
  eligibilityCriteria: (user: User, signals: SignalResult) => boolean;
  generateRationale: (user: User, signals: SignalResult) => string;
  generateActionItems: (user: User, signals: SignalResult) => string[];
  matchPartnerOffers: (user: User, signals: SignalResult) => PartnerOffer[];
  priority: number;
}

