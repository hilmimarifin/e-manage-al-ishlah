import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDeletePermission } from '@/lib/auth-middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

export const DELETE = withDeletePermission('/role-menus', async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    await prisma.roleMenu.delete({
      where: { id }
    })

    return NextResponse.json(createSuccessResponse(null, 'Role menu assignment deleted successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to delete role menu assignment', 'Internal server error'),
      { status: 500 }
    )
  }
})