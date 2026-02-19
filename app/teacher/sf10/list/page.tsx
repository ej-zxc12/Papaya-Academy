'use client';

import { useState, useEffect } from 'react';
import { Eye, FileText, Search, Clock, BarChart3, Plus } from 'lucide-react';
import TeacherLayout from '../../components/TeacherLayout';

export default function SF10List() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI Interaction States
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

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
        </div>
      </div>

      {/* SF10 Table Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 z-0">
        {/* Header with ENHANCED VISIBILITY */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#F2C94C] to-[#e5b840] text-[#1B3E2A]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Student SF10 Records (0)
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
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No SF10 forms found</h3>
                    <p className="text-sm text-gray-500 mb-6">Start by creating SF10 forms for your students.</p>
                    
                    <div className="w-48">
                      <button
                        onMouseEnter={() => setIsBtnHovered(true)}
                        onMouseLeave={() => setIsBtnHovered(false)}
                        className="flex items-center justify-center gap-2 px-5 w-full rounded-md font-semibold text-sm tracking-normal border border-[#1B3E2A] border-b-2 shadow-sm transition-all duration-300 h-11"
                        style={{
                          backgroundImage: 'linear-gradient(to top, #1B3E2A 50%, transparent 50%)',
                          backgroundSize: '100% 200%',
                          backgroundPosition: isBtnHovered ? 'bottom' : 'top',
                          color: isBtnHovered ? '#F2C94C' : '#1B3E2A', 
                          borderColor: '#1B3E2A',
                          boxShadow: isBtnHovered ? '0 4px 12px rgba(27, 62, 42, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        <Plus 
                          className={`w-4 h-4 transition-transform duration-300 ${isBtnHovered ? '-translate-y-1' : ''}`} 
                        />
                        Create First SF10
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
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
              <div className="text-4xl font-bold text-[#1B3E2A] mb-2">0</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Forms</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
              <div className="text-4xl font-bold text-green-600 mb-2">0</div>
              <div className="text-sm font-medium text-green-700 uppercase tracking-wider">Completed</div>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-xl border border-orange-100">
              <div className="text-4xl font-bold text-orange-500 mb-2">0</div>
              <div className="text-sm font-medium text-orange-700 uppercase tracking-wider">In Progress</div>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}