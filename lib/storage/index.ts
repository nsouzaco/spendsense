import type { StorageAdapter } from './interface';
import { MemoryStorageAdapter } from './memory-adapter';
import syntheticData from '@/data/synthetic-users.json';

let storageInstance: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (!storageInstance) {
    // For now, always use in-memory storage with synthetic data
    // In the future, check process.env.DEPLOYMENT_TARGET to decide
    storageInstance = new MemoryStorageAdapter(syntheticData as any);
    console.log('✅ Storage initialized with', syntheticData.metadata.userCount, 'users');
  }
  
  return storageInstance;
}

export * from './interface';
export { MemoryStorageAdapter };

