import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { withUpdatePermission, withDeletePermission } from '@/lib/auth-middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

export const PUT = withUpdatePermission('/users', async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { email, username, password, roleId } = await req.json()
    const { id } = params

    const updateData: any = {
      email,
      username,
      roleId
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true
      }
    })

    const { password: _, ...safeUser } = updatedUser

    return NextResponse.json(createSuccessResponse(safeUser, 'User updated successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to update user', 'Internal server error'),
      { status: 500 }
    )
  }
})

export const DELETE = withDeletePermission('/users', async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json(createSuccessResponse(null, 'User deleted successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to delete user', 'Internal server error'),
      { status: 500 }
    )
  }
})