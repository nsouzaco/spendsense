import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';

export async function GET(request: NextRequest) {
  try {
    const storage = getStorage();
    const users = storage.getAllUsers();
    
    // Return simplified user list
    const userList = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      consentStatus: user.consentStatus,
    }));
    
    return NextResponse.json(createApiResponse(userList));
  } catch (error) {
    return handleApiError(error);
  }
}

