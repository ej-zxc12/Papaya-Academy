'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Student, Grade } from '@/types';
import { 
  Printer, 
  Download, 
  Search,
  FileText,
  GraduationCap,
  Loader2,
  Eye,
  Filter
} from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';

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
  grades: Record<string, {
    quarters: [number | null, number | null, number | null, number | null];
    finalGrade?: number;
    remarks?: string;
  }>;
  age?: number;
  sex?: 'M' | 'F';
  lrn?: string;
  section?: string;
}

export default function ReportCardsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentWithGrades[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentWithGrades[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [schoolYear, setSchoolYear] = useState('2025-2026');
  const [teacherData, setTeacherData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('teacherSession');
    if (!session) {
      router.push('/teacher/login');
      return;
    }

    try {
      const parsed = JSON.parse(session);
      setTeacherData(parsed.teacher || parsed);
      loadStudents(parsed.teacher?.uid || parsed.teacher?.id || parsed.uid || parsed.id);
    } catch (error) {
      console.error('Error parsing session:', error);
      router.push('/teacher/login');
    }
  }, [router]);

  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.lrn && s.lrn.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.section && s.section.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedGradeLevel) {
      filtered = filtered.filter(s => s.gradeLevel === selectedGradeLevel);
    }

    if (selectedSection) {
      filtered = filtered.filter(s => s.section === selectedSection);
    }

    setFilteredStudents(filtered);
  }, [searchTerm, selectedGradeLevel, selectedSection, students]);

  const loadStudents = async (teacherId: string) => {
    try {
      setIsLoading(true);
      
      const studentsResponse = await fetch('/api/teacher/students', {
        headers: { 'Authorization': `Bearer ${teacherId}` }
      });

      if (!studentsResponse.ok) {
        throw new Error('Failed to load students');
      }

      const studentsData: Student[] = await studentsResponse.json();

      const gradesResponse = await fetch(`/api/teacher/grades/all?teacherId=${teacherId}`, {
        headers: { 'Authorization': `Bearer ${teacherId}` }
      });

      let gradesData: Grade[] = [];
      if (gradesResponse.ok) {
        gradesData = await gradesResponse.json();
      }

      const processedStudents = studentsData.map(student => {
        const studentGrades: Record<string, {
          quarters: [number | null, number | null, number | null, number | null];
          finalGrade?: number;
          remarks?: string;
        }> = {};

        defaultSubjects.forEach(subject => {
          studentGrades[subject] = {
            quarters: [null, null, null, null],
          };
        });

        const studentGradeRecords = gradesData.filter(g => g.studentId === student.id);
        
        studentGradeRecords.forEach(grade => {
          const subjectName = grade.subjectId || 'Unknown Subject';
          const quarterIndex = grade.quarter === 'Q1' ? 0 : 
                              grade.quarter === 'Q2' ? 1 : 
                              grade.quarter === 'Q3' ? 2 : 3;
          
          if (!studentGrades[subjectName]) {
            studentGrades[subjectName] = { quarters: [null, null, null, null] };
          }
          
          studentGrades[subjectName].quarters[quarterIndex] = grade.grade;
        });

        Object.keys(studentGrades).forEach(subject => {
          const quarters = studentGrades[subject].quarters;
          const validGrades = quarters.filter(g => g !== null) as number[];
          
          if (validGrades.length > 0) {
            const average = validGrades.reduce((a, b) => a + b, 0) / validGrades.length;
            studentGrades[subject].finalGrade = Math.round(average * 100) / 100;
            studentGrades[subject].remarks = studentGrades[subject].finalGrade! >= 75 ? 'Passed' : 'Failed';
          }
        });

        return {
          ...student,
          grades: studentGrades,
          age: (student as any).age || 12,
          sex: (student as any).sex || 'M',
          lrn: (student as any).lrn || student.id,
          section: (student as any).section || 'Section A',
        } as StudentWithGrades;
      });

      setStudents(processedStudents);
      setFilteredStudents(processedStudents);

    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (student: StudentWithGrades) => {
    router.push(`/teacher/report-cards/${encodeURIComponent(student.id)}?schoolYear=${encodeURIComponent(schoolYear)}`);
  };

  const handleDownload = (student: StudentWithGrades) => {
    router.push(
      `/teacher/report-cards/${encodeURIComponent(student.id)}?action=download&schoolYear=${encodeURIComponent(schoolYear)}`
    );
  };

  const handlePrint = (student: StudentWithGrades) => {
    router.push(
      `/teacher/report-cards/${encodeURIComponent(student.id)}?action=print&schoolYear=${encodeURIComponent(schoolYear)}`
    );
  };

  // Extract unique grade levels and sections
  const availableGradeLevels = Array.from(new Set(students.map(s => s.gradeLevel))).filter(Boolean) as string[];
  const availableSections = Array.from(new Set(students.map(s => s.section))).filter(Boolean) as string[];

  if (isLoading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B3E2A]" />
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout 
      title="Student Report Cards" 
      subtitle="Generate and print official student report cards"
    >
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name, ID, or section..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-[#1B3E2A]"
            />
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                <select
                  value={selectedGradeLevel}
                  onChange={(e) => setSelectedGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
                >
                  <option value="">All Grade Levels</option>
                  {availableGradeLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
                >
                  <option value="">All Sections</option>
                  {availableSections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Year</label>
                <input
                  type="text"
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Directory Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Student Report Cards</h2>
                <p className="text-sm text-gray-500">Managing {filteredStudents.length} total student records</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No students found</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.gradeLevel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Button */}
                        <button
                          onClick={() => handleView(student)}
                          className="p-2 text-gray-500 hover:text-[#1B3E2A] hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Report Card"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Download Button */}
                        <button
                          onClick={() => handleDownload(student)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Print Button */}
                        <button
                          onClick={() => handlePrint(student)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Print Report Card"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination / Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {filteredStudents.length} of {students.length} student records
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded">
              1
            </button>
            <button className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      </div>

    </TeacherLayout>
  );
}
