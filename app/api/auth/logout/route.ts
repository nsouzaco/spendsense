import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth/session';
import { getSessionFromRequest, createApiResponse } from '@/lib/api/middleware';

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionFromRequest(request);
    
    if (sessionId) {
      deleteSession(sessionId);
    }
    
    const response = NextResponse.json(
      createApiResponse({ message: 'Logged out successfully' })
    );
    
    // Clear session cookie
    response.cookies.delete('session_id');
    
    return response;
  } catch (error: any) {
    return NextResponse.json(
      createApiResponse(undefined, {
        code: 'INTERNAL_ERROR',
        message: error.message,
      }),
      { status: 500 }
    );
  }
}

