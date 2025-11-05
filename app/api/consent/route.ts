import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';
import type { Consent } from '@/types';

// GET consent status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        createApiResponse(undefined, {
          code: 'VALIDATION_ERROR',
          message: 'userId query parameter required',
        }),
        { status: 400 }
      );
    }
    
    const storage = getStorage();
    const consent = await storage.getConsent(userId);
    
    if (!consent) {
      return NextResponse.json(
        createApiResponse(undefined, {
          code: 'NOT_FOUND',
          message: 'Consent record not found',
        }),
        { status: 404 }
      );
    }
    
    return NextResponse.json(createApiResponse(consent));
  } catch (error) {
    return handleApiError(error);
  }
}

// POST to grant consent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        createApiResponse(undefined, {
          code: 'VALIDATION_ERROR',
          message: 'userId required',
        }),
        { status: 400 }
      );
    }
    
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
    
    const consent: Consent = {
      userId,
      active: true,
      grantedAt: new Date().toISOString(),
    };
    
    await storage.saveConsent(consent);
    
    return NextResponse.json(createApiResponse(consent));
  } catch (error) {
    return handleApiError(error);
  }
}

