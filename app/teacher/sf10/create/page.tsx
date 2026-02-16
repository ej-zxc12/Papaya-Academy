'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SF10Record, SF10Subject, Student } from '@/types';
import { ArrowLeft, Save, Plus, Trash2, User, Calculator } from 'lucide-react';

export default function SF10Create() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [sf10Data, setSf10Data] = useState<Partial<SF10Record>>({
    gradeLevel: '',
    section: '',
    schoolYear: '',
    semester: 'First',
    subjects: [],
    generalAverage: 0,
    status: 'promoted',
    adviserName: '',
    dateCompleted: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('teacherSession');
    if (!session) {
      router.push('/teacher/login');
      return;
    }
    loadStudents();
  }, [router]);

  const loadStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSubject = () => {
    setSf10Data(prev => ({
      ...prev,
      subjects: [...(prev.subjects || []), {
        subjectCode: '',
        subjectName: '',
        firstGrading: 0,
        secondGrading: 0,
        thirdGrading: 0,
        fourthGrading: 0,
        finalRating: 0,
        remarks: ''
      }]
    }));
  };

  const updateSubject = (index: number, field: keyof SF10Subject, value: string | number) => {
    const updatedSubjects = [...(sf10Data.subjects || [])];
    updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
    
    // Calculate final rating if grading periods are updated
    if (field.includes('Grading')) {
      const subject = updatedSubjects[index];
      const grades = [
        subject.firstGrading,
        subject.secondGrading,
        subject.thirdGrading,
        subject.fourthGrading
      ].filter(g => g > 0);
      subject.finalRating = grades.length > 0 
        ? grades.reduce((a, b) => a + b, 0) / grades.length 
        : 0;
    }
    
    setSf10Data(prev => ({ ...prev, subjects: updatedSubjects }));
    calculateGeneralAverage(updatedSubjects);
  };

  const removeSubject = (index: number) => {
    const updatedSubjects = (sf10Data.subjects || []).filter((_, i) => i !== index);
    setSf10Data(prev => ({ ...prev, subjects: updatedSubjects }));
    calculateGeneralAverage(updatedSubjects);
  };

  const calculateGeneralAverage = (subjects: SF10Subject[]) => {
    const validSubjects = subjects.filter(s => s.finalRating > 0);
    if (validSubjects.length > 0) {
      const average = validSubjects.reduce((sum, s) => sum + s.finalRating, 0) / validSubjects.length;
      setSf10Data(prev => ({ ...prev, generalAverage: Math.round(average * 100) / 100 }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const session = localStorage.getItem('teacherSession');
      const teacherData = JSON.parse(session!);
      
      const selectedStudentData = students.find(s => s.id === selectedStudent);
      
      const completeSF10: SF10Record = {
        ...sf10Data as SF10Record,
        subjects: sf10Data.subjects || [],
        studentId: selectedStudent,
        lrn: selectedStudentData?.id || '',
        studentName: selectedStudentData?.name || ''
      };

      const response = await fetch('/api/teacher/sf10', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeSF10)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'SF10 form created successfully!' });
        setTimeout(() => router.push('/teacher/sf10/list'), 2000);
      } else {
        setMessage({ type: 'error', text: 'Failed to create SF10 form' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create SF10 form' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button onClick={() => router.back()} className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Create SF10 Form</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Student Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} - Grade {student.grade}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LRN</label>
              <input
                type="text"
                value={students.find(s => s.id === selectedStudent)?.id || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
              <input
                type="text"
                value={sf10Data.gradeLevel}
                onChange={(e) => setSf10Data(prev => ({ ...prev, gradeLevel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Grade 7"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
              <input
                type="text"
                value={sf10Data.section}
                onChange={(e) => setSf10Data(prev => ({ ...prev, section: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Rose"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Year</label>
              <input
                type="text"
                value={sf10Data.schoolYear}
                onChange={(e) => setSf10Data(prev => ({ ...prev, schoolYear: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2024-2025"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Subjects & Grades</h2>
            <button
              onClick={addSubject}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Subject
            </button>
          </div>

          {(sf10Data.subjects || []).map((subject, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium">Subject {index + 1}</h3>
                <button
                  onClick={() => removeSubject(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Subject Code"
                  value={subject.subjectCode}
                  onChange={(e) => updateSubject(index, 'subjectCode', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={subject.subjectName}
                  onChange={(e) => updateSubject(index, 'subjectName', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="1st Grading"
                  value={subject.firstGrading || ''}
                  onChange={(e) => updateSubject(index, 'firstGrading', parseFloat(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="2nd Grading"
                  value={subject.secondGrading || ''}
                  onChange={(e) => updateSubject(index, 'secondGrading', parseFloat(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="3rd Grading"
                  value={subject.thirdGrading || ''}
                  onChange={(e) => updateSubject(index, 'thirdGrading', parseFloat(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="4th Grading"
                  value={subject.fourthGrading || ''}
                  onChange={(e) => updateSubject(index, 'fourthGrading', parseFloat(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Final Rating"
                  value={subject.finalRating || ''}
                  readOnly
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <input
                  type="text"
                  placeholder="Remarks"
                  value={subject.remarks}
                  onChange={(e) => updateSubject(index, 'remarks', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">General Average</label>
              <input
                type="number"
                value={sf10Data.generalAverage}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={sf10Data.status}
                onChange={(e) => setSf10Data(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="promoted">Promoted</option>
                <option value="retained">Retained</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Completed</label>
              <input
                type="date"
                value={sf10Data.dateCompleted}
                onChange={(e) => setSf10Data(prev => ({ ...prev, dateCompleted: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || !selectedStudent}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save SF10 Form
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
