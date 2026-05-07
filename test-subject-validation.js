// Test script for subject name validation and normalization
const { normalizeSubjectName, validateAndNormalizeSubject } = require('./lib/subject-utils.ts');

console.log('=== Testing Subject Name Normalization ===\n');

// Test common variations
const testCases = [
  'math',
  'Mathematics', 
  'MATH',
  'maths',
  'english',
  'English',
  'sci',
  'Science',
  'filipino',
  'Filipino',
  'gmrc',
  'Good Manners and Right Conduct',
  'ap',
  'Araling Panlipunan',
  'reading',
  'Reading and Literacy'
];

testCases.forEach(testCase => {
  try {
    const normalized = normalizeSubjectName(testCase);
    console.log(`"${testCase}" → "${normalized}"`);
  } catch (error) {
    console.log(`Error testing "${testCase}":`, error.message);
  }
});

console.log('\n=== Testing Grade-Specific Validation ===\n');

// Test grade-specific validation
const gradeTests = [
  { grade: 'Grade 1', subject: 'math' },
  { grade: 'Grade 1', subject: 'Mathematics' },
  { grade: 'Grade 2', subject: 'MATH2' },
  { grade: 'Grade 3', subject: 'Science' },
  { grade: 'Grade 3', subject: 'sci' },
  { grade: 'Grade 6', subject: 'Mathematics' },
  { grade: 'Grade 6', subject: 'math' }
];

gradeTests.forEach(({ grade, subject }) => {
  try {
    const validation = validateAndNormalizeSubject(grade, subject);
    console.log(`${grade} - "${subject}":`);
    console.log(`  Normalized: "${validation.normalizedName}"`);
    console.log(`  Is Recommended: ${validation.isRecommended}`);
    if (validation.suggestedCode) {
      console.log(`  Suggested Code: ${validation.suggestedCode}`);
    }
    console.log('');
  } catch (error) {
    console.log(`Error testing ${grade} - "${subject}":`, error.message);
  }
});

console.log('=== Test Complete ===');
