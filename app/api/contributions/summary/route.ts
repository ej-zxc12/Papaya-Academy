process.env.TZ = 'Asia/Manila';

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

  const principalCookie = request.cookies.get('principalSession')?.value;
  if (principalCookie) {
    try {
      const sessionData = JSON.parse(principalCookie);
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

    // Fetch ALL previous years' payments for continuous rollover balance calculation
    const allPaymentsSnap = await db
      .collection(PAYMENTS_COLLECTION)
      .where('year', '<=', year)
      .get();

    let totalCollected = 0;
    const monthlyCollected = new Map<string, number>();
    const gradeCollected = new Map<string, number>();
    const gradeStudents = new Map<string, number>();
    const paidByStudentId = new Map<string, number>();
    const allYearsPaidByStudentId = new Map<string, number>();

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
      paidByStudentId.set(sid, (paidByStudentId.get(sid) ?? 0) + amt);

      const m = String(data.month ?? '');
      if (m) monthlyCollected.set(m, (monthlyCollected.get(m) ?? 0) + amt);

      const g = String(data.gradeLevel ?? '');
      if (g) gradeCollected.set(g, (gradeCollected.get(g) ?? 0) + amt);
    }

    // Calculate ALL years' payments for continuous rollover
    for (const doc of allPaymentsSnap.docs) {
      const data = doc.data() as any;
      const sid = String(data.studentId ?? '');
      if (!studentIds.has(sid)) continue;
      const amt = Number(data.amount ?? 0);
      allYearsPaidByStudentId.set(sid, (allYearsPaidByStudentId.get(sid) ?? 0) + amt);
    }

    // Calculate total expected based on students' actual enrollment dates (continuous rollover)
    let totalExpected = 0;
    const currentYear = parseInt(year);
    for (const student of students as any[]) {
      // Calculate years enrolled based on createdAt timestamp
      // If createdAt is missing or invalid, assume current year enrollment
      let enrollmentYear = currentYear;
      if (student.createdAt) {
        try {
          const createdAt = new Date(student.createdAt);
          const yearFromCreatedAt = createdAt.getFullYear();
          if (yearFromCreatedAt > 2000 && yearFromCreatedAt <= currentYear) {
            enrollmentYear = yearFromCreatedAt;
          }
        } catch (e) {
          // Invalid date format, use current year
          enrollmentYear = currentYear;
        }
      }
      let yearsEnrolled = currentYear - enrollmentYear + 1;
      if (yearsEnrolled < 1) yearsEnrolled = 1; // At least 1 year
      totalExpected += yearsEnrolled * TARGET_AMOUNT_PER_STUDENT;
    }

    // Calculate total collected across all years
    let totalAllYearsCollected = 0;
    for (const student of students as any[]) {
      const sid = String(student.id);
      totalAllYearsCollected += allYearsPaidByStudentId.get(sid) ?? 0;
    }

    const totalStudents = students.length;
    const totalRemaining = Math.max(0, totalExpected - totalAllYearsCollected);
    const collectionRate = totalExpected > 0 ? (totalAllYearsCollected / totalExpected) * 100 : 0;

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
      totalCollected: totalAllYearsCollected,
      totalRemaining,
      collectionRate,
      monthlyBreakdown,
      gradeBreakdown: Array.from(gradeStudents.entries())
        .filter(([g]) => Boolean(g))
        .map(([g, count]) => {
          // Calculate expected based on actual enrollment dates (continuous rollover)
          const gradeStudentsList = students.filter((s: any) => String(s.gradeLevel) === g);
          let expected = 0;
          let gradeAllYearsCollected = 0;
          
          for (const student of gradeStudentsList) {
            const sid = String(student.id);
            // Calculate years enrolled based on createdAt timestamp
            // If createdAt is missing or invalid, assume current year enrollment
            let enrollmentYear = currentYear;
            if (student.createdAt) {
              try {
                const createdAt = new Date(student.createdAt);
                const yearFromCreatedAt = createdAt.getFullYear();
                if (yearFromCreatedAt > 2000 && yearFromCreatedAt <= currentYear) {
                  enrollmentYear = yearFromCreatedAt;
                }
              } catch (e) {
                // Invalid date format, use current year
                enrollmentYear = currentYear;
              }
            }
            let yearsEnrolled = currentYear - enrollmentYear + 1;
            if (yearsEnrolled < 1) yearsEnrolled = 1; // At least 1 year
            expected += yearsEnrolled * TARGET_AMOUNT_PER_STUDENT;
            gradeAllYearsCollected += allYearsPaidByStudentId.get(sid) ?? 0;
          }
          
          const collected = gradeCollected.get(g) ?? 0;
          const rate = expected > 0 ? (gradeAllYearsCollected / expected) * 100 : 0;
          return {
            gradeLevel: g,
            totalStudents: count,
            totalExpected: expected,
            totalCollected: gradeAllYearsCollected,
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
