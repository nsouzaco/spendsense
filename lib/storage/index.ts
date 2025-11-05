import type { StorageAdapter } from './interface';
import { MemoryStorageAdapter } from './memory-adapter';
import { PostgresStorageAdapter } from './postgres-adapter';
import syntheticData from '@/data/synthetic-users.json';

let storageInstance: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (!storageInstance) {
    const storageMode = process.env.STORAGE_MODE || 'memory';
    
    if (storageMode === 'postgres') {
      storageInstance = new PostgresStorageAdapter();
      console.log('✅ Storage initialized with PostgreSQL adapter');
    } else {
      storageInstance = new MemoryStorageAdapter(syntheticData as any);
      console.log('✅ Storage initialized with in-memory adapter,', syntheticData.metadata.userCount, 'users');
    }
  }
  
  return storageInstance;
}

export * from './interface';
export { MemoryStorageAdapter, PostgresStorageAdapter };

