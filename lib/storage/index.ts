import type { StorageAdapter } from './interface';
import { MemoryStorageAdapter } from './memory-adapter';
import syntheticData from '@/data/synthetic-users.json';

let storageInstance: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (!storageInstance) {
    // Default to in-memory storage
    // Note: PostgreSQL requires async interface refactor (see docs/FUTURE_ENHANCEMENTS.md)
    storageInstance = new MemoryStorageAdapter(syntheticData as any);
    console.log('✅ Storage initialized with', syntheticData.metadata.userCount, 'users');
  }
  
  return storageInstance;
}

export * from './interface';
export { MemoryStorageAdapter };

