import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DashboardApiResponse, DashboardData } from "@/types/dashboard";
import { getCurrentAcademicYear } from "@/lib/client-utils";

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error("Database connection failed");
    }

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year") || getCurrentAcademicYear();

    console.log("Dashboard API called with year:", yearParam);

    // Parse academic year format (e.g., "2024/2025" -> 2024)
    const startYear = yearParam.includes("/")
      ? parseInt(yearParam.split("/")[0])
      : parseInt(yearParam);

    if (isNaN(startYear)) {
      throw new Error(`Invalid year format: ${yearParam}`);
    }

    // Get dashboard statistics
    const [
      totalStudents,
      totalClasses,
      totalPayments,
      previousYearPayments,
      genderStats,
      classGenderStats,
      paymentTrends,
    ] = await Promise.all([
      // Total students
      prisma.studentClass.count({
        where: {
          class: {
            year: yearParam,
          },
        },
      }),

      // Total classes
      prisma.class.count({
        where: {
          year: yearParam,
        },
      }),

      // Total payments for current year
      prisma.payment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          class: {
            year: yearParam,
          },
        },
      }),

      // Previous year payments for growth calculation
      prisma.payment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          createdAt: {
            gte: new Date(`${startYear - 1}-07-01`),
            lt: new Date(`${startYear}-07-01`),
          },
        },
      }),

      // Gender distribution
      //   prisma.student.groupBy({
      //     by: ["gender"],
      //     _count: {
      //       gender: true,
      //     },
      //   }),
      prisma.studentClass.findMany({
        where: {
          class: {
            year: yearParam,
          },
        },
        include: {
          student: {
            select: {
              gender: true,
            },
          },
        },
      }),

      // Students by class and gender
      prisma.studentClass.findMany({
        where: {
          year: yearParam,
        },
        include: {
          student: {
            select: {
              gender: true,
            },
          },
          class: {
            select: {
              name: true,
            },
          },
        },
      }),

      // Payment trends by month
      prisma.$queryRaw<
        Array<{ month: number; class_name: string; total_amount: number }>
      >`
        SELECT 
          EXTRACT(MONTH FROM "paidAt") as month,
          c.name as class_name,
          SUM(p.amount) as total_amount
        FROM payments p
        JOIN classes c ON p."classId" = c.id
        WHERE EXTRACT(YEAR FROM p."paidAt") = ${startYear}
        GROUP BY EXTRACT(MONTH FROM "paidAt"), c.name
        ORDER BY month, class_name
      `,
    ]);

    // Calculate payment growth
    const currentTotal = totalPayments._sum.amount || 0;
    const previousTotal = previousYearPayments._sum.amount || 0;
    const paymentGrowth =
      previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    //[{gender: "MALE", _count: { gender: 10 }}, {gender: "FEMALE", _count: { gender: 5 }}]
    const grouped = genderStats.reduce((acc, item) => {
      const existing: { gender: string; count: number } | undefined = acc.find(
        (x: { gender: string; count: number }) =>
          x.gender === item.student.gender
      );
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ gender: item.student.gender, count: 1 });
      }
      return acc;
    }, [] as { gender: string; count: number }[]);
    // Process gender distribution
    const genderDistribution = grouped.map((stat, index) => ({
      name: stat.gender === "MALE" ? "Laki-laki" : "Perempuan",
      value: stat.count,
      fill: `hsl(var(--chart-${index + 1}))`,
    }));

    // Process class gender data
    const classGenderMap = new Map<
      string,
      { lakiLaki: number; perempuan: number }
    >();

    classGenderStats.forEach((item) => {
      const className = item.class.name;
      const gender = item.student.gender;

      if (!classGenderMap.has(className)) {
        classGenderMap.set(className, { lakiLaki: 0, perempuan: 0 });
      }

      const classData = classGenderMap.get(className)!;
      if (gender === "MALE") {
        classData.lakiLaki++;
      } else if (gender === "FEMALE") {
        classData.perempuan++;
      }
    });

    const classGenderData = Array.from(classGenderMap.entries()).map(
      ([className, data]) => ({
        class: className,
        lakiLaki: data.lakiLaki,
        perempuan: data.perempuan,
      })
    );

    // Process payment trends
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const paymentTrendMap = new Map<number, Record<string, number>>();

    paymentTrends.forEach((trend) => {
      const month = Number(trend.month);
      const className = trend.class_name;
      const amount = Number(trend.total_amount);

      if (!paymentTrendMap.has(month)) {
        paymentTrendMap.set(month, {});
      }

      paymentTrendMap.get(month)![className] = amount;
    });

    const paymentTrendData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthData = paymentTrendMap.get(month) || {};

      return {
        month: monthNames[i],
        ...monthData,
      };
    });

    const dashboardData: DashboardData = {
      stats: {
        totalPayments: currentTotal,
        totalStudents,
        totalClasses,
        paymentGrowth,
      },
      genderDistribution,
      classGenderData,
      paymentTrendData,
    };

    const response: DashboardApiResponse = {
      success: true,
      data: dashboardData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Dashboard API Error:", error);

    // Return detailed error for debugging
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Detailed error:", errorMessage);

    const errorResponse: DashboardApiResponse = {
      success: false,
      data: {
        stats: {
          totalPayments: 0,
          totalStudents: 0,
          totalClasses: 0,
          paymentGrowth: 0,
        },
        genderDistribution: [],
        classGenderData: [],
        paymentTrendData: [],
      },
      message: `Failed to fetch dashboard data: ${errorMessage}`,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
