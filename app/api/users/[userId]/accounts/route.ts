import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const storage = getStorage();
    const accounts = await storage.getUserAccounts(params.userId);
    
    return NextResponse.json(createApiResponse(accounts));
  } catch (error) {
    return handleApiError(error);
  }
}

