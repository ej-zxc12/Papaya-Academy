import { NextRequest, NextResponse } from 'next/server';
import { WeeklyReport, PrincipalComment } from '@/types';

// In-memory storage for demo - replace with actual database
let reportsDatabase: WeeklyReport[] = [];

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reportId = params.id;
    const { comment, type, principalId, principalName } = await request.json();

    if (!comment || !type || !principalId || !principalName) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the report
    const reportIndex = reportsDatabase.findIndex(r => r.id === reportId);
    
    if (reportIndex === -1) {
      return NextResponse.json(
        { message: 'Report not found' },
        { status: 404 }
      );
    }

    // Create new comment
    const newComment: PrincipalComment = {
      id: `comment-${Date.now()}`,
      principalId,
      principalName,
      comment,
      type,
      createdAt: new Date().toISOString()
    };

    // Add comment to report
    const report = reportsDatabase[reportIndex];
    if (!report.principalComments) {
      report.principalComments = [];
    }
    report.principalComments.push(newComment);

    // Update report status based on comment type
    if (type === 'approval') {
      report.status = 'approved';
    } else if (report.status === 'pending') {
      report.status = 'reviewed';
    }

    reportsDatabase[reportIndex] = report;

    return NextResponse.json({
      message: 'Comment added successfully',
      report
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
