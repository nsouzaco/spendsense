import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const storage = getStorage();
    const personas = await storage.getUserPersonas(params.userId);
    
    // Get the primary persona (lowest priority number)
    const primaryPersona = personas.length > 0
      ? personas.reduce((prev, curr) => curr.priority < prev.priority ? curr : prev)
      : null;
    
    return NextResponse.json(createApiResponse({
      success: true,
      data: {
        personas,
        primaryPersona: primaryPersona?.personaType || null,
      },
    }));
  } catch (error) {
    return handleApiError(error);
  }
}

