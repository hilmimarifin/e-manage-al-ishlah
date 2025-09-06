import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withReadPermission, withWritePermission } from '@/lib/auth-middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const forUser = searchParams.get('forUser') === 'true'

    // Get user from auth middleware
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        createErrorResponse('Authentication required'),
        { status: 401 }
      )
    }

    const { verifyAccessToken } = await import('@/lib/jwt')
    const user = verifyAccessToken(token)

    if (forUser) {
      // Get menus for the current user based on their role (for sidebar navigation)
      // Sidebar should show all assigned menus regardless of specific permissions
      const userWithRole = await prisma.user.findUnique({
        where: { id: user.userId },
        include: {
          role: {
            include: {
              roleMenus: {
                include: {
                  menu: true
                }
                // Remove canRead filter - show all assigned menus in sidebar
              }
            }
          }
        }
      })

      // Get all menus assigned to the user's role (for navigation purposes)
      const userMenus = userWithRole?.role.roleMenus.map(rm => rm.menu) || []
      return NextResponse.json(createSuccessResponse(userMenus, 'User menus fetched successfully'))
    }

    // Get all menus for management (requires menu read permission)
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        role: {
          include: {
            roleMenus: {
              where: {
                menu: {
                  path: '/menus'
                }
              }
            }
          }
        }
      }
    })

    // Check if user has read permission for menus management
    const hasMenuPermission = userWithRole?.role.name === 'Super admin' || 
      userWithRole?.role.roleMenus.some(rm => rm.canRead)

    if (!hasMenuPermission) {
      return NextResponse.json(
        createErrorResponse('Insufficient permissions to access menu management'),
        { status: 403 }
      )
    }

    const menus = await prisma.menu.findMany({
      include: {
        children: true,
        parent: true
      },
      orderBy: {
        orderIndex: 'asc'
      }
    })

    return NextResponse.json(createSuccessResponse(menus, 'Menus fetched successfully'))
  } catch (error) {
    console.error('Error fetching menus:', error)
    return NextResponse.json(
      createErrorResponse('Failed to fetch menus', 'Internal server error'),
      { status: 500 }
    )
  }
}

export const POST = withWritePermission('/menus', async (req: NextRequest) => {
  try {
    const { name, path, icon, parentId, orderIndex } = await req.json()

    const menu = await prisma.menu.create({
      data: {
        name,
        path,
        icon,
        parentId,
        orderIndex: orderIndex || 0
      }
    })

    return NextResponse.json(createSuccessResponse(menu, 'Menu created successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to create menu', 'Internal server error'),
      { status: 500 }
    )
  }
})