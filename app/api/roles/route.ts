import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withReadPermission, withWritePermission } from '@/lib/auth-middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { createRoleSchema } from '@/lib/validations'

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
    const body = await req.json()
    
    // Validate request body
    const validationResult = createRoleSchema.safeParse(body)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return NextResponse.json(
        createErrorResponse('Validation failed', errorMessages),
        { status: 400 }
      )
    }

    const { name, description } = validationResult.data

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