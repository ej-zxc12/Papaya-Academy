import { Grade, SF10, SF10Subject, StudentDocument } from '@/types';
import { doc, getDoc, collection, getDocs, query, where, addDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import GradeService from './grade-service';

// Cache for subject names to avoid repeated Firestore lookups
const subjectNameCache = new Map<string, string>();

export class SF10NormalizedGenerator {
  
  static async generateSF10(studentId: string, schoolYear: string): Promise<SF10> {
    try {
      console.log(`Generating SF10 for student ${studentId}, year ${schoolYear}`);
      
      const studentDoc = await getDoc(doc(db, 'students', studentId));
      if (!studentDoc.exists()) {
        throw new Error(`Student ${studentId} not found`);
      }
      
      const student = studentDoc.data() as StudentDocument;
      
      // Get all academic records to find all school years for this student
      const academicRecords = student.academicRecords || {};
      const schoolYears = Object.keys(academicRecords).sort();
      
      console.log(`Found school years for student: ${schoolYears.join(', ')}`);
      
      // If we are generating for a specific year, we should still ensure we have all data
      const yearRecord = academicRecords[schoolYear];
      const gradeLevel = yearRecord?.gradeLevel || student.currentGradeLevel || 'Unknown';
      
      // Fetch grades filtered by grade level and school year
      const gradesMap = await GradeService.getGradesForSF10(studentId, schoolYear);
      
      // Determine the correct grade level and section from the actual grades found
      let effectiveGradeLevel = gradeLevel;
      let effectiveSection = student.currentSection || 'Default';
      
      const rawGrades = await GradeService.getGradesByStudent(studentId, schoolYear);
      if (rawGrades.length > 0) {
        effectiveGradeLevel = rawGrades[0].gradeLevel || effectiveGradeLevel;
        effectiveSection = rawGrades[0].section || effectiveSection;
      }

      const subjects = await this.generateSF10Subjects(gradesMap);
      const generalAverage = this.calculateGeneralAverage(subjects);
      const attendance = await this.getAttendanceData(studentId, schoolYear);
      
      const sf10Record: SF10 = {
        id: `sf10-${studentId}-${schoolYear}`,
        studentId,
        lrn: student.lrn || '',
        studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim() || `Student ${studentId}`,
        schoolYear,
        gradeLevel: effectiveGradeLevel,
        section: effectiveSection,
        semester: 'First Semester', // Default value
        subjects,
        generalAverage,
        status: generalAverage >= 75 ? 'promoted' : 'retained',
        adviserName: 'Not Assigned', // This should come from teacher data
        dateCompleted: new Date().toISOString().split('T')[0],
        attendance,
        generatedAt: new Date().toISOString()
      };
      
      // Check if SF10 already exists for this student and school year
      const existingSF10Query = query(
        collection(db, 'sf10'),
        where('studentId', '==', studentId),
        where('schoolYear', '==', schoolYear)
      );
      const existingSnapshot = await getDocs(existingSF10Query);
      
      let sf10Id: string;
      
      if (!existingSnapshot.empty) {
        // Update existing SF10
        const existingDoc = existingSnapshot.docs[0];
        sf10Id = existingDoc.id;
        await updateDoc(doc(db, 'sf10', sf10Id), {
          ...sf10Record,
          id: sf10Id,
          updatedAt: new Date().toISOString()
        });
        console.log(`SF10 updated for student ${studentId}, year ${schoolYear}`);
      } else {
        // Create new SF10
        const sf10Ref = await addDoc(collection(db, 'sf10'), sf10Record);
        sf10Id = sf10Ref.id;
        console.log(`SF10 created for student ${studentId}, year ${schoolYear}`);
      }
      
      // Also update student's academic record with this SF10 data
      // This is needed for the cumulative SF10 to work properly
      await updateDoc(doc(db, 'students', studentId), {
        [`academicRecords.${schoolYear}.sf10`]: {
          ...sf10Record,
          id: sf10Id
        },
        [`academicRecords.${schoolYear}.gradeLevel`]: effectiveGradeLevel,
        [`academicRecords.${schoolYear}.section`]: effectiveSection,
        updatedAt: new Date().toISOString()
      });
      
      return sf10Record;
      
    } catch (error) {
      console.error(`Error generating SF10 for student ${studentId}:`, error);
      throw error;
    }
  }

  /**
   * Generate a cumulative SF10 that combines grades from ALL school years
   * This creates a single SF10 record with all subjects from all years
   */
  static async generateCumulativeSF10(studentId: string): Promise<SF10 & { schoolYears: string[] }> {
    try {
      console.log(`Generating cumulative SF10 for student ${studentId}`);
      
      const studentDoc = await getDoc(doc(db, 'students', studentId));
      if (!studentDoc.exists()) {
        throw new Error(`Student ${studentId} not found`);
      }
      
      const student = studentDoc.data() as StudentDocument;
      const academicRecords = student.academicRecords || {};
      
      // Get all school years from academic records
      const schoolYears = Object.keys(academicRecords).sort();
      
      if (schoolYears.length === 0) {
        throw new Error(`No academic records found for student ${studentId}`);
      }
      
      console.log(`Found school years: ${schoolYears.join(', ')}`);
      
      // Collect all grades from all years
      const allSubjectsMap = new Map<string, Map<string, number>>();
      const schoolYearBySubject = new Map<string, string>(); // Track which year each subject came from
      let combinedGradeLevel = '';
      let combinedSection = '';
      
      for (const year of schoolYears) {
        const yearRecord = academicRecords[year];
        const gradeLevel = yearRecord?.gradeLevel || student.currentGradeLevel || 'Unknown';
        const section = yearRecord?.section || student.currentSection || 'Default';
        
        // Build combined grade level and section info
        if (!combinedGradeLevel) {
          combinedGradeLevel = gradeLevel;
          combinedSection = section;
        }
        
        // Get grades for this year
        const gradesMap = await GradeService.getGradesForSF10(studentId, year, gradeLevel);
        
        // Merge into allSubjectsMap, using year suffix to differentiate same subjects
        const entries = Array.from(gradesMap.entries());
        for (const [subjectId, quarterGrades] of entries) {
          // Create unique subject key with year suffix
          const uniqueSubjectKey = `${subjectId}__${year}`;
          allSubjectsMap.set(uniqueSubjectKey, quarterGrades);
          schoolYearBySubject.set(uniqueSubjectKey, year);
        }
        
        console.log(`Added ${gradesMap.size} subjects from ${year}`);
      }
      
      // Generate subjects with year information
      const subjects = await this.generateCumulativeSF10Subjects(allSubjectsMap, schoolYearBySubject);
      const generalAverage = this.calculateGeneralAverage(subjects);
      
      // Combine school years into a range
      const combinedSchoolYear = schoolYears.length > 1 
        ? `${schoolYears[0]} to ${schoolYears[schoolYears.length - 1]}`
        : schoolYears[0];
      
      const sf10Record: SF10 & { schoolYears: string[] } = {
        id: `sf10-${studentId}-cumulative`,
        studentId,
        lrn: student.lrn || '',
        studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim() || `Student ${studentId}`,
        schoolYear: combinedSchoolYear,
        gradeLevel: combinedGradeLevel,
        section: combinedSection,
        semester: 'All Semesters',
        subjects: subjects as SF10Subject[],
        generalAverage,
        status: (generalAverage >= 75 ? 'promoted' : 'retained') as 'promoted' | 'retained',
        adviserName: 'Not Assigned',
        dateCompleted: new Date().toISOString().split('T')[0],
        attendance: { daysPresent: 0, daysAbsent: 0, daysTardy: 0 }, // Cumulative - no single attendance
        generatedAt: new Date().toISOString(),
        schoolYears // Include all years for reference
      };
      
      console.log(`Cumulative SF10 generated with ${subjects.length} subjects`);
      
      return sf10Record;
      
    } catch (error) {
      console.error(`Error generating cumulative SF10 for student ${studentId}:`, error);
      throw error;
    }
  }

  /**
   * Generate SF10 subjects for cumulative view with year information
   */
  static async generateCumulativeSF10Subjects(
    gradesMap: Map<string, Map<string, number>>, 
    schoolYearBySubject: Map<string, string>
  ): Promise<(SF10Subject & { schoolYear: string })[]> {
    const subjects: (SF10Subject & { schoolYear: string })[] = [];
    
    const subjectPromises = Array.from(gradesMap.entries()).map(async ([uniqueKey, quarterGrades]) => {
      // Extract subjectId and year from unique key
      const [subjectId, year] = uniqueKey.split('__');
      const subjectName = await this.getSubjectName(subjectId);
      
      const sf10Subject: SF10Subject & { schoolYear: string } = {
        subjectCode: subjectId,
        subjectName: `${subjectName} (${year})`, // Add year to subject name
        firstGrading: quarterGrades.get('Q1') || 0,
        secondGrading: quarterGrades.get('Q2') || 0,
        thirdGrading: quarterGrades.get('Q3') || 0,
        fourthGrading: quarterGrades.get('Q4') || 0,
        finalRating: 0,
        remarks: this.generateRemarks(quarterGrades),
        schoolYear: year
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
      
      return sf10Subject;
    });
    
    return await Promise.all(subjectPromises);
  }
  
  static async generateSF10Subjects(gradesMap: Map<string, Map<string, number>>): Promise<SF10Subject[]> {
    const subjects: SF10Subject[] = [];
    
    // Process each subject asynchronously to fetch names
    const subjectPromises = Array.from(gradesMap.entries()).map(async ([subjectId, quarterGrades]) => {
      const subjectName = await this.getSubjectName(subjectId);
      const sf10Subject: SF10Subject = {
        subjectCode: subjectId,
        subjectName: subjectName,
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
      
      return sf10Subject;
    });
    
    return await Promise.all(subjectPromises);
  }
  
  static calculateGeneralAverage(subjects: SF10Subject[]): number {
    const validSubjects = subjects.filter(subject => subject.finalRating > 0);
    
    if (validSubjects.length === 0) return 0;
    
    const total = validSubjects.reduce((sum, subject) => sum + subject.finalRating, 0);
    return Math.round(total / validSubjects.length);
  }

  /**
   * Generate SF10 data grouped by school year for two-column form view
   * Returns an array of year data, each with its own grade level, section, and subjects
   */
  static async generateSF10ByYear(studentId: string): Promise<Array<{
    schoolYear: string;
    gradeLevel: string;
    section: string;
    subjects: SF10Subject[];
    generalAverage: number;
  }>> {
    try {
      console.log(`Generating SF10 data by year for student ${studentId}`);
      
      const studentDoc = await getDoc(doc(db, 'students', studentId));
      if (!studentDoc.exists()) {
        throw new Error(`Student ${studentId} not found`);
      }
      
      const student = studentDoc.data() as StudentDocument;
      const academicRecords = student.academicRecords || {};
      
      // Get all school years from academic records
      const schoolYears = Object.keys(academicRecords).sort();
      
      if (schoolYears.length === 0) {
        throw new Error(`No academic records found for student ${studentId}`);
      }
      
      console.log(`Found school years: ${schoolYears.join(', ')}`);
      
      // Generate data for each school year
      const yearDataPromises = schoolYears.map(async (year) => {
        const yearRecord = academicRecords[year];
        
        // Get ALL grades for this specific year
        const rawGrades = await GradeService.getGradesByStudent(studentId, year);
        
        // Detect the grade level and section from the grades collection for this year
        // This ensures if a grade was saved as "Grade 1" and section "Alon", it shows as "Grade 1" and "Alon"
        let detectedGradeLevel = yearRecord?.gradeLevel;
        let detectedSection = yearRecord?.section;
        
        if (rawGrades.length > 0) {
          // Use the grade level and section from the actual grade entries as the source of truth
          detectedGradeLevel = rawGrades[0].gradeLevel;
          detectedSection = rawGrades[0].section;
        }
        
        const gradeLevel = detectedGradeLevel || student.currentGradeLevel || 'Unknown';
        const section = detectedSection || student.currentSection || 'Default';
        
        // Convert raw grades to the Map format expected by generateSF10Subjects
        const gradesMap = new Map<string, Map<string, number>>();
        rawGrades.forEach(grade => {
          if (!gradesMap.has(grade.subjectId)) {
            gradesMap.set(grade.subjectId, new Map());
          }
          gradesMap.get(grade.subjectId)!.set(grade.quarter, grade.grade);
        });
        
        // Generate subjects for this year
        const subjects = await this.generateSF10Subjects(gradesMap);
        const generalAverage = this.calculateGeneralAverage(subjects);
        
        console.log(`Year ${year}: ${subjects.length} subjects, Grade ${gradeLevel}, Section ${section}`);
        
        return {
          schoolYear: year,
          gradeLevel,
          section,
          subjects,
          generalAverage
        };
      });
      
      const yearData = await Promise.all(yearDataPromises);
      
      console.log(`Generated SF10 data for ${yearData.length} school years`);
      
      return yearData;
      
    } catch (error) {
      console.error(`Error generating SF10 by year for student ${studentId}:`, error);
      throw error;
    }
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
  
  static async getSubjectName(subjectCode: string): Promise<string> {
    // Check cache first
    if (subjectNameCache.has(subjectCode)) {
      return subjectNameCache.get(subjectCode)!;
    }
    
    // Hardcoded mappings for common secondary subjects
    const subjectMapping: Record<string, string> = {
      'MATH7': 'Mathematics 7',
      'ENG7': 'English 7',
      'SCI7': 'Science 7',
      'FIL7': 'Filipino 7',
      'HELE7': 'HELE 7',
      'MSEP7': 'Music, Arts & PE 7',
      'EPP7': 'EPP 7',
      'CLE7': 'Christian Living Education 7',
      'COMP7': 'Computer 7',
      'MATH': 'Mathematics',
      'ENG': 'English',
      'SCI': 'Science',
      'FIL': 'Filipino',
      'GMRC': 'Good Manners and Right Conduct'
    };
    
    // Check hardcoded mapping
    if (subjectMapping[subjectCode]) {
      subjectNameCache.set(subjectCode, subjectMapping[subjectCode]);
      return subjectMapping[subjectCode];
    }
    
    // If not in mapping, try to fetch from Firestore
    try {
      const subjectDoc = await getDoc(doc(db, 'subjects', subjectCode));
      if (subjectDoc.exists()) {
        const subjectData = subjectDoc.data();
        const name = subjectData.name || subjectData.code || subjectCode;
        subjectNameCache.set(subjectCode, name);
        return name;
      }
    } catch (error) {
      console.warn(`Failed to fetch subject name for ${subjectCode}:`, error);
    }
    
    // Fallback: return the code itself
    return subjectCode;
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
