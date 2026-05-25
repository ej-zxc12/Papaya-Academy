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

    // Fetch ALL previous years' payments for continuous rollover balance calculation
    const allPaymentsSnap = await db
      .collection(PAYMENTS_COLLECTION)
      .where('year', '<=', year)
      .get();

    const paidByStudentId = new Map<string, number>();
    const monthsPaidByStudentId = new Map<string, Set<string>>();
    const allYearsPaidByStudentId = new Map<string, number>();
    
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

    // Calculate ALL years' payments for continuous rollover
    for (const doc of allPaymentsSnap.docs) {
      const data = doc.data() as any;
      const sid = String(data.studentId ?? '');
      if (!sid) continue;
      const amt = Number(data.amount ?? 0);
      allYearsPaidByStudentId.set(sid, (allYearsPaidByStudentId.get(sid) ?? 0) + amt);
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
      
      // Calculate ALL years' total payments for continuous rollover
      const allYearsTotalPaid = Math.round((allYearsPaidByStudentId.get(studentId) ?? 0) * 100) / 100;
      
      // Calculate expected total based on student's actual enrollment date (createdAt)
      // This ensures transfer students are only charged for years they were actually enrolled
      const createdAt = s.createdAt ? new Date(s.createdAt) : new Date(); // Default to now if no createdAt
      const currentYear = parseInt(year);
      const enrollmentYear = createdAt.getFullYear();
      
      // Check if rollover should continue
      // Stop if: 1) Student is in Grade 6 and current year is after their Grade 6 year
      //         2) rolloverActive is explicitly set to false (e.g., student moved away)
      const isGrade6 = gradeLevelValue === 'Grade 6';
      const rolloverActive = s.rolloverActive !== false; // Default to true if not set
      
      // Calculate years enrolled (from enrollment year to current year, inclusive)
      let yearsEnrolled = currentYear - enrollmentYear + 1;
      if (yearsEnrolled < 1) yearsEnrolled = 1; // At least 1 year
      
      // If student is in Grade 6, cap the years enrolled to prevent future charges after graduation
      // If rollover is manually stopped, use the year they stopped as the cap
      if (!rolloverActive || isGrade6) {
        // For Grade 6 students, the current year is their last year
        // For students with stopped rollover, we need to track when it stopped
        // For now, we'll just use current year as the cap
        const maxYear = isGrade6 ? currentYear : currentYear;
        yearsEnrolled = Math.min(yearsEnrolled, maxYear - enrollmentYear + 1);
      }
      
      const totalExpected = yearsEnrolled * TARGET_AMOUNT_PER_STUDENT;
      
      // Current year remaining = 2000 - current year payments
      let currentYearRemaining = Math.max(0, Math.round((TARGET_AMOUNT_PER_STUDENT - totalPaid) * 100) / 100);
      
      // Total remaining balance = total expected across all years - total paid across all years
      let totalRemaining = Math.max(0, Math.round((totalExpected - allYearsTotalPaid) * 100) / 100);
      
      // Fix precision issues (e.g., 0.01 remaining when it should be 0)
      if (totalRemaining > -0.1 && totalRemaining < 0.1) {
        totalRemaining = 0;
      }
      if (currentYearRemaining > -0.1 && currentYearRemaining < 0.1) {
        currentYearRemaining = 0;
      }
      
      // Payment status based on total remaining balance
      const paymentStatus: ContributionQuota['paymentStatus'] =
        totalRemaining === 0
          ? 'fully_paid'
          : allYearsTotalPaid > 0
            ? 'partially_paid'
            : 'not_paid';

      // Ensure totalRemaining is 0 when fully paid
      if (paymentStatus === 'fully_paid') {
        totalRemaining = 0;
      }

      const monthsPaid = Array.from(monthsPaidByStudentId.get(studentId) ?? new Set<string>()).sort();
      const monthsUnpaid = allMonths.filter((m) => !monthsPaidByStudentId.get(studentId)?.has(m));

      return {
        studentId,
        studentName,
        gradeLevel: gradeLevelValue,
        monthlyAmount: TARGET_AMOUNT_PER_STUDENT,
        yearlyQuota: totalExpected, // Total expected across all enrollment years
        totalPaid: allYearsTotalPaid, // Total paid across all years
        remainingBalance: totalRemaining, // Total remaining across all years
        paymentStatus,
        monthsPaid,
        monthsUnpaid,
        lastUpdated: new Date().toISOString(),
        previousBalance: Math.max(0, totalExpected - allYearsTotalPaid - TARGET_AMOUNT_PER_STUDENT),
        currentYearRemaining, // Current year's remaining (2000 - current year payments)
        rolloverActive, // Include rollover status in response
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
