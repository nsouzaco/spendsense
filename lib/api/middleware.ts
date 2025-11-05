import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';
import { validateSession } from '@/lib/auth/session';

export function createApiResponse<T>(
  data?: T,
  error?: { code: string; message: string; details?: any }
): ApiResponse<T> {
  return {
    success: !error,
    data,
    error,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  };
}

export function getSessionFromRequest(request: NextRequest): string | null {
  // Try to get session from cookie
  const sessionId = request.cookies.get('session_id')?.value;
  return sessionId || null;
}

export function requireAuth(requiredRole?: 'user' | 'operator') {
  return (request: NextRequest): NextResponse | null => {
    const sessionId = getSessionFromRequest(request);
    const session = validateSession(sessionId, requiredRole);
    
    if (!session) {
      return NextResponse.json(
        createApiResponse(undefined, {
          code: 'UNAUTHORIZED',
          message: requiredRole 
            ? `${requiredRole} role required`
            : 'Authentication required',
        }),
        { status: 401 }
      );
    }
    
    return null; // Auth passed
  };
}

export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error);
  
  return NextResponse.json(
    createApiResponse(undefined, {
      code: 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    }),
    { status: 500 }
  );
}

