// Grade-specific subjects configuration for Papaya Academy
export interface GradeSubjects {
  gradeLevel: string;
  subjects: {
    name: string;
    code: string;
  }[];
}

export const gradeSubjectsConfig: GradeSubjects[] = [
  {
    gradeLevel: 'Grade 1',
    subjects: [
      { name: 'Language', code: 'LANG1' },
      { name: 'Reading and Literacy', code: 'READ1' },
      { name: 'Mathematics', code: 'MATH1' },
      { name: 'GMRC (Good Manners and Right Conduct)', code: 'GMRC1' },
      { name: 'Makabansa', code: 'MAKAB1' }
    ]
  },
  {
    gradeLevel: 'Grade 2',
    subjects: [
      { name: 'Language', code: 'LANG2' },
      { name: 'Filipino', code: 'FIL2' },
      { name: 'Mathematics', code: 'MATH2' },
      { name: 'GMRC (Good Manners and Right Conduct)', code: 'GMRC2' },
      { name: 'Makabansa', code: 'MAKAB2' }
    ]
  },
  {
    gradeLevel: 'Grade 3',
    subjects: [
      { name: 'Language', code: 'LANG3' },
      { name: 'Filipino', code: 'FIL3' },
      { name: 'Mathematics', code: 'MATH3' },
      { name: 'GMRC (Good Manners and Right Conduct)', code: 'GMRC3' },
      { name: 'Science', code: 'SCI3' },
      { name: 'Makabansa', code: 'MAKAB3' }
    ]
  }
];

// Helper functions to get subjects for a specific grade
export const getSubjectsForGrade = (gradeLevel: string): GradeSubjects['subjects'] => {
  const gradeConfig = gradeSubjectsConfig.find(config => config.gradeLevel === gradeLevel);
  return gradeConfig?.subjects || [];
};

// Helper function to get subject name by code and grade
export const getSubjectName = (gradeLevel: string, subjectCode: string): string => {
  const subjects = getSubjectsForGrade(gradeLevel);
  const subject = subjects.find(s => s.code === subjectCode);
  return subject?.name || subjectCode;
};

// Helper function to get all available grade levels
export const getAvailableGradeLevels = (): string[] => {
  return gradeSubjectsConfig.map(config => config.gradeLevel);
};

// Helper function to check if a subject exists in a grade
export const isSubjectValidForGrade = (gradeLevel: string, subjectCode: string): boolean => {
  const subjects = getSubjectsForGrade(gradeLevel);
  return subjects.some(s => s.code === subjectCode);
};
