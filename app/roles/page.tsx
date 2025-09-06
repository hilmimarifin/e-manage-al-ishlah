'use client'

import { RoleForm } from '@/components/forms/role-form'
import { PermissionModal } from '@/components/forms/permission-modal'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { DataTable } from '@/components/ui/data-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useCreateRole, useDeleteRole, useRoles, useUpdateRole } from '@/hooks/use-roles'
import { Edit, MoreHorizontal, Plus, Trash, Shield } from 'lucide-react'
import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { usePermissionGuard } from '@/hooks/use-permissions'

import { Role as RoleType } from '@/types'

type Role = RoleType

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [permissionModalOpen, setPermissionModalOpen] = useState(false)
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<Role | null>(null)

  const { data: roles = [], isLoading, error } = useRoles()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()
  
  // Permission checks for /roles path
  const { showAddButton, showEditButton, showDeleteButton, canUpdate, isLoading: permissionsLoading } = usePermissionGuard('/roles')


  const handleCreateRole = async (data: any) => {
    try {
      await createRole.mutateAsync(data)
      setDialogOpen(false)
    } catch (error) {
      console.error('Failed to create role:', error)
    }
  }

  const handleUpdateRole = async (data: any) => {
    try {
      if (selectedRole) {
        await updateRole.mutateAsync({ id: selectedRole.id, ...data })
        setDialogOpen(false)
        setSelectedRole(null)
      }
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const handleDeleteRole = async (id: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete role:', error)
      }
    }
  }

  const openEditDialog = (role: any) => {
    setSelectedRole(role)
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    setSelectedRole(null)
    setDialogOpen(true)
  }

  const openPermissionModal = (role: Role) => {
    setSelectedRoleForPermissions(role)
    setPermissionModalOpen(true)
  }

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('name')}</Badge>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div>{row.getValue('description') || 'No description'}</div>
      ),
    },
    {
      accessorKey: '_count.users',
      header: 'Users',
      cell: ({ row }) => row.original._count?.users || 0,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <div>{new Date(row.getValue('createdAt')).toLocaleDateString()}</div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const role = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {showEditButton && (
                <DropdownMenuItem onClick={() => openEditDialog(role)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {canUpdate && (
                <DropdownMenuItem onClick={() => openPermissionModal(role)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Permissions
                </DropdownMenuItem>
              )}
              {showDeleteButton && (
                <DropdownMenuItem
                  onClick={() => handleDeleteRole(role.id)}
                  className="text-destructive"
                  disabled={(role._count?.users || 0) > 0}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Role Management
            </h1>
            <p className="text-muted-foreground">
              Create and manage system roles and permissions.
            </p>
          </div>

          {showAddButton && (
            <Modal
              isOpen={dialogOpen}
              onOpenChange={setDialogOpen}
              title={selectedRole ? 'Edit Role' : 'Create Role'}
              description={selectedRole ? 'Make changes to the role here.' : 'Add a new role to the system.'}
              trigger={
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Role
                </Button>
              }
            >
              <RoleForm
                role={selectedRole}
                onSubmit={selectedRole ? handleUpdateRole : handleCreateRole}
                isLoading={createRole.isPending || updateRole.isPending}
              />
            </Modal>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={roles}
              isLoading={isLoading}
              searchPlaceholder="Search roles..."
              emptyMessage="No roles found."
              pageSize={10}
            />
          </CardContent>
        </Card>
      </div>

      {/* Permission Modal */}
      <PermissionModal
        isOpen={permissionModalOpen}
        onOpenChange={setPermissionModalOpen}
        role={selectedRoleForPermissions}
      />
    </DashboardLayout>
  );
}