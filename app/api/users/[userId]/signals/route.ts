import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const storage = getStorage();
    const signals = storage.getUserSignals(params.userId);
    
    if (!signals || signals.length === 0) {
      return NextResponse.json(
        createApiResponse(undefined, {
          code: 'NOT_FOUND',
          message: 'No signals found for user',
        }),
        { status: 404 }
      );
    }
    
    return NextResponse.json(createApiResponse(signals));
  } catch (error) {
    return handleApiError(error);
  }
}

