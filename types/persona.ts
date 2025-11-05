export type PersonaType = 
  | 'HIGH_UTILIZATION'
  | 'VARIABLE_INCOME_BUDGETER'
  | 'SUBSCRIPTION_HEAVY'
  | 'SAVINGS_BUILDER'
  | 'LOW_INCOME_STABILIZER';

export interface PersonaAssignment {
  userId: string;
  personaType: PersonaType;
  assignedAt: string;
  rationale: string;
  matchedCriteria: string[];
  priority: number;
}

export interface PersonaCriteria {
  personaType: PersonaType;
  name: string;
  description: string;
  focus: string;
  priority: number;
  checkCriteria: (signals: SignalResult) => boolean;
  generateRationale: (signals: SignalResult) => { 
    rationale: string; 
    matchedCriteria: string[] 
  };
}

// Re-export for convenience
import type { SignalResult } from './signal';

