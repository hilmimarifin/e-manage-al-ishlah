import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withReadPermission, withWritePermission } from '@/lib/auth-middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

export const GET = withReadPermission('/roles', async (req: NextRequest) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(createSuccessResponse(roles, 'Roles fetched successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to fetch roles', 'Internal server error'),
      { status: 500 }
    )
  }
})

export const POST = withWritePermission('/roles', async (req: NextRequest) => {
  try {
    const { name, description } = await req.json()

    const role = await prisma.role.create({
      data: {
        name,
        description
      }
    })

    return NextResponse.json(createSuccessResponse(role, 'Role created successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to create role', 'Internal server error'),
      { status: 500 }
    )
  }
})