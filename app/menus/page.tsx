'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useMenus, useCreateMenu, useUpdateMenu, useDeleteMenu } from '@/hooks/use-menus'
import { Menu as MenuType } from '@/types'
import { MenuForm } from '@/components/forms/menu-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus, Edit, Trash } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { usePermissionGuard } from '@/hooks/use-permissions'

type Menu = MenuType

export default function MenusPage() {
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { user } = useAuthStore()
  const router = useRouter()

  const { data: menus = [], isLoading } = useMenus()
  const createMenu = useCreateMenu()
  const updateMenu = useUpdateMenu()
  
  // Permission checks for /menus path
  const { showAddButton, showEditButton, showDeleteButton, isLoading: permissionsLoading } = usePermissionGuard('/menus')
  const deleteMenu = useDeleteMenu()


  const handleCreateMenu = async (data: any) => {
    try {
      await createMenu.mutateAsync(data)
      setDialogOpen(false)
    } catch (error) {
      console.error('Failed to create menu:', error)
    }
  }

  const handleUpdateMenu = async (data: any) => {
    try {
      if (selectedMenu) {
        await updateMenu.mutateAsync({ id: selectedMenu.id, ...data })
        setDialogOpen(false)
        setSelectedMenu(null)
      }
    } catch (error) {
      console.error('Failed to update menu:', error)
    }
  }

  const handleDeleteMenu = async (id: string) => {
    if (confirm('Are you sure you want to delete this menu?')) {
      try {
        await deleteMenu.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete menu:', error)
      }
    }
  }

  const openEditDialog = (menu: any) => {
    setSelectedMenu(menu)
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    setSelectedMenu(null)
    setDialogOpen(true)
  }

  const columns: ColumnDef<Menu>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'path',
      header: 'Path',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue('path')}</Badge>
      ),
    },
    {
      accessorKey: 'icon',
      header: 'Icon',
      cell: ({ row }) => (
        <div>{row.getValue('icon') || 'None'}</div>
      ),
    },
    {
      accessorKey: 'parent.name',
      header: 'Parent',
      cell: ({ row }) => (
        <div>{row.original.parent?.name || 'Root'}</div>
      ),
    },
    {
      accessorKey: 'orderIndex',
      header: 'Order',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const menu = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {showEditButton && (
                <DropdownMenuItem onClick={() => openEditDialog(menu)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {showDeleteButton && (
                <DropdownMenuItem 
                  onClick={() => handleDeleteMenu(menu.id)}
                  className="text-destructive"
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
            <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
            <p className="text-muted-foreground">
              Manage navigation menus and their hierarchy.
            </p>
          </div>
          
          {showAddButton && (
            <Modal
              isOpen={dialogOpen}
              onOpenChange={setDialogOpen}
              title={selectedMenu ? 'Edit Menu' : 'Create Menu'}
              description={selectedMenu ? 'Make changes to the menu item here.' : 'Add a new menu item to the system.'}
              trigger={
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Menu
                </Button>
              }
            >
              <MenuForm
                menu={selectedMenu}
                onSubmit={selectedMenu ? handleUpdateMenu : handleCreateMenu}
                isLoading={createMenu.isPending || updateMenu.isPending}
              />
            </Modal>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={menus}
              isLoading={isLoading}
              searchPlaceholder="Search menus..."
              emptyMessage="No menus found."
              pageSize={10}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}