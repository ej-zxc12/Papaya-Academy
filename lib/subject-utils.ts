import { getSubjectsForGrade, isSubjectValidForGrade, getSubjectName } from './grade-subjects-config';

// Utility functions for subject management across the application

/**
 * Validates if a subject belongs to a specific grade level
 * @param gradeLevel The grade level (e.g., 'Grade 1', 'Grade 2', 'Grade 3')
 * @param subjectName The name of the subject
 * @returns boolean indicating if the subject is valid for the grade
 */
export const validateSubjectForGrade = (gradeLevel: string, subjectName: string): boolean => {
  if (!gradeLevel || !subjectName) return false;
  
  const subjects = getSubjectsForGrade(gradeLevel);
  return subjects.some(subject => 
    subject.name.toLowerCase() === subjectName.toLowerCase() ||
    subject.code.toLowerCase() === subjectName.toLowerCase()
  );
};

/**
 * Gets all valid subjects for multiple grade levels
 * @param gradeLevels Array of grade levels
 * @returns Array of unique subject names across all specified grades
 */
export const getSubjectsForGrades = (gradeLevels: string[]): string[] => {
  const allSubjects = new Set<string>();
  
  gradeLevels.forEach(gradeLevel => {
    const subjects = getSubjectsForGrade(gradeLevel);
    subjects.forEach(subject => {
      allSubjects.add(subject.name);
    });
  });
  
  return Array.from(allSubjects);
};

/**
 * Formats subject name for display
 * @param gradeLevel The grade level
 * @param subjectCodeOrName Either the subject code or name
 * @returns Formatted subject name
 */
export const formatSubjectName = (gradeLevel: string, subjectCodeOrName: string): string => {
  if (!gradeLevel || !subjectCodeOrName) return subjectCodeOrName;
  
  // Try to get subject name by code first
  const nameByCode = getSubjectName(gradeLevel, subjectCodeOrName);
  if (nameByCode !== subjectCodeOrName) {
    return nameByCode;
  }
  
  // If it's already a name, return as-is
  const subjects = getSubjectsForGrade(gradeLevel);
  const subject = subjects.find(s => 
    s.name.toLowerCase() === subjectCodeOrName.toLowerCase()
  );
  
  return subject ? subject.name : subjectCodeOrName;
};

/**
 * Gets the subject code for a given subject name in a specific grade
 * @param gradeLevel The grade level
 * @param subjectName The subject name
 * @returns The subject code or the original name if not found
 */
export const getSubjectCode = (gradeLevel: string, subjectName: string): string => {
  const subjects = getSubjectsForGrade(gradeLevel);
  const subject = subjects.find(s => 
    s.name.toLowerCase() === subjectName.toLowerCase()
  );
  
  return subject ? subject.code : subjectName;
};

/**
 * Checks if a grade level uses the new subject structure (grades 1-3)
 * @param gradeLevel The grade level to check
 * @returns boolean indicating if the grade uses the new structure
 */
export const usesNewSubjectStructure = (gradeLevel: string): boolean => {
  return ['Grade 1', 'Grade 2', 'Grade 3'].includes(gradeLevel);
};

/**
 * Gets the default subjects for a grade level, with fallback for older grades
 * @param gradeLevel The grade level
 * @returns Array of subject names
 */
export const getDefaultSubjectsForGrade = (gradeLevel: string): string[] => {
  if (usesNewSubjectStructure(gradeLevel)) {
    return getSubjectsForGrade(gradeLevel).map(subject => subject.name);
  }
  
  // Default subjects for higher grades (4-6 and above)
  return [
    'Filipino',
    'English',
    'Mathematics',
    'Science',
    'GMRC (Good Manners and Right Conduct)',
    'Araling Panlipunan',
    'EPP',
    'MAPEH',
    'Music & Arts',
    'Physical Education & Health'
  ];
};
