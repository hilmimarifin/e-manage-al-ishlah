import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'
import { LoginResponse, Menu } from '@/types'
import { showToast } from '@/lib/toast'

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  username: string
  password: string
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (data: LoginData) => apiClient.post<LoginResponse>('/auth/login', data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      showToast.success('Login successful', `Welcome back, ${data.user.username}!`)
    },
    onError: (error: any) => {
      showToast.error('Login failed', error.message || 'Please check your credentials')
    }
  })
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Registration failed')
      }

      return response.json()
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      showToast.success('Registration successful', `Welcome, ${data.user.username}!`)
    },
    onError: (error: any) => {
      showToast.error('Registration failed', error.message || 'Please try again')
    }
  })
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout)

  return useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    },
    onSuccess: () => {
      logout()
      showToast.success('Logged out successfully', 'See you next time!')
    },
    onError: (error: any) => {
      showToast.error('Logout failed', error.message || 'Please try again')
    }
  })
}

export function useUserMenus() {
  return useQuery({
    queryKey: ['user-menus'],
    queryFn: () => apiClient.get<Menu[]>('/menus?forUser=true'),
  })
}