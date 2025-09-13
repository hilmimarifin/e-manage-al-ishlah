import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withAuth,
  withReadPermission,
  withWritePermission,
} from "@/lib/auth-middleware";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { createStudentClassSchema } from "@/lib/validations";
import { convertToAcademicMonthNumber } from "@/lib/utils";
import { isAdmin } from "@/lib/utils";
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId") || undefined;
    const year = searchParams.get("year") || undefined;
    const admin = await isAdmin(teacherId || "");
    const studentofClass = await prisma.studentClass.findMany({
      where: {
        class: {
          AND: [{ year }, { teacherId: admin ? undefined : teacherId }],
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

    const classInfo = await prisma.class.findFirst({
      where: {
        AND: [{ year }, { teacherId }],
      },
    });

    const data = {
      classId: classInfo?.id,
      className: classInfo?.name,
      year: classInfo?.year,
      grade: classInfo?.grade,
      studentData: studentofClass.map((student) => ({
        id: student.student.id,
        name: student.student.fullName,
        monthlyFee: {
          jan:
            student.student.payments.find((payment) => payment.month === 1)
              ?.amount || 0,
          feb:
            student.student.payments.find((payment) => payment.month === 2)
              ?.amount || 0,
          mar:
            student.student.payments.find((payment) => payment.month === 3)
              ?.amount || 0,
          apr:
            student.student.payments.find((payment) => payment.month === 4)
              ?.amount || 0,
          may:
            student.student.payments.find((payment) => payment.month === 5)
              ?.amount || 0,
          jun:
            student.student.payments.find((payment) => payment.month === 6)
              ?.amount || 0,
          jul:
            student.student.payments.find((payment) => payment.month === 7)
              ?.amount || 0,
          aug:
            student.student.payments.find((payment) => payment.month === 8)
              ?.amount || 0,
          sep:
            student.student.payments.find((payment) => payment.month === 9)
              ?.amount || 0,
          oct:
            student.student.payments.find((payment) => payment.month === 10)
              ?.amount || 0,
          nov:
            student.student.payments.find((payment) => payment.month === 11)
              ?.amount || 0,
          dec:
            student.student.payments.find((payment) => payment.month === 12)
              ?.amount || 0,
        },
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

export const POST = withAuth(async (req: NextRequest, user: any) => {
  try {
    const { studentId, classId } = await req.json();
    const userPayment = await prisma.studentClass.findFirst({
      where: {
        studentId,
        classId,
      },
      include: {
        class: {
          select: {
            year: true,
            monthlyFee: true,
          },
        },
        student: {
          select: {
            payments: {
              where: { classId },
              select: {
                month: true,
              },
            },
          },
        },
      },
    });
    const monthLatestPayment =
      userPayment?.student?.payments?.sort(
        (a, b) =>
          convertToAcademicMonthNumber(b.month) -
          convertToAcademicMonthNumber(a.month)
      )[0]?.month || convertToAcademicMonthNumber(0);
    const month = monthLatestPayment % 12 + 1;
    console.log(month);
    
    const existing = await prisma.payment.findFirst({
      where: {
        studentId,
        classId,
        month,
        class: { year: userPayment?.class?.year }, // filter relasi ke Class
      },
    });
    if (existing) {
      return NextResponse.json(
        createErrorResponse(
          "Payment for this class, year, and month already exists"
        ),
        { status: 400 }
      );
    }
    const invalidMonth = month > 12 || month < 1;
    if (invalidMonth) {
      return NextResponse.json(
        createErrorResponse(
          "Error","Bulan tidak valid"
        ),
        { status: 400 }
      );
    }
    const payment = await prisma.payment.create({
      data: {
        studentId,
        classId,
        month,
        amount: userPayment?.class?.monthlyFee || 0,
        recordedBy: user.userId,
      },
    });
    return NextResponse.json(
      createSuccessResponse(payment, "Payment created successfully")
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error as string, "Internal server error"),
      { status: 500 }
    );
  }
});
