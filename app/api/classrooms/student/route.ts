import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withAuth,
  withReadPermission,
  withWritePermission,
} from "@/lib/auth-middleware";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { createStudentClassSchema } from "@/lib/validations";
import { isAdmin } from "@/lib/utils";
export const GET = withReadPermission(
  "/classrooms",
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const teacherId = searchParams.get("teacherId");
      const year = searchParams.get("year");
      const classId = searchParams.get("classId");
      const admin = await isAdmin(teacherId || "");
      const students = await prisma.studentClass.findMany({
        where: {
          class: {
            AND: [
              { teacherId: admin ? undefined : teacherId },
              { year: year || undefined },
              { id: classId || undefined },
            ],
          },
        },
        include: {
          class: {
            select: {
              name: true,
              grade: true,
              year: true,
            },
          },
          student: {
            select: {
              id: true,
              fullName: true,
              address: true,
              phone: true,
            },
          },
        },
        orderBy: {
          student: {
            fullName: "asc",
          },
        },
      });

      const data = students.map((student) => ({
        id: student.id,
        name: student.student.fullName,
        grade: student.class.grade,
        className: student.class.name,
        year: student.class.year,
        address: student.student.address,
        phone: student.student.phone,
      }));

      return NextResponse.json(
        createSuccessResponse(data, "Classes fetched successfully")
      );
    } catch (error) {
      return NextResponse.json(
        createErrorResponse(error as string, "Internal server error"),
        { status: 500 }
      );
    }
  }
);

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();

    if (!body.classId) {
      return NextResponse.json(
        createErrorResponse(
          "Gagal menambahkan siswa",
          "Kelas tidak boleh kosong"
        ),
        { status: 400 }
      );
    }
    //validate is user is exist in class
    const studentClass = await prisma.studentClass.findFirst({
      where: {
        AND: [
          { studentId: body.studentId },
          { year: body.year },
        ]
      },
    });
    if (studentClass) {
      return NextResponse.json(
        createErrorResponse(
          "Gagal menambahkan siswa",
          "Siswa sudah terdaftar di kelas lain"
        ),
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
        studentId: studentId || "",
        classId: classId || "",
        year: year || "",
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
