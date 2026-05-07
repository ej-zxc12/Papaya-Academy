// Simple test for subject name normalization logic

function normalizeSubjectName(subjectName) {
  if (!subjectName || typeof subjectName !== 'string') return subjectName;
  
  const trimmed = subjectName.trim().toLowerCase();
  
  // Common subject name variations mapping
  const subjectMappings = {
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
}

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
  const normalized = normalizeSubjectName(testCase);
  console.log(`"${testCase}" → "${normalized}"`);
});

console.log('\n=== Key Test Cases ===\n');

// Specific test cases for the user's scenario
console.log('Grade 1 teacher enters "math":');
console.log(`  Normalized to: "${normalizeSubjectName('math')}"`);

console.log('\nGrade 6 teacher enters "Mathematics":');
console.log(`  Normalized to: "${normalizeSubjectName('Mathematics')}"`);

console.log('\nBoth will now use the same standardized name!');

console.log('\n=== Test Complete ===');
