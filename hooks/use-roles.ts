import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Role } from '@/types'
import { showToast } from '@/lib/toast'

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => apiClient.get<Role[]>('/roles'),
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => apiClient.post('/roles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      showToast.success('Role created successfully', 'New role has been added to the system')
    },
    onError: (error: any) => {
      showToast.error('Failed to create role', error.message || 'Please try again')
    }
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiClient.put(`/roles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      showToast.success('Role updated successfully', 'Role information has been updated')
    },
    onError: (error: any) => {
      showToast.error('Failed to update role', error.message || 'Please try again')
    }
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      showToast.success('Role deleted successfully', 'Role has been removed from the system')
    },
    onError: (error: any) => {
      showToast.error('Failed to delete role', error.message || 'Please try again')
    }
  })
}