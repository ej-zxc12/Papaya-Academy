import { NextRequest, NextResponse } from 'next/server';
import { ContributionSummary } from '@/types';
import { db } from '@/lib/firebase-admin';

const PAYMENTS_COLLECTION = 'contributions_payments';
const STUDENTS_COLLECTION = 'students';
const TARGET_AMOUNT_PER_STUDENT = 2000;

function getTeacherIdFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const sessionCookie = request.cookies.get('teacherSession')?.value;
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie);
      const t = sessionData?.teacher ?? sessionData;
      return t?.uid || t?.id || null;
    } catch {
      return null;
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const gradeLevel = searchParams.get('gradeLevel');
    const scope = searchParams.get('scope') || 'teacher';

    const requestorId = getTeacherIdFromRequest(request);
    if (!requestorId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    let studentsQuery: FirebaseFirestore.Query = db.collection(STUDENTS_COLLECTION);
    if (scope !== 'school') {
      studentsQuery = studentsQuery.where('teacherId', '==', requestorId);
    }
    if (gradeLevel) studentsQuery = studentsQuery.where('gradeLevel', '==', gradeLevel);

    const studentsSnap = await studentsQuery.get();
    const students = studentsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    const studentIds = new Set(students.map((s: any) => String(s.id)));

    const paymentsSnap = await db
      .collection(PAYMENTS_COLLECTION)
      .where('year', '==', year)
      .get();

    let totalCollected = 0;
    const monthlyCollected = new Map<string, number>();
    const gradeCollected = new Map<string, number>();
    const gradeStudents = new Map<string, number>();

    for (const s of students as any[]) {
      const g = String(s.gradeLevel ?? '');
      gradeStudents.set(g, (gradeStudents.get(g) ?? 0) + 1);
    }

    for (const doc of paymentsSnap.docs) {
      const data = doc.data() as any;
      const sid = String(data.studentId ?? '');
      if (!studentIds.has(sid)) continue;
      const amt = Number(data.amount ?? 0);
      totalCollected += amt;

      const m = String(data.month ?? '');
      if (m) monthlyCollected.set(m, (monthlyCollected.get(m) ?? 0) + amt);

      const g = String(data.gradeLevel ?? '');
      if (g) gradeCollected.set(g, (gradeCollected.get(g) ?? 0) + amt);
    }

    const totalStudents = students.length;
    const totalExpected = totalStudents * TARGET_AMOUNT_PER_STUDENT;
    const totalRemaining = Math.max(0, totalExpected - totalCollected);
    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    // Monthly breakdown
    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const monthNum = String(i + 1).padStart(2, '0');
      const month = `${year}-${monthNum}`;
      const monthName = new Date(parseInt(year), i, 1).toLocaleDateString('en-US', { month: 'long' });

      const monthExpected = totalStudents * (TARGET_AMOUNT_PER_STUDENT / 12);
      const monthCollected = monthlyCollected.get(month) ?? 0;
      const monthRate = monthExpected > 0 ? (monthCollected / monthExpected) * 100 : 0;

      return {
        month: monthName,
        expected: monthExpected,
        collected: monthCollected,
        rate: monthRate
      };
    });

    const summary: ContributionSummary = {
      year,
      totalStudents,
      totalExpected,
      totalCollected,
      totalRemaining,
      collectionRate,
      monthlyBreakdown,
      gradeBreakdown: Array.from(gradeStudents.entries())
        .filter(([g]) => Boolean(g))
        .map(([g, count]) => {
          const expected = count * TARGET_AMOUNT_PER_STUDENT;
          const collected = gradeCollected.get(g) ?? 0;
          const rate = expected > 0 ? (collected / expected) * 100 : 0;
          return {
            gradeLevel: g,
            totalStudents: count,
            totalExpected: expected,
            totalCollected: collected,
            collectionRate: rate,
          };
        })
    };

    return NextResponse.json(summary);

  } catch (error: any) {
    console.error('[summary] Error generating summary:', error?.message || error);
    return NextResponse.json(
      { message: 'Internal server error', error: error?.message },
      { status: 500 }
    );
  }
}
