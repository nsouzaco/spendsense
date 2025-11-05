import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';
import type { FilterParams, SearchParams } from '@/types';

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
    const users = storage.getAllUsers(filters, search);
    
    // Enrich with persona and signal count
    const enrichedUsers = users.map(user => {
      const personas = storage.getUserPersonas(user.id);
      const signals = storage.getUserSignals(user.id);
      const recommendations = storage.getUserRecommendations(user.id);
      
      return {
        ...user,
        personaCount: personas.length,
        primaryPersona: personas[0]?.personaType || null,
        signalCount: signals.length,
        recommendationCount: recommendations.length,
      };
    });
    
    return NextResponse.json(createApiResponse(enrichedUsers));
  } catch (error) {
    return handleApiError(error);
  }
}

