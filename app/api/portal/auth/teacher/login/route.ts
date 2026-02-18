import { NextRequest, NextResponse } from 'next/server';
import { signInTeacher, TeacherCredentials } from '@/lib/auth-firebase';

export async function POST(request: NextRequest) {
  try {
    const credentials: TeacherCredentials = await request.json();

    // Validate input
    if (!credentials.email || !credentials.password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign in with Firebase
    const { user, teacher } = await signInTeacher(credentials);

    // Create session
    const sessionData = {
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      },
      teacher,
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
      teacher,
      session: sessionData
    });

    response.cookies.set('teacherSession', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific Firebase auth errors
    if (error instanceof Error) {
      if (error.message.includes('auth/user-not-found') || error.message.includes('auth/wrong-password')) {
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('auth/too-many-requests')) {
        return NextResponse.json(
          { message: 'Too many failed attempts. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
