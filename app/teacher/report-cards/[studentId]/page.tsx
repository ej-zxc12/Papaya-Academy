'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Student, Grade } from '@/types';
import { ArrowLeft, Printer, Download, Loader2 } from 'lucide-react';
import TeacherLayout from '../../components/TeacherLayout';
import ReportCard from '@/components/ReportCard';
import { toPng } from 'html-to-image';
import { sortSubjectsByOrder } from '@/lib/subject-utils';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';

// Default subjects for higher grades (4+) - grades 1-3 will use manually created subjects
const defaultSubjects = [
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

interface StudentWithGrades extends Student {
  grades: Record<
    string,
    {
      quarters: [number | null, number | null, number | null, number | null];
      finalGrade?: number;
      remarks?: string;
    }
  >;
  age?: number;
  sex?: 'M' | 'F';
  lrn?: string;
  section?: string;
}

export default function ReportCardViewerPage() {
  const router = useRouter();
  const params = useParams<{ studentId: string }>();
  const searchParams = useSearchParams();

  const studentId = params?.studentId;
  const action = searchParams?.get('action');
  const schoolYearFromQuery = searchParams?.get('schoolYear');

  const [schoolYear, setSchoolYear] = useState(schoolYearFromQuery || '2024-2025');
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [student, setStudent] = useState<StudentWithGrades | null>(null);

  const reportCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = localStorage.getItem('teacherSession');
    if (!session) {
      router.push('/teacher/login');
      return;
    }

    try {
      const parsed = JSON.parse(session);
      const teacherId = parsed.teacher?.uid || parsed.teacher?.id || parsed.uid || parsed.id;
      setTeacherData(parsed.teacher || parsed);
      if (!teacherId) {
        router.push('/teacher/login');
        return;
      }
      void loadStudent(teacherId);
    } catch (error) {
      console.error('Error parsing session:', error);
      router.push('/teacher/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, studentId]);

  useEffect(() => {
    if (schoolYearFromQuery && schoolYearFromQuery !== schoolYear) {
      setSchoolYear(schoolYearFromQuery);
    }
  }, [schoolYearFromQuery, schoolYear]);

  // Real-time listener for grades - updates report card when any teacher adds/updates grades
  useEffect(() => {
    if (!studentId || !schoolYear) return;

    const gradesQuery = query(
      collection(db, 'grades'),
      where('studentId', '==', studentId),
      where('schoolYear', '==', schoolYear)
    );

    const unsubscribe = onSnapshot(gradesQuery, async (snapshot) => {
      // When grades change, reload the student data
      const session = localStorage.getItem('teacherSession');
      if (session) {
        const parsed = JSON.parse(session);
        const teacherId = parsed.teacher?.uid || parsed.teacher?.id || parsed.uid || parsed.id;
        if (teacherId) {
          await loadStudent(teacherId);
        }
      }
    }, (error) => {
      console.error('Error listening to grades:', error);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, schoolYear]);

  const loadStudent = async (teacherId: string) => {
    try {
      setIsLoading(true);

      const studentsResponse = await fetch('/api/teacher/students?scope=school', {
        headers: { Authorization: `Bearer ${teacherId}` },
      });

      if (!studentsResponse.ok) {
        throw new Error('Failed to load students');
      }

      const studentsData: Student[] = await studentsResponse.json();
      const found = studentsData.find((s) => s.id === studentId);

      if (!found) {
        setStudent(null);
        return;
      }

      // Fetch ALL grades for this student from ALL teachers (not just current teacher)
      const gradesResponse = await fetch(`/api/teacher/grades/student?studentId=${studentId}&schoolYear=${schoolYear}`, {
        headers: { Authorization: `Bearer ${teacherId}` },
      });

      let gradesData: Grade[] = [];
      if (gradesResponse.ok) {
        gradesData = await gradesResponse.json();
      }

      // Fetch ALL subjects from ALL teachers to properly resolve subject names
      const subjectsResponse = await fetch('/api/teacher/subjects?scope=school', {
        headers: { Authorization: `Bearer ${teacherId}` }
      });
      
      let subjectsData: any[] = [];
      if (subjectsResponse.ok) {
        subjectsData = await subjectsResponse.json();
      }

      // Create a map of subjectId to subjectName
      const subjectNamesMap = new Map<string, string>();
      subjectsData.forEach(subject => {
        subjectNamesMap.set(subject.id, subject.name);
      });

      const studentGrades: StudentWithGrades['grades'] = {};
      
      // Initialize with subjects that actually exist for this teacher
      // Only create entries for subjects that have been created by the teacher
      const studentGradeRecords = gradesData.filter((g) => g.studentId === found.id);
      
      // First, create entries for subjects that have actual grades
      studentGradeRecords.forEach((grade) => {
        const subjectName = subjectNamesMap.get(grade.subjectId) || grade.subjectId || '';
        if (!studentGrades[subjectName]) {
          studentGrades[subjectName] = { quarters: [null, null, null, null] };
        }
      });
      
      // Populate the grades and detect effective grade/section
      let effectiveGradeLevel = found.gradeLevel || '';
      let effectiveSection = (found as any).section || '';

      if (studentGradeRecords.length > 0) {
        // Use the first grade record's level/section as the source of truth for this year
        effectiveGradeLevel = studentGradeRecords[0].gradeLevel || effectiveGradeLevel;
        effectiveSection = studentGradeRecords[0].section || effectiveSection;
        
        studentGradeRecords.forEach((grade) => {
          const subjectName = subjectNamesMap.get(grade.subjectId) || grade.subjectId || '';
          const quarterIndex =
            grade.quarter === 'Q1' ? 0 : grade.quarter === 'Q2' ? 1 : grade.quarter === 'Q3' ? 2 : 3;

          if (!studentGrades[subjectName]) {
            studentGrades[subjectName] = { quarters: [null, null, null, null] };
          }

          studentGrades[subjectName].quarters[quarterIndex] = grade.grade;
        });
      }

      Object.keys(studentGrades).forEach((subject) => {
        const quarters = studentGrades[subject].quarters;
        const validGrades = quarters.filter((g) => g !== null) as number[];

        if (validGrades.length > 0) {
          const average = validGrades.reduce((a, b) => a + b, 0) / validGrades.length;
          studentGrades[subject].finalGrade = Math.round(average);
          studentGrades[subject].remarks = studentGrades[subject].finalGrade! >= 75 ? 'Passed' : 'Failed';
        }
      });

      // Update student data with detected effective values
      setStudent({
        ...found,
        grades: studentGrades,
        age: (found as any).age || 0,
        sex: (found as any).gender || (found as any).sex || 'M',
        lrn: (found as any).lrn || '',
        section: effectiveSection,
        gradeLevel: effectiveGradeLevel,
      });
    } catch (error) {
      console.error('Error loading student:', error);
      setStudent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const subjects = useMemo(() => {
    if (!student) return [];
    const subjectsArray = Object.entries(student.grades).map(([subject, data]) => ({
      learningArea: subject,
      quarters: data.quarters,
      finalGrade: data.finalGrade,
      remarks: data.remarks,
    }));
    // Sort subjects according to official DepEd order (grade-specific)
    return sortSubjectsByOrder(subjectsArray, student.gradeLevel);
  }, [student]);

  const handlePrint = () => {
    if (reportCardRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const printContent = reportCardRef.current.innerHTML;
        const printStyles = `
          <style>
            @page {
              size: letter landscape;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .report-card {
              width: 11in;
              height: 8.5in;
              margin: 0;
              padding: 0.16in;
              box-shadow: none;
              border: none;
            }
          </style>
        `;
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Report Card - ${student?.name}</title>
            ${printStyles}
          </head>
          <body>
            ${printContent}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      }
    }
  };

  const handleDownloadImage = async () => {
    if (!reportCardRef.current || !student) return;

    try {
      setIsDownloading(true);
      const dataUrl = await toPng(reportCardRef.current, { quality: 1, pixelRatio: 2 });

      // Create PDF with Letter landscape size (11 x 8.5 inches)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'in',
        format: 'letter'
      });

      // Calculate dimensions to fit the image on Letter landscape
      const img = new Image();
      img.src = dataUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const pdfWidth = 11; // Letter landscape width in inches
      const pdfHeight = 8.5; // Letter landscape height in inches
      const imgWidth = img.width;
      const imgHeight = img.height;

      // Calculate scaling to fit the image on the page
      const scale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 72; // Convert to points
      const scaledWidth = imgWidth * scale / 72;
      const scaledHeight = imgHeight * scale / 72;

      // Center the image on the page
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;

      pdf.addImage(dataUrl, 'PNG', x, y, scaledWidth, scaledHeight);
      pdf.save(`ReportCard_${student.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (action === 'print') {
      const t = window.setTimeout(() => handlePrint(), 150);
      return () => window.clearTimeout(t);
    }
    if (action === 'download') {
      const t = window.setTimeout(() => void handleDownloadImage(), 200);
      return () => window.clearTimeout(t);
    }
  }, [action]);

  const subtitle = useMemo(() => {
    if (!student) return 'View and print official student report card';
    return `${student.name} • ${student.gradeLevel}${student.section ? ` • ${student.section}` : ''}`;
  }, [student]);

  if (isLoading) {
    return (
      <TeacherLayout title="Report Card" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B3E2A]" />
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout title="Report Card" subtitle={subtitle}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          onClick={() => router.push('/teacher/report-cards')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={schoolYear}
            onChange={(e) => setSchoolYear(e.target.value)}
            className="w-[130px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
          />

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3E2A] text-white rounded-lg hover:bg-[#2d5a3f]"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading ? 'Downloading...' : 'Download'}
          </button>
        </div>
      </div>

      {!student ? (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
          <p className="text-gray-600">Student not found.</p>
        </div>
      ) : (
        <div className="bg-gray-100 p-4 rounded-lg flex justify-center overflow-x-auto">
          <div className="bg-white shadow-lg">
            <ReportCard
              printRef={reportCardRef}
              studentName={student.name}
              age={student.age?.toString() || ''}
              sex={student.sex || 'M'}
              grade={student.gradeLevel}
              section={student.section || ''}
              lrn={student.lrn || student.id}
              schoolYear={schoolYear}
              trackStrand=""
              subjects={subjects}
              schoolName="PAPAYA ACADEMY INC."
              division="Division of Rizal"
              region="Region IV - A"
              principalName="Sheryl Ann B. Queliza"
              adviserName={teacherData?.name || 'Teacher'}
            />
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}
