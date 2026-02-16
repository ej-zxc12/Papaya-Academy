import { NextRequest, NextResponse } from 'next/server';
import { WeeklyReport } from '@/types';

// In-memory storage for demo - replace with actual database
// This should be the same database as the teacher reports
let reportsDatabase: WeeklyReport[] = [];

export async function GET(request: NextRequest) {
  try {
    // In a real application, this would fetch from a database
    // For demo, we'll return mock data
    const mockReports: WeeklyReport[] = [
      {
        id: 'report-1',
        teacherId: 'teacher1',
        teacherName: 'Juan Dela Cruz',
        teacherDepartment: 'Mathematics',
        weekStartDate: '2024-02-05',
        weekEndDate: '2024-02-09',
        title: 'Weekly Teaching Report - Week 6',
        content: 'This week we covered advanced algebra topics including quadratic equations and factoring. Students showed good progress in understanding the concepts. We conducted a quiz on Friday with 85% average score.',
        attachments: ['quiz_results.pdf', 'lesson_plan.pdf'],
        submittedAt: '2024-02-09T15:30:00Z',
        status: 'pending',
        principalComments: []
      },
      {
        id: 'report-2',
        teacherId: 'teacher2',
        teacherName: 'Maria Santos',
        teacherDepartment: 'Science',
        weekStartDate: '2024-02-05',
        weekEndDate: '2024-02-09',
        title: 'Science Lab Report - Chemical Reactions',
        content: 'Students conducted experiments on chemical reactions this week. The lab activities were successful with students demonstrating proper safety procedures. Assessment results showed 90% mastery of the concepts.',
        attachments: ['lab_report.pdf'],
        submittedAt: '2024-02-09T14:20:00Z',
        status: 'reviewed',
        principalComments: [
          {
            id: 'comment-1',
            principalId: 'principal1',
            principalName: 'Dr. Maria Rodriguez',
            comment: 'Excellent lab organization. Consider adding more hands-on activities for next week.',
            type: 'remark',
            createdAt: '2024-02-10T09:15:00Z'
          }
        ]
      }
    ];

    // Sort by submission date (newest first)
    const sortedReports = mockReports.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return NextResponse.json(sortedReports);

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
