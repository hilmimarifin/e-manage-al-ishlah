import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withAuth,
  withReadPermission,
  withWritePermission,
} from "@/lib/auth-middleware";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { createStudentClassSchema } from "@/lib/validations";

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    //validate is user is exist in class
    const studentClass = await prisma.studentClass.findUnique({
      where: {
        studentId_classId_year: {
          studentId: body.studentId,
          classId: body.classId,
          year: body.year,
        },
      },
    });
    if (studentClass) {
      return NextResponse.json(
        createErrorResponse("Gagal menambahkan siswa", "Siswa sudah terdaftar di kelas"),
        { status: 400 }
      );
    }

    // Validate request body
    const validationResult = createStudentClassSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return NextResponse.json(
        createErrorResponse("Validation failed", errorMessages),
        { status: 400 }
      );
    }

    const { studentId, classId, year } = validationResult.data;

    const classRoom = await prisma.studentClass.create({
      data: {
        studentId,
        classId,
        year,
      },
    });

    return NextResponse.json(
      createSuccessResponse(classRoom, "Class created successfully")
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error as string, "Internal server error"),
      { status: 500 }
    );
  }
});
