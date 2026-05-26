import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { WeeklyReportPrimaryPost } from '@/types';
import { FieldValue } from 'firebase-admin/firestore';

// GET - Fetch all primary posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    console.log('Fetching primary posts with isActive:', isActive);

    let snapshot;
    
    // Fetch all posts first, then filter to avoid index requirement
    snapshot = await db.collection('weekly_report_primary_posts')
      .orderBy('createdAt', 'desc')
      .get();
    
    console.log('Primary posts snapshot size:', snapshot.size);
    
    const posts: WeeklyReportPrimaryPost[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const postIsActive = data.isActive ?? true;
      
      // Filter by isActive if specified
      if (isActive === 'true' && !postIsActive) return;
      if (isActive === 'false' && postIsActive) return;
      
      posts.push({
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        createdBy: data.createdBy || '',
        createdByName: data.createdByName || '',
        dueDate: data.dueDate || '',
        createdAt: data.createdAt?.toDate?.().toISOString() || '',
        isActive: postIsActive,
        schoolYear: data.schoolYear,
        attachments: data.attachments || []
      });
    });

    console.log('Returning primary posts:', posts);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching primary posts:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create a new primary post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, dueDate, createdBy, createdByName, schoolYear, attachments } = body;

    console.log('Creating primary post with data:', { title, description, dueDate, createdBy, createdByName, schoolYear, attachments });

    // Validate required fields
    if (!title || !description || !dueDate || !createdBy || !createdByName) {
      console.error('Missing required fields');
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the primary post
    const docRef = await db.collection('weekly_report_primary_posts').add({
      title,
      description,
      dueDate,
      createdBy,
      createdByName,
      schoolYear,
      attachments: attachments || [],
      isActive: true,
      createdAt: FieldValue.serverTimestamp()
    });

    console.log('Primary post created with ID:', docRef.id);

    return NextResponse.json({
      id: docRef.id,
      message: 'Primary post created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating primary post:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

// PATCH - Update primary post (edit or deactivate)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isActive, title, description, dueDate, attachments } = body;

    if (!id) {
      return NextResponse.json(
        { message: 'Missing post ID' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp()
    };

    if (isActive !== undefined) updateData.isActive = isActive;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (attachments !== undefined) updateData.attachments = attachments;

    await db.collection('weekly_report_primary_posts').doc(id).update(updateData);

    return NextResponse.json({ message: 'Primary post updated successfully' });
  } catch (error) {
    console.error('Error updating primary post:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete primary post
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Missing post ID' },
        { status: 400 }
      );
    }

    await db.collection('weekly_report_primary_posts').doc(id).update({
      isActive: false,
      deletedAt: FieldValue.serverTimestamp()
    });

    return NextResponse.json({ message: 'Primary post deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting primary post:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}