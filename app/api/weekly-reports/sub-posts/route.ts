import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { WeeklyReportSubPost } from '@/types';
import { FieldValue } from 'firebase-admin/firestore';

// GET - Fetch sub-posts for a specific primary post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const primaryPostId = searchParams.get('primaryPostId');
    const teacherId = searchParams.get('teacherId');

    console.log('Fetching sub-posts with primaryPostId:', primaryPostId, 'teacherId:', teacherId);

    if (!primaryPostId) {
      return NextResponse.json(
        { message: 'Missing primary post ID' },
        { status: 400 }
      );
    }

    // Fetch all sub-posts first, then filter to avoid index requirement
    let snapshot = await db.collection('weekly_report_sub_posts')
      .orderBy('submittedAt', 'desc')
      .get();
    
    console.log('Sub-posts snapshot size:', snapshot.size);
    
    const subPosts: WeeklyReportSubPost[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Filter by primaryPostId
      if (data.primaryPostId !== primaryPostId) return;
      
      // Filter by teacherId if provided
      if (teacherId && data.teacherId !== teacherId) return;
      
      subPosts.push({
        id: doc.id,
        primaryPostId: data.primaryPostId || '',
        teacherId: data.teacherId || '',
        teacherName: data.teacherName || '',
        content: data.content || '',
        attachments: data.attachments || [],
        submittedAt: data.submittedAt?.toDate?.().toISOString() || '',
        acknowledged: data.acknowledged || false,
        acknowledgedBy: data.acknowledgedBy,
        acknowledgedAt: data.acknowledgedAt?.toDate?.().toISOString()
      });
    });

    console.log('Returning sub-posts:', subPosts);
    return NextResponse.json(subPosts);
  } catch (error) {
    console.error('Error fetching sub-posts:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create a new sub-post (teacher submits report)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { primaryPostId, teacherId, teacherName, content, attachments } = body;

    // Validate required fields
    if (!primaryPostId || !teacherId || !teacherName || !content) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if teacher has already submitted for this primary post
    const existingSnapshot = await db.collection('weekly_report_sub_posts')
      .where('primaryPostId', '==', primaryPostId)
      .where('teacherId', '==', teacherId)
      .get();

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { message: 'You have already submitted a report for this assignment' },
        { status: 400 }
      );
    }

    // Create the sub-post
    const docRef = await db.collection('weekly_report_sub_posts').add({
      primaryPostId,
      teacherId,
      teacherName,
      content,
      attachments: attachments || [],
      acknowledged: false,
      submittedAt: FieldValue.serverTimestamp()
    });

    return NextResponse.json({
      id: docRef.id,
      message: 'Report submitted successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating sub-post:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update sub-post (Edit content/attachments)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content, attachments } = body;

    if (!id) {
      return NextResponse.json({ message: 'Missing report ID' }, { status: 400 });
    }

    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp()
    };

    if (content !== undefined) updateData.content = content;
    if (attachments !== undefined) updateData.attachments = attachments;

    await db.collection('weekly_report_sub_posts').doc(id).update(updateData);

    return NextResponse.json({ message: 'Report updated successfully' });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove sub-post
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing report ID' }, { status: 400 });
    }

    await db.collection('weekly_report_sub_posts').doc(id).delete();

    return NextResponse.json({ message: 'Report deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}