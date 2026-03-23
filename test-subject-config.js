// Test script to verify the grade subjects configuration
const { gradeSubjectsConfig, getSubjectsForGrade, getSubjectName, isSubjectValidForGrade } = require('./lib/grade-subjects-config.ts');

console.log('🎓 Testing Grade Subjects Configuration');
console.log('=====================================\n');

// Test Grade 1
console.log('📚 Grade 1 Subjects:');
const grade1Subjects = getSubjectsForGrade('Grade 1');
grade1Subjects.forEach(subject => {
  console.log(`  - ${subject.name} (${subject.code})`);
});

console.log('\n📚 Grade 2 Subjects:');
const grade2Subjects = getSubjectsForGrade('Grade 2');
grade2Subjects.forEach(subject => {
  console.log(`  - ${subject.name} (${subject.code})`);
});

console.log('\n📚 Grade 3 Subjects:');
const grade3Subjects = getSubjectsForGrade('Grade 3');
grade3Subjects.forEach(subject => {
  console.log(`  - ${subject.name} (${subject.code})`);
});

// Test validation
console.log('\n✅ Validation Tests:');
console.log(`Is Mathematics valid for Grade 1? ${isSubjectValidForGrade('Grade 1', 'LANG1')}`);
console.log(`Is Filipino valid for Grade 2? ${isSubjectValidForGrade('Grade 2', 'FIL2')}`);
console.log(`Is Science valid for Grade 3? ${isSubjectValidForGrade('Grade 3', 'SCI3')}`);
console.log(`Is Science valid for Grade 1? ${isSubjectValidForGrade('Grade 1', 'SCI3')}`);

// Test subject name resolution
console.log('\n🏷️  Subject Name Tests:');
console.log(`LANG1 in Grade 1: ${getSubjectName('Grade 1', 'LANG1')}`);
console.log(`FIL2 in Grade 2: ${getSubjectName('Grade 2', 'FIL2')}`);
console.log(`SCI3 in Grade 3: ${getSubjectName('Grade 3', 'SCI3')}`);

console.log('\n✨ Configuration test completed!');
