import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

// Force dynamic rendering since this route uses request headers
export const dynamic = 'force-dynamic'

function getPrincipalIdFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return decodeURIComponent(authHeader.substring(7));
  }

  const sessionCookie = request.cookies.get('principalSession')?.value;
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie);
      const p = sessionData?.principal ?? sessionData;
      return p?.id ?? p?.uid ?? null;
    } catch {
      return null;
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const principalId = getPrincipalIdFromRequest(request);
    if (!principalId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'inactive', or 'all'

    // Fetch all users from teachers_user collection
    const teachersQuery = db.collection('teachers_user');
    const snap = await teachersQuery.get();

    let teachers = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        name: data.name ?? data.username ?? 'Unknown',
        email: data.email ?? '',
        employeeId: data.employeeId ?? '',
        department: data.department ?? '',
        subjects: Array.isArray(data.subjects) ? data.subjects : [],
        gradeLevel: data.gradeLevel ?? '',
        isActive: data.isActive ?? true,
        role: data.role ?? 'teacher',
        imageUrl: data.imageUrl ?? null,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : null,
        lastLoginAt: data.lastLoginAt?.toDate?.() ? data.lastLoginAt.toDate().toISOString() : null,
      };
    });

    // Filter by role - only include teachers (not principals)
    teachers = teachers.filter((t) => t.role === 'teacher');

    // Filter by status if specified
    if (status === 'active') {
      teachers = teachers.filter((t) => t.isActive);
    } else if (status === 'inactive') {
      teachers = teachers.filter((t) => !t.isActive);
    }

    // Sort by name
    teachers.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(teachers);
  } catch (error: any) {
    console.error('[principal/teachers] Error fetching teachers:', error);
    console.error('[principal/teachers] Error stack:', error?.stack);
    return NextResponse.json(
      { message: 'Internal server error', error: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
