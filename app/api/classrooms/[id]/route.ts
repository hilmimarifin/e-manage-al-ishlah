import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withUpdatePermission, withDeletePermission } from '@/lib/auth-middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { updateClassSchema } from '@/lib/validations'

export const PUT = withUpdatePermission('/classes', async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json()
    const { id } = params

    // Validate request body
    const validationResult = updateClassSchema.safeParse(body)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return NextResponse.json(
        createErrorResponse('Validation failed', errorMessages),
        { status: 400 }
      )
    }

    const { name, grade, year, teacherId, monthlyFee } = validationResult.data

    const classRoom = await prisma.class.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(grade !== undefined && { grade }),
        ...(year !== undefined && { year }),
        ...(teacherId !== undefined && { teacherId }),
        ...(monthlyFee !== undefined && { monthlyFee })
      }
    })

    return NextResponse.json(createSuccessResponse(classRoom, 'Class updated successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error as string, 'Internal server error'),
      { status: 500 }
    )
  }
})

export const DELETE = withDeletePermission('/classes', async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    // Check if class has students
    const classWithStudents = await prisma.class.findUnique({
      where: { id },
      include: { _count: { select: { students: true } } }
    })

    if (classWithStudents?._count.students && classWithStudents._count.students > 0) {
      return NextResponse.json(
        createErrorResponse('Cannot delete class with assigned students', 'Validation error'),
        { status: 400 }
      )
    }

    await prisma.class.delete({
      where: { id }
    })

    return NextResponse.json(createSuccessResponse(null, 'Class deleted successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to delete class', 'Internal server error'),
      { status: 500 }
    )
  }
})