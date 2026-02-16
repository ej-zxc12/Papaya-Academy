import { NextRequest, NextResponse } from 'next/server';
import { ContributionQuota } from '@/types';

// Mock student data - replace with actual database
const mockStudents = [
  { id: '2024001', name: 'Ana Reyes', grade: 'Grade 7' },
  { id: '2024002', name: 'Carlos Mendoza', grade: 'Grade 7' },
  { id: '2024003', name: 'Sofia Rodriguez', grade: 'Grade 7' },
  { id: '2024004', name: 'Miguel Santos', grade: 'Grade 8' },
  { id: '2024005', name: 'Isabella Cruz', grade: 'Grade 8' }
];

// In-memory storage for contributions - replace with actual database
let contributionsDatabase: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const monthlyAmount = 500; // Default monthly contribution

    // Calculate quotas for each student
    const quotas: ContributionQuota[] = mockStudents.map(student => {
      // Get all contributions for this student in the specified year
      const studentContributions = contributionsDatabase.filter(
        c => c.studentId === student.id && c.year === year
      );

      const totalPaid = studentContributions.reduce((sum, c) => sum + c.amount, 0);
      const yearlyQuota = monthlyAmount * 12;
      const remainingBalance = yearlyQuota - totalPaid;

      // Determine payment status
      let paymentStatus: 'fully_paid' | 'partially_paid' | 'not_paid';
      if (totalPaid >= yearlyQuota) {
        paymentStatus = 'fully_paid';
      } else if (totalPaid > 0) {
        paymentStatus = 'partially_paid';
      } else {
        paymentStatus = 'not_paid';
      }

      // Get paid and unpaid months
      const monthsPaid = studentContributions.map(c => c.month);
      const allMonths = Array.from({ length: 12 }, (_, i) => {
        const monthNum = String(i + 1).padStart(2, '0');
        return `${year}-${monthNum}`;
      });
      const monthsUnpaid = allMonths.filter(month => !monthsPaid.includes(month));

      return {
        studentId: student.id,
        studentName: student.name,
        gradeLevel: student.grade,
        monthlyAmount,
        yearlyQuota,
        totalPaid,
        remainingBalance,
        paymentStatus,
        monthsPaid,
        monthsUnpaid,
        lastUpdated: new Date().toISOString()
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
