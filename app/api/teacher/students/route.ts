import { NextRequest, NextResponse } from 'next/server';
import { Student } from '@/types';

// Mock student data - replace with actual database
const mockStudents: Student[] = [
  {
    id: '2024001',
    name: 'Ana Reyes',
    grade: 'Grade 7',
    enrolledDate: '2024-06-01',
    attendance: [],
    grades: []
  },
  {
    id: '2024002',
    name: 'Carlos Mendoza',
    grade: 'Grade 7',
    enrolledDate: '2024-06-01',
    attendance: [],
    grades: []
  },
  {
    id: '2024003',
    name: 'Sofia Rodriguez',
    grade: 'Grade 7',
    enrolledDate: '2024-06-01',
    attendance: [],
    grades: []
  },
  {
    id: '2024004',
    name: 'Miguel Santos',
    grade: 'Grade 8',
    enrolledDate: '2024-06-01',
    attendance: [],
    grades: []
  },
  {
    id: '2024005',
    name: 'Isabella Cruz',
    grade: 'Grade 8',
    enrolledDate: '2024-06-01',
    attendance: [],
    grades: []
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    // In a real application, filter students by teacher's assigned classes
    // For demo, we'll return students based on teacher
    let filteredStudents = mockStudents;

    if (teacherId === 'teacher1') {
      // Grade 7 students for Math teacher
      filteredStudents = mockStudents.filter(s => s.grade === 'Grade 7');
    } else if (teacherId === 'teacher2') {
      // Grade 8 students for Science teacher
      filteredStudents = mockStudents.filter(s => s.grade === 'Grade 8');
    }

    return NextResponse.json(filteredStudents);

  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
