import { NextRequest, NextResponse } from 'next/server';
import { WeeklyReport } from '@/types';

// In-memory storage for demo - replace with actual database
let reportsDatabase: WeeklyReport[] = [];

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reportId = params.id;
    const { status } = await request.json();

    if (!status || !['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      );
    }

    // Find and update the report
    const reportIndex = reportsDatabase.findIndex(r => r.id === reportId);
    
    if (reportIndex === -1) {
      return NextResponse.json(
        { message: 'Report not found' },
        { status: 404 }
      );
    }

    const report = reportsDatabase[reportIndex];
    report.status = status;
    reportsDatabase[reportIndex] = report;

    return NextResponse.json({
      message: 'Report status updated successfully',
      report
    });

  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
