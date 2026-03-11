import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export async function GET() {
  try {
    console.log('Fetching Apple Scholarships data from Firebase...');
    
    const appleScholarshipsRef = collection(db, 'appleScholarship');
    const q = query(appleScholarshipsRef, orderBy('updatedAt', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No Apple Scholarships data found');
      return NextResponse.json({ error: 'Apple Scholarships data not found' }, { status: 404 });
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    // Add document ID to the data
    const scholarshipData = {
      id: doc.id,
      ...data,
    };
    
    console.log('Apple Scholarships data fetched successfully:', doc.id);
    return NextResponse.json(scholarshipData);
    
  } catch (error) {
    console.error('Error fetching Apple Scholarships data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Apple Scholarships data' },
      { status: 500 }
    );
  }
}
