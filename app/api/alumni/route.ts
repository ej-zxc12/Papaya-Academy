import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase-admin';

export interface Alumni {
  id: string;
  name: string;
  age?: number;
  batchYear?: number;
  educationalStatus?: string;
  imageUrl?: string;
  nameOfSchool?: string;
  programOrGrade?: string;
}

// Cache for 5 minutes (300 seconds) - public content that changes infrequently
export const revalidate = 300;

export async function GET() {
  try {
    const alumniSnapshot = await db.collection('alumni').get();
    
    const alumni: Alumni[] = alumniSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name?.trim() || 'Unnamed Alumni',
        age: typeof data.age === 'number' ? data.age : undefined,
        batchYear: typeof data.batchYear === 'number' ? data.batchYear : undefined,
        educationalStatus: data.educationalStatus?.trim() || undefined,
        imageUrl: data.imageUrl?.trim() || undefined,
        nameOfSchool: data.nameOfSchool?.trim() || undefined,
        programOrGrade: data.programOrGrade?.trim() || undefined,
      };
    });

    // Sort by batch year descending
    alumni.sort((a, b) => (b.batchYear ?? 0) - (a.batchYear ?? 0));

    return NextResponse.json(alumni, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching alumni:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alumni' },
      { status: 500 }
    );
  }
}
