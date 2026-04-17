import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Batch delete availability configuration
// Available annually from May 29 to June 30
const BATCH_DELETE_START_MONTH = 4; // May (0-indexed)
const BATCH_DELETE_START_DAY = 29;
const BATCH_DELETE_END_MONTH = 5; // June (0-indexed)
const BATCH_DELETE_END_DAY = 30;

function getPrincipalIdFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return decodeURIComponent(authHeader.substring(7));
  }

  const sessionCookie = request.cookies.get('principalSession')?.value;
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie);
      const p = sessionData?.principal ?? sessionData;
      return p?.id ?? p?.uid ?? null;
    } catch {
      return null;
    }
  }

  return null;
}

function isBatchDeleteAvailable(): boolean {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentDay = today.getDate(); // 1-31

  // Check if we're in the available window (May 30 to June 30)
  // May 30-31
  if (currentMonth === BATCH_DELETE_START_MONTH && currentDay >= BATCH_DELETE_START_DAY) {
    return true;
  }
  // June 1-30
  if (currentMonth === BATCH_DELETE_END_MONTH && currentDay <= BATCH_DELETE_END_DAY) {
    return true;
  }

  return false;
}

function getNextAvailableWindow(): { start: string; end: string } {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  let year = currentYear;

  // If we're past June 30, next window is next year
  if (currentMonth > BATCH_DELETE_END_MONTH ||
      (currentMonth === BATCH_DELETE_END_MONTH && today.getDate() > BATCH_DELETE_END_DAY)) {
    year = currentYear + 1;
  }

  const startDate = new Date(year, BATCH_DELETE_START_MONTH, BATCH_DELETE_START_DAY);
  const endDate = new Date(year, BATCH_DELETE_END_MONTH, BATCH_DELETE_END_DAY);

  return {
    start: startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    end: endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const principalId = getPrincipalIdFromRequest(request);
    if (!principalId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    // Check if batch delete is available (annual window: May 30 - June 30)
    if (!isBatchDeleteAvailable()) {
      const nextWindow = getNextAvailableWindow();
      return NextResponse.json(
        { 
          message: 'Batch delete is not available yet',
          nextAvailableWindow: nextWindow,
          availableWindow: 'May 30 - June 30 (annually)'
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { year } = body;

    if (!year || typeof year !== 'string') {
      return NextResponse.json(
        { message: 'Year is required (e.g., "2024")' },
        { status: 400 }
      );
    }

    console.log(`[batch-delete] Starting delete for year ${year}...`);

    // Try to query reports by createdAt date range
    let reportsToDelete: FirebaseFirestore.QueryDocumentSnapshot[] = [];

    try {
      const startOfYear = Timestamp.fromDate(new Date(`${year}-01-01T00:00:00.000Z`));
      const endOfYear = Timestamp.fromDate(new Date(`${year}-12-31T23:59:59.999Z`));

      const reportsQuery = db.collection('weekly_reports')
        .where('createdAt', '>=', startOfYear)
        .where('createdAt', '<=', endOfYear);

      const snapshot = await reportsQuery.get();
      console.log(`[batch-delete] Date query found ${snapshot.size} reports for year ${year}`);
      reportsToDelete = snapshot.docs;
    } catch (error) {
      console.log(`[batch-delete] Date query failed, will try fallback: ${error}`);
    }

    // Fallback: Get all reports and filter by checking the createdAt timestamp manually
    if (reportsToDelete.length === 0) {
      console.log(`[batch-delete] Trying fallback query - fetching all reports...`);
      const allReportsSnapshot = await db.collection('weekly_reports').get();
      console.log(`[batch-delete] Total reports in collection: ${allReportsSnapshot.size}`);

      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`).getTime();
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`).getTime();

      reportsToDelete = allReportsSnapshot.docs.filter(doc => {
        const data = doc.data();
        if (!data.createdAt) {
          console.log(`[batch-delete] Report ${doc.id} has no createdAt field`);
          return false;
        }

        let reportTime: number;
        if (data.createdAt.toDate) {
          // Firestore Timestamp
          reportTime = data.createdAt.toDate().getTime();
        } else if (data.createdAt instanceof Date) {
          // JavaScript Date
          reportTime = data.createdAt.getTime();
        } else if (typeof data.createdAt === 'string') {
          // ISO string
          reportTime = new Date(data.createdAt).getTime();
        } else {
          console.log(`[batch-delete] Report ${doc.id} has unknown createdAt type:`, typeof data.createdAt);
          return false;
        }

        const inRange = reportTime >= startOfYear && reportTime <= endOfYear;
        if (inRange) {
          console.log(`[batch-delete] Report ${doc.id} (${new Date(reportTime).toISOString()}) matches year ${year}`);
        }
        return inRange;
      });

      console.log(`[batch-delete] Fallback filtering found ${reportsToDelete.length} reports for year ${year}`);
    }

    if (reportsToDelete.length === 0) {
      return NextResponse.json({
        message: `No reports found for year ${year}`,
        deleteCount: 0,
        year,
        debug: 'Checked both date query and manual filtering'
      });
    }

    // Delete all reports and their comments
    const batch = db.batch();
    let deleteCount = 0;
    let commentsDeleted = 0;

    for (const doc of reportsToDelete) {
      // Delete the report
      batch.delete(doc.ref);
      deleteCount++;

      // Delete associated comments
      const commentsSnapshot = await doc.ref.collection('comments').get();
      for (const commentDoc of commentsSnapshot.docs) {
        batch.delete(commentDoc.ref);
        commentsDeleted++;
      }
    }

    console.log(`[batch-delete] Deleting ${deleteCount} reports and ${commentsDeleted} comments...`);

    // Commit the batch
    await batch.commit();

    console.log(`[batch-delete] Successfully deleted ${deleteCount} reports for year ${year}`);

    return NextResponse.json({
      message: `Successfully deleted ${deleteCount} reports and ${commentsDeleted} comments for year ${year}`,
      deleteCount,
      commentsDeleted,
      year,
      deletedBy: principalId,
      deletedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('[principal/reports/batch-delete] Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check availability status
export async function GET(request: NextRequest) {
  try {
    const principalId = getPrincipalIdFromRequest(request);
    if (!principalId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const today = new Date();
    const isAvailable = isBatchDeleteAvailable();
    const nextWindow = getNextAvailableWindow();

    return NextResponse.json({
      isAvailable,
      availableWindow: 'May 30 - June 30 (annually)',
      nextAvailableWindow: nextWindow,
      currentDate: today.toISOString()
    });
  } catch (error) {
    console.error('[principal/reports/batch-delete] Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
