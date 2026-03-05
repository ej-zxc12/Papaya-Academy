import { StudentDocument, SF10Record, AcademicYearRecord } from '@/types';

/**
 * Desktop SF10 Adapter
 * 
 * This adapter helps the desktop component work with the new hybrid student structure
 * by providing backward-compatible interfaces and data transformation utilities.
 */

export interface DesktopStudent {
  id: string;
  lrn: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  nameExtn?: string;
  currentGradeLevel: string;
  currentSection: string;
  status: string;
}

export interface DesktopSF10Record {
  id: string;
  studentId: string;
  lrn: string;
  studentName: string;
  gradeLevel: string;
  section: string;
  schoolYear: string;
  semester: string;
  subjects: Array<{
    subjectCode: string;
    subjectName: string;
    firstGrading: number;
    secondGrading: number;
    thirdGrading: number;
    fourthGrading: number;
    finalRating: number;
    remarks: string;
  }>;
  generalAverage: number;
  status: 'promoted' | 'retained' | 'transferred' | 'dropped';
  adviserName: string;
  dateCompleted: string;
}

export class DesktopSF10Adapter {
  
  /**
   * Transform student document to desktop-compatible format
   */
  static transformStudentToDesktop(student: StudentDocument): DesktopStudent {
    return {
      id: student.id,
      lrn: student.lrn,
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      nameExtn: student.nameExtn,
      currentGradeLevel: student.currentGradeLevel,
      currentSection: student.currentSection,
      status: student.status
    };
  }
  
  /**
   * Transform SF10 record to desktop-compatible format
   */
  static transformSF10ToDesktop(sf10: SF10Record): DesktopSF10Record {
    return {
      id: sf10.id,
      studentId: sf10.studentId,
      lrn: sf10.lrn,
      studentName: sf10.studentName,
      gradeLevel: sf10.gradeLevel,
      section: sf10.section,
      schoolYear: sf10.schoolYear,
      semester: sf10.semester,
      subjects: sf10.subjects.map(subject => ({
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        firstGrading: subject.firstGrading,
        secondGrading: subject.secondGrading,
        thirdGrading: subject.thirdGrading,
        fourthGrading: subject.fourthGrading,
        finalRating: subject.finalRating,
        remarks: subject.remarks
      })),
      generalAverage: sf10.generalAverage,
      status: sf10.status,
      adviserName: sf10.adviserName,
      dateCompleted: sf10.dateCompleted
    };
  }
  
  /**
   * Get students with SF10 records for desktop display
   */
  static async getStudentsWithSF10(
    schoolYear: string = '2024-2025',
    gradeLevel?: string,
    section?: string
  ): Promise<Array<{ student: DesktopStudent; sf10: DesktopSF10Record | null }>> {
    try {
      // This would typically make an API call to your new SF10 endpoint
      const response = await fetch(`/api/teacher/sf10?schoolYear=${schoolYear}${gradeLevel ? `&gradeLevel=${gradeLevel}` : ''}${section ? `&section=${section}` : ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch SF10 records');
      }
      
      const data = await response.json();
      
      return data.sf10Records.map((record: any) => ({
        student: this.transformStudentToDesktop({
          id: record.student.id,
          lrn: record.student.lrn,
          firstName: record.student.name.split(' ')[0],
          lastName: record.student.name.split(' ').slice(-1)[0],
          middleName: record.student.name.split(' ').slice(1, -1).join(' '),
          currentGradeLevel: record.student.gradeLevel,
          currentSection: record.student.section,
          status: 'enrolled',
          academicRecords: {},
          createdAt: '',
          updatedAt: ''
        } as StudentDocument),
        sf10: record.sf10 ? this.transformSF10ToDesktop(record.sf10) : null
      }));
      
    } catch (error) {
      console.error('Error fetching students with SF10:', error);
      throw error;
    }
  }
  
  /**
   * Get SF10 record for a specific student
   */
  static async getStudentSF10(studentId: string, schoolYear: string = '2024-2025'): Promise<DesktopSF10Record | null> {
    try {
      const response = await fetch(`/api/teacher/sf10?studentId=${studentId}&schoolYear=${schoolYear}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // SF10 not found
        }
        throw new Error('Failed to fetch SF10 record');
      }
      
      const data = await response.json();
      return this.transformSF10ToDesktop(data.sf10);
      
    } catch (error) {
      console.error('Error fetching student SF10:', error);
      throw error;
    }
  }
  
  /**
   * Generate SF10 for a student (desktop trigger)
   */
  static async generateSF10(studentId: string, schoolYear: string = '2024-2025'): Promise<DesktopSF10Record> {
    try {
      const response = await fetch('/api/teacher/sf10', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, schoolYear })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate SF10');
      }
      
      const data = await response.json();
      return this.transformSF10ToDesktop(data.sf10);
      
    } catch (error) {
      console.error('Error generating SF10:', error);
      throw error;
    }
  }
  
  /**
   * Get SF10 statistics for dashboard
   */
  static async getSF10Statistics(schoolYear: string = '2024-2025') {
    try {
      const response = await fetch(`/api/teacher/sf10?schoolYear=${schoolYear}`, {
        method: 'PATCH'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch SF10 statistics');
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Error fetching SF10 statistics:', error);
      throw error;
    }
  }
  
  /**
   * Format student name for display
   */
  static formatStudentName(student: DesktopStudent): string {
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
   * Check if SF10 is complete
   */
  static isSF10Complete(sf10: DesktopSF10Record): boolean {
    return sf10.subjects.every(subject => 
      subject.firstGrading > 0 && 
      subject.secondGrading > 0 && 
      subject.thirdGrading > 0 && 
      subject.fourthGrading > 0
    );
  }
  
  /**
   * Get SF10 completion percentage
   */
  static getSF10CompletionPercentage(sf10: DesktopSF10Record): number {
    if (sf10.subjects.length === 0) return 0;
    
    const totalGrades = sf10.subjects.length * 4; // 4 grading periods per subject
    const completedGrades = sf10.subjects.reduce((count, subject) => {
      return count + [
        subject.firstGrading,
        subject.secondGrading,
        subject.thirdGrading,
        subject.fourthGrading
      ].filter(grade => grade > 0).length;
    }, 0);
    
    return Math.round((completedGrades / totalGrades) * 100);
  }
  
  /**
   * Get grading period completion status
   */
  static getGradingPeriodStatus(sf10: DesktopSF10Record): {
    first: boolean;
    second: boolean;
    third: boolean;
    fourth: boolean;
  } {
    return {
      first: sf10.subjects.every(subject => subject.firstGrading > 0),
      second: sf10.subjects.every(subject => subject.secondGrading > 0),
      third: sf10.subjects.every(subject => subject.thirdGrading > 0),
      fourth: sf10.subjects.every(subject => subject.fourthGrading > 0)
    };
  }
  
  /**
   * Export SF10 data for printing/download
   */
  static exportSF10Data(sf10: DesktopSF10Record): string {
    return JSON.stringify({
      student: {
        id: sf10.studentId,
        lrn: sf10.lrn,
        name: sf10.studentName,
        gradeLevel: sf10.gradeLevel,
        section: sf10.section
      },
      sf10: sf10,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
  
  /**
   * Validate SF10 data integrity
   */
  static validateSF10(sf10: DesktopSF10Record): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Check required fields
    if (!sf10.studentId) errors.push('Student ID is required');
    if (!sf10.lrn) errors.push('LRN is required');
    if (!sf10.studentName) errors.push('Student name is required');
    if (!sf10.gradeLevel) errors.push('Grade level is required');
    if (!sf10.section) errors.push('Section is required');
    
    // Check subjects
    if (sf10.subjects.length === 0) {
      errors.push('At least one subject is required');
    } else {
      sf10.subjects.forEach((subject, index) => {
        if (!subject.subjectCode) errors.push(`Subject ${index + 1}: Code is required`);
        if (!subject.subjectName) errors.push(`Subject ${index + 1}: Name is required`);
        
        // Check grade ranges
        [subject.firstGrading, subject.secondGrading, subject.thirdGrading, subject.fourthGrading].forEach((grade, gradeIndex) => {
          if (grade < 0 || grade > 100) {
            const periodNames = ['First', 'Second', 'Third', 'Fourth'];
            errors.push(`Subject ${index + 1}: ${periodNames[gradeIndex]} grading grade must be between 0 and 100`);
          }
        });
      });
    }
    
    // Check general average
    if (sf10.generalAverage < 0 || sf10.generalAverage > 100) {
      errors.push('General average must be between 0 and 100');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default DesktopSF10Adapter;
