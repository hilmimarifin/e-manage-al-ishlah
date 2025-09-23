'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useMenus } from '@/hooks/use-menus'
import { useRoleMenus, useUpdateRolePermissions, RoleMenuPermission } from '@/hooks/use-role-menus'
import { ChevronDown, ChevronRight, Loader2, Plus, Shield } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface PermissionModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  role: {
    id: string
    name: string
  } | null
}

interface MenuWithPermissions {
  id: string
  name: string
  path: string
  icon: string | null
  parentId: string | null
  orderIndex: number
  children: MenuWithPermissions[]
  permissions: {
    canRead: boolean
    canWrite: boolean
    canUpdate: boolean
    canDelete: boolean
  }
}

export function PermissionModal({ isOpen, onOpenChange, role }: PermissionModalProps) {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
  const [menuPermissions, setMenuPermissions] = useState<Record<string, RoleMenuPermission>>({})
  
  const { data: menus = [], isLoading: menusLoading } = useMenus()
  const { data: roleMenus = [], isLoading: roleMenusLoading } = useRoleMenus(role?.id)
  const updatePermissions = useUpdateRolePermissions()

  // Build menu tree with permissions
  const buildMenuTree = (menus: any[], parentId: string | null = null): MenuWithPermissions[] => {
    return menus
      .filter(menu => menu.parentId === parentId)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(menu => {
        const existingPermission = roleMenus.find(rm => rm.menuId === menu.id)
        return {
          ...menu,
          children: buildMenuTree(menus, menu.id),
          permissions: {
            canRead: existingPermission?.canRead || false,
            canWrite: existingPermission?.canWrite || false,
            canUpdate: existingPermission?.canUpdate || false,
            canDelete: existingPermission?.canDelete || false,
          }
        }
      })
  }

  const menuTree = buildMenuTree(menus)

  // Initialize permissions state
  useEffect(() => {
    if (roleMenus.length > 0) {
      const permissionsMap: Record<string, RoleMenuPermission> = {}
      roleMenus.forEach(rm => {
        permissionsMap[rm.menuId] = rm
      })
      setMenuPermissions(permissionsMap)
    }
  }, [roleMenus])

  const toggleExpanded = (menuId: string) => {
    const newExpanded = new Set(expandedMenus)
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId)
    } else {
      newExpanded.add(menuId)
    }
    setExpandedMenus(newExpanded)
  }

  const updatePermission = (menuId: string, permission: keyof RoleMenuPermission, value: boolean) => {
    if (!role) return

    setMenuPermissions(prev => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        roleId: role.id,
        menuId,
        [permission]: value,
        canRead: permission === 'canRead' ? value : prev[menuId]?.canRead || false,
        canWrite: permission === 'canWrite' ? value : prev[menuId]?.canWrite || false,
        canUpdate: permission === 'canUpdate' ? value : prev[menuId]?.canUpdate || false,
        canDelete: permission === 'canDelete' ? value : prev[menuId]?.canDelete || false,
      }
    }))
  }

  const handleSave = async () => {
    if (!role) return

    const permissions = Object.values(menuPermissions).filter(p => 
      p.canRead || p.canWrite || p.canUpdate || p.canDelete
    )

    try {
      await updatePermissions.mutateAsync({
        roleId: role.id,
        permissions
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update permissions:', error)
    }
  }

  const renderMenuItem = (menu: MenuWithPermissions, level: number = 0) => {
    const hasChildren = menu.children.length > 0
    const isExpanded = expandedMenus.has(menu.id)
    const currentPermissions = menuPermissions[menu.id] || {
      canRead: false,
      canWrite: false,
      canUpdate: false,
      canDelete: false
    }

    return (
      <div key={menu.id} className="space-y-2">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(menu.id)}
                    className="h-6 w-6 p-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-sm font-medium">{menu.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {menu.path}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${menu.id}-read`}
                  checked={currentPermissions.canRead}
                  onCheckedChange={(checked) => 
                    updatePermission(menu.id, 'canRead', checked as boolean)
                  }
                />
                <Label htmlFor={`${menu.id}-read`} className="text-sm text-green-600">
                  Read
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${menu.id}-write`}
                  checked={currentPermissions.canWrite}
                  onCheckedChange={(checked) => 
                    updatePermission(menu.id, 'canWrite', checked as boolean)
                  }
                />
                <Label htmlFor={`${menu.id}-write`} className="text-sm text-blue-600">
                  Write
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${menu.id}-update`}
                  checked={currentPermissions.canUpdate}
                  onCheckedChange={(checked) => 
                    updatePermission(menu.id, 'canUpdate', checked as boolean)
                  }
                />
                <Label htmlFor={`${menu.id}-update`} className="text-sm text-yellow-600">
                  Update
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${menu.id}-delete`}
                  checked={currentPermissions.canDelete}
                  onCheckedChange={(checked) => 
                    updatePermission(menu.id, 'canDelete', checked as boolean)
                  }
                />
                <Label htmlFor={`${menu.id}-delete`} className="text-sm text-red-600">
                  Delete
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {hasChildren && isExpanded && (
          <div className="ml-6 space-y-2">
            {menu.children.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!role) return null

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={`Hak Akses - ${role.name}`}
      description="Mengatur hak akses untuk setiap menu item dan submenu."
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
          <Shield className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">Permission Types</p>
            <p className="text-xs text-blue-700">
              <span className="font-medium text-green-600">Read:</span> View menu item | 
              <span className="font-medium text-blue-600 ml-2">Write:</span> Create new records | 
              <span className="font-medium text-yellow-600 ml-2">Update:</span> Modify existing records | 
              <span className="font-medium text-red-600 ml-2">Delete:</span> Remove records
            </p>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-3">
          {menusLoading || roleMenusLoading ? (
            <div className="text-center py-8">Loading menus...</div>
          ) : (
            menuTree.map(menu => renderMenuItem(menu))
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updatePermissions.isPending}
          >
            {updatePermissions.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {updatePermissions.isPending ? 'Saving...' : 'Save Permissions'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
