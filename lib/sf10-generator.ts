import { StudentDocument, AcademicYearRecord, SF10Subject, SF10Record } from '@/types';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Automatic SF10 Generation Service
 * 
 * This service handles:
 * 1. Generating SF10 records from grade data
 * 2. Updating SF10 when grades change
 * 3. Calculating final ratings and general averages
 * 4. Determining student promotion status
 */

export class SF10Generator {
  
  /**
   * Generate or update SF10 record for a student
   */
  static async generateOrUpdateSF10(studentId: string, schoolYear: string): Promise<SF10Record> {
    try {
      console.log(`🔄 Generating SF10 for student ${studentId}, year ${schoolYear}`);
      
      // Get student document
      const studentRef = doc(db, 'students', studentId);
      const studentSnap = await getDoc(studentRef);
      
      if (!studentSnap.exists()) {
        throw new Error(`Student ${studentId} not found`);
      }
      
      const student = studentSnap.data() as StudentDocument;
      const yearRecord = student.academicRecords[schoolYear];
      
      if (!yearRecord) {
        throw new Error(`Academic record for ${schoolYear} not found`);
      }
      
      // Generate SF10 from grades
      const sf10Record = this.generateSF10FromGrades(yearRecord.grades, student, schoolYear);
      
      // Update student document with new SF10
      await updateDoc(studentRef, {
        [`academicRecords.${schoolYear}.sf10`]: sf10Record,
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ SF10 generated for student ${studentId}`);
      return sf10Record;
      
    } catch (error) {
      console.error(`❌ Error generating SF10 for student ${studentId}:`, error);
      throw error;
    }
  }
  
  /**
   * Generate SF10 record from grade data
   */
  static generateSF10FromGrades(
    grades: AcademicYearRecord['grades'], 
    student: StudentDocument, 
    schoolYear: string
  ): SF10Record {
    const yearRecord = student.academicRecords[schoolYear];
    
    // Get all unique subjects across all grading periods
    const allSubjects = new Set<string>();
    Object.values(grades).forEach(periodGrades => {
      Object.keys(periodGrades).forEach(subjectCode => allSubjects.add(subjectCode));
    });
    
    // Create SF10 subjects
    const subjects: SF10Subject[] = [];
    let totalFinalRatings = 0;
    let validSubjectCount = 0;
    
    allSubjects.forEach(subjectCode => {
      const subjectGrades = {
        first: grades.First?.[subjectCode],
        second: grades.Second?.[subjectCode],
        third: grades.Third?.[subjectCode],
        fourth: grades.Fourth?.[subjectCode]
      };
      
      const sf10Subject: SF10Subject = {
        subjectCode,
        subjectName: this.getSubjectName(subjectCode),
        firstGrading: subjectGrades.first?.grade || 0,
        secondGrading: subjectGrades.second?.grade || 0,
        thirdGrading: subjectGrades.third?.grade || 0,
        fourthGrading: subjectGrades.fourth?.grade || 0,
        finalRating: 0,
        remarks: this.generateRemarks(subjectGrades)
      };
      
      // Calculate final rating (average of all non-zero grades)
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
        totalFinalRatings += sf10Subject.finalRating;
        validSubjectCount++;
      }
      
      subjects.push(sf10Subject);
    });
    
    // Calculate general average
    const generalAverage = validSubjectCount > 0 
      ? Math.round(totalFinalRatings / validSubjectCount) 
      : 0;
    
    // Determine status based on general average and specific criteria
    const status = this.determineStudentStatus(generalAverage, subjects, yearRecord);
    
    return {
      id: `sf10-${student.id}-${schoolYear}`,
      studentId: student.id,
      lrn: student.lrn,
      studentName: this.formatStudentName(student),
      gradeLevel: yearRecord.gradeLevel,
      section: yearRecord.section,
      schoolYear,
      semester: 'First', // Can be updated based on current period
      subjects,
      generalAverage,
      status,
      adviserName: yearRecord.adviser,
      dateCompleted: new Date().toISOString()
    };
  }
  
  /**
   * Get subject name from subject code
   * This should be enhanced to fetch from subjects collection
   */
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
  
  /**
   * Generate remarks based on grade performance
   */
  static generateRemarks(subjectGrades: Record<string, { grade: number }>): string {
    const grades = Object.values(subjectGrades)
      .filter((g): g is { grade: number } => g && typeof g.grade === 'number')
      .map(g => g.grade);
    
    if (grades.length === 0) return '';
    
    const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    
    if (average >= 90) return 'Excellent performance';
    if (average >= 85) return 'Very good performance';
    if (average >= 80) return 'Good performance';
    if (average >= 75) return 'Satisfactory performance';
    if (average >= 70) return 'Needs improvement';
    return 'Requires remedial classes';
  }
  
  /**
   * Determine student status based on grades and other factors
   */
  static determineStudentStatus(
    generalAverage: number, 
    subjects: SF10Subject[], 
    yearRecord: AcademicYearRecord
  ): 'promoted' | 'retained' | 'dropped' {
    
    // Check if student has failing grades
    const failingSubjects = subjects.filter(subject => 
      subject.finalRating < 75 && subject.finalRating > 0
    );
    
    // Basic promotion criteria
    if (generalAverage >= 75 && failingSubjects.length <= 2) {
      return 'promoted';
    }
    
    // Retention criteria
    if (generalAverage < 75 || failingSubjects.length > 2) {
      return 'retained';
    }
    
    // Default to promoted if no clear reason for retention
    return 'promoted';
  }
  
  /**
   * Format student name properly
   */
  static formatStudentName(student: StudentDocument): string {
    const parts = [
      student.firstName,
      student.middleName,
      student.lastName
    ].filter(Boolean);
    
    let name = parts.join(' ');
    
    if (student.nameExtn) {
      name += ` ${student.nameExtn}`;
    }
    
    return name;
  }
  
  /**
   * Check if SF10 is complete for a grading period
   */
  static isGradingPeriodComplete(
    grades: AcademicYearRecord['grades'], 
    gradingPeriod: string,
    requiredSubjects: string[]
  ): boolean {
    const periodGrades = grades[gradingPeriod];
    if (!periodGrades) return false;
    
    return requiredSubjects.every(subjectCode => 
      periodGrades[subjectCode] && periodGrades[subjectCode].grade > 0
    );
  }
  
  /**
   * Get SF10 completion status
   */
  static getSF10CompletionStatus(yearRecord: AcademicYearRecord): {
    firstGrading: boolean;
    secondGrading: boolean;
    thirdGrading: boolean;
    fourthGrading: boolean;
    overall: boolean;
    completedSubjects: number;
    totalSubjects: number;
  } {
    const gradingPeriods = ['First', 'Second', 'Third', 'Fourth'];
    const allSubjects = new Set<string>();
    
    // Get all subjects
    gradingPeriods.forEach(period => {
      const periodGrades = yearRecord.grades[period];
      if (periodGrades) {
        Object.keys(periodGrades).forEach(subject => allSubjects.add(subject));
      }
    });
    
    const totalSubjects = allSubjects.size;
    const completion = {
      firstGrading: this.isGradingPeriodComplete(yearRecord.grades, 'First', Array.from(allSubjects)),
      secondGrading: this.isGradingPeriodComplete(yearRecord.grades, 'Second', Array.from(allSubjects)),
      thirdGrading: this.isGradingPeriodComplete(yearRecord.grades, 'Third', Array.from(allSubjects)),
      fourthGrading: this.isGradingPeriodComplete(yearRecord.grades, 'Fourth', Array.from(allSubjects)),
      overall: false,
      completedSubjects: 0,
      totalSubjects
    };
    
    completion.overall = gradingPeriods.every(period => {
      const key = period.toLowerCase() + 'Grading' as keyof typeof completion;
      return completion[key];
    });
    completion.completedSubjects = gradingPeriods.filter(period => {
      const key = period.toLowerCase() + 'Grading' as keyof typeof completion;
      return completion[key];
    }).length;
    
    return completion;
  }
}

export default SF10Generator;
