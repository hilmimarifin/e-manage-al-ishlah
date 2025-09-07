import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withUpdatePermission, withDeletePermission } from '@/lib/auth-middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

export const PUT = withUpdatePermission('/students', async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { fullName, birthDate, address, phone, gender, guardian, photo, status } = await req.json()
    const { id } = params

    const student = await prisma.student.update({
      where: { id },
      data: {
        fullName,
        birthDate,
        address,
        phone,
        gender,
        guardian,
        photo,
        status
      }
    })

    return NextResponse.json(createSuccessResponse(student, 'Student updated successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error as string, 'Internal server error'),
      { status: 500 }
    )
  }
})

export const DELETE = withDeletePermission('/students', async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    // Check if student has classes
    const studentWithClasses = await prisma.student.findUnique({
      where: { id },
      include: { _count: { select: { classes: true } } }
    })

    if (studentWithClasses?._count.classes && studentWithClasses._count.classes > 0) {
      return NextResponse.json(
        createErrorResponse('Cannot delete student with assigned classes', 'Validation error'),
        { status: 400 }
      )
    }

    await prisma.student.delete({
      where: { id }
    })

    return NextResponse.json(createSuccessResponse(null, 'Student deleted successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to delete student', 'Internal server error'),
      { status: 500 }
    )
  }
})