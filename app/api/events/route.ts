import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase-admin';

export interface Event {
  id: string;
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  status?: string;
  timezone?: string;
  createdAt?: string;
}

// Cache for 5 minutes (300 seconds) - public content that changes infrequently
export const revalidate = 300;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const maxCount = Math.min(parseInt(searchParams.get('limit') || '3', 10), 50);

    const eventsSnapshot = await db
      .collection('events')
      .orderBy('createdAt', 'desc')  // Newest first (latest uploaded)
      .limit(maxCount)
      .get();

    const events: Event[] = eventsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        startAt: data.startAt,
        endAt: data.endAt,
        status: data.status,
        timezone: data.timezone,
        createdAt: data.createdAt?.toDate?.() 
          ? data.createdAt.toDate().toISOString() 
          : data.createdAt,
      };
    });

    return NextResponse.json(events, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
