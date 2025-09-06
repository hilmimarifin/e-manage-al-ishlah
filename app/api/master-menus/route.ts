import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withReadPermission, withWritePermission } from '@/lib/auth-middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

export const GET = withReadPermission('/master-menus', async (req: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(req.url)
    const forUser = searchParams.get('forUser') === 'true'

    if (forUser) {
      // Get menus for the current user based on their role
      const userWithRole = await prisma.user.findUnique({
        where: { id: user.userId },
        include: {
          role: {
            include: {
              roleMenus: {
                include: {
                  menu: true
                },
                where: {
                  canRead: true
                }
              }
            }
          }
        }
      })

      const userMenus = userWithRole?.role.roleMenus.map(rm => rm.menu) || []
      return NextResponse.json(userMenus)
    }

    // Get all menus (admin only)
    const adminUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { role: true }
    })

    if (adminUser?.role.name !== 'Super admin') {
      return NextResponse.json(
        createErrorResponse('Admin access required', 'Admin access required'),
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
    return NextResponse.json(
      createErrorResponse('Failed to fetch menus', 'Internal server error'),
      { status: 500 }
    )
  }
})

export const POST = withWritePermission('/master-menus', async (req: NextRequest) => {
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