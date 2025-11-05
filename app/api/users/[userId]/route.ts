import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const storage = getStorage();
    const user = await storage.getUser(params.userId);
    
    if (!user) {
      return NextResponse.json(
        createApiResponse(undefined, {
          code: 'NOT_FOUND',
          message: 'User not found',
        }),
        { status: 404 }
      );
    }
    
    return NextResponse.json(createApiResponse(user));
  } catch (error) {
    return handleApiError(error);
  }
}

