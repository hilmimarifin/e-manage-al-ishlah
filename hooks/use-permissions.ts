import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'
import { RoleMenu } from '@/types'

export interface UserPermissions {
  canRead: boolean
  canWrite: boolean
  canUpdate: boolean
  canDelete: boolean
}

export function useUserPermissions(menuPath: string) {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['user-permissions', user?.id, menuPath],
    queryFn: async (): Promise<UserPermissions> => {
      if (!user) {
        return { canRead: false, canWrite: false, canUpdate: false, canDelete: false }
      }

      // Super admin has all permissions
      if (user.role.name === 'Super admin') {
        return { canRead: true, canWrite: true, canUpdate: true, canDelete: true }
      }

      try {
        const roleMenus = await apiClient.get<RoleMenu[]>(`/role-menus?roleId=${user.role.id}`)
        const menuPermission = roleMenus.find(rm => rm.menu.path === menuPath)
        
        if (!menuPermission) {
          return { canRead: false, canWrite: false, canUpdate: false, canDelete: false }
        }

        return {
          canRead: menuPermission.canRead,
          canWrite: menuPermission.canWrite,
          canUpdate: menuPermission.canUpdate,
          canDelete: menuPermission.canDelete
        }
      } catch (error) {
        console.error('Error fetching user permissions:', error)
        return { canRead: false, canWrite: false, canUpdate: false, canDelete: false }
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useHasPermission(menuPath: string, permission: keyof UserPermissions) {
  const { data: permissions, isLoading } = useUserPermissions(menuPath)
  
  return {
    hasPermission: permissions?.[permission] ?? false,
    isLoading
  }
}

// Utility function for conditional rendering based on permissions
export function usePermissionGuard(menuPath: string) {
  const { data: permissions, isLoading } = useUserPermissions(menuPath)
  
  return {
    canRead: permissions?.canRead ?? false,
    canWrite: permissions?.canWrite ?? false,
    canUpdate: permissions?.canUpdate ?? false,
    canDelete: permissions?.canDelete ?? false,
    isLoading,
    // Helper functions for common UI patterns
    showAddButton: permissions?.canWrite ?? false,
    showEditButton: permissions?.canUpdate ?? false,
    showDeleteButton: permissions?.canDelete ?? false,
  }
}
