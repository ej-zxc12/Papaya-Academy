import { NextRequest, NextResponse } from 'next/server';
import { WeeklyReport } from '@/types';

// In-memory storage for demo - replace with actual database
let reportsDatabase: WeeklyReport[] = [];

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reportId = params.id;
    const reportData = await request.json();

    // Find and update the report
    const reportIndex = reportsDatabase.findIndex(r => r.id === reportId);
    
    if (reportIndex === -1) {
      return NextResponse.json(
        { message: 'Report not found' },
        { status: 404 }
      );
    }

    const updatedReport: WeeklyReport = {
      ...reportsDatabase[reportIndex],
      ...reportData,
      lastModified: new Date().toISOString()
    };

    reportsDatabase[reportIndex] = updatedReport;

    return NextResponse.json({
      message: 'Report updated successfully',
      report: updatedReport
    });

  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reportId = params.id;
    
    const report = reportsDatabase.find(r => r.id === reportId);
    
    if (!report) {
      return NextResponse.json(
        { message: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);

  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
