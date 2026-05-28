process.env.TZ = 'Asia/Manila';

import { NextRequest, NextResponse } from 'next/server';
import { MonthlyContribution } from '@/types';
import { db } from '@/lib/firebase-admin';

const COLLECTION = 'contributions_payments';

// Helper function to format student name to correct format: "LASTNAME, FIRSTNAME MIDDLENAME"
function formatStudentName(firstName?: string, lastName?: string, middleName?: string, existingName?: string): string {
  // If we have firstName and lastName, format correctly
  if (lastName || firstName) {
    return `${lastName || ''}, ${firstName || ''} ${middleName || ''}`.trim().replace(/\s+/g, ' ');
  }
  
  // If we have existing name, try to parse and reformat it
  if (existingName) {
    const trimmed = existingName.trim();
    
    // If already in correct format (contains comma), return as is
    if (trimmed.includes(',')) {
      return trimmed;
    }
    
    // Try to parse "FIRSTNAME MIDDLENAME LASTNAME" format
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      const lastName = parts[parts.length - 1];
      const firstName = parts[0];
      const middleName = parts.slice(1, parts.length - 1).join(' ');
      return `${lastName}, ${firstName} ${middleName}`.trim().replace(/\s+/g, ' ');
    }
    
    return trimmed;
  }
  
  return '';
}

 function getTeacherIdFromRequest(request: NextRequest) {
   const authHeader = request.headers.get('authorization');
   if (authHeader && authHeader.startsWith('Bearer ')) {
     return decodeURIComponent(authHeader.substring(7));
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

export async function POST(request: NextRequest) {
  try {
    const requestorId = getTeacherIdFromRequest(request);
    if (!requestorId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const contributionData = await request.json();

    // Validate required fields
    if (!contributionData.studentId || !contributionData.amount || !contributionData.month || !contributionData.year) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const now = new Date();

    // Format student name to correct format
    const formattedStudentName = formatStudentName(
      contributionData.firstName,
      contributionData.lastName,
      contributionData.middleName,
      contributionData.studentName
    );

    const payload = {
      studentId: String(contributionData.studentId),
      studentName: formattedStudentName,
      gradeLevel: String(contributionData.gradeLevel ?? ''),
      amount: Number(contributionData.amount),
      month: String(contributionData.month),
      year: String(contributionData.year),
      paymentDate: now,
      paymentMethod: contributionData.paymentMethod ?? 'cash',
      receiptNumber: contributionData.receiptNumber ?? '',
      recordedByUid: requestorId,
      recordedByName: String(contributionData.recordedByName ?? ''),
      status: 'paid',
      notes: contributionData.notes ?? '',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(COLLECTION).add(payload);

    const newContribution: MonthlyContribution = {
      id: docRef.id,
      studentId: payload.studentId,
      studentName: payload.studentName,
      gradeLevel: payload.gradeLevel,
      amount: payload.amount,
      month: payload.month,
      year: payload.year,
      paymentDate: contributionData.paymentDate ?? new Date().toISOString(),
      paymentMethod: payload.paymentMethod,
      receiptNumber: payload.receiptNumber,
      recordedBy: payload.recordedByUid,
      recordedByName: payload.recordedByName,
      status: 'paid',
      notes: payload.notes,
    };

    return NextResponse.json(
      {
        message: 'Payment recorded successfully',
        contribution: newContribution,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('[contributions] Error recording payment:', error?.message || error);
    return NextResponse.json(
      { message: 'Internal server error', error: error?.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const studentId = searchParams.get('studentId');
    const recordedByUid = searchParams.get('recordedByUid');

    let q: FirebaseFirestore.Query = db.collection(COLLECTION);
    if (month) q = q.where('month', '==', month);
    if (year) q = q.where('year', '==', year);
    if (studentId) q = q.where('studentId', '==', studentId);
    if (recordedByUid) q = q.where('recordedByUid', '==', recordedByUid);

    const snap = await q.get();
    const contributions: MonthlyContribution[] = snap.docs
      .map((d) => {
        const data = d.data() as any;
        const paymentDate: string = data?.paymentDate?.toDate
          ? data.paymentDate.toDate().toISOString()
          : typeof data?.paymentDate === 'string'
            ? data.paymentDate
            : '';

        // Format student name to correct format
        const formattedStudentName = formatStudentName(
          data.firstName,
          data.lastName,
          data.middleName,
          data.studentName
        );

        return {
          id: d.id,
          studentId: String(data.studentId ?? ''),
          studentName: formattedStudentName,
          gradeLevel: String(data.gradeLevel ?? ''),
          amount: Number(data.amount ?? 0),
          month: String(data.month ?? ''),
          year: String(data.year ?? ''),
          paymentDate,
          paymentMethod: data.paymentMethod ?? 'cash',
          receiptNumber: data.receiptNumber ?? '',
          recordedBy: String(data.recordedByUid ?? data.recordedBy ?? ''),
          recordedByName: String(data.recordedByName ?? ''),
          status: data.status ?? 'paid',
          notes: data.notes ?? '',
        };
      })
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    return NextResponse.json(contributions);

  } catch (error: any) {
    console.error('[contributions] Error fetching contributions:', error?.message || error);
    return NextResponse.json(
      { message: 'Internal server error', error: error?.message },
      { status: 500 }
    );
  }
}
