'use client';

import { useState, useEffect } from 'react';
import { Student, Subject, type GradeInput } from '@/types';
import { 
  Save, 
  Users, 
  BookOpen, 
  CheckCircle,
  AlertCircle,
  Filter
} from 'lucide-react';
import TeacherLayout from '../../components/TeacherLayout';

export default function GradeInput() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedGradingPeriod, setSelectedGradingPeriod] = useState<'first' | 'second' | 'third' | 'fourth'>('first');
  const [grades, setGrades] = useState<{ [key: string]: string }>({});
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Load mock data for demonstration
    const loadMockData = () => {
      // Mock students data
      const mockStudents: Student[] = [
        { id: '1', name: 'Ana Santos', grade: 'Grade 7', enrolledDate: '2024-01-15', attendance: [], grades: [] },
        { id: '2', name: 'Ben Reyes', grade: 'Grade 7', enrolledDate: '2024-01-15', attendance: [], grades: [] },
        { id: '3', name: 'Cruz Martinez', grade: 'Grade 7', enrolledDate: '2024-01-15', attendance: [], grades: [] },
        { id: '4', name: 'Diana Lim', grade: 'Grade 7', enrolledDate: '2024-01-15', attendance: [], grades: [] },
        { id: '5', name: 'Eduardo Tan', grade: 'Grade 7', enrolledDate: '2024-01-15', attendance: [], grades: [] },
      ];

      // Mock subjects data
      const mockSubjects: Subject[] = [
        { id: '1', name: 'Mathematics', code: 'MATH7', gradeLevel: 'Grade 7', teacherId: 'teacher1', semester: 'First', schoolYear: '2024-2025' },
        { id: '2', name: 'English', code: 'ENG7', gradeLevel: 'Grade 7', teacherId: 'teacher1', semester: 'First', schoolYear: '2024-2025' },
        { id: '3', name: 'Science', code: 'SCI7', gradeLevel: 'Grade 7', teacherId: 'teacher1', semester: 'First', schoolYear: '2024-2025' },
        { id: '4', name: 'Filipino', code: 'FIL7', gradeLevel: 'Grade 7', teacherId: 'teacher1', semester: 'First', schoolYear: '2024-2025' },
      ];

      setStudents(mockStudents);
      setSubjects(mockSubjects);
      if (mockSubjects.length > 0) {
        setSelectedSubject(mockSubjects[0].id);
      }
      setIsLoading(false);
    };

    loadMockData();
  }, []);


  const handleGradeChange = (studentId: string, value: string) => {
    const numValue = parseFloat(value);
    if (value === '' || (numValue >= 0 && numValue <= 100)) {
      setGrades(prev => ({ ...prev, [studentId]: value }));
    }
  };

  const handleRemarkChange = (studentId: string, value: string) => {
    setRemarks(prev => ({ ...prev, [studentId]: value }));
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
        },
        body: JSON.stringify({ grades: gradeData }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Grades saved successfully!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to save grades' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save grades' });
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
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
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
                disabled={isSaving || !selectedSubject}
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
                    Save Grades
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
                        {student.grade}
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
                        className={`w-24 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${getGradeColor(grades[student.id] || '')}`}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={remarks[student.id] || ''}
                        onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                        className="w-48 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Optional remarks"
                      />
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
