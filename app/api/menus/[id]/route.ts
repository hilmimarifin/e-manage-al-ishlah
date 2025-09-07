import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withUpdatePermission, withDeletePermission } from '@/lib/auth-middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

export const PUT = withUpdatePermission('/menus', async (req: NextRequest, user: any, context: any) => {
  try {

    const { name, path, icon, parentId, orderIndex, id } = await req.json()
    const safeParentId = !parentId ? null : parentId
    const menu = await prisma.menu.update({
      where: { id },
      data: {
        name,
        path,
        icon,
        parentId: safeParentId,
        orderIndex
      }
    })

    return NextResponse.json(createSuccessResponse(menu, 'Menu updated successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error as string, 'Internal server error'),
      { status: 500 }
    )
  }
})

export const DELETE = withDeletePermission('/menus', async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    await prisma.menu.delete({
      where: { id }
    })

    return NextResponse.json(createSuccessResponse(null, 'Menu deleted successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to delete menu', 'Internal server error'),
      { status: 500 }
    )
  }
})