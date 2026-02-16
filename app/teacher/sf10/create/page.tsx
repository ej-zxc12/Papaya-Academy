'use client';

import { useState, useEffect } from 'react';
import { Student } from '@/types';
import { FilePlus, User, Calculator } from 'lucide-react';
import TeacherLayout from '../../components/TeacherLayout';

export default function SF10Create() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load mock data for demonstration
    const loadMockData = () => {
      const mockStudents: Student[] = [
        { id: '1', name: 'Ana Santos', grade: 'Grade 7', enrolledDate: '2024-01-15', attendance: [], grades: [] },
        { id: '2', name: 'Ben Reyes', grade: 'Grade 7', enrolledDate: '2024-01-15', attendance: [], grades: [] },
        { id: '3', name: 'Cruz Martinez', grade: 'Grade 7', enrolledDate: '2024-01-15', attendance: [], grades: [] },
        { id: '4', name: 'Diana Lim', grade: 'Grade 7', enrolledDate: '2024-01-15', attendance: [], grades: [] },
        { id: '5', name: 'Eduardo Tan', grade: 'Grade 7', enrolledDate: '2024-01-15', attendance: [], grades: [] },
      ];

      setStudents(mockStudents);
      setIsLoading(false);
    };

    loadMockData();
  }, []);

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
    <TeacherLayout title="Create SF10" subtitle="Generate SF10 forms for your students.">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FilePlus className="w-5 h-5 text-[#1B3E2A]" />
          Create New SF10 Form
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Student
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]">
              <option value="">Choose a student...</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.grade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School Year
            </label>
            <input
              type="text"
              defaultValue="2024-2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade Level
            </label>
            <input
              type="text"
              defaultValue="Grade 7"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <input
              type="text"
              placeholder="e.g., Rose"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
            />
          </div>
        </div>

        <div className="mt-6">
          <button className="bg-[#1B3E2A] text-white px-6 py-2 rounded-lg hover:bg-[#2d5a3f] flex items-center gap-2">
            <FilePlus className="w-4 h-4" />
            Create SF10 Form
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#1B3E2A]" />
          Recent SF10 Forms
        </h3>
        
        <div className="text-center py-8 text-gray-500">
          <FilePlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>No SF10 forms created yet.</p>
          <p className="text-sm">Create your first SF10 form using the form above.</p>
        </div>
      </div>
    </TeacherLayout>
  );
}
