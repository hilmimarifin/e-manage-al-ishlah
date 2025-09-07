import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withUpdatePermission, withDeletePermission } from '@/lib/auth-middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { updateMenuSchema } from '@/lib/validations'

export const PUT = withUpdatePermission('/menus', async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json()
    const { id } = params

    // Validate request body
    const validationResult = updateMenuSchema.safeParse(body)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return NextResponse.json(
        createErrorResponse('Validation failed', errorMessages),
        { status: 400 }
      )
    }

    const { name, path, icon, parentId, orderIndex } = validationResult.data
    const safeParentId = !parentId ? null : parentId
    
    const menu = await prisma.menu.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(path !== undefined && { path }),
        ...(icon !== undefined && { icon }),
        ...(parentId !== undefined && { parentId: safeParentId }),
        ...(orderIndex !== undefined && { orderIndex })
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