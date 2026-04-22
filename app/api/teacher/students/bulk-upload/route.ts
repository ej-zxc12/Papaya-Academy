import { NextRequest, NextResponse } from 'next/server';
import { Student } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, Timestamp, QueryConstraint } from 'firebase/firestore';
import * as XLSX from 'xlsx';

// Simple middleware to check for teacher session
function getTeacherSession(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  const sessionCookie = request.cookies.get('teacherSession')?.value;
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie);
      return sessionData?.teacher?.id ?? sessionData?.teacher?.uid ?? sessionData?.user?.uid ?? null;
    } catch {
      return null;
    }
  }
  
  return null;
}

function getTeacherIdentifiers(request: NextRequest) {
  const bearer = getTeacherSession(request);

  const sessionCookie = request.cookies.get('teacherSession')?.value;
  if (!sessionCookie) {
    return { uid: bearer ?? null, id: bearer ?? null };
  }

  try {
    const sessionData = JSON.parse(sessionCookie);
    const t = sessionData?.teacher ?? sessionData;
    const uid = (typeof t?.uid === 'string' && t.uid) ? t.uid : null;
    const id = (typeof t?.id === 'string' && t.id) ? t.id : null;

    return {
      uid: uid ?? bearer ?? null,
      id: id ?? bearer ?? null,
    };
  } catch {
    return { uid: bearer ?? null, id: bearer ?? null };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check teacher session
    const teacherId = getTeacherSession(request);
    if (!teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const subjectIdsJson = formData.get('subjectIds') as string;

    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!subjectIdsJson) {
      return NextResponse.json(
        { message: 'No subject IDs provided' },
        { status: 400 }
      );
    }

    const subjectIds = JSON.parse(subjectIdsJson);
    if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
      return NextResponse.json(
        { message: 'At least one subject ID is required' },
        { status: 400 }
      );
    }

    // Parse Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json(
        { message: 'No data found in Excel file' },
        { status: 400 }
      );
    }

    // Validate required columns
    const requiredColumns = ['Student Name', 'LRN', 'Grade Level', 'Section'];
    const alternativeColumns = {
      'Student Name': ['student_name', 'name'],
      'LRN': ['lrn'],
      'Grade Level': ['grade_level', 'grade'],
      'Section': ['section']
    };

    const firstRow = jsonData[0] as any;
    const availableColumns = Object.keys(firstRow);
    
    // Check if required columns are present (either exact or alternative)
    for (const [required, alternatives] of Object.entries(alternativeColumns)) {
      const hasColumn = availableColumns.some(col => 
        col === required || alternatives.includes(col)
      );
      
      if (!hasColumn) {
        return NextResponse.json(
          { 
            message: `Missing required column: ${required}. Please include one of: [${required}, ...${alternatives.join(', ')}]` 
          },
          { status: 400 }
        );
      }
    }

    // Get teacher identifiers
    const { uid, id } = getTeacherIdentifiers(request);
    const teacherIdsToTry = Array.from(new Set([uid, id, teacherId].filter(Boolean))) as string[];

    if (teacherIdsToTry.length === 0) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const studentsCollection = collection(db, 'students');
    let uploadedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any;
      
      try {
        // Extract data with flexible column names
        const name = row['Student Name'] || row['student_name'] || row['name'] || '';
        const lrn = row['LRN'] || row['lrn'] || '';
        const gradeLevel = row['Grade Level'] || row['grade_level'] || row['grade'] || '';
        const section = row['Section'] || row['section'] || '';

        // Validate required fields
        if (!name || !lrn || !gradeLevel) {
          errors.push(`Row ${i + 1}: Missing required fields (name, LRN, or grade level)`);
          continue;
        }

        // Normalize section for duplicate check (treat null, undefined, and empty string as equivalent)
        const normalizedSection = (section || '').trim();

        // Check if student already exists across ALL teachers
        // Look across ALL teachers to prevent duplicates (same as route.ts)
        const existingQuery = query(
          studentsCollection,
          where('name', '==', name.trim()),
          where('lrn', '==', lrn.trim()),
          where('gradeLevel', '==', gradeLevel.trim())
        );
        
        const existingSnapshot = await getDocs(existingQuery);
        // Filter results to match section (treating null/undefined/empty as equivalent)
        const existingStudent = existingSnapshot.docs.find(doc => {
          const data = doc.data();
          const docSection = data.section || '';
          return docSection === normalizedSection;
        });

        if (existingStudent) {
          // Update existing student with new subject IDs
          const existingData = existingStudent.data();
          const existingSubjectIds = existingData.subjectIds || [];
          const existingTeacherIds = existingData.teacherIds || [existingData.teacherId].filter(Boolean);
          
          // Merge new subject IDs with existing ones (avoid duplicates)
          const mergedSubjectIds = Array.from(new Set([...existingSubjectIds, ...subjectIds]));
          
          // Add current teacher to teacherIds if not already present
          const mergedTeacherIds = existingTeacherIds.includes(teacherId)
            ? existingTeacherIds
            : [...existingTeacherIds, teacherId];
          
          const needsUpdate = mergedSubjectIds.length > existingSubjectIds.length ||
                             mergedTeacherIds.length > existingTeacherIds.length;
          
          if (needsUpdate) {
            // Update the existing student
            await import('firebase/firestore').then(({ updateDoc, doc }) => {
              return updateDoc(doc(db, 'students', existingStudent.id), {
                subjectIds: mergedSubjectIds,
                teacherIds: mergedTeacherIds,
                updatedAt: Timestamp.now()
              });
            });
            
            uploadedCount++;
          } else {
            skippedCount++; // Student already has all subjects and teacher
          }
        } else {
          // Create new student
          const studentData = {
            name: name.trim(),
            lrn: lrn.trim(),
            gradeLevel: gradeLevel.trim(),
            section: section.trim(),
            currentGradeLevel: gradeLevel.trim(),
            currentSection: section.trim(),
            teacherId: teacherId,
            subjectIds: subjectIds,
            status: 'enrolled',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          };

          await addDoc(studentsCollection, studentData);
          uploadedCount++;
        }
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        errors.push(`Row ${i + 1}: Failed to process student data`);
      }
    }

    return NextResponse.json({
      message: `Upload completed. ${uploadedCount} students processed successfully.`,
      uploadedCount,
      skippedCount,
      totalRows: jsonData.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error in bulk upload:', error);
    return NextResponse.json(
      { message: 'Internal server error during bulk upload' },
      { status: 500 }
    );
  }
}
