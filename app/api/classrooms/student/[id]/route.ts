import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/auth-middleware";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";

export const DELETE = withPermission(
  "/classrooms",
  "canDelete",
  async (
    req: NextRequest,
    user: any,
    { params }: { params: { id: string } }
  ) => {
    try {
      const { id } = params;

      await prisma.studentClass.delete({
        where: { id },
      });

      return NextResponse.json(
        createSuccessResponse(null, "Student deleted successfully")
      );
    } catch (error) {
      return NextResponse.json(
        createErrorResponse("Failed to delete student", "Internal server error"),
        { status: 500 }
      );
    }
  }
);
