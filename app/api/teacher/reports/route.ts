import { NextRequest, NextResponse } from 'next/server';
import { WeeklyReport } from '@/types';

// In-memory storage for demo - replace with actual database
let reportsDatabase: WeeklyReport[] = [];

export async function POST(request: NextRequest) {
  try {
    const reportData = await request.json();

    // Validate required fields
    if (!reportData.title || !reportData.content || !reportData.weekStartDate || !reportData.weekEndDate) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new report
    const newReport: WeeklyReport = {
      id: `report-${Date.now()}`,
      teacherId: reportData.teacherId,
      teacherName: reportData.teacherName,
      teacherDepartment: reportData.teacherDepartment,
      weekStartDate: reportData.weekStartDate,
      weekEndDate: reportData.weekEndDate,
      title: reportData.title,
      content: reportData.content,
      attachments: reportData.attachments || [],
      submittedAt: new Date().toISOString(),
      status: 'pending',
      principalComments: []
    };

    reportsDatabase.push(newReport);

    return NextResponse.json({
      message: 'Report created successfully',
      report: newReport
    });

  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    let filteredReports = reportsDatabase;

    if (teacherId) {
      filteredReports = filteredReports.filter(r => r.teacherId === teacherId);
    }

    // Sort by submission date (newest first)
    filteredReports.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    return NextResponse.json(filteredReports);

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
