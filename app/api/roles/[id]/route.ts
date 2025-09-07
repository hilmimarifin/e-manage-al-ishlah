import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withUpdatePermission, withDeletePermission } from '@/lib/auth-middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { updateRoleSchema } from '@/lib/validations'

export const PUT = withUpdatePermission('/roles', async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json()
    const { id } = params

    // Validate request body
    const validationResult = updateRoleSchema.safeParse(body)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return NextResponse.json(
        createErrorResponse('Validation failed', errorMessages),
        { status: 400 }
      )
    }

    const { name, description } = validationResult.data

    const role = await prisma.role.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description })
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