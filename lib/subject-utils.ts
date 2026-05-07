import { getSubjectsForGrade, isSubjectValidForGrade, getSubjectName, getSubjectOrderForGrade, grades4To6SubjectOrder } from './grade-subjects-config';

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

/**
 * Official DepEd subject order for Grades 4-6 report cards (re-exported from grade-subjects-config)
 */
export const officialSubjectOrder = grades4To6SubjectOrder;

/**
 * Helper to get the index of a subject in the order array
 * Uses flexible matching to handle variations like "GMRC" vs "GMRC (Good Manners and Right Conduct)"
 */
function getSubjectIndexInOrder(subjectName: string, orderArray: string[]): number {
  const normalizedName = subjectName.toLowerCase().trim();

  // First try exact match
  const exactIndex = orderArray.findIndex(
    s => s.toLowerCase() === normalizedName
  );
  if (exactIndex !== -1) return exactIndex;

  // Try partial match - check if the official subject contains the input or vice versa
  for (let i = 0; i < orderArray.length; i++) {
    const official = orderArray[i].toLowerCase();
    // Check if official contains the subject name (e.g., "GMRC" matches "GMRC (Good Manners...)")
    if (official.includes(normalizedName) || normalizedName.includes(official)) {
      return i;
    }
  }

  return -1;
}

/**
 * Sorts subjects according to the official DepEd order for report cards
 * Supports grade-specific ordering for Grades 1-3 and 4-6
 * @param subjects Array of subject objects with a name or learningArea property
 * @param gradeLevel Optional grade level for grade-specific sorting (e.g., 'Grade 1', 'Grade 4')
 * @returns Sorted array
 */
/**
 * Normalizes subject names to standard conventions
 * Handles common variations like 'math' → 'Mathematics'
 * @param subjectName The input subject name
 * @returns Normalized subject name
 */
export const normalizeSubjectName = (subjectName: string): string => {
  if (!subjectName || typeof subjectName !== 'string') return subjectName;
  
  const trimmed = subjectName.trim().toLowerCase();
  
  // Common subject name variations mapping
  const subjectMappings: Record<string, string> = {
    // Mathematics variations
    'math': 'Mathematics',
    'maths': 'Mathematics',
    'matematika': 'Mathematics',
    
    // Language/English variations
    'english': 'English',
    'lang': 'Language',
    'language arts': 'Language',
    
    // Science variations
    'sci': 'Science',
    
    // Filipino variations
    'fil': 'Filipino',
    'pilipino': 'Filipino',
    
    // GMRC variations
    'gmrc': 'GMRC (Good Manners and Right Conduct)',
    'good manners': 'GMRC (Good Manners and Right Conduct)',
    'good manners and right conduct': 'GMRC (Good Manners and Right Conduct)',
    
    // Araling Panlipunan variations
    'ap': 'Araling Panlipunan',
    'araling panlipunan': 'Araling Panlipunan',
    'social studies': 'Araling Panlipunan',
    
    // EPP variations
    'epp': 'EPP',
    'edukasyong pantahanan at pangkabuhayan': 'EPP',
    
    // MAPEH variations
    'mapeh': 'MAPEH',
    'music arts pe health': 'MAPEH',
    
    // ESP variations
    'esp': 'Edukasyon sa Pagpapakatao',
    'edukasyon sa pagpapakatao': 'Edukasyon sa Pagpapakatao',
    
    // Makabansa variations
    'makabansa': 'Makabansa',
    
    // Reading and Literacy variations
    'reading': 'Reading and Literacy',
    'literacy': 'Reading and Literacy',
    'reading and literacy': 'Reading and Literacy',
  };
  
  // First check exact matches
  if (subjectMappings[trimmed]) {
    return subjectMappings[trimmed];
  }
  
  // Check partial matches for longer variations
  for (const [key, value] of Object.entries(subjectMappings)) {
    if (trimmed.includes(key) || key.includes(trimmed)) {
      return value;
    }
  }
  
  // If no mapping found, return original with proper capitalization
  return subjectName.charAt(0).toUpperCase() + subjectName.slice(1).toLowerCase();
};

/**
 * Validates and normalizes a subject for a specific grade level
 * @param gradeLevel The grade level
 * @param subjectName The subject name to validate
 * @returns Object with normalized name and validation result
 */
export const validateAndNormalizeSubject = (gradeLevel: string, subjectName: string): {
  normalizedName: string;
  isValid: boolean;
  isRecommended: boolean;
  suggestedCode?: string;
} => {
  const normalizedName = normalizeSubjectName(subjectName);
  
  // Check if it's a recommended subject for grades 1-3
  if (usesNewSubjectStructure(gradeLevel)) {
    const recommendedSubjects = getSubjectsForGrade(gradeLevel);
    const recommendedSubject = recommendedSubjects.find(s => 
      s.name.toLowerCase() === normalizedName.toLowerCase()
    );
    
    return {
      normalizedName,
      isValid: true, // Allow any subject but flag if not recommended
      isRecommended: !!recommendedSubject,
      suggestedCode: recommendedSubject?.code
    };
  }
  
  // For grades 4-6, check against standard subject list
  const standardSubjects = getDefaultSubjectsForGrade(gradeLevel);
  const isStandard = standardSubjects.some(s => 
    s.toLowerCase() === normalizedName.toLowerCase()
  );
  
  return {
    normalizedName,
    isValid: true,
    isRecommended: isStandard
  };
};

export function sortSubjectsByOrder<T extends { name?: string; learningArea?: string }>(
  subjects: T[],
  gradeLevel?: string
): T[] {
  // Get the appropriate subject order for the grade level
  const subjectOrder = gradeLevel ? getSubjectOrderForGrade(gradeLevel) : grades4To6SubjectOrder;
  const orderArray = subjectOrder || grades4To6SubjectOrder;

  return [...subjects].sort((a, b) => {
    const nameA = a.learningArea || a.name || '';
    const nameB = b.learningArea || b.name || '';

    const indexA = getSubjectIndexInOrder(nameA, orderArray);
    const indexB = getSubjectIndexInOrder(nameB, orderArray);

    // If both subjects are in the official order, sort by their index
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // If only one is in the official order, it comes first
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // If neither is in the official order, sort alphabetically
    return nameA.localeCompare(nameB);
  });
}
