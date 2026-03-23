import { NextRequest, NextResponse } from 'next/server';
import { signInPrincipal } from '@/lib/auth-firebase';
import { auth as adminAuth } from '@/lib/firebase-admin';
import type { PrincipalCredentials } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const credentials: PrincipalCredentials = await request.json();

    if (!credentials.email || !credentials.password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Security: Check if email exists first using admin SDK for granular error
    try {
      await adminAuth.getUserByEmail(credentials.email);
    } catch (adminError: any) {
      if (adminError.code === 'auth/user-not-found') {
        return NextResponse.json(
          { message: 'Account not found. Please check your email' },
          { status: 404 }
        );
      }
      console.error('Admin auth check error:', adminError);
    }

    const { user, principal } = await signInPrincipal(credentials);

    // Create session
    const sessionData = {
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      },
      principal,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    // Set cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      },
      principal,
      session: sessionData
    });

    response.cookies.set('principalSession', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);

    if (error.message?.includes('Account is not registered as a principal')) {
      return NextResponse.json(
        { message: 'Account is not registered as a principal. Please use the Teacher portal.' },
        { status: 403 }
      );
    }

    if (error.code === 'auth/wrong-password' || error.message?.includes('auth/wrong-password')) {
      return NextResponse.json(
        { message: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    if (error.code === 'auth/user-not-found' || error.message?.includes('auth/user-not-found')) {
      return NextResponse.json(
        { message: 'Account not found. Please check your email or register.' },
        { status: 404 }
      );
    }

    if (error.code === 'auth/too-many-requests' || error.message?.includes('auth/too-many-requests')) {
      return NextResponse.json(
        { message: 'Too many failed attempts. Please try again later for security reasons.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { message: 'Login failed. Please verify your credentials.' },
      { status: 500 }
    );
  }
}
