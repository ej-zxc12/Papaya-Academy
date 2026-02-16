import { NextRequest, NextResponse } from 'next/server';
import { PrincipalCredentials, Principal } from '@/types';

// Mock principal database - replace with actual database
const mockPrincipals: Principal[] = [
  {
    id: 'principal1',
    name: 'Dr. Maria Rodriguez',
    email: 'principal@papaya.edu',
    employeeId: 'PRINC001',
    position: 'School Principal',
    isActive: true
  }
];

export async function POST(request: NextRequest) {
  try {
    const credentials: PrincipalCredentials = await request.json();

    // Find principal by email
    const principal = mockPrincipals.find(p => p.email === credentials.email);

    if (!principal) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // In a real application, you would hash and compare passwords
    // For demo purposes, we'll accept any password for existing principals
    if (!credentials.password) {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 }
      );
    }

    // Create session
    const sessionData = {
      principal,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    // Set cookie
    const response = NextResponse.json({
      message: 'Login successful',
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

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
