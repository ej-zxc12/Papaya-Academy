'use client';

import { useState, useEffect, useRef } from 'react';
import { Student } from '@/types';
import { 
  FilePlus, 
  Calculator, 
  ChevronDown, 
  Check, 
  Calendar, 
  GraduationCap, 
  Users 
} from 'lucide-react';
import TeacherLayout from '../../components/TeacherLayout';

export default function SF10Create() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form States
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [schoolYear, setSchoolYear] = useState('2024-2025');
  const [gradeLevel, setGradeLevel] = useState('Grade 7');
  const [section, setSection] = useState('');

  // UI Interaction States
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle Click Outside for Dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStudentDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

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
    <TeacherLayout title="Create SF10" subtitle="Generate official SF10 forms for your students.">
      <style jsx global>{`
        .dropdown-enter {
          animation: scaleIn 0.2s ease-out forwards;
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af; 
        }
      `}</style>

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 z-10 relative">
        <div className="px-6 py-4 bg-gradient-to-r from-[#F2C94C] to-[#e5b840] text-[#1B3E2A]">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FilePlus className="w-5 h-5 text-[#1B3E2A]" />
            New SF10 Configuration
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Custom Student Dropdown */}
            <div className="relative z-50">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Student
              </label>
              <div className="relative group" ref={dropdownRef}>
                <div className={`absolute inset-0 bg-gradient-to-r from-[#F2C94C] to-[#1B3E2A] rounded-lg opacity-0 transition-opacity duration-300 blur-sm ${isStudentDropdownOpen ? 'opacity-100' : 'group-hover:opacity-100'}`}></div>
                <div className="relative h-11">
                  <button
                    onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                    className="h-full flex items-center justify-between w-full px-4 border border-gray-300 rounded-lg bg-white focus:outline-none transition-all duration-300 group-hover:border-[#F2C94C]"
                  >
                    <span className={`text-sm ${selectedStudent ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {selectedStudent ? `${selectedStudent.name} - ${selectedStudent.grade}` : "Choose a student..."}
                    </span>
                    <ChevronDown 
                      className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isStudentDropdownOpen ? 'rotate-180 text-[#F2C94C]' : 'group-hover:text-[#F2C94C]'}`} 
                    />
                  </button>

                  {isStudentDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 dropdown-enter">
                      <div className="py-1 max-h-64 overflow-y-auto custom-scrollbar">
                        {students.map((student) => (
                          <button
                            key={student.id}
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsStudentDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:bg-[#f0f7f3] transition-colors ${selectedStudent?.id === student.id ? 'bg-[#f0f7f3] text-[#1B3E2A] font-medium' : 'text-gray-700'}`}
                          >
                            <span>{student.name} <span className="text-xs text-gray-400 ml-1">({student.grade})</span></span>
                            {selectedStudent?.id === student.id && <Check className="w-4 h-4 text-[#1B3E2A]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* School Year Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                School Year
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1B3E2A] to-[#F2C94C] rounded-lg opacity-0 transition-opacity duration-300 blur-sm group-focus-within:opacity-100 group-hover:opacity-100"></div>
                <div className="relative flex items-center h-11">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 group-focus-within:text-[#1B3E2A]" />
                  <input
                    type="text"
                    value={schoolYear}
                    onChange={(e) => setSchoolYear(e.target.value)}
                    className="h-full w-full pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent bg-white transition-all duration-300 group-hover:border-[#1B3E2A] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Grade Level Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Grade Level
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1B3E2A] to-[#F2C94C] rounded-lg opacity-0 transition-opacity duration-300 blur-sm group-focus-within:opacity-100 group-hover:opacity-100"></div>
                <div className="relative flex items-center h-11">
                  <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 group-focus-within:text-[#1B3E2A]" />
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="h-full w-full pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent bg-white transition-all duration-300 group-hover:border-[#1B3E2A] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Section
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1B3E2A] to-[#F2C94C] rounded-lg opacity-0 transition-opacity duration-300 blur-sm group-focus-within:opacity-100 group-hover:opacity-100"></div>
                <div className="relative flex items-center h-11">
                  <Users className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 group-focus-within:text-[#1B3E2A]" />
                  <input
                    type="text"
                    placeholder="e.g., Rose"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="h-full w-full pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent bg-white transition-all duration-300 group-hover:border-[#1B3E2A] text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
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
                <FilePlus 
                  className={`w-4 h-4 transition-transform duration-300 ${isBtnHovered ? '-translate-y-1' : ''}`} 
                />
                Generate Form
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Forms Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden z-0">
        <div className="px-6 py-4 bg-gradient-to-r from-[#F2C94C] to-[#e5b840] text-[#1B3E2A]">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Recent SF10 Forms
          </h3>
        </div>
        
        <div className="text-center py-16 text-gray-500 bg-[#fef9e7]/30">
          <FilePlus className="mx-auto h-16 w-16 text-[#F2C94C]/60 mb-4" />
          <p className="text-lg font-medium text-gray-700">No SF10 forms generated yet.</p>
          <p className="text-sm mt-2">Select a student and fill out the details above to create your first official record.</p>
        </div>
      </div>
    </TeacherLayout>
  );
}