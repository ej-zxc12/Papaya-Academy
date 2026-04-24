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

    // Convert to 2D array to find metadata like School Year
    // Use raw: false to get formatted values (handles scientific notation display)
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' }) as any[][];
    
    console.log('📋 First 20 rows of Excel data for debugging:');
    console.log(JSON.stringify(rawData.slice(0, 20), null, 2));
    console.log('📁 Filename:', file.name);
    
    // Try to find "School Year" - prioritize filename, then check sheet
    let foundSchoolYear = '';
    
    // First, try to extract from filename (most reliable for Papaya masterlist)
    if (file.name) {
      const filenameMatch = file.name.match(/(\d{4}[-–]\d{4})/);
      if (filenameMatch) {
        foundSchoolYear = filenameMatch[1].replace('–', '-');
      }
    }
    
    // If not in filename, check the sheet
    if (!foundSchoolYear) {
      for (let r = 0; r < rawData.length; r++) {
        const row = rawData[r];
        
        // Handle both 2D array and object-based structures
        const cellValues: string[] = [];
        
        if (Array.isArray(row)) {
          // 2D array structure
          for (let c = 0; c < row.length; c++) {
            cellValues.push(String(row[c] || '').trim());
          }
        } else if (typeof row === 'object' && row !== null) {
          // Object structure (e.g., { __EMPTY: 'value', __EMPTY_1: 'value' })
          Object.keys(row).forEach(key => {
            if (key !== '__rowNum__') {
              cellValues.push(String(row[key] || '').trim());
            }
          });
        }
        
        // Check each cell value in the row
        for (let i = 0; i < cellValues.length; i++) {
          const cellValue = cellValues[i];
          
          // Check for explicit "School Year" label with value in next cell
          if (cellValue.toLowerCase() === 'school year' && cellValues[i + 1]) {
            foundSchoolYear = cellValues[i + 1];
            break;
          }
          
          // Check for any year pattern (XXXX-XXXX)
          const match = cellValue.match(/(\d{4}[-–]\d{4})/);
          if (match) {
            foundSchoolYear = match[1].replace('–', '-');
            break;
          }
        }
        if (foundSchoolYear) break;
      }
    }
    
    // If still not found, use a default or allow upload without it
    if (!foundSchoolYear) {
      foundSchoolYear = '2025-2026'; // Default fallback for Papaya masterlist
    }

    // Helper function to convert Roman numerals to integers
    const romanToInt = (roman: string): number => {
      const romanUpper = roman.toUpperCase();
      const romanNumerals: { [key: string]: number } = {
        'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
        'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
        'XI': 11, 'XII': 12
      };
      return romanNumerals[romanUpper] || 0;
    };

    // Helper function to convert grade level with Roman numeral to whole number
    const convertGradeLevel = (gradeLevel: string): string => {
      if (!gradeLevel) return gradeLevel;
      
      // Match patterns like "Grade VI", "GRADE VI", "Grade 6", etc.
      const match = gradeLevel.match(/grade\s*(\w+)/i);
      if (match) {
        const gradePart = match[1];
        const romanNumeral = romanToInt(gradePart);
        if (romanNumeral > 0) {
          return `Grade ${romanNumeral}`;
        }
      }
      return gradeLevel;
    };

    // Convert to 2D array to find header row (same logic as frontend)
    const rawData2D = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' }) as any[][];
    
    console.log('📋 Backend: First 15 rows of raw data:');
    for (let i = 0; i < Math.min(15, rawData2D.length); i++) {
      console.log(`  Row ${i}:`, rawData2D[i]);
    }
    
    // Find header row (contains "LRN NUMBER" or "NAME")
    let headerRowIndex = -1;
    for (let r = 0; r < rawData2D.length; r++) {
      const row = rawData2D[r];
      const rowStr = row.map((cell: any) => String(cell || '').toLowerCase()).join(' ');
      if (rowStr.includes('lrn') || rowStr.includes('name')) {
        headerRowIndex = r;
        console.log(`📋 Backend: Found header row at index ${r}:`, row);
        break;
      }
    }
    
    let jsonData: any[] = [];
    let defaultGradeLevel = '';
    let defaultSection = '';
    
    if (headerRowIndex >= 0) {
      // Extract grade/section from row before header
      if (headerRowIndex > 0) {
        const gradeSectionRow = rawData2D[headerRowIndex - 1];
        const gradeSectionText = gradeSectionRow.map((cell: any) => String(cell || '')).join(' ').trim();
        console.log(`📋 Backend: Grade/Section row (index ${headerRowIndex - 1}):`, gradeSectionRow);
        console.log(`📋 Backend: Grade/Section text: "${gradeSectionText}"`);
        
        const gradeMatch = gradeSectionText.match(/GRADE\s+(\w+)/i);
        console.log(`📋 Backend: Grade match result:`, gradeMatch);
        if (gradeMatch) {
          defaultGradeLevel = convertGradeLevel(`Grade ${gradeMatch[1]}`);
        }
        
        const sectionMatch = gradeSectionText.match(/-\s*(\w+)$/);
        console.log(`📋 Backend: Section match result:`, sectionMatch);
        if (sectionMatch) {
          defaultSection = sectionMatch[1].trim();
          // Convert to title case (e.g., "DIAMOND" -> "Diamond")
          defaultSection = defaultSection.charAt(0).toUpperCase() + defaultSection.slice(1).toLowerCase();
        }
        
        console.log(`📋 Backend: Default Grade: "${defaultGradeLevel}", Default Section: "${defaultSection}"`);
      }
      
      // Use the header row to parse data
      const headers = rawData2D[headerRowIndex].map((h: any) => String(h || '').trim());
      console.log('📋 Backend: Headers:', headers);
      
      // Parse data rows
      for (let r = headerRowIndex + 1; r < rawData2D.length; r++) {
        const row = rawData2D[r];
        if (row.length === 0 || row.every((cell: any) => !cell)) continue;
        
        const obj: any = {};
        headers.forEach((header: string, index: number) => {
          if (header && row[index] !== undefined) {
            obj[header] = row[index];
          }
        });
        
        // Map Papaya masterlist column names to standard names
        if (obj['NAME']) {
          obj['Student Name'] = obj['NAME'];
        }
        if (obj['LRN NUMBER']) {
          obj['LRN'] = obj['LRN NUMBER'];
        }
        
        // Add default grade and section
        if (defaultGradeLevel && !obj['Grade Level'] && !obj['gradeLevel']) {
          obj['Grade Level'] = defaultGradeLevel;
        }
        if (defaultSection && !obj['Section'] && !obj['section']) {
          obj['Section'] = defaultSection;
        }
        
        if (Object.keys(obj).length > 0) {
          jsonData.push(obj);
        }
      }
    } else {
      // Fallback: use default parsing
      jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
    }

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json(
        { message: 'No data found in Excel file' },
        { status: 400 }
      );
    }

    // Validate required columns
    const firstRow = jsonData[0] as any;
    const availableColumns = Object.keys(firstRow);
    
    console.log('📋 Backend: Available columns:', availableColumns);
    
    const hasName = availableColumns.some(col => 
      col === 'Student Name' || col === 'student_name' || col === 'name' || col === 'NAME'
    );
    const hasLRN = availableColumns.some(col => 
      col === 'LRN' || col === 'lrn' || col === 'LRN NUMBER'
    );
    
    if (!hasName) {
      return NextResponse.json(
        { message: 'Missing required column: Student Name (or NAME)' },
        { status: 400 }
      );
    }
    
    if (!hasLRN) {
      return NextResponse.json(
        { message: 'Missing required column: LRN (or LRN NUMBER)' },
        { status: 400 }
      );
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
        console.log(`📝 Processing row ${i + 1}:`, row);
        
        // Extract data with flexible column names
        const name = row['Student Name'] || row['student_name'] || row['name'] || row['NAME'] || '';
        const lrn = String(row['LRN'] || row['lrn'] || row['LRN NUMBER'] || '').trim();
        let gradeLevel = row['Grade Level'] || row['grade_level'] || row['grade'] || defaultGradeLevel;
        let section = row['Section'] || row['section'] || defaultSection;
        
        console.log(`📝 Extracted data - Name: "${name}", LRN: "${lrn}", Grade: "${gradeLevel}", Section: "${section}"`);
        console.log(`📝 Row data:`, row);
        console.log(`📝 defaultSection: "${defaultSection}"`);
        
        // Convert Roman numerals in grade level to whole numbers
        gradeLevel = convertGradeLevel(gradeLevel);

        // Validate required fields
        if (!name || !lrn || !gradeLevel) {
          console.log(`❌ Skipping row ${i + 1}: Missing required fields`);
          errors.push(`Row ${i + 1}: Missing required fields (name, LRN, or grade level)`);
          continue;
        }

        // Normalize section for duplicate check (treat null, undefined, and empty string as equivalent)
        const normalizedSection = (section || '').trim();

        // Check if student already exists across ALL teachers
        // Use LRN as the unique identifier (LRN should be unique per student)
        console.log(`🔍 Checking for duplicates with LRN: "${lrn.trim()}"`);
        const existingQuery = query(
          studentsCollection,
          where('lrn', '==', lrn.trim())
        );
        
        const existingSnapshot = await getDocs(existingQuery);
        console.log(`🔍 Found ${existingSnapshot.docs.length} existing students with matching LRN`);
        
        // Use the first matching student (LRN should be unique)
        const existingStudent = existingSnapshot.docs[0];

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
            schoolYear: foundSchoolYear,
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
