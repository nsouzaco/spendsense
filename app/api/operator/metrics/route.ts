import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [Metrics API] Fetching system metrics...');
    const storage = getStorage();
    const metrics = await storage.getSystemMetrics();
    
    console.log('📊 [Metrics API] Metrics retrieved:', {
      totalUsers: metrics.totalUsers,
      usersWithPersona: metrics.usersWithPersona,
      personaBreakdown: metrics.personaBreakdown
    });
    
    return NextResponse.json(createApiResponse(metrics));
  } catch (error) {
    console.error('❌ [Metrics API] Error:', error);
    return handleApiError(error);
  }
}

