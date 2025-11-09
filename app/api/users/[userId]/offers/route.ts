import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import type { Offer } from '@/types';

// GET /api/users/[userId]/offers - Get all offers for a user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const storage = getStorage();
    const { userId } = params;

    // Get user's offers
    const offers = await storage.getUserOffers(userId);

    return NextResponse.json({
      success: true,
      data: offers,
    });
  } catch (error: any) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_OFFERS_ERROR',
          message: error.message || 'Failed to fetch offers',
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/users/[userId]/offers - Send a new offer to a user
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const storage = getStorage();
    const { userId } = params;
    const body = await request.json();

    const { offerId, title, description, category, sentBy } = body;

    if (!offerId || !title || !description || !category || !sentBy) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required fields',
          },
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    // Create offer
    const offer: Offer = {
      id: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      offerId,
      title,
      description,
      category,
      sentBy,
      sentAt: new Date().toISOString(),
      status: 'sent',
    };

    await storage.saveOffer(offer);

    return NextResponse.json({
      success: true,
      data: offer,
    });
  } catch (error: any) {
    console.error('Error sending offer:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SEND_OFFER_ERROR',
          message: error.message || 'Failed to send offer',
        },
      },
      { status: 500 }
    );
  }
}

