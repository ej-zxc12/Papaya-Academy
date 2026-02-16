import { NextRequest, NextResponse } from 'next/server';
import { Subject } from '@/types';

// Mock subject data - replace with actual database
const mockSubjects: Subject[] = [
  {
    id: 'subj1',
    name: 'Algebra',
    code: 'MATH7-ALG',
    gradeLevel: 'Grade 7',
    teacherId: 'teacher1',
    semester: 'First',
    schoolYear: '2024-2025'
  },
  {
    id: 'subj2',
    name: 'Geometry',
    code: 'MATH7-GEO',
    gradeLevel: 'Grade 7',
    teacherId: 'teacher1',
    semester: 'Second',
    schoolYear: '2024-2025'
  },
  {
    id: 'subj3',
    name: 'Biology',
    code: 'SCI8-BIO',
    gradeLevel: 'Grade 8',
    teacherId: 'teacher2',
    semester: 'First',
    schoolYear: '2024-2025'
  },
  {
    id: 'subj4',
    name: 'Chemistry',
    code: 'SCI8-CHEM',
    gradeLevel: 'Grade 8',
    teacherId: 'teacher2',
    semester: 'Second',
    schoolYear: '2024-2025'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    // Filter subjects by teacher
    const filteredSubjects = teacherId 
      ? mockSubjects.filter(s => s.teacherId === teacherId)
      : mockSubjects;

    return NextResponse.json(filteredSubjects);

  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
