import { Grade, SF10, SF10Subject, StudentDocument } from '@/types';
import { doc, getDoc, collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import GradeService from './grade-service';

export class SF10NormalizedGenerator {
  
  static async generateSF10(studentId: string, schoolYear: string): Promise<SF10> {
    try {
      console.log(`Generating SF10 for student ${studentId}, year ${schoolYear}`);
      
      const studentDoc = await getDoc(doc(db, 'students', studentId));
      if (!studentDoc.exists()) {
        throw new Error(`Student ${studentId} not found`);
      }
      
      const student = studentDoc.data() as StudentDocument;
      const gradesMap = await GradeService.getGradesForSF10(studentId, schoolYear);
      const subjects = this.generateSF10Subjects(gradesMap);
      const generalAverage = this.calculateGeneralAverage(subjects);
      const attendance = await this.getAttendanceData(studentId, schoolYear);
      
      const sf10Record: SF10 = {
        id: `sf10-${studentId}-${schoolYear}`,
        studentId,
        schoolYear,
        gradeLevel: student.currentGradeLevel || 'Unknown',
        section: student.currentSection || 'Default',
        subjects,
        generalAverage,
        attendance,
        generatedAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'sf10'), sf10Record);
      
      console.log(`SF10 generated for student ${studentId}`);
      return sf10Record;
      
    } catch (error) {
      console.error(`Error generating SF10 for student ${studentId}:`, error);
      throw error;
    }
  }
  
  static generateSF10Subjects(gradesMap: Map<string, Map<string, number>>): SF10Subject[] {
    const subjects: SF10Subject[] = [];
    
    gradesMap.forEach((quarterGrades, subjectId) => {
      const sf10Subject: SF10Subject = {
        subjectCode: subjectId,
        subjectName: this.getSubjectName(subjectId),
        firstGrading: quarterGrades.get('Q1') || 0,
        secondGrading: quarterGrades.get('Q2') || 0,
        thirdGrading: quarterGrades.get('Q3') || 0,
        fourthGrading: quarterGrades.get('Q4') || 0,
        finalRating: 0,
        remarks: this.generateRemarks(quarterGrades)
      };
      
      const validGrades = [
        sf10Subject.firstGrading,
        sf10Subject.secondGrading,
        sf10Subject.thirdGrading,
        sf10Subject.fourthGrading
      ].filter(grade => grade > 0);
      
      if (validGrades.length > 0) {
        sf10Subject.finalRating = Math.round(
          validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length
        );
      }
      
      subjects.push(sf10Subject);
    });
    
    return subjects;
  }
  
  static calculateGeneralAverage(subjects: SF10Subject[]): number {
    const validSubjects = subjects.filter(subject => subject.finalRating > 0);
    
    if (validSubjects.length === 0) return 0;
    
    const total = validSubjects.reduce((sum, subject) => sum + subject.finalRating, 0);
    return Math.round(total / validSubjects.length);
  }
  
  static async getAttendanceData(studentId: string, schoolYear: string): Promise<{
    daysPresent: number;
    daysAbsent: number;
    daysTardy: number;
  }> {
    try {
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('studentId', '==', studentId),
        where('schoolYear', '==', schoolYear)
      );
      
      const snapshot = await getDocs(attendanceQuery);
      
      if (snapshot.empty) {
        return { daysPresent: 0, daysAbsent: 0, daysTardy: 0 };
      }
      
      const attendance = snapshot.docs[0].data();
      return {
        daysPresent: attendance.daysPresent || 0,
        daysAbsent: attendance.daysAbsent || 0,
        daysTardy: attendance.daysTardy || 0
      };
      
    } catch (error) {
      console.error('Error getting attendance data:', error);
      return { daysPresent: 0, daysAbsent: 0, daysTardy: 0 };
    }
  }
  
  static getSubjectName(subjectCode: string): string {
    const subjectMapping: Record<string, string> = {
      'MATH7': 'Mathematics 7',
      'ENG7': 'English 7',
      'SCI7': 'Science 7',
      'FIL7': 'Filipino 7',
      'HELE7': 'HELE 7',
      'MSEP7': 'Music, Arts & PE 7',
      'EPP7': 'EPP 7',
      'CLE7': 'Christian Living Education 7',
      'COMP7': 'Computer 7'
    };
    
    return subjectMapping[subjectCode] || subjectCode;
  }
  
  static generateRemarks(quarterGrades: Map<string, number>): string {
    const grades = Array.from(quarterGrades.values()).filter(grade => grade > 0);
    
    if (grades.length === 0) return '';
    
    const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    
    if (average >= 90) return 'Excellent performance';
    if (average >= 85) return 'Very good performance';
    if (average >= 80) return 'Good performance';
    if (average >= 75) return 'Satisfactory performance';
    if (average >= 70) return 'Needs improvement';
    return 'Requires remedial classes';
  }
}

export default SF10NormalizedGenerator;
