import { createErrorResponse, createSuccessResponse } from '@/lib/api-response'
import { withAuth, withUpdatePermission, withWritePermission } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const roleId = searchParams.get('roleId')

    const roleMenus = await prisma.roleMenu.findMany({
      where: roleId ? { roleId } : {},
      include: {
        role: true,
        menu: true
      }
    })

    return NextResponse.json(createSuccessResponse(roleMenus, 'Role menus fetched successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to fetch role menus', 'Internal server error'),
      { status: 500 }
    )
  }
})

export const POST = withWritePermission('/role-menus', async (req: NextRequest) => {
  try {
    const { roleId, menuId, canRead, canWrite, canUpdate, canDelete } = await req.json()

    const roleMenu = await prisma.roleMenu.upsert({
      where: {
        roleId_menuId: {
          roleId,
          menuId
        }
      },
      create: {
        roleId,
        menuId,
        canRead: canRead || true,
        canWrite: canWrite || false,
        canUpdate: canUpdate || false,
        canDelete: canDelete || false
      },
      update: {
        canRead,
        canWrite,
        canUpdate,
        canDelete
      },
      include: {
        role: true,
        menu: true
      }
    })

    return NextResponse.json(createSuccessResponse(roleMenu, 'Role menu permission assigned successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to assign menu to role', 'Internal server error'),
      { status: 500 }
    )
  }
})

export const PUT = withUpdatePermission('/role-menus', async (req: NextRequest) => {
  try {
    const { roleId, permissions } = await req.json()

    // Delete existing permissions for this role
    await prisma.roleMenu.deleteMany({
      where: { roleId }
    })

    // Create new permissions
    const roleMenus = await Promise.all(
      permissions.map((permission: any) =>
        prisma.roleMenu.create({
          data: {
            roleId,
            menuId: permission.menuId,
            canRead: permission.canRead || false,
            canWrite: permission.canWrite || false,
            canUpdate: permission.canUpdate || false,
            canDelete: permission.canDelete || false
          },
          include: {
            role: true,
            menu: true
          }
        })
      )
    )

    return NextResponse.json(createSuccessResponse(roleMenus, 'Role permissions updated successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to update role permissions', 'Internal server error'),
      { status: 500 }
    )
  }
})