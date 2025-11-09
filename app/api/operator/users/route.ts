import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';
import type { FilterParams, SearchParams } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters: FilterParams = {};
    
    const personaParam = searchParams.get('persona');
    if (personaParam) {
      filters.persona = personaParam.split(',');
    }
    
    const hasConsent = searchParams.get('hasConsent');
    if (hasConsent !== null) {
      filters.hasConsent = hasConsent === 'true';
    }
    
    // Parse search
    const search: SearchParams = {};
    const query = searchParams.get('query');
    if (query) {
      search.query = query;
    }
    
    const storage = getStorage();
    const users = await storage.getAllUsers(filters, search);
    
    // Enrich with persona and signal count
    const enrichedUsers = await Promise.all(users.map(async user => {
      const personas = await storage.getUserPersonas(user.id);
      const signals = await storage.getUserSignals(user.id);
      const recommendations = await storage.getUserRecommendations(user.id);
      
      // Find primary persona (lowest priority number = highest priority)
      const primaryPersona = personas.length > 0 
        ? personas.reduce((prev, current) => 
            (prev.priority < current.priority) ? prev : current
          )
        : null;
      
      return {
        ...user,
        personaCount: personas.length,
        primaryPersona: primaryPersona?.personaType || null,
        signalCount: signals.length,
        recommendationCount: recommendations.length,
      };
    }));
    
    return NextResponse.json(createApiResponse(enrichedUsers));
  } catch (error) {
    return handleApiError(error);
  }
}

