import { NextRequest, NextResponse } from 'next/server';
import { GradeInput } from '@/types';

// In-memory storage for demo - replace with actual database
let gradesDatabase: GradeInput[] = [];

export async function POST(request: NextRequest) {
  try {
    const { grades } = await request.json();

    if (!Array.isArray(grades)) {
      return NextResponse.json(
        { message: 'Grades must be an array' },
        { status: 400 }
      );
    }

    // Validate each grade entry
    for (const grade of grades) {
      if (!grade.studentId || !grade.subjectId || !grade.gradingPeriod || !grade.teacherId) {
        return NextResponse.json(
          { message: 'Missing required fields in grade entry' },
          { status: 400 }
        );
      }

      if (typeof grade.grade !== 'number' || grade.grade < 0 || grade.grade > 100) {
        return NextResponse.json(
          { message: 'Grade must be a number between 0 and 100' },
          { status: 400 }
        );
      }
    }

    // Save grades (in real app, this would be a database operation)
    gradesDatabase.push(...grades);

    return NextResponse.json({
      message: 'Grades saved successfully',
      savedCount: grades.length
    });

  } catch (error) {
    console.error('Error saving grades:', error);
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
    const subjectId = searchParams.get('subjectId');
    const gradingPeriod = searchParams.get('gradingPeriod');

    let filteredGrades = gradesDatabase;

    if (teacherId) {
      filteredGrades = filteredGrades.filter(g => g.teacherId === teacherId);
    }

    if (subjectId) {
      filteredGrades = filteredGrades.filter(g => g.subjectId === subjectId);
    }

    if (gradingPeriod) {
      filteredGrades = filteredGrades.filter(g => g.gradingPeriod === gradingPeriod);
    }

    return NextResponse.json(filteredGrades);

  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
