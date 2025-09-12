import { apiClient } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { Class } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useClasses({ year }: { year?: string }) {
  return useQuery({
    queryKey: ['classes', year],
    queryFn: () => apiClient.get<Class[]>('/classes', { params: { year } }),
  })
}

export function useCreateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => apiClient.post('/classes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      showToast.success('Class created successfully', 'New class has been added to the system')
    },
    onError: (error: any) => {
      showToast.error('Failed to create class', error.message || 'Please try again')
    }
  })
}

export function useUpdateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiClient.put(`/classes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      showToast.success('Class updated successfully', 'Class information has been updated')
    },
    onError: (error: any) => {
      showToast.error('Failed to update class', error.message || 'Please try again')
    }
  })
}

export function useDeleteClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      showToast.success('Class deleted successfully', 'Class has been removed from the system')
    },
    onError: (error: any) => {
      showToast.error('Failed to delete class', error.message || 'Please try again')
    }
  })
}