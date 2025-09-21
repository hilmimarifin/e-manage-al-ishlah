import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateTokens } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json()

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Get default user role
    const userRole = await prisma.role.findUnique({
      where: { name: 'user' }
    })

    if (!userRole) {
      return NextResponse.json(
        { error: 'Default role not found' },
        { status: 500 }
      )
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        roleId: userRole.id,
        nik: "", // Will be filled later by user
        name: username, // Use username as default name
        gender: "MALE", // Default gender
        phone: "" // Will be filled later by user
      },
      include: {
        role: true
      }
    })

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      roleId: user.roleId
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      accessToken
    })

    // Set refresh token as httpOnly cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}