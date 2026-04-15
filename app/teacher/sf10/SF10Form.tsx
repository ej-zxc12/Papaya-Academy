import React from 'react';

interface SF10SubjectData {
  subjectCode: string;
  subjectName: string;
  firstGrading: number;
  secondGrading: number;
  thirdGrading: number;
  fourthGrading: number;
  finalRating: number;
  remarks: string;
}

interface StudentData {
  id: string;
  lrn: string;
  name: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthdate?: string;
  sex?: string;
  gradeLevel: string;
  section: string;
  schoolYear: string;
  adviserName?: string;
}

interface SF10FormProps {
  student?: StudentData;
  subjects?: SF10SubjectData[];
  generalAverage?: number;
  status?: 'promoted' | 'retained' | 'transferred' | 'dropped';
  isEditMode?: boolean;
  onStudentFieldChange?: (field: string, value: string) => void;
  onSubjectGradeChange?: (index: number, field: keyof SF10SubjectData, value: number) => void;
}

const SF10Form: React.FC<SF10FormProps> = ({ 
  student, 
  subjects = [], 
  generalAverage = 0,
  status = 'promoted',
  isEditMode = false,
  onStudentFieldChange,
  onSubjectGradeChange
}) => {
  return (
    <div>
      {/* PAGE 1 */}
      <div style={{ 
        width: '215mm', 
        minHeight: '297mm', 
        margin: '0 auto', 
        padding: '5mm 6mm', 
        background: '#fff', 
        color: '#000',
        fontFamily: 'Arial, sans-serif',
        fontSize: '7pt',
        boxSizing: 'border-box'
      }}>
        {/* PAGE 1 CONTENT */}
        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ width: '50px' }}>
            <div style={{ fontSize: '7pt', fontWeight: 'bold' }}>SF10-ES</div>
            <img src="/images/foundation/deped-logo.png" alt="DepEd" style={{ width: '44px', height: '44px', marginTop: '2px' }} />
          </div>
          <div style={{ textAlign: 'center', flex: 1, padding: '0 10px' }}>
            <div style={{ fontSize: '8pt', lineHeight: '1.2' }}>Republic of the Philippines</div>
            <div style={{ fontSize: '8pt', lineHeight: '1.2' }}>Department of Education</div>
            <div style={{ fontSize: '11pt', fontWeight: 'bold', lineHeight: '1.3', marginTop: '2px' }}>
              Learner Permanent Academic Record for Elementary School (SF10-ES)
            </div>
            <div style={{ fontSize: '7pt', fontStyle: 'italic', lineHeight: '1.2' }}>(Formerly Form 137)</div>
          </div>
          <div style={{ width: '60px', textAlign: 'right' }}>
            <img src="/images/foundation/depedtextlogo.png" alt="DepED" style={{ width: '55px', height: '48px' }} />
          </div>
        </div>

      {/* LEARNER'S PERSONAL INFORMATION */}
      <div style={{ 
        background: '#d9d9d9', 
        color: '#000', 
        textAlign: 'center', 
        fontWeight: 'bold', 
        fontSize: '7.5pt', 
        padding: '2px 0',
        border: '1px solid #000',
        marginBottom: '2px'
      }}>
        LEARNER'S PERSONAL INFORMATION
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '2px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
          <span style={{ fontSize: '6.5pt', whiteSpace: 'nowrap' }}>LAST NAME:</span>
          {isEditMode ? (
            <input
              type="text"
              value={student?.lastName || ''}
              onChange={(e) => onStudentFieldChange?.('lastName', e.target.value)}
              style={{ fontSize: '7pt', fontWeight: 'bold', minWidth: '70px', height: '18px', padding: '0 4px', border: '1px solid #000', borderBottom: '2px solid #2563EB' }}
            />
          ) : (
            <div style={{ borderBottom: '1px solid #000', minWidth: '70px', height: '12px', padding: '0 4px' }}>
              <span style={{ fontSize: '7pt', fontWeight: 'bold' }}>{student?.lastName || ''}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
          <span style={{ fontSize: '6.5pt', whiteSpace: 'nowrap' }}>FIRST NAME:</span>
          {isEditMode ? (
            <input
              type="text"
              value={student?.firstName || student?.name?.split(' ')[0] || ''}
              onChange={(e) => onStudentFieldChange?.('firstName', e.target.value)}
              style={{ fontSize: '7pt', fontWeight: 'bold', minWidth: '70px', height: '18px', padding: '0 4px', border: '1px solid #000', borderBottom: '2px solid #2563EB' }}
            />
          ) : (
            <div style={{ borderBottom: '1px solid #000', minWidth: '70px', height: '12px', padding: '0 4px' }}>
              <span style={{ fontSize: '7pt', fontWeight: 'bold' }}>{student?.firstName || student?.name?.split(' ')[0] || ''}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
          <span style={{ fontSize: '6.5pt', whiteSpace: 'nowrap' }}>NAME EXTN. (Jr,I,II)</span>
          <div style={{ borderBottom: '1px solid #000', width: '40px', height: '12px' }}></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
          <span style={{ fontSize: '6.5pt', whiteSpace: 'nowrap' }}>MIDDLE NAME:</span>
          {isEditMode ? (
            <input
              type="text"
              value={student?.middleName || ''}
              onChange={(e) => onStudentFieldChange?.('middleName', e.target.value)}
              style={{ fontSize: '7pt', minWidth: '70px', height: '18px', padding: '0 4px', border: '1px solid #000', borderBottom: '2px solid #2563EB' }}
            />
          ) : (
            <div style={{ borderBottom: '1px solid #000', minWidth: '70px', height: '12px', padding: '0 4px' }}>
              <span style={{ fontSize: '7pt' }}>{student?.middleName || ''}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '3px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
          <span style={{ fontSize: '6.5pt', whiteSpace: 'nowrap' }}>Learner Reference Number (LRN):</span>
          {isEditMode ? (
            <input
              type="text"
              value={student?.lrn || ''}
              onChange={(e) => onStudentFieldChange?.('lrn', e.target.value)}
              style={{ fontSize: '7pt', fontWeight: 'bold', minWidth: '80px', height: '18px', padding: '0 4px', border: '1px solid #000', borderBottom: '2px solid #2563EB' }}
            />
          ) : (
            <div style={{ borderBottom: '1px solid #000', minWidth: '80px', height: '12px', padding: '0 4px' }}>
              <span style={{ fontSize: '7pt', fontWeight: 'bold' }}>{student?.lrn || ''}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
          <span style={{ fontSize: '6.5pt', whiteSpace: 'nowrap' }}>Birthdate (mm/dd/yyyy):</span>
          {isEditMode ? (
            <input
              type="text"
              value={student?.birthdate || ''}
              onChange={(e) => onStudentFieldChange?.('birthdate', e.target.value)}
              style={{ fontSize: '7pt', minWidth: '60px', height: '18px', padding: '0 4px', border: '1px solid #000', borderBottom: '2px solid #2563EB' }}
            />
          ) : (
            <div style={{ borderBottom: '1px solid #000', minWidth: '60px', height: '12px', padding: '0 4px' }}>
              <span style={{ fontSize: '7pt' }}>{student?.birthdate || ''}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
          <span style={{ fontSize: '6.5pt', whiteSpace: 'nowrap' }}>Sex:</span>
          {isEditMode ? (
            <select
              value={student?.sex || ''}
              onChange={(e) => onStudentFieldChange?.('sex', e.target.value)}
              style={{ fontSize: '7pt', minWidth: '50px', height: '18px', padding: '0 4px', border: '1px solid #000', borderBottom: '2px solid #2563EB' }}
            >
              <option value="">Select</option>
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          ) : (
            <div style={{ borderBottom: '1px solid #000', minWidth: '35px', height: '12px', padding: '0 4px' }}>
              <span style={{ fontSize: '7pt' }}>{student?.sex || ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* ELIGIBILITY */}
      <div style={{ 
        background: '#d9d9d9', 
        color: '#000', 
        textAlign: 'center', 
        fontWeight: 'bold', 
        fontSize: '7.5pt', 
        padding: '2px 0',
        border: '1px solid #000',
        marginBottom: '2px'
      }}>
        ELIGIBILITY FOR ELEMENTARY SCHOOL ENROLLMENT
      </div>

      <div style={{ fontSize: '6.5pt', marginBottom: '1px' }}>
        <span style={{ fontStyle: 'italic' }}>Credential Presented for Grade 1:</span>
      </div>
      <div style={{ display: 'flex', gap: '15px', fontSize: '6.5pt', marginBottom: '2px' }}>
        <span>☐ Kinder Progress Report</span>
        <span>☐ ECCD Checklist</span>
        <span>☐ Kindergarten Certificate of Completion</span>
      </div>

      <table style={{ width: '100%', fontSize: '6.5pt', marginBottom: '2px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '1px 0' }}>
              <span>Name of School:</span>
              <span style={{ fontWeight: 'bold', marginLeft: '4px' }}>PAPAYA ACADEMY INC.</span>
            </td>
            <td style={{ padding: '1px 0' }}>
              <span>School ID:</span>
              <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '40px', marginLeft: '4px' }}></span>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '1px 0' }}>
              <span>Address of School:</span>
              <span style={{ fontWeight: 'bold', marginLeft: '4px' }}>KASIGLAHAN MAIN ROAD, SAN JOSE ROD. RIZAL</span>
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', fontSize: '6.5pt', marginBottom: '1px', flexWrap: 'wrap' }}>
        <span>Other Credential Presented:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', flex: 1, height: '11px' }}></span>
      </div>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap' }}>
        <span>PEPT Passer Rating:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '40px', height: '11px' }}></span>
        <span>Date of Examination/Assessment (mm/dd/yyyy):</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '60px', height: '11px' }}></span>
        <span>Others (Pls. Specify):</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '50px', height: '11px' }}></span>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', fontSize: '6.5pt', marginTop: '1px', flexWrap: 'wrap' }}>
        <span>Name and Address of Testing Center:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', flex: 1, height: '11px' }}></span>
        <span>Remark:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '50px', height: '11px' }}></span>
      </div>

      {/* SCHOLASTIC RECORD */}
      <div style={{ 
        background: '#d9d9d9', 
        color: '#000', 
        textAlign: 'center', 
        fontWeight: 'bold', 
        fontSize: '7.5pt', 
        padding: '2px 0',
        border: '1px solid #000',
        marginTop: '3px',
        marginBottom: '2px'
      }}>
        SCHOLASTIC RECORD
      </div>

      {/* GRADE BLOCKS - 2x2 Grid */}
      {/* ROW 1: Grade 1 | Grade 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', marginBottom: '4px' }}>
        
        {/* Grade 1 */}
        <GradeBlock 
          grade="Grade 1"
          subjects={['Filipino', 'English', 'Mathematics', 'GMRC (Good Manners and Right Conduct)', 'Makabansa']}
          emptyRows={7}
          studentData={student}
          subjectGrades={subjects}
          isActive={student?.gradeLevel === 'Grade 1'}
          isEditMode={isEditMode}
          onSubjectGradeChange={onSubjectGradeChange}
        />

        {/* Grade 2 */}
        <GradeBlock 
          grade="Grade 2"
          subjects={['Filipino', 'English', 'Mathematics', 'Science', 'GMRC (Good Manners and Right Conduct)', 'Makabansa']}
          emptyRows={6}
          studentData={student}
          subjectGrades={subjects}
          isActive={student?.gradeLevel === 'Grade 2'}
          isEditMode={isEditMode}
          onSubjectGradeChange={onSubjectGradeChange}
        />

      </div>

      {/* ROW 2: Grade 3 | Grade 4 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
        
        {/* Grade 3 */}
        <GradeBlock 
          grade="Grade 3"
          subjects={['Filipino', 'English', 'Mathematics', 'Science', 'GMRC (Good Manners and Right Conduct)', 'Araling Panlipunan', 'EPP', 'MAPEH', 'Music & Arts', 'Physical Education & Health']}
          emptyRows={2}
          studentData={student}
          subjectGrades={subjects}
          isActive={student?.gradeLevel === 'Grade 3'}
          isEditMode={isEditMode}
          onSubjectGradeChange={onSubjectGradeChange}
        />

        {/* Grade 4 */}
        <GradeBlock 
          grade="Grade 4"
          subjects={['Filipino', 'English', 'Mathematics', 'Science', 'GMRC (Good Manners and Right Conduct)', 'Araling Panlipunan', 'EPP', 'MAPEH', 'Music & Arts', 'Physical Education & Health']}
          emptyRows={2}
          studentData={student}
          subjectGrades={subjects}
          isActive={student?.gradeLevel === 'Grade 4'}
          isEditMode={isEditMode}
          onSubjectGradeChange={onSubjectGradeChange}
        />

      </div>

      <div style={{ fontSize: '6pt', fontStyle: 'italic', textAlign: 'right', marginTop: '4px' }}>
        Revised 2025 based on DepEd Order No. 10, s. 2024
      </div>
    </div>

    {/* PAGE BREAK */}
    <div style={{ pageBreakAfter: 'always', breakAfter: 'page', height: '1px' }}></div>

    {/* PAGE 2 */}
    <Page2 student={student} subjects={subjects} isEditMode={isEditMode} onSubjectGradeChange={onSubjectGradeChange} />
    </div>
  );
};

// Reusable Grade Block Component
interface GradeBlockProps {
  grade: string;
  subjects: string[];
  emptyRows: number;
  studentData?: StudentData;
  subjectGrades?: SF10SubjectData[];
  isActive?: boolean;
  isEditMode?: boolean;
  onSubjectGradeChange?: (index: number, field: keyof SF10SubjectData, value: number) => void;
}

// Helper to normalize grade level for comparison
const normalizeGradeLevel = (gradeLevel: string | undefined): string => {
  if (!gradeLevel) return '';
  // Handle formats like "Grade 6", "6", "Grade6", "G6"
  const normalized = gradeLevel.toLowerCase().replace(/\s/g, '');
  if (normalized.startsWith('grade')) return normalized; // grade6
  if (normalized.startsWith('g')) return 'grade' + normalized.slice(1); // g6 -> grade6
  if (/^\d+$/.test(normalized)) return 'grade' + normalized; // 6 -> grade6
  if (normalized === 'kinder' || normalized === 'kindergarten' || normalized === 'k') return 'kinder';
  return normalized;
};

const GradeBlock: React.FC<GradeBlockProps> = ({ grade, subjects, emptyRows, studentData, subjectGrades = [], isActive = false, isEditMode = false, onSubjectGradeChange }) => {
  // Filter grades for subjects in this grade level
  const gradesMap = new Map<string, SF10SubjectData>();
  subjectGrades.forEach(sg => {
    gradesMap.set(sg.subjectName.toLowerCase(), sg);
    gradesMap.set(sg.subjectCode.toLowerCase(), sg);
  });

  const getGradeForSubject = (subjectName: string) => {
    const lowerName = subjectName.toLowerCase();
    
    // Try exact match first
    const exactMatch = gradesMap.get(lowerName);
    if (exactMatch) return exactMatch;
    
    // Try matching without spaces
    const noSpaces = lowerName.replace(/\s/g, '');
    const noSpacesMatch = gradesMap.get(noSpaces);
    if (noSpacesMatch) return noSpacesMatch;
    
    // Try matching without parentheses content (e.g., "GMRC (Good Manners...)" -> "gmrc")
    const withoutParens = lowerName.replace(/\s*\([^)]*\)/g, '').trim();
    const noParensMatch = gradesMap.get(withoutParens);
    if (noParensMatch) return noParensMatch;
    
    // Try matching with just the content inside parentheses
    const parensMatch = lowerName.match(/\(([^)]+)\)/);
    if (parensMatch) {
      const insideParens = parensMatch[1].trim();
      const insideMatch = gradesMap.get(insideParens);
      if (insideMatch) return insideMatch;
    }
    
    // Try partial/fuzzy matching - check if any key contains parts of the subject name
    const entries = Array.from(gradesMap.entries());
    
    // Special handling for GMRC - expanded matching
    if (lowerName.includes('gmrc')) {
      const gmrcVariations = ['gmrc', 'good', 'manners', 'right', 'conduct', 'g.m.r.c'];
      for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i];
        // Check if key contains any GMRC-related term
        if (gmrcVariations.some(v => key.includes(v))) {
          return value;
        }
      }
    }
    
    // General fuzzy matching for other subjects
    const subjectWords = lowerName.replace(/[()]/g, '').split(/\s+/).filter(w => w.length > 3);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      // Check if key contains any significant word from the subject name
      if (subjectWords.some(word => key.includes(word))) {
        return value;
      }
    }
    
    return null;
  };

  // Check if this block is active based on normalized grade levels
  const blockGrade = normalizeGradeLevel(grade);
  const studentGrade = normalizeGradeLevel(studentData?.gradeLevel);
  const isBlockActive = isActive || blockGrade === studentGrade;

  return (
    <div style={{ opacity: isBlockActive ? 1 : 0.7 }}>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap', marginBottom: '1px' }}>
        <span>School:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', flex: 1, height: '11px', padding: '0 2px' }}>
          {isBlockActive ? 'PAPAYA ACADEMY INC.' : ''}
        </span>
        <span>School ID:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '30px', height: '11px' }}></span>
      </div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap', marginBottom: '1px' }}>
        <span>District:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '40px', height: '11px' }}></span>
        <span>Division:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', flex: 1, height: '11px', padding: '0 2px' }}>
          {isBlockActive ? 'Division of Rizal' : ''}
        </span>
        <span>Region:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '25px', height: '11px', padding: '0 2px' }}>
          {isBlockActive ? 'IV-A' : ''}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap', marginBottom: '1px' }}>
        <span>Classified as Grade:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '20px', height: '11px', padding: '0 2px', textAlign: 'center' }}>
          {isBlockActive ? studentData?.gradeLevel?.replace('Grade ', '') : ''}
        </span>
        <span>Section:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', flex: 1, height: '11px', padding: '0 2px' }}>
          {isBlockActive ? studentData?.section : ''}
        </span>
        <span>School Year:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '50px', height: '11px', padding: '0 2px' }}>
          {isBlockActive ? studentData?.schoolYear : ''}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap', marginBottom: '2px' }}>
        <span>Name of Adviser/Teacher:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', flex: 1, height: '11px', padding: '0 2px' }}>
          {isBlockActive ? studentData?.adviserName : ''}
        </span>
        <span>Signature:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '40px', height: '11px' }}></span>
      </div>
      
      <GradeTable subjects={subjects} emptyRows={emptyRows} subjectGrades={subjectGrades} isActive={isBlockActive} isEditMode={isEditMode} onSubjectGradeChange={onSubjectGradeChange} />
      <RemedialTable />
    </div>
  );
};

// Grade Table Component
interface GradeTableProps {
  subjects: string[];
  emptyRows: number;
  hasMapehSub?: boolean;
  showZero?: boolean;
  subjectGrades?: SF10SubjectData[];
  isActive?: boolean;
  isEditMode?: boolean;
  onSubjectGradeChange?: (index: number, field: keyof SF10SubjectData, value: number) => void;
}

const GradeTable: React.FC<GradeTableProps> = ({ subjects, emptyRows, hasMapehSub, showZero, subjectGrades = [], isActive = false, isEditMode = false, onSubjectGradeChange }) => {
  // Debug: Log all available subjects once
  if (isActive && subjectGrades.length > 0) {
    console.log('Available subjects in SF10:', subjectGrades.map(sg => ({ name: sg.subjectName, code: sg.subjectCode })));
  }
  
  // Create a map for quick lookup
  const gradesMap = new Map<string, SF10SubjectData>();
  subjectGrades.forEach(sg => {
    gradesMap.set(sg.subjectName.toLowerCase(), sg);
    gradesMap.set(sg.subjectCode.toLowerCase(), sg);
  });

  // Debug logging
  if (isActive) {
    console.log('GradeTable - subjects prop:', subjects);
    console.log('GradeTable - subjectGrades prop:', subjectGrades);
    console.log('GradeTable - gradesMap:', Array.from(gradesMap.entries()));
  }

  const getGradeForSubject = (subjectName: string): SF10SubjectData | null => {
    const lowerName = subjectName.toLowerCase();
    let result = gradesMap.get(lowerName) || null;
    
    // If not found, try matching without closing parenthesis (handles truncated keys)
    if (!result && lowerName.includes('(')) {
      const withoutClosingParen = lowerName.replace(/\)/g, '');
      result = gradesMap.get(withoutClosingParen) || null;
    }
    
    // If still not found, try partial key matching
    if (!result) {
      const keys = Array.from(gradesMap.keys());
      // Find key that starts with our search term (handles truncated keys)
      const partialMatch = keys.find(key => key.startsWith(lowerName) || lowerName.startsWith(key));
      if (partialMatch) {
        result = gradesMap.get(partialMatch) || null;
      }
    }
    
    if (isActive) {
      console.log(`Looking for subject "${subjectName}" (lowercase: "${lowerName}")`, result);
    }
    return result;
  };

  const formatGrade = (grade: number): string => {
    if (!isActive || grade === 0 || grade === null || grade === undefined) return '';
    return grade.toString();
  };

  // Calculate general average from available grades
  const calculateGeneralAvg = (): string => {
    if (!isActive) return '';
    const allFinalRatings = subjects.map(s => getGradeForSubject(s)?.finalRating || 0).filter(g => g > 0);
    if (allFinalRatings.length === 0) return '';
    const avg = Math.round(allFinalRatings.reduce((a, b) => a + b, 0) / allFinalRatings.length);
    return avg.toString();
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.5pt', tableLayout: 'fixed' }}>
      <thead>
        <tr style={{ background: '#e0e0e0' }}>
          <th rowSpan={2} style={{ 
            border: '1px solid #000', 
            textAlign: 'left', 
            padding: '1px 3px', 
            width: '40%', 
            fontWeight: 'bold',
            fontSize: '6.5pt'
          }}>LEARNING AREAS</th>
          <th colSpan={4} style={{ 
            border: '1px solid #000', 
            textAlign: 'center', 
            fontWeight: 'bold',
            fontSize: '6.5pt'
          }}>Quarterly Rating</th>
          <th rowSpan={2} style={{ 
            border: '1px solid #000', 
            textAlign: 'center', 
            width: '12%',
            fontWeight: 'bold',
            fontSize: '6.5pt'
          }}>Final<br/>Rating</th>
          <th rowSpan={2} style={{ 
            border: '1px solid #000', 
            textAlign: 'center', 
            width: '12%',
            fontWeight: 'bold',
            fontSize: '6.5pt'
          }}>Remarks</th>
        </tr>
        <tr style={{ background: '#e0e0e0' }}>
          <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>1</th>
          <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>2</th>
          <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>3</th>
          <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>4</th>
        </tr>
      </thead>
      <tbody>
        {subjects.map((subject, i) => {
          const gradeData = getGradeForSubject(subject);
          // Find the index in subjectGrades array for this subject
          const subjectIndex = subjectGrades.findIndex(sg => 
            sg.subjectName.toLowerCase() === subject.toLowerCase() ||
            sg.subjectCode.toLowerCase() === subject.toLowerCase()
          );
          return (
            <tr key={i}>
              <td style={{ 
                border: '1px solid #000', 
                textAlign: 'left', 
                paddingLeft: '3px',
                fontSize: '6.5pt',
                height: '12px'
              }}>{subject}</td>
              <td style={{ border: '1px solid #000', textAlign: 'center' }}>
                {isEditMode && isActive && subjectIndex >= 0 ? (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradeData?.firstGrading || ''}
                    onChange={(e) => onSubjectGradeChange?.(subjectIndex, 'firstGrading', parseFloat(e.target.value) || 0)}
                    style={{ width: '90%', fontSize: '6.5pt', textAlign: 'center', border: '1px solid #2563EB', height: '14px' }}
                  />
                ) : formatGrade(gradeData?.firstGrading || 0)}
              </td>
              <td style={{ border: '1px solid #000', textAlign: 'center' }}>
                {isEditMode && isActive && subjectIndex >= 0 ? (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradeData?.secondGrading || ''}
                    onChange={(e) => onSubjectGradeChange?.(subjectIndex, 'secondGrading', parseFloat(e.target.value) || 0)}
                    style={{ width: '90%', fontSize: '6.5pt', textAlign: 'center', border: '1px solid #2563EB', height: '14px' }}
                  />
                ) : formatGrade(gradeData?.secondGrading || 0)}
              </td>
              <td style={{ border: '1px solid #000', textAlign: 'center' }}>
                {isEditMode && isActive && subjectIndex >= 0 ? (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradeData?.thirdGrading || ''}
                    onChange={(e) => onSubjectGradeChange?.(subjectIndex, 'thirdGrading', parseFloat(e.target.value) || 0)}
                    style={{ width: '90%', fontSize: '6.5pt', textAlign: 'center', border: '1px solid #2563EB', height: '14px' }}
                  />
                ) : formatGrade(gradeData?.thirdGrading || 0)}
              </td>
              <td style={{ border: '1px solid #000', textAlign: 'center' }}>
                {isEditMode && isActive && subjectIndex >= 0 ? (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradeData?.fourthGrading || ''}
                    onChange={(e) => onSubjectGradeChange?.(subjectIndex, 'fourthGrading', parseFloat(e.target.value) || 0)}
                    style={{ width: '90%', fontSize: '6.5pt', textAlign: 'center', border: '1px solid #2563EB', height: '14px' }}
                  />
                ) : formatGrade(gradeData?.fourthGrading || 0)}
              </td>
              <td style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{formatGrade(gradeData?.finalRating || 0)}</td>
              <td style={{ border: '1px solid #000', textAlign: 'center', fontSize: '6pt' }}>{isActive && gradeData?.finalRating ? (gradeData.finalRating >= 75 ? 'Passed' : 'Failed') : ''}</td>
            </tr>
          );
        })}
        {Array.from({ length: emptyRows }).map((_, i) => (
          <tr key={`empty-${i}`}>
            <td style={{ border: '1px solid #000', height: '12px' }}></td>
            <td style={{ border: '1px solid #000' }}></td>
            <td style={{ border: '1px solid #000' }}></td>
            <td style={{ border: '1px solid #000' }}></td>
            <td style={{ border: '1px solid #000' }}></td>
            <td style={{ border: '1px solid #000' }}></td>
            <td style={{ border: '1px solid #000' }}></td>
          </tr>
        ))}
        <tr>
          <td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', fontStyle: 'italic', fontSize: '6pt', height: '12px' }}>
            *Arabic Language
          </td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
        </tr>
        <tr>
          <td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', fontStyle: 'italic', fontSize: '6pt', height: '12px' }}>
            *Islamic Values Education
          </td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
        </tr>
        <tr>
          <td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', fontWeight: 'bold', fontSize: '6.5pt', height: '12px' }}>
            General Average
          </td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{calculateGeneralAvg()}</td>
          <td style={{ border: '1px solid #000' }}></td>
        </tr>
      </tbody>
    </table>
  );
};

// Remedial Table Component
const RemedialTable: React.FC = () => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.5pt', tableLayout: 'fixed', marginTop: '2px' }}>
      <thead>
        <tr style={{ background: '#e0e0e0' }}>
          <th style={{ border: '1px solid #000', textAlign: 'left', padding: '1px 3px', width: '38%', fontWeight: 'bold', fontSize: '6.5pt' }}>
            Remedial Classes
          </th>
          <th colSpan={2} style={{ border: '1px solid #000', borderRight: 'none', textAlign: 'left', padding: '1px 3px', fontWeight: 'normal', fontSize: '6.5pt' }}>
            <span>Conducted from:</span>
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '50px', height: '10px', marginLeft: '3px' }}></span>
          </th>
          <th colSpan={2} style={{ border: '1px solid #000', textAlign: 'left', padding: '1px 3px', fontWeight: 'normal', fontSize: '6.5pt' }}>
            <span>to</span>
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '50px', height: '10px', marginLeft: '3px' }}></span>
          </th>
        </tr>
        <tr style={{ background: '#e0e0e0' }}>
          <th style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', fontWeight: 'bold', fontSize: '6.5pt' }}>LEARNING AREAS</th>
          <th style={{ border: '1px solid #000', textAlign: 'center', width: '15%', fontWeight: 'bold', fontSize: '6.5pt' }}>Final Rating</th>
          <th style={{ border: '1px solid #000', textAlign: 'center', width: '18%', fontWeight: 'bold', fontSize: '6.5pt' }}>Remedial Class Mark</th>
          <th style={{ border: '1px solid #000', textAlign: 'center', width: '20%', fontWeight: 'bold', fontSize: '6.5pt' }}>Recomputed Final Grade</th>
          <th style={{ border: '1px solid #000', textAlign: 'center', width: '12%', fontWeight: 'bold', fontSize: '6.5pt' }}>Remarks</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ border: '1px solid #000', height: '12px' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
        </tr>
        <tr>
          <td style={{ border: '1px solid #000', height: '12px' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
        </tr>
      </tbody>
    </table>
  );
};

// PAGE 2 Component
interface Page2Props {
  student?: StudentData;
  subjects?: SF10SubjectData[];
  isEditMode?: boolean;
  onSubjectGradeChange?: (index: number, field: keyof SF10SubjectData, value: number) => void;
}

const Page2: React.FC<Page2Props> = ({ student, subjects = [], isEditMode = false, onSubjectGradeChange }) => {
  return (
    <div style={{ 
      width: '215mm', 
      minHeight: '297mm', 
      margin: '0 auto', 
      padding: '5mm 7mm', 
      background: '#fff', 
      color: '#000',
      fontFamily: 'Arial, sans-serif',
      fontSize: '7pt',
      boxSizing: 'border-box'
    }}>
      {/* TOP BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2px', fontSize: '7pt' }}>
        <span><b>SF10-ES</b></span>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
          <span>Page 2 of</span>
          <div style={{ borderBottom: '1px solid #000', minWidth: '30px', height: '12px' }}></div>
        </div>
      </div>

      {/* SCHOLASTIC RECORD TITLE */}
      <div style={{ 
        background: '#000', 
        color: '#fff', 
        textAlign: 'center', 
        fontWeight: 'bold', 
        fontSize: '8pt', 
        padding: '2px 0',
        marginBottom: '3px'
      }}>
        SCHOLASTIC RECORD
      </div>

      {/* ROW 1: Grade 5 (left) | Grade 6 (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 6px', marginBottom: '4px' }}>
        
        {/* Grade 5 */}
        <GradeBlock 
          grade="Grade 5"
          subjects={['Filipino', 'English', 'Mathematics', 'Science', 'GMRC (Good Manners and Right Conduct)', 'Araling Panlipunan', 'EPP', 'MAPEH', 'Music & Arts', 'Physical Education & Health']}
          emptyRows={2}
          studentData={student}
          subjectGrades={subjects}
          isActive={student?.gradeLevel === 'Grade 5'}
          isEditMode={isEditMode}
          onSubjectGradeChange={onSubjectGradeChange}
        />

        {/* Grade 6 */}
        <GradeBlock 
          grade="Grade 6"
          subjects={['Filipino', 'English', 'Mathematics', 'Science', 'GMRC (Good Manners and Right Conduct)', 'Araling Panlipunan', 'EPP', 'MAPEH', 'Music & Arts', 'Physical Education & Health']}
          emptyRows={2}
          studentData={student}
          subjectGrades={subjects}
          isActive={student?.gradeLevel === 'Grade 6'}
          isEditMode={isEditMode}
          onSubjectGradeChange={onSubjectGradeChange}
        />

      </div>

      {/* ROW 2: Blank (left) | Blank (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 6px', marginBottom: '4px' }}>
        
        {/* Blank left */}
        <BlankGradeBlock />

        {/* Blank right */}
        <BlankGradeBlock />

      </div>

      {/* FOR TRANSFER OUT */}
      <div style={{ fontSize: '7pt', fontStyle: 'italic', margin: '6px 0 3px' }}>
        For Transfer Out /Elementary School Completer Only
      </div>

      {/* CERTIFICATION BOXES */}
      <CertificationBox />
      <CertificationBox />
      <CertificationBox />

      {/* BOTTOM BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '3px' }}>
        <span style={{ fontSize: '6pt', fontStyle: 'italic' }}>May add Certification Box if needed</span>
        <span style={{ fontSize: '6pt' }}>Revised 2025 based on DepEd Order No. 10, s. 2024</span>
      </div>
    </div>
  );
};

// Grade 4 Block
const Grade4Block: React.FC = () => {
  return (
    <div>
      <MetaRow />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.8pt', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: '#e0e0e0' }}>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'left', padding: '1px 3px', width: '42%', fontWeight: 'bold', fontSize: '6.5pt' }}>LEARNING AREAS</th>
            <th colSpan={4} style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '6.5pt' }}>Quarterly Rating</th>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'center', width: '12%', fontWeight: 'bold', fontSize: '6.5pt' }}>Final<br/>Rating</th>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'center', width: '10%', fontWeight: 'bold', fontSize: '6.5pt' }}>Remarks</th>
          </tr>
          <tr style={{ background: '#e0e0e0' }}>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>1</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>2</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>3</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>4</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>Filipino</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>English</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontWeight: 'bold' }}>Mathematics</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>Science</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>GMRC (Good Manners and Right Conduct)</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>Araling Panlipunan</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>EPP</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontWeight: 'bold' }}>MAPEH</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '8px', height: '13px', fontStyle: 'italic', fontSize: '6.5pt' }}>Music &amp; Arts</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '8px', height: '13px', fontStyle: 'italic', fontSize: '6.5pt' }}>Physical Education &amp; Health</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontStyle: 'italic', fontSize: '6.5pt' }}> *Arabic Language</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontStyle: 'italic', fontSize: '6.5pt' }}> *Islamic Values Education</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontWeight: 'bold' }}>General Average</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
        </tbody>
      </table>
      <Page2RemedialTable />
    </div>
  );
};

// Grade 5 Block
const Grade5Block: React.FC = () => {
  return (
    <div>
      <MetaRow />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.8pt', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: '#e0e0e0' }}>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'left', padding: '1px 3px', width: '42%', fontWeight: 'bold', fontSize: '6.5pt' }}>Learning Areas</th>
            <th colSpan={4} style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '6.5pt' }}>Quarterly Rating</th>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'center', width: '12%', fontWeight: 'bold', fontSize: '6.5pt' }}>Final<br/>Rating</th>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'center', width: '10%', fontWeight: 'bold', fontSize: '6.5pt' }}>Remarks</th>
          </tr>
          <tr style={{ background: '#e0e0e0' }}>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>1</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>2</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>3</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>4</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>Filipino</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>English</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontWeight: 'bold' }}>Mathematics</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>Science</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>GMRC (Good Manners and Right Conduct)</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>Araling Panlipunan</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>TLE</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontWeight: 'bold' }}>MAPEH</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '8px', height: '13px', fontStyle: 'italic', fontSize: '6.5pt' }}>Music &amp; Arts</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '8px', height: '13px', fontStyle: 'italic', fontSize: '6.5pt' }}>Physical Education &amp; Health</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontStyle: 'italic', fontSize: '6.5pt' }}> *Arabic Language</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontStyle: 'italic', fontSize: '6.5pt' }}> *Islamic Values Education</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontWeight: 'bold' }}>General Average</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
        </tbody>
      </table>
      <Page2RemedialTable />
    </div>
  );
};

// Grade 6 / Blank Block
const Grade6Block: React.FC = () => {
  return (
    <div>
      <MetaRow />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.8pt', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: '#e0e0e0' }}>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'left', padding: '1px 3px', width: '42%', fontWeight: 'bold', fontSize: '6.5pt' }}>Learning Areas</th>
            <th colSpan={4} style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '6.5pt' }}>Quarterly Rating</th>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'center', width: '12%', fontWeight: 'bold', fontSize: '6.5pt' }}>Final<br/>Rating</th>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'center', width: '10%', fontWeight: 'bold', fontSize: '6.5pt' }}>Remarks</th>
          </tr>
          <tr style={{ background: '#e0e0e0' }}>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>1</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>2</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>3</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>4</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 16 }).map((_, i) => (
            <tr key={i}><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          ))}
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontWeight: 'bold' }}>General Average</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
        </tbody>
      </table>
      <Page2RemedialTable />
    </div>
  );
};

// Blank Grade Block
const BlankGradeBlock: React.FC = () => {
  return (
    <div>
      <MetaRow />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.8pt', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: '#e0e0e0' }}>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'left', padding: '1px 3px', width: '42%', fontWeight: 'bold', fontSize: '6.5pt' }}>Learning Areas</th>
            <th colSpan={4} style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '6.5pt' }}>Quarterly Rating</th>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'center', width: '12%', fontWeight: 'bold', fontSize: '6.5pt' }}>Final<br/>Rating</th>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'center', width: '10%', fontWeight: 'bold', fontSize: '6.5pt' }}>Remarks</th>
          </tr>
          <tr style={{ background: '#e0e0e0' }}>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>1</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>2</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>3</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>4</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 16 }).map((_, i) => (
            <tr key={i}><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          ))}
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontWeight: 'bold' }}>General Average</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
        </tbody>
      </table>
      <Page2RemedialTable />
    </div>
  );
};

// Meta Row for Page 2
const MetaRow: React.FC = () => {
  return (
    <>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap', marginBottom: '1px' }}>
        <span style={{ whiteSpace: 'nowrap' }}>School:</span>
        <div style={{ borderBottom: '1px solid #000', flex: 1, minWidth: '25px', height: '12px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>School ID:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '30px', height: '12px' }}></div>
      </div>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap', marginBottom: '1px' }}>
        <span style={{ whiteSpace: 'nowrap' }}>District:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '25px', height: '12px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>Division:</span>
        <div style={{ borderBottom: '1px solid #000', flex: 1, height: '12px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>Region:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '20px', height: '12px' }}></div>
      </div>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap', marginBottom: '1px' }}>
        <span style={{ whiteSpace: 'nowrap' }}>Classified as Grade:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '18px', height: '12px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>Section:</span>
        <div style={{ borderBottom: '1px solid #000', flex: 1, height: '12px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>School Year:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '28px', height: '12px' }}></div>
      </div>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap', marginBottom: '2px' }}>
        <span style={{ whiteSpace: 'nowrap' }}>Name of Adviser/Teacher:</span>
        <div style={{ borderBottom: '1px solid #000', flex: 1, height: '12px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>Signature:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '35px', height: '12px' }}></div>
      </div>
    </>
  );
};

// Page 2 Remedial Table
const Page2RemedialTable: React.FC = () => {
  return (
    <div style={{ marginTop: '2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#e0e0e0', border: '1px solid #000', borderBottom: 'none', fontSize: '6.5pt', fontWeight: 'bold', padding: '1px 3px' }}>
        <b>Remedial Classes</b>
        <span>Date Conducted:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '28px', height: '11px', flex: 1 }}></div>
        <span>to</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '28px', height: '11px', flex: 1 }}></div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.5pt', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: '#e0e0e0' }}>
            <th style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', width: '40%', fontWeight: 'bold' }}>Learning Areas</th>
            <th style={{ border: '1px solid #000', textAlign: 'center', width: '15%', fontWeight: 'bold' }}>Final Rating</th>
            <th style={{ border: '1px solid #000', textAlign: 'center', width: '20%', fontWeight: 'bold' }}>Remedial Class Mark</th>
            <th style={{ border: '1px solid #000', textAlign: 'center', width: '20%', fontWeight: 'bold' }}>Recomputed Final Grade</th>
            <th style={{ border: '1px solid #000', textAlign: 'center', width: '15%', fontWeight: 'bold' }}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
        </tbody>
      </table>
    </div>
  );
};

// Certification Box
const CertificationBox: React.FC = () => {
  return (
    <div style={{ border: '1px solid #000', padding: '4px 6px', marginBottom: '5px' }}>
      <div style={{ background: '#000', color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: '8pt', padding: '2px 0', marginBottom: '4px' }}>
        CERTIFICATION
      </div>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', fontSize: '7pt', marginBottom: '3px', flexWrap: 'wrap' }}>
        <span style={{ whiteSpace: 'nowrap' }}>I CERTIFY that this is a true record of</span>
        <div style={{ borderBottom: '1px solid #000', flex: 1, minWidth: '40px', height: '13px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>with LRN</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '60px', height: '13px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>and that he/she is eligible for addmision to Grade</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '25px', height: '13px' }}></div>
        <span>.</span>
      </div>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', fontSize: '7pt', marginBottom: '3px', flexWrap: 'wrap' }}>
        <span style={{ whiteSpace: 'nowrap' }}>School Name:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '100px', height: '13px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>School ID</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '50px', height: '13px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>Division</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '70px', height: '13px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>Last School Year Attended:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '60px', height: '13px' }}></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px', fontSize: '7pt', gap: '10px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', minWidth: '120px', marginTop: '14px' }}></div>
          <div style={{ fontSize: '6.5pt' }}>Date</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ borderTop: '1px solid #000', margin: '14px auto 0', minWidth: '240px' }}></div>
          <div style={{ fontSize: '6.5pt' }}>Signature of Principal/School Head over Printed Name</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ border: '1px solid #000', width: '90px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6pt', color: '#555' }}>(Affix School Seal here)</div>
        </div>
      </div>
    </div>
  );
};

export default SF10Form;
