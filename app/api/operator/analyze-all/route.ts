import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { assignPersonas } from '@/lib/personas';
import { createApiResponse, handleApiError } from '@/lib/api/middleware';

export async function POST(request: NextRequest) {
  try {
    const storage = getStorage();
    const users = await storage.getAllUsers();
    
    let assignedCount = 0;
    
    for (const user of users) {
      try {
        // Check if user already has personas
        const existingPersonas = await storage.getUserPersonas(user.id);
        if (existingPersonas && existingPersonas.length > 0) {
          continue; // Skip if already assigned
        }
        
        // Get signals (should exist for demo users)
        const signals = await storage.getUserSignals(user.id);
        const signal180d = signals.find(s => s.window === '180d');
        
        if (!signal180d) {
          continue; // Skip if no signals
        }
        
        // Assign personas based on signals
        const personas = assignPersonas(user.id, signal180d);
        
        if (personas.length > 0) {
          for (const persona of personas) {
            await storage.savePersona(persona);
          }
          assignedCount++;
        }
      } catch (error) {
        console.error(`Error assigning personas for user ${user.id}:`, error);
      }
    }
    
    return NextResponse.json(createApiResponse({
      message: `Successfully assigned personas to ${assignedCount} users`,
      assignedCount,
      totalUsers: users.length,
    }));
  } catch (error) {
    return handleApiError(error);
  }
}

