import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth/session';
import { getStorage } from '@/lib/storage';
import { createApiResponse } from '@/lib/api/middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role } = body;
    
    if (!userId || !role) {
      return NextResponse.json(
        createApiResponse(undefined, {
          code: 'VALIDATION_ERROR',
          message: 'userId and role are required',
        }),
        { status: 400 }
      );
    }
    
    if (role !== 'user' && role !== 'operator') {
      return NextResponse.json(
        createApiResponse(undefined, {
          code: 'VALIDATION_ERROR',
          message: 'role must be "user" or "operator"',
        }),
        { status: 400 }
      );
    }
    
    // For user role, verify the user exists
    if (role === 'user') {
      const storage = getStorage();
      const user = await storage.getUser(userId);
      
      if (!user) {
        return NextResponse.json(
          createApiResponse(undefined, {
            code: 'NOT_FOUND',
            message: 'User not found',
          }),
          { status: 404 }
        );
      }
    }
    
    // Create session
    const sessionId = createSession(userId, role);
    
    // Create response
    const response = NextResponse.json(
      createApiResponse({
        sessionId,
        userId,
        role,
      })
    );
    
    // Set session cookie
    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
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

