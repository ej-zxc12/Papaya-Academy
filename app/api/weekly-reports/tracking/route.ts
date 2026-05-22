import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { TeacherCompletionStatus } from '@/types';

// GET - Fetch teacher completion status for a specific primary post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const primaryPostId = searchParams.get('primaryPostId');

    if (!primaryPostId) {
      return NextResponse.json(
        { message: 'Missing primary post ID' },
        { status: 400 }
      );
    }

    // Fetch all teachers
    const teachersSnapshot = await db.collection('teachers_user')
      .where('role', '==', 'teacher')
      .get();

    const teachers: any[] = [];
    teachersSnapshot.forEach((doc) => {
      const data = doc.data();
      teachers.push({
        id: doc.id,
        username: data.username || '',
        email: data.email || '',
        isActive: data.isActive !== false
      });
    });

    // Fetch all sub-posts for this primary post
    const subPostsSnapshot = await db.collection('weekly_report_sub_posts')
      .where('primaryPostId', '==', primaryPostId)
      .get();

    const subPosts: any[] = [];
    subPostsSnapshot.forEach((doc) => {
      const data = doc.data();
      subPosts.push({
        teacherId: data.teacherId,
        submittedAt: data.submittedAt?.toDate?.().toISOString(),
        id: doc.id
      });
    });

    // Build completion status for each teacher
    const completionStatus: TeacherCompletionStatus[] = teachers.map((teacher) => {
      const submission = subPosts.find((sub) => sub.teacherId === teacher.id);
      return {
        teacherId: teacher.id,
        teacherName: teacher.username,
        teacherEmail: teacher.email,
        hasSubmitted: !!submission,
        submittedAt: submission?.submittedAt,
        subPostId: submission?.id
      };
    });

    return NextResponse.json(completionStatus);
  } catch (error) {
    console.error('Error fetching completion status:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
