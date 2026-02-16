'use client';

import { useState, useEffect } from 'react';
import { Table, BookOpen, Download, Search, Filter } from 'lucide-react';
import TeacherLayout from '../../components/TeacherLayout';

export default function ClassRecords() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
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
    <TeacherLayout title="Class Records" subtitle="View and manage class records and grade sheets.">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Table className="w-5 h-5 text-[#1B3E2A]" />
            Grade Sheets
          </h2>
          
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
              />
            </div>
            
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
            >
              <option value="">All Subjects</option>
              <option value="math">Mathematics</option>
              <option value="english">English</option>
              <option value="science">Science</option>
              <option value="filipino">Filipino</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  LRN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  First Grading
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Second Grading
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Third Grading
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fourth Grading
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Final Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <Table className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No grade records found</h3>
                  <p className="text-sm text-gray-500">Start by inputting grades for your students.</p>
                  <button className="mt-4 bg-[#1B3E2A] text-white px-4 py-2 rounded-lg hover:bg-[#2d5a3f] flex items-center gap-2 mx-auto">
                    <BookOpen className="w-4 h-4" />
                    Input Grades
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#1B3E2A]" />
            Subject Overview
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Mathematics</span>
              <span className="text-sm text-gray-500">0 students</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">English</span>
              <span className="text-sm text-gray-500">0 students</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Science</span>
              <span className="text-sm text-gray-500">0 students</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Filipino</span>
              <span className="text-sm text-gray-500">0 students</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-[#1B3E2A]" />
            Export Options
          </h3>
          
          <div className="space-y-3">
            <button className="w-full bg-[#1B3E2A] text-white px-4 py-2 rounded-lg hover:bg-[#2d5a3f] flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export Grade Sheet
            </button>
            <button className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export Summary Report
            </button>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
