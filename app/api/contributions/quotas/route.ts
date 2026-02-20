import { NextRequest, NextResponse } from 'next/server';
import { ContributionQuota } from '@/types';

// In-memory storage for contributions - replace with actual database
let contributionsDatabase: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    // Return empty quotas array - will be populated from actual database
    const quotas: ContributionQuota[] = [];

    return NextResponse.json(quotas);

  } catch (error) {
    console.error('Error calculating quotas:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
