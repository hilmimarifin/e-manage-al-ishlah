// Offline storage utilities for PWA functionality
export interface OfflineAction {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retryCount: number;
}

export interface CachedData {
  data: any;
  timestamp: number;
  expiresAt: number;
}

class OfflineStorage {
  private dbName = 'EManageOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for offline actions (POST, PUT, DELETE requests)
        if (!db.objectStoreNames.contains('offlineActions')) {
          const actionStore = db.createObjectStore('offlineActions', {
            keyPath: 'id',
            autoIncrement: true,
          });
          actionStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store for cached API responses
        if (!db.objectStoreNames.contains('cachedData')) {
          const dataStore = db.createObjectStore('cachedData', {
            keyPath: 'key',
          });
          dataStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }

        // Store for user preferences and settings
        if (!db.objectStoreNames.contains('userSettings')) {
          db.createObjectStore('userSettings', {
            keyPath: 'key',
          });
        }
      };
    });
  }

  // Offline Actions Management
  async addOfflineAction(action: Omit<OfflineAction, 'id'>): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      const request = store.add(action);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineActions(): Promise<OfflineAction[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readonly');
      const store = transaction.objectStore('offlineActions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeOfflineAction(id: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Cached Data Management
  async setCachedData(key: string, data: any, ttlMinutes: number = 60): Promise<void> {
    if (!this.db) await this.init();

    const cachedData: CachedData = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');
      const request = store.put({ key, ...cachedData });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readonly');
      const store = transaction.objectStore('cachedData');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Check if data has expired
        if (Date.now() > result.expiresAt) {
          // Remove expired data
          this.removeCachedData(key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async removeCachedData(key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // User Settings Management
  async setUserSetting(key: string, value: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userSettings'], 'readwrite');
      const store = transaction.objectStore('userSettings');
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUserSetting(key: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userSettings'], 'readonly');
      const store = transaction.objectStore('userSettings');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Cleanup expired data
  async cleanupExpiredData(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');
      const index = store.index('expiresAt');
      const range = IDBKeyRange.upperBound(Date.now());
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineStorage = new OfflineStorage();

// Network status utilities
export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const waitForOnline = (): Promise<void> => {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const handleOnline = () => {
      window.removeEventListener('online', handleOnline);
      resolve();
    };

    window.addEventListener('online', handleOnline);
  });
};

// Sync offline actions when back online
export const syncOfflineActions = async (): Promise<void> => {
  if (!isOnline()) return;

  try {
    const actions = await offlineStorage.getOfflineActions();
    
    for (const action of actions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });

        if (response.ok) {
          await offlineStorage.removeOfflineAction(action.id!);
        } else if (action.retryCount < 3) {
          // Update retry count
          await offlineStorage.removeOfflineAction(action.id!);
          await offlineStorage.addOfflineAction({
            ...action,
            retryCount: action.retryCount + 1,
          });
        }
      } catch (error) {
        console.error('Failed to sync offline action:', error);
        
        if (action.retryCount < 3) {
          await offlineStorage.removeOfflineAction(action.id!);
          await offlineStorage.addOfflineAction({
            ...action,
            retryCount: action.retryCount + 1,
          });
        }
      }
    }
  } catch (error) {
    console.error('Failed to sync offline actions:', error);
  }
};

// Initialize offline storage and setup sync
if (typeof window !== 'undefined') {
  offlineStorage.init();
  
  // Sync when coming back online
  window.addEventListener('online', syncOfflineActions);
  
  // Cleanup expired data periodically
  setInterval(() => {
    offlineStorage.cleanupExpiredData();
  }, 60 * 60 * 1000); // Every hour
}
