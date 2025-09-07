import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Student } from '@/types'
import { showToast } from '@/lib/toast'

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => apiClient.get<Student[]>('/students'),
  })
}

export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => apiClient.post('/students', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      showToast.success('Student created successfully', 'New student has been added to the system')
    },
    onError: (error: any) => {
      showToast.error('Failed to create student', error.message || 'Please try again')
    }
  })
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiClient.put(`/students/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      showToast.success('Student updated successfully', 'Student information has been updated')
    },
    onError: (error: any) => {
      showToast.error('Failed to update student', error.message || 'Please try again')
    }
  })
}

export function useDeleteStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/students/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      showToast.success('Student deleted successfully', 'Student has been removed from the system')
    },
    onError: (error: any) => {
      showToast.error('Failed to delete student', error.message || 'Please try again')
    }
  })
}