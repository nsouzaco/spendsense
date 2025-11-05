import { NextResponse } from 'next/server';
import { preloadData, isPreloaded } from '@/lib/storage/preload';

export async function GET() {
  if (isPreloaded()) {
    return NextResponse.json({ success: true, message: 'Already loaded' });
  }
  
  // Start preloading in the background (don't wait for it)
  preloadData().catch(console.error);
  
  return NextResponse.json({ success: true, message: 'Loading started' });
}

export async function POST() {
  return GET();
}

