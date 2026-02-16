import { NextRequest, NextResponse } from 'next/server';
import { SF10Record } from '@/types';

// In-memory storage for demo - replace with actual database
let sf10Database: SF10Record[] = [
  {
    id: 'sf10-1',
    studentId: '2024001',
    lrn: '2024001',
    studentName: 'Ana Reyes',
    gradeLevel: 'Grade 7',
    section: 'Rose',
    schoolYear: '2024-2025',
    semester: 'First',
    subjects: [
      {
        subjectCode: 'MATH7-ALG',
        subjectName: 'Algebra',
        firstGrading: 85,
        secondGrading: 87,
        thirdGrading: 0,
        fourthGrading: 0,
        finalRating: 86,
        remarks: 'Good performance'
      }
    ],
    generalAverage: 86,
    status: 'promoted',
    adviserName: 'Juan Dela Cruz',
    dateCompleted: '2024-10-15'
  }
];

export async function POST(request: NextRequest) {
  try {
    const sf10Data: SF10Record = await request.json();

    // Validate required fields
    if (!sf10Data.studentId || !sf10Data.studentName || !sf10Data.gradeLevel) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate ID and save
    const newSF10: SF10Record = {
      ...sf10Data,
      id: `sf10-${Date.now()}`
    };

    sf10Database.push(newSF10);

    return NextResponse.json({
      message: 'SF10 form created successfully',
      sf10: newSF10
    });

  } catch (error) {
    console.error('Error creating SF10:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    // In a real app, filter by teacher's assigned students
    let filteredSF10 = sf10Database;

    return NextResponse.json(filteredSF10);

  } catch (error) {
    console.error('Error fetching SF10 records:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
