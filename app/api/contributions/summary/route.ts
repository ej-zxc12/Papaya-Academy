import { NextRequest, NextResponse } from 'next/server';
import { ContributionSummary } from '@/types';

// Mock data - replace with actual database
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
    const monthlyAmount = 500;

    const totalStudents = mockStudents.length;
    const totalExpected = totalStudents * monthlyAmount * 12;

    // Get all contributions for the specified year
    const yearContributions = contributionsDatabase.filter(c => c.year === year);
    const totalCollected = yearContributions.reduce((sum, c) => sum + c.amount, 0);
    const totalRemaining = totalExpected - totalCollected;
    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    // Monthly breakdown
    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const monthNum = String(i + 1).padStart(2, '0');
      const month = `${year}-${monthNum}`;
      const monthName = new Date(year, i, 1).toLocaleDateString('en-US', { month: 'long' });
      
      const monthContributions = yearContributions.filter(c => c.month === month);
      const monthExpected = totalStudents * monthlyAmount;
      const monthCollected = monthContributions.reduce((sum, c) => sum + c.amount, 0);
      const monthRate = monthExpected > 0 ? (monthCollected / monthExpected) * 100 : 0;

      return {
        month: monthName,
        expected: monthExpected,
        collected: monthCollected,
        rate: monthRate
      };
    });

    // Grade breakdown
    const gradeBreakdown = mockStudents.reduce((acc, student) => {
      const existingGrade = acc.find(g => g.gradeLevel === student.grade);
      if (existingGrade) {
        existingGrade.totalStudents += 1;
        existingGrade.totalExpected += monthlyAmount * 12;
      } else {
        acc.push({
          gradeLevel: student.grade,
          totalStudents: 1,
          totalExpected: monthlyAmount * 12,
          totalCollected: 0,
          collectionRate: 0
        });
      }
      return acc;
    }, [] as any[]);

    // Calculate collected amounts for each grade
    gradeBreakdown.forEach(grade => {
      const gradeContributions = yearContributions.filter(c => 
        mockStudents.find(s => s.id === c.studentId && s.grade === grade.gradeLevel)
      );
      grade.totalCollected = gradeContributions.reduce((sum, c) => sum + c.amount, 0);
      grade.collectionRate = grade.totalExpected > 0 ? (grade.totalCollected / grade.totalExpected) * 100 : 0;
    });

    const summary: ContributionSummary = {
      year,
      totalStudents,
      totalExpected,
      totalCollected,
      totalRemaining,
      collectionRate,
      monthlyBreakdown,
      gradeBreakdown
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
