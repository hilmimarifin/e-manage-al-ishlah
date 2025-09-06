import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from './jwt'

export function withAuth(handler: (req: NextRequest, user: any, context?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context?: any) => {
    try {
      const token = req.headers.get('authorization')?.replace('Bearer ', '')
      
      if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      const user = verifyAccessToken(token)
      return handler(req, user, context)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  }
}

export function withAdminAuth(handler: (req: NextRequest, user: any, context?: any) => Promise<NextResponse>) {
  return withAuth(async (req: NextRequest, user: any, context?: any) => {
    // Check if user is admin (you'll need to fetch role from DB)
    const { prisma } = await import('./prisma')
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { role: true }
    })

    if (userWithRole?.role.name !== 'Super admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    return handler(req, user, context)
  })
}

type PermissionType = 'canRead' | 'canWrite' | 'canUpdate' | 'canDelete'

export function withPermission(
  menuPath: string, 
  permission: PermissionType,
  handler: (req: NextRequest, user: any, context?: any) => Promise<NextResponse>
) {
  return withAuth(async (req: NextRequest, user: any, context?: any) => {
    try {
      const { prisma } = await import('./prisma')
      
      // Get user with role
      const userWithRole = await prisma.user.findUnique({
        where: { id: user.userId },
        include: { role: true }
      })

      if (!userWithRole) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Super admin bypass - has all permissions
      if (userWithRole.role.name === 'Super admin') {
        return handler(req, user, context)
      }

      // Find menu by path
      const menu = await prisma.menu.findUnique({
        where: { path: menuPath }
      })

      if (!menu) {
        return NextResponse.json({ error: 'Menu not found' }, { status: 404 })
      }
      console.log("MENU", menu.id)
      console.log("USERWITHROLE", userWithRole.roleId)
      // Check role-menu permission
      const roleMenu = await prisma.roleMenu.findFirst({
        where: {
          AND: [
            { roleId: userWithRole.roleId },
            { menuId: menu.id }
          ]
        }
      })
      console.log("ROLEMENU", roleMenu)
      if (!roleMenu || !roleMenu[permission]) {
        return NextResponse.json({ 
          error: `Insufficient permissions. Required: ${permission} on ${menuPath}` 
        }, { status: 403 })
      }

      return handler(req, user, context)
    } catch (error) {
      console.error('Permission check error:', error)
      return NextResponse.json({ error: 'Permission check failed' }, { status: 500 })
    }
  })
}

// Convenience functions for common permission patterns
export function withReadPermission(menuPath: string, handler: (req: NextRequest, user: any, context?: any) => Promise<NextResponse>) {
  return withPermission(menuPath, 'canRead', handler)
}

export function withWritePermission(menuPath: string, handler: (req: NextRequest, user: any, context?: any) => Promise<NextResponse>) {
  return withPermission(menuPath, 'canWrite', handler)
}

export function withUpdatePermission(menuPath: string, handler: (req: NextRequest, user: any, context?: any) => Promise<NextResponse>) {
  return withPermission(menuPath, 'canUpdate', handler)
}

export function withDeletePermission(menuPath: string, handler: (req: NextRequest, user: any, context?: any) => Promise<NextResponse>) {
  return withPermission(menuPath, 'canDelete', handler)
}