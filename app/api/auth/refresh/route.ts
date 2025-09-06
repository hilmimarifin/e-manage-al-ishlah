import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken, generateTokens } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        createErrorResponse('Refresh token not found'),
        { status: 401 }
      )
    }

    const payload = verifyRefreshToken(refreshToken)

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { role: true }
    })

    if (!user) {
      return NextResponse.json(
        createErrorResponse('User not found'),
        { status: 401 }
      )
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      roleId: user.roleId
    })

    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      accessToken
    }

    const response = NextResponse.json(
      createSuccessResponse(responseData, 'Token refreshed successfully')
    )

    // Set new refresh token
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response
  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json(
      createErrorResponse('Invalid refresh token'),
      { status: 401 }
    )
  }
}