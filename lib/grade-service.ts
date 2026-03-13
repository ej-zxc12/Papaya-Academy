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

    for (const grade of gradeData) {
      try {
        results.processed++;
        
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
          gradeLevel: grade.gradeLevel,
          section: grade.section,
          schoolYear: grade.schoolYear,
          quarter: grade.quarter,
          grade: grade.grade,
          remarks: grade.remarks || '',
          updatedAt: serverTimestamp()
        };

        if (existingSnapshot.empty) {
          await addDoc(collection(db, 'grades'), {
            ...gradeDoc,
            createdAt: serverTimestamp()
          });
          results.saved++;
        } else {
          const existingDoc = existingSnapshot.docs[0];
          await updateDoc(doc(db, 'grades', existingDoc.id), gradeDoc);
          results.updated++;
        }
        
      } catch (error) {
        results.errors.push(`Error processing grade for student ${grade.studentId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    schoolYear: string = '2024-2025'
  ): Promise<Map<string, Map<string, number>>> {
    const grades = await this.getGradesByStudent(studentId, schoolYear);
    const gradesMap = new Map<string, Map<string, number>>();

    grades.forEach(grade => {
      if (!gradesMap.has(grade.subjectId)) {
        gradesMap.set(grade.subjectId, new Map());
      }
      
      gradesMap.get(grade.subjectId)!.set(grade.quarter, grade.grade);
    });

    return gradesMap;
  }
}

export default GradeService;
