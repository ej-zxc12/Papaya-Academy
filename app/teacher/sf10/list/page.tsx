'use client';

import { useState, useEffect } from 'react';
import { Eye, FileText, Search, Clock, BarChart3, Plus, Download, Edit, Trash2 } from 'lucide-react';
import TeacherLayout from '../../components/TeacherLayout';
import SF10Form from '../SF10Form';

interface SF10Record {
  student: {
    id: string;
    lrn: string;
    name: string;
    gradeLevel: string;
    section: string;
  };
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
    subjects: Array<{
      subjectCode: string;
      subjectName: string;
      firstGrading: number;
      secondGrading: number;
      thirdGrading: number;
      fourthGrading: number;
      finalRating: number;
      remarks: string;
    }>;
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
  const [selectedSF10, setSelectedSF10] = useState<SF10Record | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // UI Interaction States
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  useEffect(() => {
    fetchSF10Records();
  }, []);

  const fetchSF10Records = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/teacher/sf10');
      
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
      
      if (data.sf10Records) {
        setSF10Records(data.sf10Records);
      } else {
        setSF10Records([]);
      }
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

  const handleViewSF10 = (record: SF10Record) => {
    setSelectedSF10(record);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedSF10(null);
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
                            onClick={fetchSF10Records}
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
              <SF10Form />
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
