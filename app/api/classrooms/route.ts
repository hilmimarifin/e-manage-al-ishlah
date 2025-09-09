import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withAuth,
  withReadPermission,
  withWritePermission,
} from "@/lib/auth-middleware";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { createClassSchema } from "@/lib/validations";

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const year = searchParams.get("year");
    const grade = searchParams.get("grade");
    const unrestricted = ["Super Admin", "Admin"];
    const isAdmin = unrestricted.includes(
      prisma.user.findUnique({
        where: {
          id: teacherId || "",
        },
      })?.role?.name || ""
    );
    const students = await prisma.studentClass.findMany({
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
      where: {
        class: {
          AND: [
            { teacherId: isAdmin ? undefined : teacherId },
            { year: year || undefined },
            { grade: grade || undefined },
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const classes = await prisma.class.findFirst({
      where: {
        AND: [
          { teacherId: isAdmin ? undefined : teacherId },
          { year: year || undefined },
          { grade: grade || undefined },
        ],
      },
    });
    const data = {
      classId: classes?.id,
      className: classes?.name,
      year: classes?.year,
      grade: classes?.grade,
      students: students.map((student) => ({
        id: student.student.id,
        name: student.student.fullName,
        grade: student.class.grade,
        className: student.class.name,
        year: student.class.year,
        address: student.student.address,
        phone: student.student.phone,
      })),
    };
    return NextResponse.json(
      createSuccessResponse(data, "Classes fetched successfully")
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error as string, "Internal server error"),
      { status: 500 }
    );
  }
});

export const POST = withWritePermission(
  "/classes",
  async (req: NextRequest) => {
    try {
      const body = await req.json();

      // Validate request body
      const validationResult = createClassSchema.safeParse(body);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        return NextResponse.json(
          createErrorResponse("Validation failed", errorMessages),
          { status: 400 }
        );
      }

      const { name, grade, year, teacherId, monthlyFee } =
        validationResult.data;

      const classRoom = await prisma.class.create({
        data: {
          name,
          grade,
          year,
          teacherId,
          monthlyFee,
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
  }
);
