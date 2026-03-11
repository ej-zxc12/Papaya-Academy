import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

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
    
    const missionVisionRef = collection(db, 'missionVision');
    const q = query(missionVisionRef, orderBy('createdAt', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No mission and vision data found');
      return NextResponse.json({ error: 'Mission and vision data not found' }, { status: 404 });
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    const missionVisionData: MissionVisionData = {
      id: doc.id,
      ...data
    } as MissionVisionData;
    
    console.log('Mission and vision data fetched successfully');
    return NextResponse.json(missionVisionData);
  } catch (error) {
    console.error('Error fetching mission and vision data:', error);
    return NextResponse.json(
      { error: `Failed to fetch mission and vision data: ${error}` },
      { status: 500 }
    );
  }
}
