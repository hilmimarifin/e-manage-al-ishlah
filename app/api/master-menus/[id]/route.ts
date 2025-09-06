import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withUpdatePermission, withDeletePermission } from '@/lib/auth-middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

export const PUT = withUpdatePermission('/master-menus', async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { name, path, icon, parentId, orderIndex } = await req.json()
    const { id } = params

    const menu = await prisma.menu.update({
      where: { id },
      data: {
        name,
        path,
        icon,
        parentId,
        orderIndex
      }
    })

    return NextResponse.json(createSuccessResponse(menu, 'Menu updated successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to update menu', 'Internal server error'),
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