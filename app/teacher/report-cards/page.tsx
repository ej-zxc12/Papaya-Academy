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
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

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
  const [schoolYear, setSchoolYear] = useState('');
  const [teacherData, setTeacherData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [availableSchoolYears, setAvailableSchoolYears] = useState<string[]>([]);

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Load subjects and students to get available school years
  useEffect(() => {
    const loadData = async () => {
      const session = localStorage.getItem('teacherSession');
      if (!session) {
        router.push('/teacher/login');
        return;
      }

      try {
        const parsed = JSON.parse(session);
        const teacherId = parsed.teacher?.uid || parsed.teacher?.id || parsed.uid || parsed.id;
        setTeacherData(parsed.teacher || parsed);
        
        // Fetch subjects to get the school year
        const subjectsResponse = await fetch('/api/teacher/subjects', {
          headers: { 'Authorization': `Bearer ${teacherId}` }
        });
        
        // Fetch students and grades to get school years
        const studentsResponse = await fetch('/api/teacher/students?scope=school', {
          headers: { 'Authorization': `Bearer ${teacherId}` }
        });

        // Fetch all grades to get historical school years
        const gradesResponse = await fetch('/api/teacher/grades/student?studentId=all', {
          headers: { 'Authorization': `Bearer ${teacherId}` }
        });

        console.log('🔍 DEBUG: Grades response status:', gradesResponse.status);

        const schoolYearsSet = new Set<string>();

        // Get school years from students
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          console.log('🔍 DEBUG: Students loaded:', studentsData.length);
          studentsData.forEach((s: any) => {
            if (s.schoolYear) {
              console.log('🔍 DEBUG: Adding student schoolYear:', s.schoolYear);
              schoolYearsSet.add(s.schoolYear);
            }
          });
        }

        // Get school years from grades (historical data)
        if (gradesResponse.ok) {
          const gradesData = await gradesResponse.json();
          console.log('🔍 DEBUG: Grades loaded:', gradesData.length);
          gradesData.forEach((g: any) => {
            if (g.schoolYear) {
              console.log('🔍 DEBUG: Adding grade schoolYear:', g.schoolYear);
              schoolYearsSet.add(g.schoolYear);
            }
          });
        } else {
          console.error('🔍 DEBUG: Grades fetch failed:', gradesResponse.statusText);
        }

        if (subjectsResponse.ok) {
          const subjectsData = await subjectsResponse.json();
          setSubjects(subjectsData);
        }
        
        const schoolYears = Array.from(schoolYearsSet).sort();
        console.log('🔍 DEBUG: Final school years:', schoolYears);
        setAvailableSchoolYears(schoolYears);
        
        if (schoolYears.length > 0 && !schoolYear) {
          setSchoolYear(schoolYears[0]);
        } else if (schoolYears.length === 0 && !schoolYear) {
          setSchoolYear('2024-2025'); // fallback only if no data
        }
      } catch (error) {
        console.error('Error loading data:', error);
        if (!schoolYear) setSchoolYear('2024-2025'); // fallback
      }
    };
    
    loadData();
  }, [router]); // Remove schoolYear from dependencies to prevent reset

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

  // Load students when schoolYear is determined
  useEffect(() => {
    if (!schoolYear) return;
    const teacherId = teacherData?.uid || teacherData?.id;
    if (!teacherId) return;
    
    loadStudents(teacherId);
  }, [schoolYear, teacherData]);

  // Real-time listener for ALL grades - updates when any teacher adds/updates grades
  useEffect(() => {
    if (!teacherData || !schoolYear) return;
    const teacherId = teacherData?.uid || teacherData?.id;
    if (!teacherId) return;

    const gradesQuery = query(
      collection(db, 'grades'),
      where('schoolYear', '==', schoolYear)
    );

    const unsubscribe = onSnapshot(gradesQuery, async () => {
      // Reload all student data when any grade changes
      await loadStudents(teacherId);
    }, (error) => {
      console.error('Error listening to grades:', error);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherData, schoolYear]);

  const loadStudents = async (teacherId: string) => {
    try {
      setIsLoading(true);
      
      const studentsResponse = await fetch('/api/teacher/students?scope=school', {
        headers: { 'Authorization': `Bearer ${teacherId}` }
      });

      if (!studentsResponse.ok) {
        throw new Error('Failed to load students');
      }

      const studentsData: Student[] = await studentsResponse.json();
      console.log('🔍 DEBUG: Total students fetched:', studentsData.length);
      console.log('🔍 DEBUG: Students with their schoolYear:', studentsData.map(s => ({ id: s.id, name: s.name, schoolYear: s.schoolYear })));

      // Fetch ALL grades for ALL students in the school (from all teachers)
      // This allows seeing grades entered by other teachers
      const gradesResponse = await fetch(`/api/teacher/grades/student?studentId=all&schoolYear=${schoolYear}`, {
        headers: { 'Authorization': `Bearer ${teacherId}` }
      });

      let gradesData: Grade[] = [];
      if (gradesResponse.ok) {
        gradesData = await gradesResponse.json();
      }

      console.log('🔍 DEBUG: Fetching grades for schoolYear:', schoolYear);
      console.log('🔍 DEBUG: Total grades fetched:', gradesData.length);
      console.log('🔍 DEBUG: All grades fetched from API:', gradesData.map(g => ({
        studentId: g.studentId,
        studentName: studentsData.find(s => s.id === g.studentId)?.name || 'Unknown',
        subjectId: g.subjectId,
        grade: g.grade,
        quarter: g.quarter,
        schoolYear: g.schoolYear
      })));

      console.log('🔍 SIMPLE DEBUG: Total grades count:', gradesData.length);
      gradesData.forEach((grade, index) => {
        console.log(`🔍 Grade ${index + 1}:`, {
          studentId: grade.studentId,
          subjectId: grade.subjectId,
          grade: grade.grade,
          quarter: grade.quarter
        });
      });

      // Fetch ALL subjects from ALL teachers to properly resolve subject names
      const subjectsResponse = await fetch('/api/teacher/subjects?scope=school', {
        headers: { 'Authorization': `Bearer ${teacherId}` }
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

      console.log('🔍 DEBUG: Available subjects:', subjectsData.map(s => ({ id: s.id, name: s.name })));
      console.log('🔍 DEBUG: Subject names map:', Object.fromEntries(subjectNamesMap));

      const processedStudents = studentsData.map(student => {
        const studentGrades: Record<string, {
          quarters: [number | null, number | null, number | null, number | null];
          finalGrade?: number;
          remarks?: string;
        }> = {};

        // Extract historical info if available for the selected school year
        const historicalRecord = (student as any).academicRecords?.[schoolYear];
        
        // Find if any grade record exists for this student in this school year that has gradeLevel/section
        const studentGradeRecords = gradesData.filter(g => g.studentId === student.id);
        const gradeLevelFromGrades = studentGradeRecords.find(g => g.gradeLevel)?.gradeLevel;
        const sectionFromGrades = studentGradeRecords.find(g => g.section)?.section;

        const displayGradeLevel = gradeLevelFromGrades || historicalRecord?.gradeLevel || student.gradeLevel;
        const displaySection = sectionFromGrades || historicalRecord?.section || student.section || '';
        
        console.log(`🔍 DEBUG: Student ${student.name} has ${studentGradeRecords.length} grade records:`, studentGradeRecords.map(g => ({
          subjectId: g.subjectId,
          subjectName: g.subjectName,
          grade: g.grade,
          quarter: g.quarter
        })));
        
        studentGradeRecords.forEach(grade => {
          // Get subject name from subjects collection
          const subjectName = subjectNamesMap.get(grade.subjectId) || grade.subjectId || '';
          
          console.log(`🔍 DEBUG: Processing grade - SubjectID: ${grade.subjectId}, ResolvedName: ${subjectName}, Grade: ${grade.grade}`);
          
          if (!studentGrades[subjectName]) {
            studentGrades[subjectName] = { quarters: [null, null, null, null] };
          }
          
          // Handle both quarter formats (Q1-Q4 and numeric)
          const quarterIndex = grade.quarter === 'Q1' ? 0 : 
                              grade.quarter === 'Q2' ? 1 : 
                              grade.quarter === 'Q3' ? 2 : 
                              grade.quarter === 'Q4' ? 3 : 
                              parseInt((grade.quarter as string).replace('Q', '')) - 1;
          
          if (quarterIndex >= 0 && quarterIndex <= 3) {
            studentGrades[subjectName].quarters[quarterIndex] = grade.grade;
          }
        });

        Object.keys(studentGrades).forEach(subject => {
          const quarters = studentGrades[subject].quarters;
          const validGrades = quarters.filter(g => g !== null) as number[];

          if (validGrades.length > 0) {
            const average = validGrades.reduce((a, b) => a + b, 0) / validGrades.length;
            studentGrades[subject].finalGrade = Math.round(average);
            studentGrades[subject].remarks = studentGrades[subject].finalGrade! >= 75 ? 'Passed' : 'Failed';
          }
        });

        return {
          ...student,
          grades: studentGrades,
          age: (student as any).age || 12,
          sex: (student as any).sex || 'M',
          lrn: (student as any).lrn || student.id,
          gradeLevel: displayGradeLevel,
          section: displaySection,
        } as StudentWithGrades;
      });

      console.log('🔍 DEBUG: Total processed students:', processedStudents.length);
      console.log('🔍 DEBUG: Students with grades for', schoolYear, ':', processedStudents.filter(s => Object.keys(s.grades).length > 0).map(s => ({ id: s.id, name: s.name, gradeCount: Object.keys(s.grades).length })));

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
      <style jsx global>{`
        @keyframes jump {
          0%, 100% { transform: translateY(-50%); }
          50% { transform: translateY(-80%); }
        }
        .animate-icon-jump {
          animation: jump 0.4s ease-in-out;
        }
      `}</style>

      {/* Action Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 z-20">
          {/* Search Bar */}
          <div className="relative group flex-1 sm:flex-none">
            <div className={`absolute inset-0 bg-gradient-to-r from-[#1B3E2A] to-[#F2C94C] rounded-lg opacity-0 transition-opacity duration-300 blur-sm ${isSearchFocused ? 'opacity-100' : 'group-hover:opacity-100'}`}></div>
            <div className="relative flex items-center h-11">
              <Search 
                className={`w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${isSearchFocused ? 'text-[#1B3E2A] animate-icon-jump' : 'group-focus-within:text-[#1B3E2A]'}`} 
              />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="h-full pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent bg-white transition-all duration-300 w-full sm:w-64 group-hover:border-[#1B3E2A] text-sm"
              />
            </div>
          </div>
          
          {/* School Year Selector */}
          {availableSchoolYears.length > 0 && (
            <div className="relative">
              <select
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                className="h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent bg-white text-sm"
              >
                {availableSchoolYears.map(year => (
                  <option key={year} value={year}>SY {year}</option>
                ))}
              </select>
            </div>
          )}

          {/* Filters Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-11 px-4 flex items-center gap-2 border border-gray-300 rounded-lg transition-all duration-300 text-sm ${showFilters ? 'bg-[#1B3E2A] text-white border-[#1B3E2A]' : 'bg-white text-gray-700 hover:border-[#1B3E2A]'}`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Grade Level</label>
              <select
                value={selectedGradeLevel}
                onChange={(e) => setSelectedGradeLevel(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent text-sm"
              >
                <option value="">All Grade Levels</option>
                {availableGradeLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent text-sm"
              >
                <option value="">All Sections</option>
                {availableSections.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Directory Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 z-0">
        {/* Enhanced Header - Matching SF10 Style */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#F2C94C] to-[#e5b840] text-[#1B3E2A]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Student Report Cards ({filteredStudents.length})
            </h3>
            <div className="flex items-center gap-2 text-sm font-medium">
              <GraduationCap className="w-4 h-4" />
              <span>SY {schoolYear}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-[#f0f7f3]">
              <tr>
                <th className="w-[20%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                  Student ID
                </th>
                <th className="w-[30%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                  Student Name
                </th>
                <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                  Grade Level
                </th>
                <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                  Section
                </th>
                <th className="w-[20%] px-6 py-4 text-center text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        LRN: {student.lrn}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.gradeLevel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Button */}
                        <button
                          onClick={() => handleView(student)}
                          className="p-2 text-[#1B3E2A] hover:text-[#F2C94C] transition-colors"
                          title="View Report Card"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Download Button */}
                        <button
                          onClick={() => handleDownload(student)}
                          className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Print Button */}
                        <button
                          onClick={() => handlePrint(student)}
                          className="p-2 text-green-600 hover:text-green-800 transition-colors"
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
