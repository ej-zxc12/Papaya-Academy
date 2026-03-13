import { Grade, Student, Subject, SF10Subject } from '@/types';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import GradeService from './grade-service';

export interface ReportCard {
  student: {
    id: string;
    name: string;
    gradeLevel: string;
    section: string;
  };
  schoolYear: string;
  subjects: ReportCardSubject[];
  generalAverage: number;
  attendance: {
    daysPresent: number;
    daysAbsent: number;
    daysTardy: number;
  };
  conduct: string;
  teacherRemarks: string;
}

export interface ReportCardSubject {
  subjectCode: string;
  subjectName: string;
  quarters: {
    Q1: number;
    Q2: number;
    Q3: number;
    Q4: number;
  };
  finalRating: number;
  remarks: string;
}

export class ReportCardService {
  
  static async generateReportCard(
    studentId: string,
    schoolYear: string = '2024-2025'
  ): Promise<ReportCard> {
    try {
      console.log(`Generating report card for student ${studentId}, year ${schoolYear}`);
      
      const studentDoc = await getDoc(doc(db, 'students', studentId));
      if (!studentDoc.exists()) {
        throw new Error(`Student ${studentId} not found`);
      }
      
      const student = studentDoc.data() as any;
      const grades = await GradeService.getGradesByStudent(studentId, schoolYear);
      const subjectsMap = this.groupGradesBySubject(grades);
      const subjects = await this.generateReportCardSubjects(subjectsMap);
      const generalAverage = this.calculateGeneralAverage(subjects);
      const attendance = await this.getAttendanceData(studentId, schoolYear);
      
      const reportCard: ReportCard = {
        student: {
          id: studentId,
          name: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
          gradeLevel: student.gradeLevel || student.currentGradeLevel || 'Unknown',
          section: student.section || student.currentSection || 'Default'
        },
        schoolYear,
        subjects,
        generalAverage,
        attendance,
        conduct: 'Good',
        teacherRemarks: 'Student shows satisfactory progress'
      };
      
      console.log(`Report card generated for student ${studentId}`);
      return reportCard;
      
    } catch (error) {
      console.error(`Error generating report card for student ${studentId}:`, error);
      throw error;
    }
  }
  
  private static groupGradesBySubject(grades: Grade[]): Map<string, Grade[]> {
    const subjectsMap = new Map<string, Grade[]>();
    
    grades.forEach(grade => {
      if (!subjectsMap.has(grade.subjectId)) {
        subjectsMap.set(grade.subjectId, []);
      }
      subjectsMap.get(grade.subjectId)!.push(grade);
    });
    
    return subjectsMap;
  }
  
  private static async generateReportCardSubjects(
    subjectsMap: Map<string, Grade[]>
  ): Promise<ReportCardSubject[]> {
    const subjects: ReportCardSubject[] = [];
    
    const subjectEntries = Array.from(subjectsMap.entries());
    
    for (const [subjectId, subjectGrades] of subjectEntries) {
      const quarters = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
      
      subjectGrades.forEach((grade: Grade) => {
        (quarters as any)[grade.quarter] = grade.grade;
      });
      
      const reportCardSubject: ReportCardSubject = {
        subjectCode: subjectId,
        subjectName: await this.getSubjectName(subjectId),
        quarters,
        finalRating: this.calculateFinalRating(quarters),
        remarks: this.generateSubjectRemarks(quarters)
      };
      
      subjects.push(reportCardSubject);
    }
    
    return subjects;
  }
  
  private static calculateFinalRating(quarters: {
    Q1: number;
    Q2: number;
    Q3: number;
    Q4: number;
  }): number {
    const validGrades = Object.values(quarters).filter(grade => grade > 0);
    
    if (validGrades.length === 0) return 0;
    
    const total = validGrades.reduce((sum, grade) => sum + grade, 0);
    return Math.round(total / validGrades.length);
  }
  
  private static calculateGeneralAverage(subjects: ReportCardSubject[]): number {
    const validSubjects = subjects.filter(subject => subject.finalRating > 0);
    
    if (validSubjects.length === 0) return 0;
    
    const total = validSubjects.reduce((sum, subject) => sum + subject.finalRating, 0);
    return Math.round(total / validSubjects.length);
  }
  
  private static async getSubjectName(subjectCode: string): Promise<string> {
    try {
      const subjectDoc = await getDoc(doc(db, 'subjects', subjectCode));
      if (subjectDoc.exists()) {
        const subject = subjectDoc.data();
        return subject.name || subjectCode;
      }
    } catch (error) {
      console.error('Error fetching subject name:', error);
    }
    
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
  
  private static generateSubjectRemarks(quarters: {
    Q1: number;
    Q2: number;
    Q3: number;
    Q4: number;
  }): string {
    const grades = Object.values(quarters).filter(grade => grade > 0);
    
    if (grades.length === 0) return '';
    
    const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    
    if (average >= 90) return 'Excellent performance';
    if (average >= 85) return 'Very good performance';
    if (average >= 80) return 'Good performance';
    if (average >= 75) return 'Satisfactory performance';
    if (average >= 70) return 'Needs improvement';
    return 'Requires remedial classes';
  }
  
  private static async getAttendanceData(studentId: string, schoolYear: string): Promise<{
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
}

export default ReportCardService;
