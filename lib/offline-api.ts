import { offlineStorage, isOnline, syncOfflineActions } from './offline-storage';

interface ApiRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
  cacheTTL?: number; // Cache time-to-live in minutes
}

interface ApiResponse<T = any> {
  data: T;
  fromCache: boolean;
  timestamp: number;
}

class OfflineApiClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  private getCacheKey(url: string, method: string = 'GET'): string {
    return `api_${method}_${url}`;
  }

  private async makeRequest<T>(
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      cache = true,
      cacheTTL = 60
    } = options;

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const cacheKey = this.getCacheKey(url, method);

    // For GET requests, try cache first if offline or cache is requested
    if (method === 'GET' && cache) {
      const cachedData = await offlineStorage.getCachedData(cacheKey);
      if (cachedData) {
        // If offline, return cached data
        if (!isOnline()) {
          return {
            data: cachedData,
            fromCache: true,
            timestamp: Date.now()
          };
        }
        // If online but cache is fresh (less than 5 minutes), return cached data
        const cacheAge = Date.now() - cachedData.timestamp;
        if (cacheAge < 5 * 60 * 1000) {
          return {
            data: cachedData,
            fromCache: true,
            timestamp: cachedData.timestamp
          };
        }
      }
    }

    // Prepare request
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      // If online, make the request
      if (isOnline()) {
        const response = await fetch(fullUrl, requestOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache successful GET requests
        if (method === 'GET' && cache) {
          await offlineStorage.setCachedData(cacheKey, data, cacheTTL);
        }

        return {
          data,
          fromCache: false,
          timestamp: Date.now()
        };
      } else {
        // If offline and it's a mutation request, store for later sync
        if (method !== 'GET') {
          await offlineStorage.addOfflineAction({
            url: fullUrl,
            method,
            headers: requestOptions.headers as Record<string, string>,
            body: requestOptions.body as string,
            timestamp: Date.now(),
            retryCount: 0
          });

          // Return optimistic response for mutations
          return {
            data: { success: true, offline: true, message: 'Action queued for sync' } as T,
            fromCache: false,
            timestamp: Date.now()
          };
        }

        // For GET requests when offline, try cache
        const cachedData = await offlineStorage.getCachedData(cacheKey);
        if (cachedData) {
          return {
            data: cachedData,
            fromCache: true,
            timestamp: Date.now()
          };
        }

        throw new Error('No cached data available offline');
      }
    } catch (error) {
      // If network request fails, try cache for GET requests
      if (method === 'GET') {
        const cachedData = await offlineStorage.getCachedData(cacheKey);
        if (cachedData) {
          return {
            data: cachedData,
            fromCache: true,
            timestamp: Date.now()
          };
        }
      }

      throw error;
    }
  }

  // API Methods
  async get<T>(url: string, options?: Omit<ApiRequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: 'GET' });
  }

  async post<T>(url: string, data?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: 'POST', body: data });
  }

  async put<T>(url: string, data?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: 'PUT', body: data });
  }

  async patch<T>(url: string, data?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: 'PATCH', body: data });
  }

  async delete<T>(url: string, options?: Omit<ApiRequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: 'DELETE' });
  }

  // Utility methods
  async clearCache(): Promise<void> {
    // This would need to be implemented in offline-storage.ts
    console.log('Cache clearing not implemented yet');
  }

  async syncPendingActions(): Promise<void> {
    await syncOfflineActions();
  }
}

// Create singleton instance
export const offlineApi = new OfflineApiClient('/api');

// Specific API functions for the application
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    offlineApi.post('/auth/login', credentials),
  
  logout: () =>
    offlineApi.post('/auth/logout'),
  
  me: () =>
    offlineApi.get('/auth/me', { cacheTTL: 30 }),
  
  refresh: () =>
    offlineApi.post('/auth/refresh')
};

export const classroomsApi = {
  getAll: () =>
    offlineApi.get('/classrooms', { cacheTTL: 60 }),
  
  getById: (id: string) =>
    offlineApi.get(`/classrooms/${id}`, { cacheTTL: 30 }),
  
  create: (data: any) =>
    offlineApi.post('/classrooms', data),
  
  update: (id: string, data: any) =>
    offlineApi.put(`/classrooms/${id}`, data),
  
  delete: (id: string) =>
    offlineApi.delete(`/classrooms/${id}`)
};

export const studentsApi = {
  getAll: () =>
    offlineApi.get('/classrooms/student', { cacheTTL: 60 }),
  
  getById: (id: string) =>
    offlineApi.get(`/classrooms/student/${id}`, { cacheTTL: 30 }),
  
  create: (data: any) =>
    offlineApi.post('/classrooms/student', data),
  
  update: (id: string, data: any) =>
    offlineApi.put(`/classrooms/student/${id}`, data),
  
  delete: (id: string) =>
    offlineApi.delete(`/classrooms/student/${id}`)
};

export const classesApi = {
  getAll: () =>
    offlineApi.get('/classes', { cacheTTL: 60 }),
  
  getById: (id: string) =>
    offlineApi.get(`/classes/${id}`, { cacheTTL: 30 }),
  
  create: (data: any) =>
    offlineApi.post('/classes', data),
  
  update: (id: string, data: any) =>
    offlineApi.put(`/classes/${id}`, data),
  
  delete: (id: string) =>
    offlineApi.delete(`/classes/${id}`)
};

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    offlineApi.syncPendingActions();
  });
}
