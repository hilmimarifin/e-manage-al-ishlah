import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withReadPermission, withWritePermission } from '@/lib/auth-middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { createStudentSchema } from '@/lib/validations'

export const GET = withReadPermission('/students', async (req: NextRequest) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(createSuccessResponse(students, 'Students fetched successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error as string, 'Internal server error'),
      { status: 500 }
    )
  }
})

export const POST = withWritePermission('/students', async (req: NextRequest) => {
  try {
    const body = await req.json()
    
    // Validate request body
    const validationResult = createStudentSchema.safeParse(body)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return NextResponse.json(
        createErrorResponse('Validation failed', errorMessages),
        { status: 400 }
      )
    }

    const { fullName, birthDate, address, phone, guardian, photo, gender, status, entryYear } = validationResult.data

    const student = await prisma.student.create({
      data: {
        fullName,
        birthDate: birthDate ? new Date(birthDate) : null,
        address,
        phone,
        guardian,
        gender,
        status,
        photo: photo || "https://placehold.co/100x100",
        entryYear,
      }
    })

    return NextResponse.json(createSuccessResponse(student, 'Student created successfully'))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error as string, 'Internal server error'),
      { status: 500 }
    )
  }
})