process.env.TZ = 'Asia/Manila';

import { NextRequest, NextResponse } from 'next/server';
import { ContributionQuota } from '@/types';
import { db } from '@/lib/firebase-admin';

const PAYMENTS_COLLECTION = 'contributions_payments';
const STUDENTS_COLLECTION = 'students';
const TARGET_AMOUNT_PER_STUDENT = 2000;

function getTeacherIdFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  console.log('[quotas] Auth header:', authHeader);
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const id = authHeader.substring(7);
    console.log('[quotas] Extracted teacherId from Bearer:', id);
    return decodeURIComponent(id);
  }

  const sessionCookie = request.cookies.get('teacherSession')?.value;
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie);
      const t = sessionData?.teacher ?? sessionData;
      const uid = t?.uid || t?.id || null;
      console.log('[quotas] Extracted teacherId from cookie:', uid);
      return uid;
    } catch {
      return null;
    }
  }

  const principalCookie = request.cookies.get('principalSession')?.value;
  if (principalCookie) {
    try {
      const sessionData = JSON.parse(principalCookie);
      const p = sessionData?.principal ?? sessionData;
      const pid = p?.id ?? p?.uid ?? null;
      console.log('[quotas] Extracted principalId from cookie:', pid);
      return pid;
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

    console.log(`[quotas] Found ${students.length} students for teacher ${requestorId}, scope=${scope}, gradeLevel=${gradeLevel || 'all'}`);
    if (students.length === 0) {
      console.log('[quotas] No students found. Checking all students in collection...');
      const allStudentsSnap = await db.collection(STUDENTS_COLLECTION).get();
      console.log(`[quotas] Total students in collection: ${allStudentsSnap.docs.length}`);
      allStudentsSnap.docs.slice(0, 5).forEach((d) => {
        const data = d.data();
        console.log(`[quotas] Sample student: id=${d.id}, name=${data.name}, teacherId=${data.teacherId}`);
      });
    }

    const paymentsSnap = await db
      .collection(PAYMENTS_COLLECTION)
      .where('year', '==', year)
      .get();

    // Fetch previous year's payments for rollover balance calculation
    const previousYear = (parseInt(year) - 1).toString();
    const previousYearPaymentsSnap = await db
      .collection(PAYMENTS_COLLECTION)
      .where('year', '==', previousYear)
      .get();

    const paidByStudentId = new Map<string, number>();
    const monthsPaidByStudentId = new Map<string, Set<string>>();
    const previousYearPaidByStudentId = new Map<string, number>();
    
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

    // Calculate previous year's payments for rollover
    for (const doc of previousYearPaymentsSnap.docs) {
      const data = doc.data() as any;
      const sid = String(data.studentId ?? '');
      if (!sid) continue;
      const amt = Number(data.amount ?? 0);
      previousYearPaidByStudentId.set(sid, (previousYearPaidByStudentId.get(sid) ?? 0) + amt);
    }

    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const monthNum = String(i + 1).padStart(2, '0');
      return `${year}-${monthNum}`;
    });

    const quotas: ContributionQuota[] = students.map((s: any) => {
      const studentId = String(s.id);
      const studentName = String(s.name ?? '');
      const gradeLevelValue = String(s.gradeLevel ?? '');
      const totalPaid = Math.round((paidByStudentId.get(studentId) ?? 0) * 100) / 100;
      
      // Calculate previous year's unpaid balance for rollover
      const previousYearPaid = Math.round((previousYearPaidByStudentId.get(studentId) ?? 0) * 100) / 100;
  const previousYearUnpaid = (previousYearPaid > 0) 
  ? Math.max(0, Math.round((TARGET_AMOUNT_PER_STUDENT - previousYearPaid) * 100) / 100)
  : 0;
      
      // Calculate how much of current year's payments went to current quota vs previous balance
      // Payments first cover the current year's quota (2000 PHP), then the previous year's unpaid amount
      const paymentsAppliedToCurrent = Math.min(TARGET_AMOUNT_PER_STUDENT, totalPaid);
      const paymentsAppliedToPrevious = Math.max(0, totalPaid - paymentsAppliedToCurrent);
      
      // Remaining balance = (current year quota - payments applied to current) + (previous unpaid - payments applied to previous)
      const remainingCurrentBalance = Math.max(0, Math.round((TARGET_AMOUNT_PER_STUDENT - paymentsAppliedToCurrent) * 100) / 100);
      const remainingPreviousBalance = Math.max(0, Math.round((previousYearUnpaid - paymentsAppliedToPrevious) * 100) / 100);
      let remainingBalance = remainingCurrentBalance + remainingPreviousBalance;
      
      // Fix precision issues (e.g., 0.01 remaining when it should be 0)
      if (remainingBalance > -0.1 && remainingBalance < 0.1) {
        remainingBalance = 0;
      }
      
      // Payment status based on combined annual total (new quota + rollover)
      const paymentStatus: ContributionQuota['paymentStatus'] =
        remainingBalance === 0
          ? 'fully_paid'
          : totalPaid > 0
            ? 'partially_paid'
            : 'not_paid';

      // Ensure remainingBalance is 0 when fully paid
      if (paymentStatus === 'fully_paid') {
        remainingBalance = 0;
      }

      const monthsPaid = Array.from(monthsPaidByStudentId.get(studentId) ?? new Set<string>()).sort();
      const monthsUnpaid = allMonths.filter((m) => !monthsPaidByStudentId.get(studentId)?.has(m));

      return {
        studentId,
        studentName,
        gradeLevel: gradeLevelValue,
        monthlyAmount: TARGET_AMOUNT_PER_STUDENT,
        yearlyQuota: TARGET_AMOUNT_PER_STUDENT + previousYearUnpaid,
        totalPaid,
        remainingBalance,
        paymentStatus,
        monthsPaid,
        monthsUnpaid,
        lastUpdated: new Date().toISOString(),
        previousBalance: previousYearUnpaid,
      };
    });

    return NextResponse.json(quotas);

  } catch (error: any) {
    console.error('[quotas] Error calculating quotas:', error?.message || error);
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error?.message, 
        details: 'Failed to calculate quotas. Please check the server logs for more information.' 
      },
      { status: 500 }
    );
  }
}
