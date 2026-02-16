import { NextRequest, NextResponse } from 'next/server';
import { MonthlyContribution } from '@/types';

// In-memory storage for demo - replace with actual database
let contributionsDatabase: MonthlyContribution[] = [];

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

    // Check if payment already exists for this student and month
    const existingPayment = contributionsDatabase.find(
      c => c.studentId === contributionData.studentId && 
           c.month === contributionData.month && 
           c.year === contributionData.year
    );

    if (existingPayment) {
      return NextResponse.json(
        { message: 'Payment already recorded for this student and month' },
        { status: 400 }
      );
    }

    // Create new contribution
    const newContribution: MonthlyContribution = {
      id: `contribution-${Date.now()}`,
      studentId: contributionData.studentId,
      studentName: contributionData.studentName,
      gradeLevel: contributionData.gradeLevel,
      amount: contributionData.amount,
      month: contributionData.month,
      year: contributionData.year,
      paymentDate: contributionData.paymentDate,
      paymentMethod: contributionData.paymentMethod,
      receiptNumber: contributionData.receiptNumber,
      recordedBy: contributionData.recordedBy,
      recordedByName: contributionData.recordedByName,
      status: 'paid',
      notes: contributionData.notes
    };

    contributionsDatabase.push(newContribution);

    return NextResponse.json({
      message: 'Payment recorded successfully',
      contribution: newContribution
    });

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

    let filteredContributions = contributionsDatabase;

    if (month) {
      filteredContributions = filteredContributions.filter(c => c.month === month);
    }

    if (year) {
      filteredContributions = filteredContributions.filter(c => c.year === year);
    }

    if (studentId) {
      filteredContributions = filteredContributions.filter(c => c.studentId === studentId);
    }

    // Sort by payment date (newest first)
    filteredContributions.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    return NextResponse.json(filteredContributions);

  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
