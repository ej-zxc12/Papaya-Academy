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
  const [gradesBySubject, setGradesBySubject] = useState<{ [subjectId: string]: { [studentId: string]: string } }>({});
  const [remarksBySubject, setRemarksBySubject] = useState<{ [subjectId: string]: { [studentId: string]: string } }>({});
  const [isRemarkManuallyEditedBySubject, setIsRemarkManuallyEditedBySubject] = useState<{ [subjectId: string]: { [studentId: string]: boolean } }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedGradeLevelFilter, setSelectedGradeLevelFilter] = useState<string>('');
  const [studentSubjectId, setStudentSubjectId] = useState<string>('');
  const [studentListSubjectFilter, setStudentListSubjectFilter] = useState<string>('');
  
  // Student management states
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', gradeLevel: 'Pre-School' });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    gradeLevels: [] as string[],
    schoolYear: '2024-2025'
  });

  // Add grade level to existing subject states
  const [showAddGradeLevel, setShowAddGradeLevel] = useState(false);
  const [newGradeLevel, setNewGradeLevel] = useState<string>('');

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
        const t = teacherData?.teacher ?? teacherData;
        const teacherUid = t?.uid || t?.id || '';
        setTeacherId(teacherUid);

        const storageKey = `activeGradingPeriod_${teacherUid}`;
        const storedActive = localStorage.getItem(storageKey) as any;
        if (storedActive === 'first' || storedActive === 'second' || storedActive === 'third' || storedActive === 'fourth') {
          setActiveGradingPeriod(storedActive);
        }

        // Load subjects from Firebase
        const subjectsResponse = await fetch('/api/teacher/subjects', {
          headers: {
            'Authorization': `Bearer ${teacherUid}`
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

        // Only auto-select subject if none is currently selected
        if (!selectedSubject && subjectsData.length > 0) {
          setSelectedSubject(subjectsData[0].id);
        }

        // Load students based on selected subject grade levels (if available)
        const selected = subjectsData.find((s: Subject) => s.id === selectedSubject);
        const selectedGradeLevels = selected?.gradeLevels && selected.gradeLevels.length > 0
          ? selected.gradeLevels
          : (selected?.gradeLevel ? [selected.gradeLevel] : []);

        const studentsUrl = selectedGradeLevels.length > 0
          ? `/api/teacher/students?${selectedGradeLevels.map(g => `gradeLevels=${encodeURIComponent(g)}`).join('&')}`
          : '/api/teacher/students';

        const studentsResponse = await fetch(studentsUrl, {
          headers: {
            'Authorization': `Bearer ${teacherUid}`
          }
        });

        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          setAllStudents(studentsData);
        } else {
          setAllStudents([]);
        }

        // Load existing grades for the selected subject and current grading period
        setIsEditingUnlocked(false);
        if (selectedSubject) {
          await loadExistingGrades(teacherUid, selectedSubject, selectedGradingPeriod);
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

  useEffect(() => {
    // Filter students by selected grade level filter and subject filter
    let filtered = allStudents;
    
    // Apply subject filter if selected
    if (studentListSubjectFilter) {
      filtered = filtered.filter(s => s.subjectId === studentListSubjectFilter);
    }
    
    // Apply grade level filter if selected
    if (selectedGradeLevelFilter) {
      filtered = filtered.filter(s => s.gradeLevel === selectedGradeLevelFilter);
    }
    
    setStudents(filtered);
  }, [selectedGradeLevelFilter, studentListSubjectFilter, allStudents]);

  useEffect(() => {
    // Auto-select first subject for student addition if none selected
    if (subjects.length > 0 && !studentSubjectId) {
      setStudentSubjectId(subjects[0].id);
    }
  }, [subjects, studentSubjectId]);

  const loadExistingGrades = async (teacherId: string, subjectId: string, gradingPeriod: string) => {
    try {
      // Save current grades before switching subjects
      if (selectedSubject && selectedSubject !== subjectId) {
        setGradesBySubject(prev => ({ ...prev, [selectedSubject]: grades }));
        setRemarksBySubject(prev => ({ ...prev, [selectedSubject]: remarks }));
        setIsRemarkManuallyEditedBySubject(prev => ({ ...prev, [selectedSubject]: isRemarkManuallyEdited }));
      }

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
        
        // Load saved grades for this subject if they exist
        const savedGrades = gradesBySubject[subjectId] || {};
        const savedRemarks = remarksBySubject[subjectId] || {};
        const savedManualEdits = isRemarkManuallyEditedBySubject[subjectId] || {};
        
        // Merge database grades with locally saved grades (local takes precedence)
        const mergedGrades = { ...gradesMap, ...savedGrades };
        const mergedRemarks = { ...remarksMap, ...savedRemarks };
        const mergedManualEdits = { ...savedManualEdits };
        
        setGrades(mergedGrades);
        setRemarks(mergedRemarks);
        setIsRemarkManuallyEdited(mergedManualEdits);
      } else {
        // If request fails, load saved grades if they exist
        const savedGrades = gradesBySubject[subjectId] || {};
        const savedRemarks = remarksBySubject[subjectId] || {};
        const savedManualEdits = isRemarkManuallyEditedBySubject[subjectId] || {};
        
        setGrades(savedGrades);
        setRemarks(savedRemarks);
        setIsRemarkManuallyEdited(savedManualEdits);
      }
    } catch (error) {
      console.error('Error loading existing grades:', error);
      // Load saved grades if they exist
      const savedGrades = gradesBySubject[subjectId] || {};
      const savedRemarks = remarksBySubject[subjectId] || {};
      const savedManualEdits = isRemarkManuallyEditedBySubject[subjectId] || {};
      
      setGrades(savedGrades);
      setRemarks(savedRemarks);
      setIsRemarkManuallyEdited(savedManualEdits);
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
      const newGrades = { ...grades, [studentId]: value };
      setGrades(newGrades);
      
      // Also save to per-subject storage
      if (selectedSubject) {
        setGradesBySubject(prev => ({ ...prev, [selectedSubject]: newGrades }));
      }

      // Auto-generate remarks unless the teacher manually edited it.
      if (value === '') {
        const newRemarks = { ...remarks, [studentId]: '' };
        const newManualEdits = { ...isRemarkManuallyEdited, [studentId]: false };
        setRemarks(newRemarks);
        setIsRemarkManuallyEdited(newManualEdits);
        
        // Also save to per-subject storage
        if (selectedSubject) {
          setRemarksBySubject(prev => ({ ...prev, [selectedSubject]: newRemarks }));
          setIsRemarkManuallyEditedBySubject(prev => ({ ...prev, [selectedSubject]: newManualEdits }));
        }
      } else if (!isRemarkManuallyEdited[studentId]) {
        const autoRemark = getAutoRemark(numValue);
        const newRemarks = { ...remarks, [studentId]: autoRemark };
        setRemarks(newRemarks);
        
        // Also save to per-subject storage
        if (selectedSubject) {
          setRemarksBySubject(prev => ({ ...prev, [selectedSubject]: newRemarks }));
        }
      }
    }
  };

  const handleRemarkChange = (studentId: string, value: string) => {
    const newRemarks = { ...remarks, [studentId]: value };
    const newManualEdits = { ...isRemarkManuallyEdited, [studentId]: value.trim().length > 0 };
    
    setRemarks(newRemarks);
    setIsRemarkManuallyEdited(newManualEdits);
    
    // Also save to per-subject storage
    if (selectedSubject) {
      setRemarksBySubject(prev => ({ ...prev, [selectedSubject]: newRemarks }));
      setIsRemarkManuallyEditedBySubject(prev => ({ ...prev, [selectedSubject]: newManualEdits }));
    }
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
      const t = teacherData?.teacher ?? teacherData;
      const teacherUid = t?.uid || t?.id || '';

      const response = await fetch('/api/teacher/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${teacherUid}`
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
        setNewSubject({
          name: '',
          code: '',
          gradeLevels: [],
          schoolYear: '2024-2025'
        });
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

  const handleAddGradeLevelToSubject = async () => {
    if (!selectedSubject || !newGradeLevel) {
      setMessage({ type: 'error', text: 'Please select a subject and grade level' });
      return;
    }

    setMessage(null);
    try {
      const session = localStorage.getItem('teacherSession');
      const teacherData = JSON.parse(session!);
      const t = teacherData?.teacher ?? teacherData;
      const teacherUid = t?.uid || t?.id || '';

      const response = await fetch('/api/teacher/subjects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${teacherUid}`
        },
        body: JSON.stringify({
          subjectId: selectedSubject,
          gradeLevels: [newGradeLevel]
        })
      });

      if (response.ok) {
        const result = await response.json();
        const subjectName = subjects.find(s => s.id === selectedSubject)?.name;
        
        // Update the subject in local state
        setSubjects(prev => prev.map(subject => 
          subject.id === selectedSubject 
            ? { ...subject, gradeLevels: result.gradeLevels, gradeLevel: result.gradeLevels[0] }
            : subject
        ));

        setNewGradeLevel('');
        setShowAddGradeLevel(false);
        setMessage({ type: 'success', text: `Grade ${newGradeLevel} added to ${subjectName}` });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to add grade level' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add grade level' });
    }
  };

  // Student management functions
  const handleAddStudent = async () => {
    if (!newStudent.name.trim()) {
      setMessage({ type: 'error', text: 'Student name is required' });
      return;
    }

    const selectedSubjectObj = subjects.find(s => s.id === studentSubjectId);
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
      const t = teacherData?.teacher ?? teacherData;
      const teacherUid = t?.uid || t?.id || '';

      const response = await fetch('/api/teacher/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${teacherUid}`
        },
        body: JSON.stringify({
          name: newStudent.name.trim(),
          gradeLevel: targetGradeLevel,
          subjectId: studentSubjectId
        })
      });

      if (response.ok) {
        const result = await response.json();
        const studentsUrl = allowedGradeLevels.length > 0
          ? `/api/teacher/students?${allowedGradeLevels.map(g => `gradeLevels=${encodeURIComponent(g)}`).join('&')}`
          : '/api/teacher/students';

        const refreshedStudentsResponse = await fetch(studentsUrl, {
          headers: {
            'Authorization': `Bearer ${teacherUid}`
          }
        });

        if (refreshedStudentsResponse.ok) {
          const refreshedStudents = await refreshedStudentsResponse.json();
          setAllStudents(refreshedStudents);
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
      const t = teacherData?.teacher ?? teacherData;
      const teacherUid = t?.uid || t?.id || '';

      console.log('Attempting to delete student:', studentId);
      console.log('Teacher ID:', teacherUid);

      const response = await fetch(`/api/teacher/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${teacherUid}`
        }
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Delete response data:', responseData);
        
        // Remove student from local state
        setAllStudents(prev => prev.filter(student => student.id !== studentId));
        
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
        console.log('Delete error response:', errorData);
        setMessage({ type: 'error', text: errorData.message || errorData.error || 'Failed to delete student' });
      }
    } catch (error) {
      console.log('Delete catch error:', error);
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
    // Check if there are students in the current filtered list
    if (students.length === 0) {
      setMessage({ 
        type: 'error', 
        text: 'No students found for the selected subject and grade level. Please add students first or adjust your filters.' 
      });
      return;
    }

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
      const t = teacherData?.teacher ?? teacherData;
      const teacherUid = t?.uid || t?.id || '';

      const gradeData: GradeInput[] = students.map(student => ({
        studentId: student.id,
        subjectId: selectedSubject,
        gradingPeriod: selectedGradingPeriod,
        grade: parseFloat(grades[student.id] || '0'),
        remarks: remarks[student.id] || '',
        teacherId: teacherUid,
        dateInput: new Date().toISOString()
      }));

      const response = await fetch('/api/teacher/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${teacherUid}`
        },
        body: JSON.stringify({ grades: gradeData })
      });

      if (response.ok) {
        const result = await response.json();
        const periodLabel = selectedGradingPeriod.charAt(0).toUpperCase() + selectedGradingPeriod.slice(1);
        
        let message = `${periodLabel} grading grades processed successfully!`;
        if (result.savedCount > 0 && result.updatedCount > 0) {
          message = `${periodLabel} grading: ${result.savedCount} new grades saved, ${result.updatedCount} grades updated.`;
        } else if (result.savedCount > 0) {
          message = `${periodLabel} grading: ${result.savedCount} new grades saved.`;
        } else if (result.updatedCount > 0) {
          message = `${periodLabel} grading: ${result.updatedCount} grades updated.`;
        }
        
        setMessage({ type: 'success', text: message });
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

  const selectedSubjectObj = subjects.find(s => s.id === selectedSubject);
  const availableGradeLevels = selectedSubjectObj?.gradeLevels && selectedSubjectObj.gradeLevels.length > 0
    ? selectedSubjectObj.gradeLevels
    : (selectedSubjectObj?.gradeLevel ? [selectedSubjectObj.gradeLevel] : []);

  // All possible grade levels in the system for adding new ones
  const allSystemGradeLevels = ['Pre-School', 'Nursery', 'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];

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

  const handleChangeGradeLevelFilter = (value: string) => {
    setSelectedGradeLevelFilter(value);
  };

  const handleChangeStudentListSubjectFilter = (value: string) => {
    setStudentListSubjectFilter(value);
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
    <TeacherLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Popup Modal */}
        {message && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 transform transition-all ${
              message.type === 'success' 
                ? 'border-l-4 border-green-500' 
                : 'border-l-4 border-red-500'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 ${
                  message.type === 'success' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-medium ${
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {message.type === 'success' ? 'Success' : 'Error'}
                  </h3>
                  <p className={`mt-1 text-sm ${
                    message.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setMessage(null)}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                    message.type === 'success' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Input Grades</h1>
          <p className="mt-1 text-sm text-gray-600">Enter grades for your students.</p>
        </div>

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
                    {['Pre-School', 'Nursery', 'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map((level) => (
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

          {/* Current Subject Grade Level Management */}
          {selectedSubject && subjects.length > 0 && (() => {
            const currentSubject = subjects.find(s => s.id === selectedSubject);
            if (!currentSubject) return null;
            
            return (
              <div className="mt-6 border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Current Subject: <span className="font-semibold text-gray-900">{currentSubject.name}</span>
                  </h4>
                  <button
                    onClick={() => setShowAddGradeLevel(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Grade Level
                  </button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-2">Current Grade Levels:</div>
                      <div className="flex flex-wrap gap-2">
                        {currentSubject.gradeLevels && currentSubject.gradeLevels.length > 0 ? (
                          currentSubject.gradeLevels.map((grade) => (
                            <span key={grade} className="px-3 py-2 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                              {grade}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">No grade levels assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Add Grade Level Modal */}
        {showAddGradeLevel && (() => {
          const currentSubject = subjects.find(s => s.id === selectedSubject);
          if (!currentSubject) return null;
          
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Add Grade Level</h3>
                    <p className="text-sm text-gray-600">to {currentSubject.name}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Grade Level to Add:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {allSystemGradeLevels.map((grade) => {
                        const isAlreadyAdded = currentSubject.gradeLevels?.includes(grade);
                        return (
                          <button
                            key={grade}
                            onClick={() => setNewGradeLevel(grade)}
                            disabled={isAlreadyAdded}
                            className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                              isAlreadyAdded
                                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                : newGradeLevel === grade
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50'
                            }`}
                          >
                            {grade}
                            {isAlreadyAdded && (
                              <span className="block text-xs mt-1">✓ Already Added</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowAddGradeLevel(false);
                      setNewGradeLevel('');
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddGradeLevelToSubject}
                    disabled={!newGradeLevel}
                    className={`px-6 py-2 rounded-lg transition duration-200 ${
                      newGradeLevel
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Add Grade Level
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

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
                    Subject
                  </label>
                  <select
                    value={studentSubjectId}
                    onChange={(e) => setStudentSubjectId(e.target.value)}
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
                    Student Grade Level
                  </label>
                  <select
                    value={newStudent.gradeLevel}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, gradeLevel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={!subjects.find(s => s.id === studentSubjectId)}
                  >
                    {(() => {
                      const subj = subjects.find(s => s.id === studentSubjectId);
                      const subjLevels = subj?.gradeLevels && subj.gradeLevels.length > 0
                        ? subj.gradeLevels
                        : (subj?.gradeLevel ? [subj.gradeLevel] : []);
                      if (subjLevels.length === 0) {
                        return [<option key="none" value="">Select a subject first</option>];
                      }

                      return allSystemGradeLevels.map((g) => (
                        <option key={g} value={g} disabled={!subjLevels.includes(g)}>
                          {g}
                        </option>
                      ));
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
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="text-sm text-gray-700">
                  <strong>Active Grading Period:</strong>
                </div>
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
                <div className="text-sm text-gray-700">
                  <strong>Subject:</strong>
                </div>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>
              {isLockedByDefault && (
                <button
                  onClick={handleUnlockEditing}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition duration-200"
                >
                  Unlock Editing
                </button>
              )}
            </div>

            <div className="mt-2 text-sm">
              {isReadOnly ? (
                <span className="text-yellow-800">This grading period is currently <strong>read-only</strong>. You can unlock editing to fix errors.</span>
              ) : (
                <span className="text-green-700">Editing is enabled for this grading period.</span>
              )}
            </div>
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                Student List ({students.length} students)
              </h3>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {subjects.length > 0 && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Filter by Subject:</label>
                    <select
                      value={studentListSubjectFilter}
                      onChange={(e) => handleChangeStudentListSubjectFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    >
                      <option value="">All Subjects</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {availableGradeLevels.length > 0 && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Filter by Grade Level:</label>
                    <select
                      value={selectedGradeLevelFilter}
                      onChange={(e) => handleChangeGradeLevelFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    >
                      <option value="">All Grade Levels</option>
                      {availableGradeLevels.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Grading Period:</label>
                  <select
                    value={selectedGradingPeriod}
                    onChange={(e) => setSelectedGradingPeriod(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  >
                    <option value="first">First Grading</option>
                    <option value="second">Second Grading</option>
                    <option value="third">Third Grading</option>
                    <option value="fourth">Fourth Grading</option>
                  </select>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !selectedSubject || isReadOnly}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
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

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
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
      </div>
    </TeacherLayout>
  );
}
