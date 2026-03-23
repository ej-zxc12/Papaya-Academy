# Grade Subjects Configuration

This document outlines the implementation of grade-specific subjects for Papaya Academy's Grades 1-3.

## Overview

The system now supports different subjects for each grade level according to the school's curriculum. Teachers must manually create subjects for their specific grade levels.

### Grade 1 Subjects (to be created manually by teachers)
- **Language** (recommended code: LANG1)
- **Reading and Literacy** (recommended code: READ1)
- **Mathematics** (recommended code: MATH1)
- **GMRC (Good Manners and Right Conduct)** (recommended code: GMRC1)
- **Makabansa** (recommended code: MAKAB1)

### Grade 2 Subjects (to be created manually by teachers)
- **Language** (recommended code: LANG2)
- **Filipino** (recommended code: FIL2)
- **Mathematics** (recommended code: MATH2)
- **GMRC (Good Manners and Right Conduct)** (recommended code: GMRC2)
- **Makabansa** (recommended code: MAKAB2)

### Grade 3 Subjects (to be created manually by teachers)
- **Language** (recommended code: LANG3)
- **Filipino** (recommended code: FIL3)
- **Mathematics** (recommended code: MATH3)
- **GMRC (Good Manners and Right Conduct)** (recommended code: GMRC3)
- **Science** (recommended code: SCI3)
- **Makabansa** (recommended code: MAKAB3)

## Implementation Details

### Files Created/Modified

1. **`lib/grade-subjects-config.ts`** - Reference configuration file
   - Defines recommended subjects for each grade level
   - Provides helper functions for subject validation
   - Used as a reference for teachers when creating subjects

2. **`lib/subject-utils.ts`** - Utility functions
   - Subject validation
   - Name formatting
   - Grade level detection

3. **`app/api/teacher/subjects/route.ts`** - API endpoint updated
   - Only returns subjects that teachers have manually created
   - No automatic generation of subjects

4. **`components/ReportCard.tsx`** - Report card component updated
   - Only displays subjects that have grades entered
   - No automatic subject loading

5. **`app/teacher/report-cards/page.tsx`** - Report cards listing updated
   - Only shows subjects that teachers have created and entered grades for

6. **`app/teacher/report-cards/[studentId]/page.tsx`** - Individual report card updated
   - Displays only subjects that have actual grade data

### Key Changes

- **Manual Subject Creation**: Teachers must now manually create subjects by entering:
  - Subject name (e.g., "Mathematics")
  - Subject code (e.g., "MATH1")
  - Grade level (e.g., "Grade 1")

- **No Automatic Generation**: Subjects are no longer automatically generated
- **Grade-Based Display**: Report cards only show subjects that have actual grades
- **Backward Compatibility**: Higher grades (4+) continue to work as before

### How Teachers Create Subjects

1. Go to the Grade Input page
2. Click on "Add Subject" 
3. Enter subject details:
   - **Name**: e.g., "Mathematics"
   - **Code**: e.g., "MATH1" 
   - **Grade Level**: Select appropriate grade (Grade 1, 2, or 3)
   - **School Year**: e.g., "2024-2025"
4. Click "Create Subject"

### Usage Examples

```typescript
// Validate if a subject is appropriate for a grade
const isValid = validateSubjectForGrade('Grade 1', 'LANG1'); // true

// Get recommended subjects for a grade
const subjects = getSubjectsForGrade('Grade 1'); // Returns array of recommended subjects
```

## Testing

Run the test script to see the recommended subjects:

```bash
node test-subject-config-simple.js
```

## Benefits of Manual Approach

- **Teacher Control**: Teachers have full control over which subjects they create
- **Flexibility**: Can accommodate special subjects or variations
- **Clean Data**: No empty or unused subjects in the system
- **Simplified Management**: Easier to manage and track subject creation

## Future Enhancements

- Add subject templates for quick creation
- Implement subject validation warnings
- Add bulk subject creation for grade levels
- Create subject management interface

## Notes

- The configuration files now serve as reference/guidelines
- Teachers should follow the recommended naming conventions
- Subject codes should be unique (e.g., MATH1, MATH2, MATH3)
- The system maintains data integrity through validation functions
