import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  withAuth,
  withReadPermission,
  withWritePermission,
} from "@/lib/auth-middleware";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";

export const GET = withAuth(async (req: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const year = searchParams.get("year");

    if (!classId || !year) {
      const users = await prisma.user.findMany({
        include: {
          role: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      const safeUsers = users.map(({ password, ...user }) => user);

      return NextResponse.json(
        createSuccessResponse(safeUsers, "Users fetched successfully")
      );
    }
    const classes = await prisma.class.findMany({
      where: {
        AND: [{ year: year || undefined }, { id: classId || undefined }],
      },
      include: {
        teacher: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const users = classes?.map((cls) => cls.teacher);

    return NextResponse.json(
      createSuccessResponse(users, "Users fetched successfully")
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse("Failed to fetch users", "Internal server error"),
      { status: 500 }
    );
  }
});

export const POST = withWritePermission("/users", async (req: NextRequest) => {
  try {
    const { email, username, password, roleId } = await req.json();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        createErrorResponse(
          "User with this email or username already exists",
          "Validation error"
        ),
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        roleId,
      },
      include: {
        role: true,
      },
    });

    const { password: _, ...safeUser } = user;

    return NextResponse.json(
      createSuccessResponse(safeUser, "User created successfully")
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse("Failed to create user", "Internal server error"),
      { status: 500 }
    );
  }
});
