'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUsers } from '@/hooks/use-users'
import { useRoles } from '@/hooks/use-roles'
import { useMenus } from '@/hooks/use-menus'
import { Users, UserCheck, Menu, BarChart3 } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()
  // const { data: users = [], isLoading: usersLoading } = useUsers()
  // const { data: roles = [], isLoading: rolesLoading } = useRoles()
  // const { data: menus = [], isLoading: menusLoading } = useMenus()

  const isAdmin = user?.role.name === 'Super admin'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.username}!</h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening in your system today.
          </p>
        </div>

        {/* {isAdmin && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usersLoading ? '...' : (users as any[])?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active user accounts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Roles</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rolesLoading ? '...' : (roles as any[])?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  System roles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
                <Menu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{menusLoading ? '...' : (menus as any[])?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Navigation items
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">100%</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>
        )}
 */}
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>
              Your role-based access control system is running smoothly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Current Role:</strong> {user?.role.name}</p>
              <p><strong>Account:</strong> {user?.email}</p>
              {user?.role.description && (
                <p><strong>Role Description:</strong> {user.role.description}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}