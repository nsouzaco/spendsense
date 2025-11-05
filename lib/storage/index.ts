import type { StorageAdapter } from './interface';
import { MemoryStorageAdapter } from './memory-adapter';
import { PostgresStorageAdapter } from './postgres-adapter';
import syntheticData from '@/data/synthetic-users.json';

let storageInstance: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (!storageInstance) {
    const storageMode = process.env.STORAGE_MODE || 'memory';
    
    switch (storageMode) {
      case 'postgres':
        if (!process.env.POSTGRES_URL && !process.env.POSTGRES_PRISMA_URL) {
          console.warn('⚠️  POSTGRES_URL not set, falling back to in-memory storage');
          storageInstance = new MemoryStorageAdapter(syntheticData as any);
          console.log('✅ Storage initialized (in-memory) with', syntheticData.metadata.userCount, 'users');
        } else {
          storageInstance = new PostgresStorageAdapter();
          console.log('✅ Storage initialized (Postgres)');
        }
        break;
        
      case 'memory':
      default:
        storageInstance = new MemoryStorageAdapter(syntheticData as any);
        console.log('✅ Storage initialized (in-memory) with', syntheticData.metadata.userCount, 'users');
    }
  }
  
  return storageInstance;
}

export * from './interface';
export { MemoryStorageAdapter, PostgresStorageAdapter };

