'use client';

import { useState, useEffect } from 'react';
import { Student, Subject, type GradeInput } from '@/types';
import { 
  Save, 
  Users, 
  BookOpen, 
  CheckCircle,
  AlertCircle,
  Filter,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import TeacherLayout from '../../components/TeacherLayout';

export default function GradeInput() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedGradingPeriod, setSelectedGradingPeriod] = useState<'first' | 'second' | 'third' | 'fourth'>('first');
  const [activeGradingPeriod, setActiveGradingPeriod] = useState<'first' | 'second' | 'third' | 'fourth'>('first');
  const [isEditingUnlocked, setIsEditingUnlocked] = useState(false);
  const [teacherId, setTeacherId] = useState<string>('');
  const [grades, setGrades] = useState<{ [key: string]: string }>({});
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [isRemarkManuallyEdited, setIsRemarkManuallyEdited] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Student management states
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', gradeLevel: 'Kinder' });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    gradeLevels: ['Kinder'] as string[],
    schoolYear: '2024-2025'
  });

  useEffect(() => {
    // Load data from Firebase
    const loadData = async () => {
      try {
        const session = localStorage.getItem('teacherSession');
        if (!session) {
          setMessage({ type: 'error', text: 'Please login first' });
          setIsLoading(false);
          return;
        }

        const teacherData = JSON.parse(session);
        setTeacherId(teacherData.teacher?.id || '');

        const storageKey = `activeGradingPeriod_${teacherData.teacher?.id || ''}`;
        const storedActive = localStorage.getItem(storageKey) as any;
        if (storedActive === 'first' || storedActive === 'second' || storedActive === 'third' || storedActive === 'fourth') {
          setActiveGradingPeriod(storedActive);
        }

        // Load subjects from Firebase
        const subjectsResponse = await fetch('/api/teacher/subjects', {
          headers: {
            'Authorization': `Bearer ${teacherData.teacher.id}`
          }
        });
        
        let subjectsData: Subject[] = [];
        if (subjectsResponse.ok) {
          subjectsData = await subjectsResponse.json();
          setSubjects(subjectsData);
        } else {
          // If no subjects API yet, set empty array
          setSubjects([]);
        }

        const effectiveSubjectId = selectedSubject || subjectsData[0]?.id || '';
        if (effectiveSubjectId && effectiveSubjectId !== selectedSubject) {
          setSelectedSubject(effectiveSubjectId);
        }

        // Load students based on selected subject grade levels (if available)
        const selected = subjectsData.find((s: Subject) => s.id === effectiveSubjectId);
        const selectedGradeLevels = selected?.gradeLevels && selected.gradeLevels.length > 0
          ? selected.gradeLevels
          : (selected?.gradeLevel ? [selected.gradeLevel] : []);

        const studentsUrl = selectedGradeLevels.length > 0
          ? `/api/teacher/students?${selectedGradeLevels.map(g => `gradeLevels=${encodeURIComponent(g)}`).join('&')}`
          : '/api/teacher/students';

        const studentsResponse = await fetch(studentsUrl, {
          headers: {
            'Authorization': `Bearer ${teacherData.teacher.id}`
          }
        });

        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          setStudents(studentsData);
        } else {
          setStudents([]);
        }

        // Load existing grades for the effective subject and current grading period
        // Reset grades/remarks when switching subject or grading period to avoid stale values
        setGrades({});
        setRemarks({});
        setIsRemarkManuallyEdited({});
        setIsEditingUnlocked(false);
        if (effectiveSubjectId) {
          await loadExistingGrades(teacherData.teacher.id, effectiveSubjectId, selectedGradingPeriod);
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
        setMessage({ type: 'error', text: 'Failed to load data' });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedSubject, selectedGradingPeriod]);

  useEffect(() => {
    setIsEditingUnlocked(false);
  }, [selectedSubject, selectedGradingPeriod]);

  const loadExistingGrades = async (teacherId: string, subjectId: string, gradingPeriod: string) => {
    try {
      const response = await fetch(`/api/teacher/grades?teacherId=${teacherId}&subjectId=${subjectId}&gradingPeriod=${gradingPeriod}`, {
        headers: {
          'Authorization': `Bearer ${teacherId}`
        }
      });
      
      if (response.ok) {
        const existingGrades = await response.json();
        const gradesMap: { [key: string]: string } = {};
        const remarksMap: { [key: string]: string } = {};
        
        existingGrades.forEach((grade: GradeInput) => {
          gradesMap[grade.studentId] = grade.grade.toString();
          if (grade.remarks) {
            remarksMap[grade.studentId] = grade.remarks;
          }
        });
        
        setGrades(gradesMap);
        setRemarks(remarksMap);
        setIsRemarkManuallyEdited({});
      } else {
        // If request fails, ensure inputs are cleared instead of leaving stale state
        setGrades({});
        setRemarks({});
        setIsRemarkManuallyEdited({});
      }
    } catch (error) {
      console.error('Error loading existing grades:', error);
      setGrades({});
      setRemarks({});
      setIsRemarkManuallyEdited({});
    }
  };


  const getAutoRemark = (gradeValue: number) => {
    if (Number.isNaN(gradeValue)) return '';
    if (gradeValue === 100) return 'Outstanding';
    if (gradeValue >= 90) return 'Very Satisfactory';
    if (gradeValue >= 85) return 'Satisfactory';
    if (gradeValue >= 80) return 'Fairly Satisfactory';
    if (gradeValue >= 75) return 'Passed';
    return 'Failed';
  };

  const handleGradeChange = (studentId: string, value: string) => {
    const numValue = parseFloat(value);
    if (value === '' || (numValue >= 0 && numValue <= 100)) {
      setGrades(prev => ({ ...prev, [studentId]: value }));

      // Auto-generate remarks unless the teacher manually edited it.
      if (value === '') {
        setRemarks(prev => ({ ...prev, [studentId]: '' }));
        setIsRemarkManuallyEdited(prev => ({ ...prev, [studentId]: false }));
      } else if (!isRemarkManuallyEdited[studentId]) {
        const autoRemark = getAutoRemark(numValue);
        setRemarks(prev => ({ ...prev, [studentId]: autoRemark }));
      }
    }
  };

  const handleRemarkChange = (studentId: string, value: string) => {
    setRemarks(prev => ({ ...prev, [studentId]: value }));
    setIsRemarkManuallyEdited(prev => ({ ...prev, [studentId]: value.trim().length > 0 }));
  };

  const handleAddSubject = async () => {
    if (!newSubject.name.trim() || !newSubject.code.trim()) {
      setMessage({ type: 'error', text: 'Subject name and code are required' });
      return;
    }

    if (!Array.isArray(newSubject.gradeLevels) || newSubject.gradeLevels.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one grade level for this subject' });
      return;
    }

    setMessage(null);
    try {
      const session = localStorage.getItem('teacherSession');
      const teacherData = JSON.parse(session!);

      const response = await fetch('/api/teacher/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${teacherData.teacher.id}`
        },
        body: JSON.stringify({
          name: newSubject.name.trim(),
          code: newSubject.code.trim(),
          gradeLevels: newSubject.gradeLevels,
          schoolYear: newSubject.schoolYear
        })
      });

      if (response.ok) {
        const result = await response.json();
        const created: Subject = result.subject;
        setSubjects(prev => [...prev, created]);
        setSelectedSubject(created.id);
        setNewSubject(prev => ({
          ...prev,
          name: '',
          code: ''
        }));
        setShowAddSubject(false);
        setMessage({ type: 'success', text: 'Subject added successfully' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to add subject' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add subject' });
    }
  };

  // Student management functions
  const handleAddStudent = async () => {
    if (!newStudent.name.trim()) {
      setMessage({ type: 'error', text: 'Student name is required' });
      return;
    }

    const selectedSubjectObj = subjects.find(s => s.id === selectedSubject);
    if (!selectedSubjectObj) {
      setMessage({ type: 'error', text: 'Please select a subject first (this will determine the student category/grade level).' });
      return;
    }

    const allowedGradeLevels = selectedSubjectObj.gradeLevels && selectedSubjectObj.gradeLevels.length > 0
      ? selectedSubjectObj.gradeLevels
      : (selectedSubjectObj.gradeLevel ? [selectedSubjectObj.gradeLevel] : []);

    if (allowedGradeLevels.length === 0) {
      setMessage({ type: 'error', text: 'Selected subject has no grade levels assigned. Please edit the subject and add grade levels.' });
      return;
    }

    const targetGradeLevel = newStudent.gradeLevel && allowedGradeLevels.includes(newStudent.gradeLevel)
      ? newStudent.gradeLevel
      : allowedGradeLevels[0];

    try {
      const session = localStorage.getItem('teacherSession');
      const teacherData = JSON.parse(session!);

      const response = await fetch('/api/teacher/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${teacherData.teacher.id}`
        },
        body: JSON.stringify({
          name: newStudent.name.trim(),
          gradeLevel: targetGradeLevel
        })
      });

      if (response.ok) {
        const result = await response.json();
        const studentsUrl = allowedGradeLevels.length > 0
          ? `/api/teacher/students?${allowedGradeLevels.map(g => `gradeLevels=${encodeURIComponent(g)}`).join('&')}`
          : '/api/teacher/students';

        const refreshedStudentsResponse = await fetch(studentsUrl, {
          headers: {
            'Authorization': `Bearer ${teacherData.teacher.id}`
          }
        });

        if (refreshedStudentsResponse.ok) {
          const refreshedStudents = await refreshedStudentsResponse.json();
          setStudents(refreshedStudents);
        }
        setNewStudent({ name: '', gradeLevel: 'Kinder' });
        setShowAddStudent(false);
        setMessage({ type: 'success', text: `Student added successfully to ${selectedSubjectObj.name} (${targetGradeLevel})` });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to add student' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add student' });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      const session = localStorage.getItem('teacherSession');
      const teacherData = JSON.parse(session!);

      const response = await fetch(`/api/teacher/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${teacherData.teacher.id}`
        }
      });

      if (response.ok) {
        // Remove student from local state
        setStudents(prev => prev.filter(student => student.id !== studentId));
        
        // Remove grades and remarks for this student
        setGrades(prev => {
          const newGrades = { ...prev };
          delete newGrades[studentId];
          return newGrades;
        });
        
        setRemarks(prev => {
          const newRemarks = { ...prev };
          delete newRemarks[studentId];
          return newRemarks;
        });
        
        setMessage({ type: 'success', text: 'Student deleted successfully' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to delete student' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete student' });
    }
  };

  const validateGrades = () => {
    const errors: string[] = [];
    
    students.forEach(student => {
      const grade = grades[student.id];
      if (grade && (parseFloat(grade) < 0 || parseFloat(grade) > 100)) {
        errors.push(`Invalid grade for ${student.name}`);
      }
    });

    return errors;
  };

  const handleSave = async () => {
    const errors = validateGrades();
    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join(', ') });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const session = localStorage.getItem('teacherSession');
      const teacherData = JSON.parse(session!);

      const gradeData: GradeInput[] = students.map(student => ({
        studentId: student.id,
        subjectId: selectedSubject,
        gradingPeriod: selectedGradingPeriod,
        grade: parseFloat(grades[student.id] || '0'),
        remarks: remarks[student.id] || '',
        teacherId: teacherData.teacher.id,
        dateInput: new Date().toISOString()
      }));

      const response = await fetch('/api/teacher/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${teacherData.teacher.id}`
        },
        body: JSON.stringify({ grades: gradeData })
      });

      if (response.ok) {
        const periodLabel = selectedGradingPeriod.charAt(0).toUpperCase() + selectedGradingPeriod.slice(1);
        setMessage({ type: 'success', text: `${periodLabel} grading grades saved successfully!` });
      } else {
        const errorData = await response.json();
        const periodLabel = selectedGradingPeriod.charAt(0).toUpperCase() + selectedGradingPeriod.slice(1);
        setMessage({ type: 'error', text: errorData.message || `Failed to save ${periodLabel} grading grades` });
      }
    } catch (error) {
      const periodLabel = selectedGradingPeriod.charAt(0).toUpperCase() + selectedGradingPeriod.slice(1);
      setMessage({ type: 'error', text: `Failed to save ${periodLabel} grading grades` });
    } finally {
      setIsSaving(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (!grade) return '';
    const numGrade = parseFloat(grade);
    if (numGrade >= 90) return 'text-green-600 font-semibold';
    if (numGrade >= 80) return 'text-blue-600';
    if (numGrade >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const gradingOrder = (period: 'first' | 'second' | 'third' | 'fourth') => {
    switch (period) {
      case 'first':
        return 1;
      case 'second':
        return 2;
      case 'third':
        return 3;
      case 'fourth':
        return 4;
      default:
        return 0;
    }
  };

  const isLockedByDefault = gradingOrder(selectedGradingPeriod) < gradingOrder(activeGradingPeriod);
  const isReadOnly = isLockedByDefault && !isEditingUnlocked;

  const handleUnlockEditing = () => {
    if (!isLockedByDefault) return;
    const ok = confirm('This grading period is locked (read-only) because it is before the active grading period. Unlock editing to fix errors?');
    if (ok) {
      setIsEditingUnlocked(true);
    }
  };

  const handleChangeActiveGrading = (value: 'first' | 'second' | 'third' | 'fourth') => {
    setActiveGradingPeriod(value);
    const storageKey = `activeGradingPeriod_${teacherId || ''}`;
    localStorage.setItem(storageKey, value);
    setIsEditingUnlocked(false);
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
    <TeacherLayout title="Input Grades" subtitle="Enter grades for your students.">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-600" />
              Subject Management
            </h3>
            <button
              onClick={() => setShowAddSubject(!showAddSubject)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Subject
            </button>
          </div>

          {showAddSubject && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g. Mathematics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code
                  </label>
                  <input
                    type="text"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g. MATH"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Levels
                  </label>
                  <div className="space-y-2">
                    {['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map((level) => (
                      <label key={level} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={newSubject.gradeLevels.includes(level)}
                          onChange={(e) => {
                            setNewSubject((prev) => {
                              const next = e.target.checked
                                ? Array.from(new Set([...prev.gradeLevels, level]))
                                : prev.gradeLevels.filter((g) => g !== level);
                              return { ...prev, gradeLevels: next };
                            });
                          }}
                          className="h-4 w-4"
                        />
                        {level}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Year
                  </label>
                  <input
                    type="text"
                    value={newSubject.schoolYear}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, schoolYear: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g. 2024-2025"
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleAddSubject}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Add Subject
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Student Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              Student Management
            </h3>
            <button
              onClick={() => setShowAddStudent(!showAddStudent)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          </div>

          {showAddStudent && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter student name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Category
                  </label>
                  <input
                    type="text"
                    value={(() => {
                      const subj = subjects.find(s => s.id === selectedSubject);
                      const subjLevels = subj?.gradeLevels && subj.gradeLevels.length > 0
                        ? subj.gradeLevels
                        : (subj?.gradeLevel ? [subj.gradeLevel] : []);
                      return subj ? `${subj.name} (${subjLevels.join(', ')})` : 'Select a subject first';
                    })()}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Grade Level
                  </label>
                  <select
                    value={newStudent.gradeLevel}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, gradeLevel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={!subjects.find(s => s.id === selectedSubject)}
                  >
                    {(() => {
                      const subj = subjects.find(s => s.id === selectedSubject);
                      const subjLevels = subj?.gradeLevels && subj.gradeLevels.length > 0
                        ? subj.gradeLevels
                        : (subj?.gradeLevel ? [subj.gradeLevel] : []);
                      return subjLevels.length > 0
                        ? subjLevels.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))
                        : [<option key="none" value="">Select a subject first</option>];
                    })()}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAddStudent}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    Add Student
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-sm text-gray-700">
                <strong>Active Grading Period:</strong>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <select
                  value={activeGradingPeriod}
                  onChange={(e) => handleChangeActiveGrading(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="first">First Grading</option>
                  <option value="second">Second Grading</option>
                  <option value="third">Third Grading</option>
                  <option value="fourth">Fourth Grading</option>
                </select>

                {isLockedByDefault && (
                  <button
                    onClick={handleUnlockEditing}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition duration-200"
                  >
                    Unlock Editing
                  </button>
                )}
              </div>
            </div>

            <div className="mt-2 text-sm">
              {isReadOnly ? (
                <span className="text-yellow-800">This grading period is currently <strong>read-only</strong>. You can unlock editing to fix errors.</span>
              ) : (
                <span className="text-green-700">Editing is enabled for this grading period.</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grading Period
              </label>
              <select
                value={selectedGradingPeriod}
                onChange={(e) => setSelectedGradingPeriod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="first">First Grading</option>
                <option value="second">Second Grading</option>
                <option value="third">Third Grading</option>
                <option value="fourth">Fourth Grading</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSave}
                disabled={isSaving || !selectedSubject || isReadOnly}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save {selectedGradingPeriod === 'first'
                      ? 'First'
                      : selectedGradingPeriod === 'second'
                        ? 'Second'
                        : selectedGradingPeriod === 'third'
                          ? 'Third'
                          : 'Fourth'}{' '}Grading Grades
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        {/* Grades Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              Student List ({students.length} students)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade (0-100)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {student.gradeLevel}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={grades[student.id] || ''}
                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                        disabled={isReadOnly}
                        className={`w-24 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${getGradeColor(grades[student.id] || '')} ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={remarks[student.id] || ''}
                        onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                        disabled={isReadOnly}
                        className={`w-48 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        placeholder="Optional remarks"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-600 hover:text-red-800 transition duration-200"
                        title="Delete student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {students.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students</h3>
              <p className="mt-1 text-sm text-gray-500">No students assigned to your classes.</p>
            </div>
          )}
        </div>
    </TeacherLayout>
  );
}
