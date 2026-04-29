import { Grade, TeacherSubject, Student, Subject } from '@/types';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export class GradeService {
  
  static async saveGrades(gradeData: {
    studentId: string;
    subjectId: string;
    subjectName?: string;
    gradeLevel: string;
    section: string;
    schoolYear: string;
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    grade: number;
    remarks?: string;
    teacherId: string;
  }[]): Promise<{
    processed: number;
    saved: number;
    updated: number;
    errors: string[];
  }> {
    const results = {
      processed: 0,
      saved: 0,
      updated: 0,
      errors: [] as string[]
    };

    // Process all grade checks in parallel for better performance
    const checkPromises = gradeData.map(async (grade) => {
      try {
        const existingGradeQuery = query(
          collection(db, 'grades'),
          where('studentId', '==', grade.studentId),
          where('subjectId', '==', grade.subjectId),
          where('schoolYear', '==', grade.schoolYear),
          where('quarter', '==', grade.quarter)
        );

        const existingSnapshot = await getDocs(existingGradeQuery);

        const gradeDoc = {
          studentId: grade.studentId,
          teacherId: grade.teacherId,
          subjectId: grade.subjectId,
          subjectName: grade.subjectName || 'Unknown Subject',
          gradeLevel: grade.gradeLevel,
          section: grade.section,
          schoolYear: grade.schoolYear,
          quarter: grade.quarter,
          grade: grade.grade,
          remarks: grade.remarks || '',
          updatedAt: serverTimestamp()
        };

        return {
          grade,
          existingDoc: existingSnapshot.empty ? null : existingSnapshot.docs[0],
          gradeDoc
        };
      } catch (error) {
        return {
          grade,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    const checkResults = await Promise.all(checkPromises);

    // Process the save/update operations
    for (const result of checkResults) {
      try {
        if ('error' in result) {
          results.errors.push(`Error checking grade for student ${result.grade.studentId}: ${result.error}`);
          continue;
        }

        results.processed++;

        if (result.existingDoc) {
          await updateDoc(doc(db, 'grades', result.existingDoc.id), result.gradeDoc);
          results.updated++;
        } else {
          await addDoc(collection(db, 'grades'), {
            ...result.gradeDoc,
            createdAt: serverTimestamp()
          });
          results.saved++;
        }
      } catch (error) {
        results.errors.push(`Error saving grade for student ${result.grade.studentId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  }

  static async getGradesByTeacherSubject(
    teacherId: string,
    subjectId: string,
    quarter: string,
    schoolYear: string = '2024-2025'
  ): Promise<Grade[]> {
    const gradesQuery = query(
      collection(db, 'grades'),
      where('teacherId', '==', teacherId),
      where('subjectId', '==', subjectId),
      where('quarter', '==', quarter),
      where('schoolYear', '==', schoolYear)
      // Removed orderBy to avoid requiring composite index
    );

    const snapshot = await getDocs(gradesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Grade));
  }

  static async getGradesByStudent(
    studentId: string,
    schoolYear: string = '2024-2025'
  ): Promise<Grade[]> {
    const gradesQuery = query(
      collection(db, 'grades'),
      where('studentId', '==', studentId),
      where('schoolYear', '==', schoolYear),
      orderBy('subjectId'),
      orderBy('quarter')
    );

    const snapshot = await getDocs(gradesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Grade));
  }

  static async getGradesForSF10(
    studentId: string,
    schoolYear: string = '2024-2025',
    gradeLevel?: string
  ): Promise<Map<string, Map<string, number>>> {
    const grades = await this.getGradesByStudent(studentId, schoolYear);
    const gradesMap = new Map<string, Map<string, number>>();

    grades.forEach(grade => {
      // If gradeLevel is specified, only include grades for that grade level
      if (gradeLevel && grade.gradeLevel !== gradeLevel) {
        return;
      }
      
      if (!gradesMap.has(grade.subjectId)) {
        gradesMap.set(grade.subjectId, new Map());
      }
      
      gradesMap.get(grade.subjectId)!.set(grade.quarter, grade.grade);
    });

    return gradesMap;
  }
}

export default GradeService;
