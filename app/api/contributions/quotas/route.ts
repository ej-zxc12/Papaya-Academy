import { NextRequest, NextResponse } from 'next/server';
import { ContributionQuota } from '@/types';
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

    const paymentsSnap = await db
      .collection(PAYMENTS_COLLECTION)
      .where('year', '==', year)
      .get();

    const paidByStudentId = new Map<string, number>();
    const monthsPaidByStudentId = new Map<string, Set<string>>();
    for (const doc of paymentsSnap.docs) {
      const data = doc.data() as any;
      const sid = String(data.studentId ?? '');
      if (!sid) continue;
      const amt = Number(data.amount ?? 0);
      paidByStudentId.set(sid, (paidByStudentId.get(sid) ?? 0) + amt);
      const m = String(data.month ?? '');
      if (m) {
        const s = monthsPaidByStudentId.get(sid) ?? new Set<string>();
        s.add(m);
        monthsPaidByStudentId.set(sid, s);
      }
    }

    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const monthNum = String(i + 1).padStart(2, '0');
      return `${year}-${monthNum}`;
    });

    const quotas: ContributionQuota[] = students.map((s: any) => {
      const studentId = String(s.id);
      const studentName = String(s.name ?? '');
      const gradeLevelValue = String(s.gradeLevel ?? '');
      const totalPaid = paidByStudentId.get(studentId) ?? 0;
      const remainingBalance = Math.max(0, TARGET_AMOUNT_PER_STUDENT - totalPaid);
      const paymentStatus: ContributionQuota['paymentStatus'] =
        totalPaid >= TARGET_AMOUNT_PER_STUDENT
          ? 'fully_paid'
          : totalPaid > 0
            ? 'partially_paid'
            : 'not_paid';

      const monthsPaid = Array.from(monthsPaidByStudentId.get(studentId) ?? new Set<string>()).sort();
      const monthsUnpaid = allMonths.filter((m) => !monthsPaidByStudentId.get(studentId)?.has(m));

      return {
        studentId,
        studentName,
        gradeLevel: gradeLevelValue,
        monthlyAmount: TARGET_AMOUNT_PER_STUDENT,
        yearlyQuota: TARGET_AMOUNT_PER_STUDENT,
        totalPaid,
        remainingBalance,
        paymentStatus,
        monthsPaid,
        monthsUnpaid,
        lastUpdated: new Date().toISOString(),
      };
    });

    return NextResponse.json(quotas);

  } catch (error) {
    console.error('Error calculating quotas:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
