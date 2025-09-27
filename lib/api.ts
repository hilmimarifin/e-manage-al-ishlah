import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/store/auth-store'
import { ApiResponse } from './api-response'

class ApiClient {
  private axiosInstance: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (error?: any) => void
  }> = []

  constructor(baseURL: string = '/api') {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const authStorage = localStorage.getItem('auth-storage')
          if (authStorage) {
            try {
              const parsedAuth = JSON.parse(authStorage)
              const token = parsedAuth.state?.accessToken
              if (token) {
                config.headers.Authorization = `Bearer ${token}`
              }
            } catch (e) {
              console.error('Error parsing auth storage:', e)
            }
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Return data from standardized API response
        if (response.data?.status === 'success') {
          return {
            ...response,
            data: response.data.data !== undefined ? response.data.data : response.data
          }
        }
        return response
      },
      async (error) => {
        const originalRequest = error.config

        // Handle API error responses by extracting the error message
        if (error.response?.data?.status === 'error') {
          const apiError = new Error(error.response.data.message || 'An error occurred')
          apiError.name = 'ApiError'
          // Preserve the original error for debugging
          ;(apiError as any).originalError = error
          ;(apiError as any).status = error.response.status
          error.message = apiError.message
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            }).then(() => {
              return this.axiosInstance(originalRequest)
            }).catch(err => {
              return Promise.reject(err)
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const refreshResponse = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'include'
            })

            if (refreshResponse.ok) {
              const data = await refreshResponse.json()
              const newToken = data.data?.accessToken || data.accessToken

              if (newToken) {
                // Update auth store
                const authStorage = localStorage.getItem('auth-storage')
                if (authStorage) {
                  const parsedAuth = JSON.parse(authStorage)
                  if (parsedAuth.state) {
                    parsedAuth.state.accessToken = newToken
                    localStorage.setItem('auth-storage', JSON.stringify(parsedAuth))
                  }
                }

                // Retry failed requests
                this.processQueue(null)
                
                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return this.axiosInstance(originalRequest)
              }
            }
          } catch (refreshError) {
            this.processQueue(refreshError)
            this.redirectToLogin()
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }

          this.redirectToLogin()
          return Promise.reject(error)
        }

        return Promise.reject(error)
      }
    )
  }

  private processQueue(error: any) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
    
    this.failedQueue = []
  }

  private redirectToLogin() {
    if (typeof window !== 'undefined') {
      // Clear auth storage
      localStorage.removeItem('auth-storage')
      
      // Redirect to login
      window.location.href = '/login'
    }
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint, config)
    return response.data
  }

  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data, config)
    return response.data
  }

  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, data, config)
    return response.data
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint, config)
    return response.data
  }
}

export const apiClient = new ApiClient()