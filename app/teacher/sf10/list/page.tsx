'use client';

import { useState, useEffect } from 'react';
import { Eye, FileText, Download, Search } from 'lucide-react';
import TeacherLayout from '../../components/TeacherLayout';

export default function SF10List() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    <TeacherLayout title="View SF10" subtitle="View and manage existing SF10 forms.">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#1B3E2A]" />
            SF10 Forms List
          </h2>
          
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
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Grade Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  School Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No SF10 forms found</h3>
                  <p className="text-sm text-gray-500">Start by creating SF10 forms for your students.</p>
                  <button className="mt-4 bg-[#1B3E2A] text-white px-4 py-2 rounded-lg hover:bg-[#2d5a3f] flex items-center gap-2 mx-auto">
                    <Eye className="w-4 h-4" />
                    Create First SF10
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#1B3E2A]" />
          SF10 Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1B3E2A]">0</div>
            <div className="text-sm text-gray-500">Total Forms</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
