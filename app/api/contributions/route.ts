import { NextRequest, NextResponse } from 'next/server';
import { MonthlyContribution } from '@/types';
import { db } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

const COLLECTION = 'contributions_payments';

export async function POST(request: NextRequest) {
  try {
    const contributionData = await request.json();

    // Validate required fields
    if (!contributionData.studentId || !contributionData.amount || !contributionData.month || !contributionData.year) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const now = admin.firestore.FieldValue.serverTimestamp();

    const payload = {
      studentId: String(contributionData.studentId),
      studentName: String(contributionData.studentName ?? ''),
      gradeLevel: String(contributionData.gradeLevel ?? ''),
      amount: Number(contributionData.amount),
      month: String(contributionData.month),
      year: String(contributionData.year),
      paymentDate: contributionData.paymentDate
        ? admin.firestore.Timestamp.fromDate(new Date(contributionData.paymentDate))
        : now,
      paymentMethod: contributionData.paymentMethod ?? 'cash',
      receiptNumber: contributionData.receiptNumber ?? '',
      recordedByUid: String(contributionData.recordedBy ?? contributionData.recordedByUid ?? ''),
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
      paymentDate:
        payload.paymentDate && typeof payload.paymentDate !== 'object'
          ? new Date().toISOString()
          : (contributionData.paymentDate ?? new Date().toISOString()),
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

  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
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

    let queryRef: FirebaseFirestore.Query = db.collection(COLLECTION);
    if (month) queryRef = queryRef.where('month', '==', month);
    if (year) queryRef = queryRef.where('year', '==', year);
    if (studentId) queryRef = queryRef.where('studentId', '==', studentId);

    queryRef = queryRef.orderBy('paymentDate', 'desc');

    const snap = await queryRef.get();
    const contributions: MonthlyContribution[] = snap.docs.map((d) => {
      const data = d.data() as any;
      const paymentDate: string = data?.paymentDate?.toDate
        ? data.paymentDate.toDate().toISOString()
        : typeof data?.paymentDate === 'string'
          ? data.paymentDate
          : '';

      return {
        id: d.id,
        studentId: String(data.studentId ?? ''),
        studentName: String(data.studentName ?? ''),
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
    });

    return NextResponse.json(contributions);

  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
