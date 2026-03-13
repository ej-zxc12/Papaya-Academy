'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, Loader2, Printer } from 'lucide-react';
import TeacherLayout from '../../components/TeacherLayout';
import ReportCard from '@/components/ReportCard';
import { Grade, Student } from '@/types';
import { toPng } from 'html-to-image';

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
  'Physical Education & Health',
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

  const [schoolYear, setSchoolYear] = useState(schoolYearFromQuery || '2025-2026');
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

  const loadStudent = async (teacherId: string) => {
    try {
      setIsLoading(true);

      const studentsResponse = await fetch('/api/teacher/students', {
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

      const gradesResponse = await fetch(`/api/teacher/grades/all?teacherId=${teacherId}`, {
        headers: { Authorization: `Bearer ${teacherId}` },
      });

      let gradesData: Grade[] = [];
      if (gradesResponse.ok) {
        gradesData = await gradesResponse.json();
      }

      const studentGrades: StudentWithGrades['grades'] = {};
      defaultSubjects.forEach((subject) => {
        studentGrades[subject] = {
          quarters: [null, null, null, null],
        };
      });

      const studentGradeRecords = gradesData.filter((g) => g.studentId === found.id);
      studentGradeRecords.forEach((grade) => {
        const subjectName = grade.subjectId || 'Unknown Subject';
        const quarterIndex =
          grade.quarter === 'Q1' ? 0 : grade.quarter === 'Q2' ? 1 : grade.quarter === 'Q3' ? 2 : 3;

        if (!studentGrades[subjectName]) {
          studentGrades[subjectName] = { quarters: [null, null, null, null] };
        }

        studentGrades[subjectName].quarters[quarterIndex] = grade.grade;
      });

      Object.keys(studentGrades).forEach((subject) => {
        const quarters = studentGrades[subject].quarters;
        const validGrades = quarters.filter((g) => g !== null) as number[];

        if (validGrades.length > 0) {
          const average = validGrades.reduce((a, b) => a + b, 0) / validGrades.length;
          studentGrades[subject].finalGrade = Math.round(average * 100) / 100;
          studentGrades[subject].remarks = studentGrades[subject].finalGrade! >= 75 ? 'Passed' : 'Failed';
        }
      });

      // Update student data with fallbacks
      setStudent({
        ...found,
        grades: studentGrades,
        age: (found as any).age || 0,
        sex: (found as any).sex || 'M',
        lrn: (found as any).lrn || '',
        section: (found as any).section || '',
        gradeLevel: (found as any).gradeLevel || '',
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
    return Object.entries(student.grades).map(([subject, data]) => ({
      learningArea: subject,
      quarters: data.quarters,
      finalGrade: data.finalGrade,
      remarks: data.remarks,
    }));
  }, [student]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!reportCardRef.current || !student) return;

    try {
      setIsDownloading(true);
      const dataUrl = await toPng(reportCardRef.current, { quality: 1, pixelRatio: 2 });

      const link = document.createElement('a');
      link.download = `ReportCard_${student.name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
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
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-hidden {
            display: none !important;
          }
          .print-area {
            padding: 0 !important;
            background: #fff !important;
          }
          .a4-frame {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          onClick={() => router.push('/teacher/report-cards')}
          className="print-hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="print-hidden flex items-center gap-2">
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
        <div className="print-area bg-gray-100 p-4 rounded-lg flex justify-center overflow-x-auto">
          <div className="a4-frame bg-white shadow-lg">
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
