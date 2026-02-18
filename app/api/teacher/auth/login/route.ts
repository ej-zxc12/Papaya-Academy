import { NextRequest, NextResponse } from 'next/server';
import { TeacherCredentials, Teacher } from '@/types';

// Mock teacher database - replace with actual database
const mockTeachers: Teacher[] = [
  {
    id: 'teacher1',
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@papaya.edu',
    employeeId: 'EMP001',
    department: 'Mathematics',
    subjects: ['Algebra', 'Geometry'],
    gradeLevel: 'Grade 7',
    isActive: true
  },
  {
    id: 'teacher2',
    name: 'Maria Santos',
    email: 'maria.santos@papaya.edu',
    employeeId: 'EMP002',
    department: 'Science',
    subjects: ['Biology', 'Chemistry'],
    gradeLevel: 'Grade 8',
    isActive: true
  },
  {
    id: 'test-teacher',
    name: 'Test Teacher',
    email: 'test@papaya.edu',
    employeeId: 'TEST001',
    department: 'Computer Science',
    subjects: ['Web Development', 'Database Management'],
    gradeLevel: 'Grade 10',
    isActive: true
  }
];

export async function POST(request: NextRequest) {
  try {
    const credentials: TeacherCredentials = await request.json();

    // Find teacher by email
    const teacher = mockTeachers.find(t => t.email === credentials.email);

    if (!teacher) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // In a real application, you would hash and compare passwords
    // For demo purposes, we'll accept any password for existing teachers
    if (!credentials.password) {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 }
      );
    }

    // Create session
    const sessionData = {
      teacher,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    // Set cookie
    const response = NextResponse.json({
      message: 'Login successful',
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
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
