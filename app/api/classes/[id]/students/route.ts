import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withWritePermission, withReadPermission } from "@/lib/auth-middleware";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";

interface BulkAssignBody {
  studentIds: string[];
  year?: string;
}

export const POST = withWritePermission(
  "/classrooms",
  async (
    req: NextRequest,
    _user: any,
    { params }: { params: { id: string } }
  ) => {
    try {
      const classId = params.id;
      const body = (await req.json()) as BulkAssignBody;

      if (!Array.isArray(body.studentIds) || body.studentIds.length === 0) {
        return NextResponse.json(
          createErrorResponse("Validation failed", "studentIds must be a non-empty array"),
          { status: 400 }
        );
      }

      const classRecord = await prisma.class.findUnique({ where: { id: classId } });
      if (!classRecord) {
        return NextResponse.json(
          createErrorResponse("Class not found", "Invalid class id"),
          { status: 404 }
        );
      }

      const targetYear = body.year || classRecord.year || undefined;
      if (!targetYear) {
        return NextResponse.json(
          createErrorResponse("Validation failed", "Year is required (use class year or provide in body)"),
          { status: 400 }
        );
      }

      // Fetch existing mappings for these students in the same year (any class)
      const existingMappings = await prisma.studentClass.findMany({
        where: {
          studentId: { in: body.studentIds },
          year: targetYear,
        },
        select: { studentId: true, classId: true },
      });
      const alreadyAssigned = new Set(existingMappings.map((m) => m.studentId));

      const toCreate = body.studentIds
        .filter((sid) => !alreadyAssigned.has(sid))
        .map((sid) => ({ studentId: sid, classId, year: targetYear }));

      if (toCreate.length > 0) {
        // Use transaction with createMany
        await prisma.$transaction([
          prisma.studentClass.createMany({ data: toCreate, skipDuplicates: true }),
        ]);
      }

      const result = {
        classId,
        year: targetYear,
        totalRequested: body.studentIds.length,
        assigned: toCreate.length,
        skipped: existingMappings.length,
        skippedStudentIds: Array.from(alreadyAssigned),
      };

      return NextResponse.json(
        createSuccessResponse(result, "Students assigned successfully")
      );
    } catch (error) {
      return NextResponse.json(
        createErrorResponse(error as string, "Internal server error"),
        { status: 500 }
      );
    }
  }
);

export const GET = withReadPermission(
  "/classrooms",
  async (
    req: NextRequest,
    _user: any,
    { params }: { params: { id: string } }
  ) => {
    try {
      const classId = params.id;
      const { searchParams } = new URL(req.url);
      const year = searchParams.get("year") || undefined;

      const classRecord = await prisma.class.findUnique({ where: { id: classId } });
      if (!classRecord) {
        return NextResponse.json(
          createErrorResponse("Class not found", "Invalid class id"),
          { status: 404 }
        );
      }

      const mappings = await prisma.studentClass.findMany({
        where: {
          classId,
          year: year || undefined,
        },
        select: { studentId: true },
      });

      const studentIds = mappings.map((m) => m.studentId);
      return NextResponse.json(
        createSuccessResponse({ studentIds }, "Assigned students fetched")
      );
    } catch (error) {
      return NextResponse.json(
        createErrorResponse(error as string, "Internal server error"),
        { status: 500 }
      );
    }
  }
);
