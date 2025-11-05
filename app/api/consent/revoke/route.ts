import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';

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
    storage.revokeConsent(userId);
    
    const updatedConsent = storage.getConsent(userId);
    
    return NextResponse.json(createApiResponse(updatedConsent));
  } catch (error) {
    return handleApiError(error);
  }
}

