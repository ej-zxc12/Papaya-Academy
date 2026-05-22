import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

// GET - Fetch all teachers for tracking section
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const snapshot = await db.collection('teachers_user')
      .where('role', '==', 'teacher')
      .get();

    const teachers: any[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      teachers.push({
        id: doc.id,
        username: data.username || '',
        email: data.email || '',
        role: data.role || 'teacher',
        isActive: data.isActive !== false,
        imageUrl: data.imageUrl || null
      });
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
