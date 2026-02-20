import { NextRequest, NextResponse } from 'next/server';
import { ContributionSummary } from '@/types';

// In-memory storage for contributions - replace with actual database
let contributionsDatabase: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const monthlyAmount = 500;

    const totalStudents = 0; // Will be populated from actual database
    const totalExpected = 0;

    // Get all contributions for the specified year
    const yearContributions = contributionsDatabase.filter(c => c.year === year);
    const totalCollected = yearContributions.reduce((sum, c) => sum + c.amount, 0);
    const totalRemaining = totalExpected - totalCollected;
    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    // Monthly breakdown
    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const monthNum = String(i + 1).padStart(2, '0');
      const month = `${year}-${monthNum}`;
      const monthName = new Date(parseInt(year), i, 1).toLocaleDateString('en-US', { month: 'long' });
      
      const monthContributions = yearContributions.filter(c => c.month === month);
      const monthExpected = 0;
      const monthCollected = monthContributions.reduce((sum, c) => sum + c.amount, 0);
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
      gradeBreakdown: []
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
