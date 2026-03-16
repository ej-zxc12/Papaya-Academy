import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase-admin'
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

// Cache for 5 minutes (300 seconds) - public content that changes infrequently
export const revalidate = 300

export interface MissionVisionData {
  id: string;
  mission?: {
    title: string;
    content: string;
    image: string;
  };
  vision?: {
    title: string;
    content: string;
    image: string;
  };
  values?: Array<{
    title: string;
    description?: string;
    icon?: string;
    id: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching mission and vision data from Firebase...');
    
    const newsSnapshot = await db.collection('missionVision').orderBy('createdAt', 'desc').limit(1).get()
    
    if (newsSnapshot.empty) {
      console.log('No mission and vision data found');
      return NextResponse.json({ error: 'Mission and vision data not found' }, { status: 404 });
    }
    
    const doc = newsSnapshot.docs[0];
    const data = doc.data();
    
    const missionVisionData: MissionVisionData = {
      id: doc.id,
      ...data
    } as MissionVisionData;
    
    console.log('Mission and vision data fetched successfully');
    return NextResponse.json(missionVisionData, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching mission and vision data:', error);
    return NextResponse.json(
      { error: `Failed to fetch mission and vision data: ${error}` },
      { status: 500 }
    );
  }
}
