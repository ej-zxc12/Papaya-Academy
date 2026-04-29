'use client';

import { useState, useEffect } from 'react';
import { Eye, FileText, Search, Clock, BarChart3, Plus, Download, Edit, Trash2 } from 'lucide-react';
import TeacherLayout from '../../components/TeacherLayout';
import SF10Form from '../SF10Form';

interface SF10Subject {
  subjectCode: string;
  subjectName: string;
  firstGrading: number;
  secondGrading: number;
  thirdGrading: number;
  fourthGrading: number;
  finalRating: number;
  remarks: string;
}

interface StudentInfo {
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
}

interface SF10Record {
  student: StudentInfo;
  sf10: {
    id: string;
    studentId: string;
    studentName: string;
    gradeLevel: string;
    section: string;
    schoolYear: string;
    generalAverage: number;
    status: string;
    dateCompleted: string;
    subjects: SF10Subject[];
    adviserName?: string;
  };
  completionStatus: {
    firstGrading: boolean;
    secondGrading: boolean;
    thirdGrading: boolean;
    fourthGrading: boolean;
    overall: boolean;
    completedSubjects: number;
    totalSubjects: number;
  };
}

export default function SF10List() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sf10Records, setSF10Records] = useState<SF10Record[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Client-side caching
  const [cache, setCache] = useState<Map<string, { data: SF10Record[], timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const [selectedSF10, setSelectedSF10] = useState<SF10Record | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewStudentGrades, setViewStudentGrades] = useState<SF10Subject[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  
  // Edit Mode States
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableStudent, setEditableStudent] = useState<any>(null);
  const [editableSubjects, setEditableSubjects] = useState<SF10Subject[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // UI Interaction States
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('');
  const [availableSchoolYears, setAvailableSchoolYears] = useState<string[]>([]);

  // Load subjects and students to get school years
  useEffect(() => {
    const loadData = async () => {
      const session = localStorage.getItem('teacherSession');
      if (!session) return;

      const teacherData = JSON.parse(session);
      const teacherId = teacherData?.teacher?.id || teacherData?.teacher?.uid || teacherData?.id;

      try {
        // Fetch subjects
        const subjectsResponse = await fetch('/api/teacher/subjects', {
          headers: { 'Authorization': `Bearer ${teacherId}` }
        });

        // Fetch students to get school years
        const studentsResponse = await fetch('/api/teacher/students?scope=school', {
          headers: { 'Authorization': `Bearer ${teacherId}` }
        });

        // Fetch all grades to get historical school years
        const gradesResponse = await fetch('/api/teacher/grades/student?studentId=all', {
          headers: { 'Authorization': `Bearer ${teacherId}` }
        });

        const schoolYearsSet = new Set<string>();

        if (subjectsResponse.ok) {
          const subjectsData = await subjectsResponse.json();
          setSubjects(subjectsData);
        }

        // Get school years from students
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          studentsData.forEach((s: any) => {
            if (s.schoolYear) schoolYearsSet.add(s.schoolYear);
          });
        }

        // Get school years from grades (historical data)
        if (gradesResponse.ok) {
          const gradesData = await gradesResponse.json();
          gradesData.forEach((g: any) => {
            if (g.schoolYear) schoolYearsSet.add(g.schoolYear);
          });
        }

        const schoolYears = Array.from(schoolYearsSet);
        setAvailableSchoolYears(schoolYears);

        if (schoolYears.length > 0 && !selectedSchoolYear) {
          setSelectedSchoolYear(schoolYears[0]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (selectedSchoolYear) {
      fetchSF10Records(selectedSchoolYear);
    }
  }, [selectedSchoolYear]);

  const fetchSF10Records = async (schoolYear?: string) => {
    try {
      const cacheKey = schoolYear || 'default';
      const now = Date.now();
      
      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        console.log('Using cached SF10 data for', cacheKey);
        setSF10Records(cached.data);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      const url = schoolYear ? `/api/teacher/sf10?schoolYear=${encodeURIComponent(schoolYear)}` : '/api/teacher/sf10';
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.message || `Failed to fetch SF10 records (${response.status})`);
      }
      
      const data = await response.json();
      
      // DEBUG: Log the API response
      console.log('SF10 API Response:', data);
      console.log('Total records:', data.totalRecords);
      console.log('SF10 Records:', data.sf10Records);
      
      // DEBUG: Log debug info from API
      if (data.debug) {
        console.log('=== DEBUG INFO ===');
        console.log('Source:', data.debug.source);
        console.log('Report cards checked:', data.debug.reportCardsChecked);
        if (data.debug.logs) {
          console.log('Logs:');
          data.debug.logs.forEach((log: string, i: number) => {
            console.log(`  ${i + 1}. ${log}`);
          });
        }
      }
      
      const records = data.sf10Records || [];
      
      // Update cache
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.set(cacheKey, { data: records, timestamp: now });
        return newCache;
      });
      
      setSF10Records(records);
    } catch (err) {
      console.error('Error fetching SF10 records:', err);
      setError(err instanceof Error ? err.message : 'Failed to load SF10 records');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = sf10Records.filter(record =>
    record.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.student.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.student.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'promoted':
        return 'text-green-600 bg-green-100';
      case 'retained':
        return 'text-red-600 bg-red-100';
      case 'transferred':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleViewSF10 = async (record: SF10Record) => {
    setSelectedSF10(record);
    setIsViewModalOpen(true);
    
    // Fetch grades by year for two-column layout
    await fetchStudentGradesByYear(record.student.id);
  };

  const [yearData, setYearData] = useState<any[]>([]);
  const [sf10ViewMode, setSf10ViewMode] = useState<'single' | 'byYear'>('byYear');

  const fetchStudentGradesByYear = async (studentId: string) => {
    try {
      setIsLoadingGrades(true);
      
      const session = localStorage.getItem('teacherSession');
      const teacherId = session ? JSON.parse(session).teacher?.id || JSON.parse(session).teacher?.uid : null;
      
      // Fetch SF10 data by year for two-column layout
      const response = await fetch(`/api/teacher/sf10?studentId=${studentId}&view=byYear`, {
        headers: { Authorization: `Bearer ${teacherId}` },
      });
      
      if (!response.ok) {
        // Fall back to single year view if byYear fails
        console.log('ByYear view failed, falling back to single year');
        await fetchStudentGrades(studentId, selectedSchoolYear || '2024-2025');
        setSf10ViewMode('single');
        return;
      }
      
      const data = await response.json();
      console.log('ByYear SF10 data:', data);
      
      if (data.yearData && data.yearData.length > 0) {
        setYearData(data.yearData);
        setSf10ViewMode('byYear');
        // For backward compatibility, also set viewStudentGrades with first year's subjects
        setViewStudentGrades(data.yearData[0]?.subjects || []);
      } else {
        setYearData([]);
        setSf10ViewMode('single');
        await fetchStudentGrades(studentId, selectedSchoolYear || '2024-2025');
      }
    } catch (err) {
      console.error('Error fetching byYear grades:', err);
      // Fall back to single year
      setSf10ViewMode('single');
      await fetchStudentGrades(studentId, selectedSchoolYear || '2024-2025');
    } finally {
      setIsLoadingGrades(false);
    }
  };

  const handleGenerateSF10 = async () => {
    if (!selectedSF10) return;
    
    try {
      setIsGenerating(true);
      
      const session = localStorage.getItem('teacherSession');
      const teacherId = session ? JSON.parse(session).teacher?.id || JSON.parse(session).teacher?.uid : null;
      
      // Use the school year from the selected record or fall back to selectedSchoolYear
      const schoolYearToUse = selectedSF10.sf10?.schoolYear || selectedSchoolYear || '2024-2025';
      
      const response = await fetch('/api/teacher/sf10/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${teacherId}`
        },
        body: JSON.stringify({
          studentId: selectedSF10.student.id,
          schoolYear: schoolYearToUse
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate SF10');
      }
      
      const result = await response.json();
      console.log('SF10 generated:', result);
      
      // Refresh the records list
      await fetchSF10Records();
      
      // Update the selected SF10 with the newly generated data
      setSelectedSF10(prev => prev ? {
        ...prev,
        sf10: result.sf10
      } : null);
      
      alert('SF10 generated successfully!');
    } catch (err) {
      console.error('Error generating SF10:', err);
      alert(err instanceof Error ? err.message : 'Failed to generate SF10');
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchStudentGrades = async (studentId: string, schoolYear: string) => {
    try {
      setIsLoadingGrades(true);
      
      const session = localStorage.getItem('teacherSession');
      const teacherId = session ? JSON.parse(session).teacher?.id || JSON.parse(session).teacher?.uid : null;
      
      // Fetch ALL grades for this student (regardless of which teacher entered them)
      const response = await fetch(`/api/teacher/grades/student?studentId=${studentId}&schoolYear=${schoolYear}`, {
        headers: { Authorization: `Bearer ${teacherId}` },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch grades');
      }
      
      const studentGrades = await response.json();
      console.log('Raw student grades from API:', studentGrades);
      
      // Group grades by subject
      const subjectMap = new Map<string, SF10Subject>();
      
      studentGrades.forEach((grade: any) => {
        const subjectName = grade.subjectName || grade.subjectId;
        console.log('Processing grade:', { subjectName, subjectId: grade.subjectId, quarter: grade.quarter, grade: grade.grade });
        
        if (!subjectMap.has(subjectName)) {
          subjectMap.set(subjectName, {
            subjectCode: grade.subjectId,
            subjectName: subjectName,
            firstGrading: 0,
            secondGrading: 0,
            thirdGrading: 0,
            fourthGrading: 0,
            finalRating: 0,
            remarks: ''
          });
        }
        
        const subject = subjectMap.get(subjectName)!;
        
        // Map quarter to grading period
        if (grade.quarter === 'Q1' || grade.quarter === '1') {
          subject.firstGrading = grade.grade;
        } else if (grade.quarter === 'Q2' || grade.quarter === '2') {
          subject.secondGrading = grade.grade;
        } else if (grade.quarter === 'Q3' || grade.quarter === '3') {
          subject.thirdGrading = grade.grade;
        } else if (grade.quarter === 'Q4' || grade.quarter === '4') {
          subject.fourthGrading = grade.grade;
        }
      });
      
      // Calculate final ratings
      const subjects = Array.from(subjectMap.values()).map(subject => {
        const grades = [subject.firstGrading, subject.secondGrading, subject.thirdGrading, subject.fourthGrading].filter(g => g > 0);
        if (grades.length > 0) {
          subject.finalRating = Math.round(grades.reduce((a, b) => a + b, 0) / grades.length);
          subject.remarks = subject.finalRating >= 75 ? 'Passed' : 'Failed';
        }
        return subject;
      });
      
      console.log('Processed subjects for SF10:', subjects);
      setViewStudentGrades(subjects);
    } catch (err) {
      console.error('Error fetching student grades:', err);
      setViewStudentGrades([]);
    } finally {
      setIsLoadingGrades(false);
    }
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedSF10(null);
    setViewStudentGrades([]);
    setIsEditMode(false);
    setEditableStudent(null);
    setEditableSubjects([]);
  };

  const handleEditClick = () => {
    // Initialize editable data with current values
    if (selectedSF10) {
      // Parse name in format: "LAST NAME, First Name Middle Name"
      const fullName = selectedSF10.student.name;
      let firstName = '', lastName = '', middleName = '';
      
      if (fullName.includes(',')) {
        // Format: "AGUSTIN, RIELYHANA ROSE B."
        const parts = fullName.split(',');
        lastName = parts[0].trim();
        const remaining = parts[1]?.trim() || '';
        const nameParts = remaining.split(' ').filter(Boolean);
        
        // Middle name is the last part if it ends with a dot (e.g., "B.")
        const lastPart = nameParts[nameParts.length - 1];
        if (lastPart && lastPart.endsWith('.')) {
          middleName = lastPart;
          firstName = nameParts.slice(0, -1).join(' ');
        } else {
          firstName = remaining;
        }
      } else {
        // Fallback: simple space-separated
        const parts = fullName.split(' ').filter(Boolean);
        firstName = parts[0] || '';
        lastName = parts[parts.length - 1] || '';
        middleName = parts.slice(1, -1).join(' ');
      }
      
      setEditableStudent({
        id: selectedSF10.student.id,
        lrn: selectedSF10.student.lrn,
        name: fullName,
        firstName,
        lastName,
        middleName,
        gradeLevel: selectedSF10.student.gradeLevel,
        section: selectedSF10.student.section,
        schoolYear: selectedSF10.sf10?.schoolYear || '2024-2025',
        adviserName: selectedSF10.sf10?.adviserName || 'Teacher'
      });
      setEditableSubjects(viewStudentGrades.length > 0 
        ? viewStudentGrades.map(s => ({...s})) 
        : (selectedSF10.sf10?.subjects || []).map((s: any) => ({...s}))
      );
    }
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditableStudent(null);
    setEditableSubjects([]);
  };

  const handleSaveSF10 = async () => {
    if (!selectedSF10 || !editableStudent) return;
    
    try {
      setIsSaving(true);
      
      // Update student info
      const studentResponse = await fetch(`/api/teacher/students/${selectedSF10.student.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('teacherSession')}`
        },
        body: JSON.stringify({
          lrn: editableStudent.lrn,
          name: `${editableStudent.firstName} ${editableStudent.middleName} ${editableStudent.lastName}`.trim(),
          firstName: editableStudent.firstName,
          lastName: editableStudent.lastName,
          middleName: editableStudent.middleName,
          gradeLevel: editableStudent.gradeLevel,
          section: editableStudent.section,
        })
      });
      
      if (!studentResponse.ok) {
        throw new Error('Failed to update student info');
      }
      
      // Refresh the SF10 records
      await fetchSF10Records();
      
      // Exit edit mode
      setIsEditMode(false);
      setEditableStudent(null);
      
      alert('SF10 updated successfully!');
    } catch (err) {
      console.error('Error saving SF10:', err);
      alert('Failed to save SF10. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStudentFieldChange = (field: string, value: string) => {
    setEditableStudent((prev: any) => prev ? { ...prev, [field]: value } : null);
  };

  const handleSubjectGradeChange = (index: number, field: keyof SF10Subject, value: number) => {
    setEditableSubjects(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Recalculate final rating if quarter grades changed
      if (field === 'firstGrading' || field === 'secondGrading' || field === 'thirdGrading' || field === 'fourthGrading') {
        const grades = [
          updated[index].firstGrading,
          updated[index].secondGrading,
          updated[index].thirdGrading,
          updated[index].fourthGrading
        ].filter(g => g > 0);
        
        if (grades.length > 0) {
          updated[index].finalRating = Math.round(grades.reduce((a, b) => a + b, 0) / grades.length);
          updated[index].remarks = updated[index].finalRating >= 75 ? 'Passed' : 'Failed';
        }
      }
      
      return updated;
    });
  };

  if (isLoading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B3E2A]"></div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout title="View SF10" subtitle="View and manage existing SF10 forms.">
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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 z-20">
          {/* Search Bar */}
          <div className="relative group">
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
                className="h-full pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent bg-white transition-all duration-300 w-64 group-hover:border-[#1B3E2A] text-sm"
              />
            </div>
          </div>
          
          {/* School Year Selector */}
          {availableSchoolYears.length > 1 && (
            <div className="relative">
              <select
                value={selectedSchoolYear}
                onChange={(e) => setSelectedSchoolYear(e.target.value)}
                className="h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent bg-white text-sm"
              >
                {availableSchoolYears.map(year => (
                  <option key={year} value={year}>SY {year}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* SF10 Table Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 z-0">
        {/* Header with ENHANCED VISIBILITY */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#F2C94C] to-[#e5b840] text-[#1B3E2A]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Student SF10 Records ({filteredRecords.length})
            </h3>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4" />
              <span>All Records</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-[#f0f7f3]">
              <tr>
                <th className="w-[25%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                  Student Name
                </th>
                <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                  Grade Level
                </th>
                <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                  School Year
                </th>
                <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                  Status
                </th>
                <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                  Date Created
                </th>
                <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {sf10Records.length === 0 ? 'No SF10 forms found' : 'No matching SF10 records'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-6">
                        {sf10Records.length === 0 
                          ? 'SF10 forms will be automatically generated when teachers enter grades.'
                          : 'Try adjusting your search criteria.'
                        }
                      </p>
                      {sf10Records.length === 0 && (
                        <div className="w-48">
                          <button
                            onClick={() => fetchSF10Records(selectedSchoolYear)}
                            className="flex items-center justify-center gap-2 px-5 w-full rounded-md font-semibold text-sm tracking-normal border border-[#1B3E2A] border-b-2 shadow-sm transition-all duration-300 h-11 hover:bg-[#1B3E2A] hover:text-white"
                          >
                            <Plus className="w-4 h-4" />
                            Refresh Records
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <tr key={`${record.student.id || 'student'}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.student.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        LRN: {record.student.lrn}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.student.gradeLevel}</div>
                      <div className="text-sm text-gray-500">{record.student.section}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.sf10 ? record.sf10.schoolYear : 'Not generated'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.sf10 ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.sf10.status)}`}>
                          {record.sf10.status}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Not Generated
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.sf10 ? new Date(record.sf10.dateCompleted).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewSF10(record)}
                          className="text-[#1B3E2A] hover:text-[#F2C94C] transition-colors"
                          title="View SF10"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Download SF10"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit SF10"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden z-0">
        <div className="px-6 py-4 bg-gradient-to-r from-[#F2C94C] to-[#e5b840] text-[#1B3E2A]">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            SF10 Statistics Overview
          </h3>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-4xl font-bold text-[#1B3E2A] mb-2">{sf10Records.length}</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Forms</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {sf10Records.filter(r => r.sf10?.status === 'promoted').length}
              </div>
              <div className="text-sm font-medium text-green-700 uppercase tracking-wider">Promoted</div>
            </div>
            <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {sf10Records.filter(r => r.sf10?.status === 'retained').length}
              </div>
              <div className="text-sm font-medium text-red-700 uppercase tracking-wider">Retained</div>
            </div>
          </div>
        </div>
      </div>

      {/* SF10 View Modal */}
      {isViewModalOpen && selectedSF10 && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 50,
          padding: '20px'
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)', 
            width: '100%', 
            maxWidth: '900px', 
            maxHeight: '90vh', 
            overflow: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{ 
              padding: '16px 24px', 
              background: 'linear-gradient(to right, #1B3E2A, #2D4A3D)', 
              color: 'white', 
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Learner Permanent Academic Record (SF10-ES)</h2>
              <button
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '24px' }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '16px', backgroundColor: '#f3f4f6' }}>
              {isLoadingGrades ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B3E2A]"></div>
                  <span className="ml-3 text-gray-600">Loading grades...</span>
                </div>
              ) : (
                <SF10Form 
                  student={isEditMode && editableStudent ? editableStudent : selectedSF10?.student ? (() => {
                    // Parse name in format: "LAST NAME, First Name Middle Name"
                    const fullName = selectedSF10.student.name;
                    let firstName = '', lastName = '', middleName = '';
                    
                    if (fullName.includes(',')) {
                      // Format: "AGUSTIN, RIELYHANA ROSE B."
                      const parts = fullName.split(',');
                      lastName = parts[0].trim();
                      const remaining = parts[1]?.trim() || '';
                      const nameParts = remaining.split(' ').filter(Boolean);
                      
                      // Middle name is the last part if it ends with a dot (e.g., "B.")
                      const lastPart = nameParts[nameParts.length - 1];
                      if (lastPart && lastPart.endsWith('.')) {
                        middleName = lastPart;
                        firstName = nameParts.slice(0, -1).join(' ');
                      } else {
                        firstName = remaining;
                      }
                    } else {
                      // Fallback: simple space-separated
                      const parts = fullName.split(' ').filter(Boolean);
                      firstName = parts[0] || '';
                      lastName = parts[parts.length - 1] || '';
                      middleName = parts.slice(1, -1).join(' ');
                    }
                    
                    return {
                      id: selectedSF10.student.id,
                      lrn: selectedSF10.student.lrn,
                      name: fullName,
                      firstName,
                      lastName,
                      middleName,
                      gradeLevel: selectedSF10.student.gradeLevel,
                      section: selectedSF10.student.section,
                      schoolYear: selectedSF10.sf10?.schoolYear || '2024-2025',
                      adviserName: selectedSF10.sf10?.adviserName || 'Teacher'
                    };
                  })() : undefined}
                  subjects={isEditMode ? editableSubjects : (viewStudentGrades.length > 0 ? viewStudentGrades : selectedSF10?.sf10?.subjects || [])}
                  generalAverage={selectedSF10?.sf10?.generalAverage || 0}
                  status={(selectedSF10?.sf10?.status as any) || 'promoted'}
                  isEditMode={isEditMode}
                  onStudentFieldChange={handleStudentFieldChange}
                  onSubjectGradeChange={handleSubjectGradeChange}
                  yearData={!isEditMode ? yearData : undefined}
                  viewMode={!isEditMode && sf10ViewMode === 'byYear' ? 'byYear' : 'single'}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ 
              padding: '16px 24px', 
              borderTop: '1px solid #e5e7eb', 
              backgroundColor: 'white', 
              borderRadius: '0 0 12px 12px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={handleCloseModal}
                style={{ 
                  padding: '8px 16px', 
                  color: '#4b5563', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                Close
              </button>
              
              {isEditMode ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    style={{ 
                      padding: '8px 16px', 
                      color: '#4b5563', 
                      background: '#f3f4f6', 
                      border: 'none', 
                      borderRadius: '6px',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      opacity: isSaving ? 0.6 : 1
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSF10}
                    disabled={isSaving}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#1B3E2A', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      opacity: isSaving ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isSaving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : selectedSF10?.sf10 ? (
                <button
                  onClick={handleEditClick}
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#2563EB', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer' 
                  }}
                >
                  Edit SF10
                </button>
              ) : (
                <button
                  onClick={handleGenerateSF10}
                  disabled={isGenerating}
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#10B981', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    opacity: isGenerating ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isGenerating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {isGenerating ? 'Generating...' : 'Generate SF10'}
                </button>
              )}
              
              <button
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#1B3E2A', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer' 
                }}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}
