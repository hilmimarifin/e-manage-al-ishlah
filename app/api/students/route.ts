import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withReadPermission, withWritePermission } from '@/lib/auth-middleware'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

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
    const { fullName, birthDate, address, phone, guardian, photo, gender, status } = await req.json()

    const student = await prisma.student.create({
      data: {
        fullName,
        birthDate: new Date(birthDate),
        address,
        phone,
        guardian,
        gender,
        status,
        photo: "https://placehold.co/100x100",
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