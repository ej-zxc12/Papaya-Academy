# Hybrid Structure Migration Guide

## Overview

This document describes the migration from separate collections (`/grades`, `/sf10`) to a hybrid student-centric structure where all academic data is stored within student documents.

## Architecture

### Before (Separate Collections)
```
/grades/
  - gradeId1: { studentId, subjectId, gradingPeriod, grade, ... }
  - gradeId2: { studentId, subjectId, gradingPeriod, grade, ... }

/sf10/
  - sf10Id1: { studentId, subjects, generalAverage, ... }

/students/
  - studentId1: { id, name, gradeLevel, ... }
```

### After (Hybrid Structure)
```
/students/
  - studentId1: {
    id: string,
    lrn: string,
    firstName: string,
    lastName: string,
    currentGradeLevel: string,
    currentSection: string,
    academicRecords: {
      "2024-2025": {
        gradeLevel: "Grade 7",
        section: "Rose",
        grades: {
          "First": {
            "MATH7": { grade: 85, teacherId: "...", dateInput: "..." },
            "ENG7": { grade: 87, teacherId: "...", dateInput: "..." }
          },
          "Second": { ... }
        },
        sf10: {
          subjects: [...],
          generalAverage: 86,
          status: "promoted",
          ...
        },
        attendance: { ... },
        behavior: { ... },
        achievements: [...]
      }
    }
  }
```

## Benefits

1. **Single Source of Truth**: All student data in one document
2. **Automatic SF10 Generation**: SF10 updates automatically when grades are entered
3. **Better Performance**: Single document read instead of multiple collection queries
4. **Data Integrity**: Atomic updates prevent inconsistencies
5. **Scalability**: Easy to add new academic data types

## Implementation Files

### Core Files
- `types/index.ts` - New hybrid interfaces
- `lib/sf10-generator.ts` - Automatic SF10 generation
- `lib/desktop-sf10-adapter.ts` - Desktop compatibility layer

### API Endpoints
- `app/api/teacher/grades/route-new.ts` - New grades API
- `app/api/teacher/sf10/route-new.ts` - New SF10 API

### Scripts
- `scripts/migrate-to-hybrid-structure.js` - Data migration
- `scripts/test-hybrid-structure.js` - Testing and validation

## Migration Steps

### 1. Backup Current Data
```bash
# Export existing collections
firebase firestore:export --backup-path backup-$(date +%Y%m%d)
```

### 2. Run Migration Script
```bash
cd scripts
node migrate-to-hybrid-structure.js
```

### 3. Test New APIs
```bash
# Start development server
npm run dev

# Test APIs manually or with the test script
cd scripts
node test-hybrid-structure.js
```

### 4. Update Frontend Components
- Use `DesktopSF10Adapter` for desktop components
- Update grade input forms to use new API endpoints
- Update SF10 viewing components

### 5. Replace API Routes
```bash
# Replace old routes with new ones
mv app/api/teacher/grades/route.ts app/api/teacher/grades/route-old.ts
mv app/api/teacher/grades/route-new.ts app/api/teacher/grades/route.ts

mv app/api/teacher/sf10/route.ts app/api/teacher/sf10/route-old.ts
mv app/api/teacher/sf10/route-new.ts app/api/teacher/sf10/route.ts
```

### 6. Remove Old Collections (After Testing)
```bash
# Only after thorough testing
firebase firestore:delete /grades
firebase firestore:delete /sf10
```

## API Changes

### Grades API

#### Old Endpoint
```javascript
POST /api/teacher/grades
{
  grades: [
    {
      studentId: "student001",
      subjectId: "MATH7", 
      gradingPeriod: "First",
      grade: 85,
      teacherId: "teacher001"
    }
  ]
}
```

#### New Endpoint
```javascript
POST /api/teacher/grades
{
  grades: [
    {
      studentId: "student001",
      subjectId: "MATH7",
      gradingPeriod: "First", 
      grade: 85,
      teacherId: "teacher001"
    }
  ],
  schoolYear: "2024-2025" // Optional, defaults to current year
}
```

**Response:**
```javascript
{
  message: "Grades processed successfully",
  results: {
    processed: 1,
    saved: 1,
    updated: 0,
    errors: [],
    sf10Generated: 1
  }
}
```

### SF10 API

#### Get SF10 Records
```javascript
GET /api/teacher/sf10?schoolYear=2024-2025&gradeLevel=Grade7
```

**Response:**
```javascript
{
  sf10Records: [
    {
      student: {
        id: "student001",
        lrn: "2024001", 
        name: "Ana Reyes",
        gradeLevel: "Grade 7",
        section: "Rose"
      },
      sf10: { /* SF10 record */ },
      completionStatus: {
        firstGrading: true,
        secondGrading: false,
        thirdGrading: false,
        fourthGrading: false,
        overall: false
      }
    }
  ],
  totalRecords: 1
}
```

#### Generate SF10
```javascript
POST /api/teacher/sf10
{
  studentId: "student001",
  schoolYear: "2024-2025"
}
```

## Desktop Integration

Use the `DesktopSF10Adapter` class for desktop components:

```javascript
import DesktopSF10Adapter from '@/lib/desktop-sf10-adapter';

// Get students with SF10
const students = await DesktopSF10Adapter.getStudentsWithSF10();

// Get specific student SF10
const sf10 = await DesktopSF10Adapter.getStudentSF10('student001');

// Generate SF10
const newSF10 = await DesktopSF10Adapter.generateSF10('student001');
```

## Data Validation

The migration includes comprehensive validation:

1. **Grade Validation**: 0-100 range, required fields
2. **SF10 Validation**: Subject consistency, calculation accuracy
3. **Relationship Validation**: Student-grade-SF10 consistency
4. **Permission Validation**: Teacher authorization checks

## Rollback Plan

If issues arise during migration:

1. **Stop using new APIs**
2. **Restore old API routes**
3. **Use backup data if needed**
4. **Identify and fix issues**
5. **Re-run migration**

## Performance Considerations

### Document Size
- Student documents will grow with academic data
- Monitor document size limits (1MB per document)
- Consider archiving old school years if needed

### Query Performance
- Student-centric queries are faster for common operations
- Use composite indexes for complex queries
- Consider denormalization for reporting needs

## Future Enhancements

1. **Academic Analytics**: Easy to add with centralized data
2. **Historical Tracking**: Complete academic history available
3. **Automated Reports**: Generate reports from single documents
4. **Machine Learning**: Rich dataset for predictive analytics

## Support

For issues during migration:
1. Check console logs for error details
2. Run the test script to validate data integrity
3. Check Firebase console for document structure
4. Review migration logs for specific errors

## Security Considerations

1. **Teacher Authorization**: Verify teachers can only access their students
2. **Grade Validation**: Prevent invalid grade entries
3. **Audit Trail**: Track who entered/modified grades
4. **Data Privacy**: Ensure sensitive data is properly secured
