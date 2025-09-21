import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import {
    withAuth
} from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const year = searchParams.get("year");
    const classId = searchParams.get("classId");
    const admin = await isAdmin(teacherId || "");
    const payments = await prisma.payment.findMany({
      where: {
        class: {
          AND: [
            { teacherId: admin ? undefined : teacherId },
            { year: year || undefined },
            { id: classId || undefined },
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      createSuccessResponse(payments, "Payments fetched successfully")
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(error as string, "Internal server error"),
      { status: 500 }
    );
  }
});
