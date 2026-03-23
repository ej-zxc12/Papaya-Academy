# Report Card System with Subject Arrays

This system allows you to create and manage report cards with multiple subjects stored in arrays, perfect for displaying subjects on the right side of report cards.

## 🎯 Key Features

### 1. **Multi-Subject Support**
- Students can have multiple subjects stored in a single document
- Each subject contains quarterly grades (Q1, Q2, Q3, Q4)
- Automatic calculation of final ratings and general averages

### 2. **Data Structure**
- **ReportCardGrade**: Main document containing student info and array of subjects
- **ReportCardSubject**: Individual subject with quarterly grades and final rating
- **Backward Compatible**: Works with both old (single subject) and new (multi-subject) student structures

### 3. **API Endpoints**
- `GET /api/teacher/report-cards` - Fetch report cards
- `POST /api/teacher/report-cards` - Create/update report card
- `PUT /api/teacher/report-cards` - Update specific subject
- `DELETE /api/teacher/report-cards` - Delete report card
- `POST /api/teacher/report-cards/generate` - Generate from existing grades

## 📁 Files Created/Modified

### Types (`types/index.ts`)
```typescript
export interface ReportCardGrade {
  id: string;
  studentId: string;
  gradeLevel: string;
  section: string;
  schoolYear: string;
  teacherId: string;
  subjects: ReportCardSubject[];
  generalAverage?: number;
  status?: 'promoted' | 'retained' | 'dropped';
  adviserName?: string;
  dateCompleted?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportCardSubject {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  firstGrading: number;
  secondGrading: number;
  thirdGrading: number;
  fourthGrading: number;
  finalRating: number;
  remarks?: string;
  teacherId?: string;
  teacherName?: string;
}
```

### API Routes
- `app/api/teacher/report-cards/route.ts` - Main report card operations
- `app/api/teacher/report-cards/generate/route.ts` - Generate from individual grades

### Components
- `components/ReportCardAdapter.tsx` - Converts new format to existing ReportCard component
- `hooks/useReportCard.ts` - Custom hook for report card operations

### Example Page
- `app/teacher/report-cards/example/page.tsx` - Complete example implementation

## 🚀 How to Use

### 1. **Generate Report Card from Existing Grades**
```typescript
const reportCard = await generateReportCard(
  studentId,
  gradeLevel,
  section
);
```

### 2. **Display Report Card with Subjects**
```tsx
<ReportCardAdapter
  reportCardData={reportCard}
  studentInfo={{
    name: "Juan Dela Cruz",
    age: "7",
    sex: "M",
    lrn: "123456789012"
  }}
  schoolInfo={{
    name: "Papaya Academy",
    division: "Division of Example",
    region: "Region IV-A"
  }}
/>
```

### 3. **Save Report Card**
```typescript
const saved = await saveReportCard({
  studentId: "student123",
  gradeLevel: "Grade 1",
  section: "Section A",
  schoolYear: "2024-2025",
  subjects: [
    {
      subjectId: "math123",
      subjectName: "Mathematics",
      subjectCode: "MATH",
      firstGrading: 85,
      secondGrading: 87,
      thirdGrading: 90,
      fourthGrading: 88,
      finalRating: 87.5,
      remarks: "Excellent performance"
    }
    // ... more subjects
  ]
});
```

## 🔄 Data Flow

1. **Individual Grades** → stored in `grades` collection
2. **Generate Report Card** → aggregates grades by subject
3. **Report Card Document** → stored in `reportCardGrades` collection
4. **Display** → ReportCardAdapter converts to existing ReportCard format

## 📊 Report Card Layout

The report card displays subjects on the right side with:
- **Learning Areas** (Subject names)
- **Quarterly Grades** (Q1, Q2, Q3, Q4 columns)
- **Final Grade** (Calculated average)
- **Remarks** (Passed/Failed based on final grade)
- **General Average** (Overall average of all subjects)

## 🎨 Styling Features

- **Print-friendly**: Optimized for A4 printing
- **Professional Layout**: Left side (student info) + Right side (subjects table)
- **Responsive**: Works on screen and print
- **Watermark Support**: School branding in background

## 🔧 Technical Details

### Automatic Calculations
- **Final Rating**: Average of quarterly grades (excluding null values)
- **General Average**: Average of all subject final ratings
- **Status**: Promoted (≥75) or Retained (<75)

### Error Handling
- Validates required fields
- Handles missing grades gracefully
- Provides meaningful error messages
- Fallback to default values

### Performance
- Efficient Firestore queries
- Batch operations for multiple subjects
- Caching in custom hook
- Lazy loading of report cards

## 📝 Example Usage

See `app/teacher/report-cards/example/page.tsx` for a complete working example that demonstrates:

1. Student selection
2. Grade level filtering
3. Report card generation
4. Preview and printing
5. Save functionality

## 🔄 Integration with Existing System

This system is designed to work alongside your existing grade input system:

1. **Grade Input** → Individual grades per subject/quarter
2. **Report Card Generation** → Aggregates into report card format
3. **Report Card Display** → Professional printable format
4. **Data Persistence** → Both individual grades and report cards saved

## 🎯 Benefits

- **Time Saving**: Automatic report card generation from existing grades
- **Consistency**: Standardized format across all report cards
- **Flexibility**: Works with any number of subjects
- **Professional**: Print-ready report cards with proper layout
- **Scalable**: Easy to add new subjects or grading periods
