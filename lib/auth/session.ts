// Simple session management for MVP
// In production, use proper session management like next-auth or iron-session

export interface Session {
  userId: string;
  role: 'user' | 'operator';
  createdAt: string;
}

// In-memory session store (resets on server restart)
const sessions = new Map<string, Session>();

export function createSession(userId: string, role: 'user' | 'operator'): string {
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  sessions.set(sessionId, {
    userId,
    role,
    createdAt: new Date().toISOString(),
  });
  
  return sessionId;
}

export function getSession(sessionId: string | null): Session | null {
  if (!sessionId) return null;
  return sessions.get(sessionId) || null;
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

export function validateSession(sessionId: string | null, requiredRole?: 'user' | 'operator'): Session | null {
  const session = getSession(sessionId);
  
  if (!session) return null;
  
  if (requiredRole && session.role !== requiredRole) {
    return null;
  }
  
  return session;
}

