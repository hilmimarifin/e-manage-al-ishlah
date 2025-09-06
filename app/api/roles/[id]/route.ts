import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withUpdatePermission, withDeletePermission } from '@/lib/auth-middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

export const PUT = withUpdatePermission('/roles', async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { name, description } = await req.json()
    const { id } = params

    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        description
      }
    })

    return NextResponse.json(createSuccessResponse(role, 'Role updated successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to update role', 'Internal server error'),
      { status: 500 }
    )
  }
})

export const DELETE = withDeletePermission('/roles', async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    // Check if role has users
    const roleWithUsers = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } }
    })

    if (roleWithUsers?._count.users && roleWithUsers._count.users > 0) {
      return NextResponse.json(
        createErrorResponse('Cannot delete role with assigned users', 'Validation error'),
        { status: 400 }
      )
    }

    await prisma.role.delete({
      where: { id }
    })

    return NextResponse.json(createSuccessResponse(null, 'Role deleted successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to delete role', 'Internal server error'),
      { status: 500 }
    )
  }
})