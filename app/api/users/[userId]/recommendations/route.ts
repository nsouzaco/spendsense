import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const storage = getStorage();
    const recommendations = storage.getUserRecommendations(params.userId);
    
    return NextResponse.json(createApiResponse(recommendations));
  } catch (error) {
    return handleApiError(error);
  }
}

