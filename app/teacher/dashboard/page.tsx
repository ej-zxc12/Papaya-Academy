'use client';

import { useState, useEffect } from 'react';
import { Teacher, Student, Subject } from '@/types';
import { 
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  UserCheck,
  Calendar,
  Clock
} from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';

export default function TeacherDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load mock data for demonstration
    const loadMockData = () => {
      // Mock students data
      const mockStudents: Student[] = [
        { id: '1', name: 'Ana Santos', lrn: '123456789012', grade: 'Grade 7', section: 'A' },
        { id: '2', name: 'Ben Reyes', lrn: '123456789013', grade: 'Grade 7', section: 'A' },
        { id: '3', name: 'Cruz Martinez', lrn: '123456789014', grade: 'Grade 7', section: 'A' },
        { id: '4', name: 'Diana Lim', lrn: '123456789015', grade: 'Grade 7', section: 'A' },
        { id: '5', name: 'Eduardo Tan', lrn: '123456789016', grade: 'Grade 7', section: 'A' },
      ];

      // Mock subjects data
      const mockSubjects: Subject[] = [
        { id: '1', name: 'Mathematics', code: 'MATH7' },
        { id: '2', name: 'English', code: 'ENG7' },
        { id: '3', name: 'Science', code: 'SCI7' },
        { id: '4', name: 'Filipino', code: 'FIL7' },
      ];

      setStudents(mockStudents);
      setSubjects(mockSubjects);
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
    <TeacherLayout 
      title="Dashboard" 
      subtitle="Welcome back! Here's an overview of your class."
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Students</p>
            <p className="font-bold text-xl">{students.length}</p>
          </div>
          <div className="bg-blue-500 text-white p-2 rounded-full">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Grade Entries</p>
            <p className="font-bold text-xl">{subjects.length}</p>
          </div>
          <div className="bg-green-500 text-white p-2 rounded-full">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">SF10 Records</p>
            <p className="font-bold text-xl">0</p>
          </div>
          <div className="bg-purple-500 text-white p-2 rounded-full">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Collections</p>
            <p className="font-bold text-xl">₱2,500</p>
          </div>
          <div className="bg-orange-500 text-white p-2 rounded-full">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recent Students and Contributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Recent Students</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {students.slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <UserCheck className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-gray-500">LRN: {student.lrn}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{student.section}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contribution Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Contribution Status</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm">Monthly Fee</span>
                </div>
                <span className="text-sm font-medium">₱500</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm">Paid Students</span>
                </div>
                <span className="text-sm font-medium">5/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-xs text-gray-500 text-center">All students have paid their contributions</p>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
