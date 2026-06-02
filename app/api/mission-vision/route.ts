import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase-admin'
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

// Cache for 30 seconds - reduced since client now uses real-time listeners
export const revalidate = 30

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
  } catch (error: any) {
    console.error('Error fetching mission and vision data:', error);
    
    // Return default data instead of error if Firebase is not available
    if (error.message?.includes('credentials') || error.message?.includes('authentication')) {
      console.warn('Firebase not available - returning default mission and vision data');
      return NextResponse.json({
        id: 'default',
        mission: {
          title: 'Our Mission',
          content: 'To provide quality education and holistic development for every child.',
          image: '/images/default-mission.jpg'
        },
        vision: {
          title: 'Our Vision', 
          content: 'To be a leading educational institution that nurtures future leaders.',
          image: '/images/default-vision.jpg'
        },
        values: []
      }, {
        headers: {
          'Cache-Control': 'no-cache, must-revalidate',
        },
      });
    }
    
    return NextResponse.json(
      { error: `Failed to fetch mission and vision data: ${error}` },
      { status: 500 }
    );
  }
}
