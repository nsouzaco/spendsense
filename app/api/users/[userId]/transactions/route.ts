import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    const storage = getStorage();
    const transactions = await storage.getUserTransactions(params.userId, limit);
    
    // Sort by date descending (most recent first)
    const sortedTransactions = transactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return NextResponse.json(createApiResponse(sortedTransactions));
  } catch (error) {
    return handleApiError(error);
  }
}

