import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withAuth,
  withReadPermission,
  withWritePermission,
} from "@/lib/auth-middleware";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { createClassSchema } from "@/lib/validations";
import { isAdmin } from "@/lib/utils";

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const teacherId = searchParams.get("teacherId");
    const admin = await isAdmin(teacherId || "");
    const classes = await prisma.class.findMany({
      where: {
        AND: [
          { year: year || undefined },
          { teacherId: admin ? undefined : teacherId || undefined },
        ],
      },
      include: {
        teacher: { select: { username: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const flattenedData = classes.map((item) => {
      const { teacher, ...rest } = item;
      return {
        ...rest,
        teacherName: teacher?.username || null,
      };
    });
    return NextResponse.json(
      createSuccessResponse(flattenedData, "Classes fetched successfully")
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
