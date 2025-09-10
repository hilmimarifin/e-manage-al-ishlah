import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withAuth,
  withReadPermission,
  withWritePermission,
} from "@/lib/auth-middleware";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { createStudentClassSchema } from "@/lib/validations";
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId") || undefined;
    const year = searchParams.get("year") || undefined;
    const studentofClass = await prisma.studentClass.findMany({
      where: {
        class: {
          AND: [{ year }, { teacherId }],
        },
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            payments: true,
          },
        },
        class: true,
      },
    });
    const data = studentofClass.map((student) => ({
      studentId: student.student.id,
      name: student.student.fullName,
      year: student.class.year,
      grade: student.class.grade,
      className: student.class.name,
      classId: student.class.id,
      monthlyFee: {
        jan: student.student.payments.find((payment) => payment.month === 1)
          ?.amount || 0,
        feb: student.student.payments.find((payment) => payment.month === 2)
          ?.amount || 0,
        mar: student.student.payments.find((payment) => payment.month === 3)
          ?.amount || 0,
        apr: student.student.payments.find((payment) => payment.month === 4)
          ?.amount || 0,
        may: student.student.payments.find((payment) => payment.month === 5)
          ?.amount || 0,
        jun: student.student.payments.find((payment) => payment.month === 6)
          ?.amount || 0,
        jul: student.student.payments.find((payment) => payment.month === 7)
          ?.amount || 0,
        aug: student.student.payments.find((payment) => payment.month === 8)
          ?.amount || 0,
        sep: student.student.payments.find((payment) => payment.month === 9)
          ?.amount || 0,
        oct: student.student.payments.find((payment) => payment.month === 10)
          ?.amount || 0,
        nov: student.student.payments.find((payment) => payment.month === 11)
          ?.amount || 0,
        dec: student.student.payments.find((payment) => payment.month === 12)
          ?.amount || 0,
      },
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
});
