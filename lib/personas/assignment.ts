import type { PersonaAssignment, SignalResult } from '@/types';
import { PERSONA_CRITERIA } from './criteria';

export function assignPersonas(
  userId: string,
  signals: SignalResult
): PersonaAssignment[] {
  const assignments: PersonaAssignment[] = [];
  
  // Check each persona criteria
  for (const criteria of PERSONA_CRITERIA) {
    if (criteria.checkCriteria(signals)) {
      const { rationale, matchedCriteria } = criteria.generateRationale(signals);
      
      assignments.push({
        userId,
        personaType: criteria.personaType,
        assignedAt: new Date().toISOString(),
        rationale,
        matchedCriteria,
        priority: criteria.priority,
      });
    }
  }
  
  // Sort by priority (lower number = higher priority)
  assignments.sort((a, b) => a.priority - b.priority);
  
  return assignments;
}

export function getPrimaryPersona(assignments: PersonaAssignment[]): PersonaAssignment | null {
  if (assignments.length === 0) return null;
  
  // Return highest priority persona (already sorted)
  return assignments[0];
}

export * from './criteria';

