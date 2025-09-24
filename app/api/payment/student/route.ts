import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { convertToAcademicMonthNumber, isAdmin } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId") || undefined;
    const year = searchParams.get("year") || undefined;
    const classId = searchParams.get("classId") || undefined;
    const admin = await isAdmin(teacherId || "");
    const studentofClass = await prisma.studentClass.findMany({
      where: {
        class: {
          AND: [
            { year: year || undefined },
            { teacherId: admin ? undefined : teacherId },
            { id: classId || undefined },
          ],
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
        class: {
          include: {
            teacher: true,
          },
        },
      },
    });

    const data = studentofClass.map((student) => ({
      id: student.student.id,
      name: student.student.fullName,
      classId: student.class.id,
      className: student.class.name,
      year: student.class.year,
      grade: student.class.grade,
      teacherName: student.class.teacher?.name || "",
      monthlyFeeAmount: student.class.monthlyFee,
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
    const month = (monthLatestPayment % 12) + 1;
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
        createErrorResponse("Error", "Bulan tidak valid"),
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

export const PUT = withAuth(async (req: NextRequest, user: any) => {
  try {
    const { studentId, classId, months } = await req.json();

    // Validate input
    if (!studentId || !classId || !Array.isArray(months)) {
      return NextResponse.json(
        createErrorResponse("Missing required fields: studentId, classId, months"),
        { status: 400 }
      );
    }

    // Convert month numbers to integers and validate
    const monthNumbers = months.map(m => parseInt(m)).filter(m => m >= 1 && m <= 12);
    if (monthNumbers.length !== months.length) {
      return NextResponse.json(
        createErrorResponse("Invalid month numbers provided"),
        { status: 400 }
      );
    }

    // Get student class info to fetch monthly fee
    const studentClass = await prisma.studentClass.findFirst({
      where: {
        studentId,
        classId,
      },
      include: {
        class: {
          select: {
            monthlyFee: true,
            year: true,
          },
        },
      },
    });

    if (!studentClass) {
      return NextResponse.json(
        createErrorResponse("Student is not enrolled in this class"),
        { status: 404 }
      );
    }

    // Get existing payments for this student and class
    const existingPayments = await prisma.payment.findMany({
      where: {
        studentId,
        classId,
      },
      select: {
        id: true,
        month: true,
      },
    });

    const existingMonths = existingPayments.map(p => p.month);
    const monthsToCreate = monthNumbers.filter(month => !existingMonths.includes(month));
    const monthsToDelete = existingMonths.filter(month => !monthNumbers.includes(month));

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Delete payments for unchecked months
      if (monthsToDelete.length > 0) {
        await tx.payment.deleteMany({
          where: {
            studentId,
            classId,
            month: {
              in: monthsToDelete,
            },
          },
        });
      }

      // Create payments for newly checked months
      if (monthsToCreate.length > 0) {
        await tx.payment.createMany({
          data: monthsToCreate.map(month => ({
            studentId,
            classId,
            month,
            amount: studentClass.class.monthlyFee || 0,
            recordedBy: user.userId,
          })),
        });
      }

      return {
        created: monthsToCreate.length,
        deleted: monthsToDelete.length,
        totalMonths: monthNumbers.length,
      };
    });

    return NextResponse.json(
      createSuccessResponse(result, "Payment updated successfully")
    );
  } catch (error) {
    console.error("Payment update error:", error);
    return NextResponse.json(
      createErrorResponse(error as string, "Internal server error"),
      { status: 500 }
    );
  }
});
