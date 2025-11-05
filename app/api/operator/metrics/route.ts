import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';

export async function GET(request: NextRequest) {
  try {
    const storage = getStorage();
    const metrics = storage.getSystemMetrics();
    
    return NextResponse.json(createApiResponse(metrics));
  } catch (error) {
    return handleApiError(error);
  }
}

