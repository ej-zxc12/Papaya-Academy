'use client';

import { useState, useEffect, useRef } from 'react';
import { Student, Subject, type GradeInput } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import * as XLSX from 'xlsx';

import { 
  Save, 
  Users, 
  BookOpen, 
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Search,
  ChevronDown,
  Check,
  Upload,
  FileText,
  Download
} from 'lucide-react';
import TeacherLayout from '../../components/TeacherLayout';

const AnimatedButton = ({
  onClick,
  disabled,
  children,
  className,
  style,
  title,
  type,
  onMouseEnter,
  onMouseLeave,
  isActive = false,
}: {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
  onMouseEnter?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLButtonElement>;
  isActive?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isVisuallyActive = isActive || isHovered;

  return (
    <button
      type={type ?? 'button'}
      title={title}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        onMouseEnter?.(e);
        setIsHovered(true);
      }}
      onMouseLeave={(e) => {
        onMouseLeave?.(e);
        setIsHovered(false);
      }}
      className={
        className ??
        'flex items-center justify-center gap-2 px-5 w-full rounded-md font-semibold text-xs tracking-normal h-11 disabled:opacity-50 disabled:cursor-not-allowed'
      }
      style={{
        backgroundColor: isVisuallyActive ? '#1B3E2A' : 'transparent',
        color: isActive ? '#FFFFFF' : (isVisuallyActive ? '#F2C94C' : '#1B3E2A'),
        borderColor: '#1B3E2A',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderBottomWidth: '2px',
        boxShadow: isVisuallyActive
          ? '0 4px 12px rgba(27, 62, 42, 0.3)'
          : '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 300ms ease',
        ...(style ?? {}),
      }}
    >
      <span
        className={`inline-flex items-center gap-2 transition-transform duration-300 ${
          isVisuallyActive ? '-translate-y-1' : ''
        }`}
      >
        {children}
      </span>
    </button>
  );
};

// Helper component for the Custom Dropdown
const CustomDropdown = ({ 
  label, 
  value, 

  options, 
  onChange, 
  placeholder = "Select...",
  disabled = false 
}: { 
  label?: string, 
  value: string, 
  options: { label: string, value: string }[], 
  onChange: (val: string) => void,
  placeholder?: string,
  disabled?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [options, value]);

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  return (
    <div className="relative group min-w-[200px]" ref={dropdownRef}>
      {label && <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1 uppercase tracking-wider">{label}</label>}
      <div className={`absolute inset-0 bg-gradient-to-r from-[#F2C94C] to-[#1B3E2A] rounded-lg opacity-0 transition-opacity duration-300 blur-sm ${isOpen ? 'opacity-20' : 'group-hover:opacity-10'}`}></div>
      <div className="relative h-11">
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`h-full w-full flex items-center justify-between px-4 border rounded-lg bg-white transition-all duration-300 ${
            isOpen ? 'border-[#1B3E2A] ring-1 ring-[#1B3E2A]' : 'border-gray-300 hover:border-[#F2C94C]'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
        >
          <span className={`text-sm truncate ${value ? 'text-[#1B3E2A] font-medium' : 'text-gray-500'}`}>
            {selectedLabel}
          </span>
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#F2C94C]' : 'group-hover:text-[#1B3E2A]'}`} 
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-[#f0f7f3] transition-colors ${
                    value === option.value ? 'bg-[#f0f7f3] text-[#1B3E2A] font-medium' : 'text-gray-700'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && <Check className="w-4 h-4 text-[#1B3E2A]" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
  const [gradesBySubjectAndPeriod, setGradesBySubjectAndPeriod] = useState<{
    [subjectId: string]: { [period: string]: { [studentId: string]: string } }
  }>({});
  const [remarksBySubjectAndPeriod, setRemarksBySubjectAndPeriod] = useState<{
    [subjectId: string]: { [period: string]: { [studentId: string]: string } }
  }>({});
  const [isRemarkManuallyEditedBySubjectAndPeriod, setIsRemarkManuallyEditedBySubjectAndPeriod] = useState<{
    [subjectId: string]: { [period: string]: { [studentId: string]: boolean } }
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedGradeLevelFilter, setSelectedGradeLevelFilter] = useState<string>('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('');
  const [studentSubjectId, setStudentSubjectId] = useState<string[]>([]);
  const [availableGradeLevelsForStudent, setAvailableGradeLevelsForStudent] = useState<string[]>([]);
  const [studentListSubjectFilter, setStudentListSubjectFilter] = useState<string>('');
  const [sections, setSections] = useState<Array<{ id: string; name: string; subjectId?: string; gradeLevel?: string }>>([]);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionGradeLevel, setNewSectionGradeLevel] = useState('Grade 1');
  const [selectedSection, setSelectedSection] = useState('');

  // Student management states
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', lrn: '', gradeLevel: '', section: '', schoolYear: '' });
  
  // Excel upload states
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [excelPreview, setExcelPreview] = useState<any[]>([]);
  const [excelSchoolYear, setExcelSchoolYear] = useState<string>('');

  // Subject management states
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: ''
  });

  useEffect(() => {
    // Initialize teacher session + persisted active period (run once)
    const init = async () => {
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
      } catch (error) {
        console.error('Error loading data:', error);
        setMessage({ type: 'error', text: 'Failed to load data' });
        setIsLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    // Load subjects whenever we have a teacherId
    const loadSubjects = async () => {
      if (!teacherId) return;
      try {
        const subjectsResponse = await fetch('/api/teacher/subjects', {
          headers: {
            'Authorization': `Bearer ${teacherId}`
          }
        });

        let subjectsData: Subject[] = [];
        if (subjectsResponse.ok) {
          subjectsData = await subjectsResponse.json();
          setSubjects(subjectsData);
        } else {
          setSubjects([]);
        }

        setSelectedSubject((prev) => {
          if (prev && subjectsData.some(s => s.id === prev)) return prev;
          const validSubjects = subjectsData.filter(s => s.name && s.code && s.id);
          return validSubjects[0]?.id ?? '';
        });
      } catch (error) {
        console.error('Error loading subjects:', error);
        setSubjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubjects();
  }, [teacherId]);

  useEffect(() => {
    // Load students + existing grades whenever selection changes
    const loadSelectionData = async () => {
      if (!teacherId || !subjects || subjects.length === 0) return;
      try {
        // For student management, load all students from ALL teachers in the school
        const studentsResponse = await fetch('/api/teacher/students?scope=school', {
          headers: {
            'Authorization': `Bearer ${teacherId}`
          }
        });

        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          setAllStudents(studentsData);
        } else {
          setAllStudents([]);
        }

        // Only load grades for the selected subject
        setIsEditingUnlocked(false);
        if (selectedSubject) {
          const subjectObj = subjects.find(s => s.id === selectedSubject);
          await loadExistingGrades(teacherId, selectedSubject, selectedGradingPeriod, subjectObj?.schoolYear);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setAllStudents([]);
      }
    };

    loadSelectionData();
  }, [teacherId, subjects, selectedSubject, selectedGradingPeriod]);

  useEffect(() => {
    setIsEditingUnlocked(false);
    // CRITICAL: Clear ALL grades when switching subjects to prevent bleed-over
    console.log('🧹 CLEARING ALL GRADES - Subject changed to:', selectedSubject);
    setGrades({});
    setRemarks({});
    setIsRemarkManuallyEdited({});
    
    // Also clear any conflicting filters
    if (studentListSubjectFilter && studentListSubjectFilter !== selectedSubject) {
      console.log('🧹 CLEARING CONFLICTING FILTER:', studentListSubjectFilter);
      setStudentListSubjectFilter('');
    }
  }, [selectedSubject, selectedGradingPeriod]);

  useEffect(() => {
    let filtered = allStudents;
    console.log('🔍 DEBUG: Starting student filtering...');
    console.log('🔍 DEBUG: All students before filtering:', allStudents.map(s => ({ 
      id: s.id, 
      name: s.name || 'Unnamed Student', 
      gradeLevel: s.gradeLevel || 'Unknown Grade', 
      section: s.section || 'NO SECTION',
      subjectId: s.subjectId || null, 
      subjectIds: s.subjectIds || [] 
    })));
    console.log('🔍 DEBUG: Selected subject:', selectedSubject || 'NONE');
    console.log('🔍 DEBUG: Selected section filter:', selectedSectionFilter || 'NONE');
    
    // CRITICAL: Check if there are grades from other subjects in memory
    const currentGrades = Object.keys(grades);
    console.log('🔍 DEBUG: Current grades in memory:', currentGrades.length, 'grades for students:', currentGrades.map(studentId => ({
      studentId,
      grade: grades[studentId],
      studentName: allStudents.find(s => s.id === studentId)?.name || 'Unknown',
      studentSubjectId: allStudents.find(s => s.id === studentId)?.subjectId || 'NONE',
      studentSubjectIds: allStudents.find(s => s.id === studentId)?.subjectIds || []
    })));
    
    // IMMEDIATE ACTION: If we have more grades than filtered students, clear excess grades
    if (currentGrades.length > filtered.length && selectedSubject) {
      console.log('🚨 IMMEDIATE: More grades than students - clearing excess grades!');
      console.log('🚨 Grades:', currentGrades.length, 'Students:', filtered.length);
      
      // Keep only grades for students who are actually in the filtered list
      const validGrades: { [key: string]: string } = {};
      const validRemarks: { [key: string]: string } = {};
      const validManualEdits: { [key: string]: boolean } = {};
      
      filtered.forEach(student => {
        if (grades[student.id]) {
          validGrades[student.id] = grades[student.id];
          console.log('✅ Keeping grade for student:', student.name, '-', grades[student.id]);
        }
        if (remarks[student.id]) validRemarks[student.id] = remarks[student.id];
        if (isRemarkManuallyEdited[student.id]) validManualEdits[student.id] = isRemarkManuallyEdited[student.id];
      });
      
      console.log('🔧 IMMEDIATE: Setting valid grades:', validGrades);
      setGrades(validGrades);
      setRemarks(validRemarks);
      setIsRemarkManuallyEdited(validManualEdits);
      
      console.log('🔧 IMMEDIATE: Cleared excess grades, now have', Object.keys(validGrades).length, 'grades');
    }
    
    // EMERGENCY CLEAR: If we have grades but no matching students, clear all grades
    if (currentGrades.length > 0 && selectedSubject) {
      console.log('🔍 DEBUG: Checking grades for subject isolation...');
      const gradesForCurrentSubject = currentGrades.filter(studentId => {
        const student = allStudents.find(s => s.id === studentId);
        console.log('🔍 DEBUG: Checking grade for student', studentId, '-', student?.name || 'Unknown');
        console.log('🔍 DEBUG: Student subjectId:', student?.subjectId, 'subjectIds:', student?.subjectIds);
        console.log('🔍 DEBUG: Selected subject:', selectedSubject);
        
        if (!student) {
          console.log('🔍 DEBUG: Student not found in allStudents - excluding grade');
          return false;
        }
        
        const belongsToCurrentSubject = student.subjectId === selectedSubject || 
               (student.subjectIds && student.subjectIds.includes(selectedSubject));
        
        console.log('🔍 DEBUG: Student belongs to current subject?', belongsToCurrentSubject);
        return belongsToCurrentSubject;
      });
      
      console.log('🔍 DEBUG: Grades analysis:', {
        totalGrades: currentGrades.length,
        gradesForCurrentSubject: gradesForCurrentSubject.length,
        shouldTriggerEmergency: gradesForCurrentSubject.length < currentGrades.length
      });
      
      if (gradesForCurrentSubject.length < currentGrades.length) {
        console.log('🚨 EMERGENCY: Clearing grades from other subjects!');
        console.log('🚨 Had', currentGrades.length, 'grades, but only', gradesForCurrentSubject.length, 'belong to current subject');
        
        // Keep only grades for current subject
        const validGrades: { [key: string]: string } = {};
        const validRemarks: { [key: string]: string } = {};
        const validManualEdits: { [key: string]: boolean } = {};
        
        gradesForCurrentSubject.forEach(studentId => {
          validGrades[studentId] = grades[studentId];
          if (remarks[studentId]) validRemarks[studentId] = remarks[studentId];
          if (isRemarkManuallyEdited[studentId]) validManualEdits[studentId] = isRemarkManuallyEdited[studentId];
        });
        
        console.log('🔧 EMERGENCY: Setting valid grades:', validGrades);
        setGrades(validGrades);
        setRemarks(validRemarks);
        setIsRemarkManuallyEdited(validManualEdits);
        
        console.log('🔧 EMERGENCY: Kept only', Object.keys(validGrades).length, 'valid grades for current subject');
      } else {
        console.log('✅ All grades belong to current subject - no emergency clearing needed');
      }
    }
    
    // ABSOLUTE REQUIREMENT: Only show students enrolled in the EXACT selected subject
    if (selectedSubject) {
      console.log('🔍 DEBUG: Filtering students for subject:', selectedSubject);
      filtered = filtered.filter(s => {
        const enrolledInOldField = s.subjectId === selectedSubject;
        const enrolledInNewArray = s.subjectIds && s.subjectIds.includes(selectedSubject);
        const isEnrolled = enrolledInOldField || enrolledInNewArray;
        
        console.log('🔍 DEBUG: Student', s.name, 'enrolled in subject', selectedSubject, '?', isEnrolled, {
          studentId: s.id,
          subjectId: s.subjectId,
          subjectIds: s.subjectIds,
          enrolledInOldField,
          enrolledInNewArray
        });
        
        return isEnrolled;
      });
      
      console.log('🔍 DEBUG: After filtering by selectedSubject (' + selectedSubject + '):', filtered.length, 'students remain');
    }
    
    // Apply additional subject filter if set (but only if it doesn't conflict)
    if (studentListSubjectFilter) {
      console.log('🔍 DEBUG: Additional filter active:', studentListSubjectFilter);
      if (studentListSubjectFilter !== selectedSubject) {
        console.log('🚨 WARNING: Additional filter conflicts with selected subject - clearing additional filter');
        setStudentListSubjectFilter(''); // Auto-clear conflicting filter
      } else {
        filtered = filtered.filter(s => 
          s.subjectId === studentListSubjectFilter || 
          (s.subjectIds && s.subjectIds.includes(studentListSubjectFilter))
        );
        console.log('🔍 DEBUG: After additional subject filter:', filtered.length, 'students remain');
      }
    }
    
    // Apply grade level filter
    if (selectedGradeLevelFilter) {
      filtered = filtered.filter(s => s.gradeLevel === selectedGradeLevelFilter);
      console.log('🔍 DEBUG: After grade level filter:', filtered.length, 'students remain');
    }
    
    // Apply section filter (case-insensitive, matches Diamond, DIAMOND, diamond)
    if (selectedSectionFilter) {
      console.log('🔍 DEBUG: Students before section filter with their sections:', filtered.map(s => ({ name: s.name, section: s.section })));
      filtered = filtered.filter(s => {
        const studentSection = (s.section || '').trim().toUpperCase();
        const filterSection = selectedSectionFilter.trim().toUpperCase();
        console.log(`🔍 DEBUG: Comparing student section "${studentSection}" with filter "${filterSection}"`);
        return studentSection === filterSection;
      });
      console.log('🔍 DEBUG: After section filter:', filtered.length, 'students remain');
    }
    
    console.log('🔍 DEBUG: Final filtered students:', filtered.map(s => ({ 
      id: s.id, 
      name: s.name || 'Unnamed Student', 
      gradeLevel: s.gradeLevel || 'Unknown Grade', 
      subjectId: s.subjectId || null, 
      subjectIds: s.subjectIds || [] 
    })));
    
    // CRITICAL: Check for any students with grades who shouldn't be here
    const invalidStudents = filtered.filter(s => {
      const hasGrade = grades[s.id] && grades[s.id] !== '' && grades[s.id] !== '0';
      if (!hasGrade) return false;
      
      const isEnrolled = s.subjectId === selectedSubject || 
                        (s.subjectIds && s.subjectIds.includes(selectedSubject));
      
      if (!isEnrolled) {
        console.log('🚨 CROSS-SUBJECT GRADE DETECTED:', {
          studentId: s.id,
          studentName: s.name,
          selectedSubject: selectedSubject,
          studentSubjectId: s.subjectId,
          studentSubjectIds: s.subjectIds,
          grade: grades[s.id],
          isEnrolled: isEnrolled
        });
        return true;
      }
      return false;
    });
    
    if (invalidStudents.length > 0) {
      console.log('🚨 FOUND', invalidStudents.length, 'INVALID STUDENTS WITH CROSS-SUBJECT GRADES!');
      // Remove invalid students immediately
      filtered = filtered.filter(s => !invalidStudents.find(inv => inv.id === s.id));
      console.log('🔧 DEBUG: Removed invalid students, now showing:', filtered.length, 'students');
    }
    
    setStudents(filtered);
  }, [selectedGradeLevelFilter, selectedSectionFilter, studentListSubjectFilter, allStudents, selectedSubject, selectedGradingPeriod, grades, remarks, isRemarkManuallyEdited]);

  useEffect(() => {
    if (subjects?.length > 0 && studentSubjectId.length === 0) {
      const validSubjects = subjects.filter(subject => subject.name && subject.code && subject.id);
      if (validSubjects.length > 0) {
        setStudentSubjectId([validSubjects[0].id]);
      }
    }
  }, [subjects, studentSubjectId]);

  useEffect(() => {
    // Update available grade levels for student dropdown
    const allGradeLevels = ['Pre-School', 'Nursery', 'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
    setAvailableGradeLevelsForStudent(allGradeLevels);
    
    // Auto-select first grade level if none is selected
    if (!newStudent.gradeLevel) {
      setNewStudent(prev => ({ ...prev, gradeLevel: allGradeLevels[0] }));
    }
  }, []);

  useEffect(() => {
    if (subjects?.length > 0 && !selectedSubject) {
      const validSubjects = subjects.filter(subject => subject.name && subject.code && subject.id);
      if (validSubjects.length > 0) {
        setSelectedSubject(validSubjects[0].id);
      }
    }
  }, [subjects]);

  useEffect(() => {
    const loadSections = async () => {
      if (!teacherId) return;
      try {
        // Fetch sections from teacherSubjects collection
        const response = await fetch('/api/teacher/subjects', {
          headers: {
            'Authorization': `Bearer ${teacherId}`
          }
        });

        if (response.ok) {
          const teacherSubjectsData = await response.json();
          console.log('Sections API response:', teacherSubjectsData); // Debug log
          // Extract unique sections from teacherSubjects
          const sectionsMap = new Map<string, { id: string; name: string; subjectId?: string; gradeLevel?: string }>();
          
          teacherSubjectsData.forEach((ts: any) => {
            if (ts.section) {
              const key = ts.section;
              sectionsMap.set(key, { 
                id: ts.id || key, 
                name: ts.section, 
                subjectId: ts.subjectId,
                gradeLevel: ts.gradeLevel
              });
            }
          });

          const normalized = Array.from(sectionsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
          console.log('Processed sections:', normalized); // Debug log
          setSections(normalized);
        }
      } catch (e) {
        console.error('Error loading sections:', e);
        setSections([]);
      }
    };

    loadSections();
  }, [teacherId]);

  const loadExistingGrades = async (teacherId: string, subjectId: string, gradingPeriod: string, schoolYear?: string) => {
    try {
      // Only cache current grades if we're SWITCHING to a different subject/period
      // Don't cache on initial load when grades are empty
      const isSwitching = selectedSubject && selectedGradingPeriod &&
        (selectedSubject !== subjectId || selectedGradingPeriod !== gradingPeriod);

      if (isSwitching && Object.keys(grades).length > 0) {
        setGradesBySubjectAndPeriod(prev => ({
          ...prev,
          [selectedSubject]: {
            ...(prev[selectedSubject] || {}),
            [selectedGradingPeriod]: grades
          }
        }));
        setRemarksBySubjectAndPeriod(prev => ({
          ...prev,
          [selectedSubject]: {
            ...(prev[selectedSubject] || {}),
            [selectedGradingPeriod]: remarks
          }
        }));
        setIsRemarkManuallyEditedBySubjectAndPeriod(prev => ({
          ...prev,
          [selectedSubject]: {
            ...(prev[selectedSubject] || {}),
            [selectedGradingPeriod]: isRemarkManuallyEdited
          }
        }));
      }

      // Fetch students first to get their schoolYear
      const studentsRes = await fetch(`/api/teacher/students?scope=school${subjectId ? `&subjectId=${encodeURIComponent(subjectId)}` : ''}`, {
        headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
      });

      let studentsData: any[] = [];
      if (studentsRes.ok) {
        studentsData = await studentsRes.json();
      }

      console.log('🔍 DEBUG: Students data with schoolYear:', studentsData.map(s => ({ name: s.name, schoolYear: s.schoolYear })));

      // Always use student's schoolYear, ignore subject's schoolYear
      // Get the most common schoolYear from students
      let effectiveSchoolYear = schoolYear;
      if (studentsData.length > 0) {
        const schoolYearCounts = new Map<string, number>();
        studentsData.forEach((s: any) => {
          if (s.schoolYear) {
            schoolYearCounts.set(s.schoolYear, (schoolYearCounts.get(s.schoolYear) || 0) + 1);
          }
        });
        if (schoolYearCounts.size > 0) {
          effectiveSchoolYear = Array.from(schoolYearCounts.entries())
            .sort((a, b) => b[1] - a[1])[0][0];
        }
      }

      console.log('🔍 DEBUG: Effective schoolYear for loading grades:', effectiveSchoolYear, '(subject schoolYear was:', schoolYear, ')');

      const [gradesRes] = await Promise.all([
        fetch(`/api/teacher/grades?teacherId=${encodeURIComponent(teacherId)}&subjectId=${encodeURIComponent(subjectId)}&gradingPeriod=${encodeURIComponent(gradingPeriod)}${effectiveSchoolYear ? `&schoolYear=${encodeURIComponent(effectiveSchoolYear)}` : ''}`, {
          headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
        }),
      ]);
      
      if (gradesRes.ok) {
        const existingGrades = await gradesRes.json();
        console.log('DEBUG: Loaded grades from API for', subjectId, gradingPeriod, ':', existingGrades);
        
        const gradesMap: { [key: string]: string } = {};
        const remarksMap: { [key: string]: string } = {};
        
        existingGrades.forEach((grade: any) => {
          if (grade.studentId) {
            gradesMap[grade.studentId] = grade.grade?.toString() || '';
            if (grade.remarks) {
              remarksMap[grade.studentId] = grade.remarks;
            }
          }
        });
        
        console.log('DEBUG: Grades map from API:', gradesMap);
        console.log('DEBUG: Student IDs with grades:', Object.keys(gradesMap));
        
        // For initial load or refresh, use API data directly - NO CACHE MERGING
        // This ensures grades are completely isolated per subject
        let finalGrades = gradesMap;
        let finalRemarks = remarksMap;
        let finalManualEdits: { [key: string]: boolean } = {};
        
        // NEVER merge cached grades between different subjects
        // Only merge if we're loading the EXACT SAME subject/period
        if (isSwitching && subjectId === selectedSubject && gradingPeriod === selectedGradingPeriod) {
          const cachedGrades = gradesBySubjectAndPeriod[subjectId]?.[gradingPeriod] || {};
          const cachedRemarks = remarksBySubjectAndPeriod[subjectId]?.[gradingPeriod] || {};
          const cachedManualEdits = isRemarkManuallyEditedBySubjectAndPeriod[subjectId]?.[gradingPeriod] || {};
          
          finalGrades = { ...gradesMap, ...cachedGrades };
          finalRemarks = { ...remarksMap, ...cachedRemarks };
          finalManualEdits = { ...cachedManualEdits };
          
          console.log('DEBUG: Merged cached grades for SAME subject/period', subjectId, gradingPeriod, ':', cachedGrades);
        } else {
          console.log('DEBUG: Using fresh API data for subject', subjectId, '- no cache merge to prevent bleed-over');
        }
        
        console.log('DEBUG: Final grades to display:', finalGrades);
        setGrades(finalGrades);
        setRemarks(finalRemarks);
        setIsRemarkManuallyEdited(finalManualEdits);
        
        // Also update the cache with the loaded data
        setGradesBySubjectAndPeriod(prev => ({
          ...prev,
          [subjectId]: {
            ...(prev[subjectId] || {}),
            [gradingPeriod]: finalGrades
          }
        }));
        setRemarksBySubjectAndPeriod(prev => ({
          ...prev,
          [subjectId]: {
            ...(prev[subjectId] || {}),
            [gradingPeriod]: finalRemarks
          }
        }));

        // REMOVED: Code that was forcing students with grades to appear across subjects
        // This was causing grades from one subject to appear in other subjects
        // Students should only appear if they are enrolled in the selected subject
      } else {
        // API failed - try to load from cache
        console.log('DEBUG: API failed, loading from cache');
        const cachedGrades = gradesBySubjectAndPeriod[subjectId]?.[gradingPeriod] || {};
        const cachedRemarks = remarksBySubjectAndPeriod[subjectId]?.[gradingPeriod] || {};
        const cachedManualEdits = isRemarkManuallyEditedBySubjectAndPeriod[subjectId]?.[gradingPeriod] || {};
        
        setGrades(cachedGrades);
        setRemarks(cachedRemarks);
        setIsRemarkManuallyEdited(cachedManualEdits);
      }
    } catch (error) {
      console.error('Error loading existing grades:', error);
      // On error, try cache
      const cachedGrades = gradesBySubjectAndPeriod[subjectId]?.[gradingPeriod] || {};
      const cachedRemarks = remarksBySubjectAndPeriod[subjectId]?.[gradingPeriod] || {};
      const cachedManualEdits = isRemarkManuallyEditedBySubjectAndPeriod[subjectId]?.[gradingPeriod] || {};
      
      setGrades(cachedGrades);
      setRemarks(cachedRemarks);
      setIsRemarkManuallyEdited(cachedManualEdits);
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
      
      // Cache by both subject AND grading period
      if (selectedSubject && selectedGradingPeriod) {
        setGradesBySubjectAndPeriod(prev => ({
          ...prev,
          [selectedSubject]: {
            ...(prev[selectedSubject] || {}),
            [selectedGradingPeriod]: newGrades
          }
        }));
      }

      if (value === '') {
        const newRemarks = { ...remarks, [studentId]: '' };
        const newManualEdits = { ...isRemarkManuallyEdited, [studentId]: false };
        setRemarks(newRemarks);
        setIsRemarkManuallyEdited(newManualEdits);
        
        if (selectedSubject && selectedGradingPeriod) {
          setRemarksBySubjectAndPeriod(prev => ({
            ...prev,
            [selectedSubject]: {
              ...(prev[selectedSubject] || {}),
              [selectedGradingPeriod]: newRemarks
            }
          }));
          setIsRemarkManuallyEditedBySubjectAndPeriod(prev => ({
            ...prev,
            [selectedSubject]: {
              ...(prev[selectedSubject] || {}),
              [selectedGradingPeriod]: newManualEdits
            }
          }));
        }
      } else if (!isRemarkManuallyEdited[studentId]) {
        const autoRemark = getAutoRemark(numValue);
        const newRemarks = { ...remarks, [studentId]: autoRemark };
        setRemarks(newRemarks);
        
        if (selectedSubject && selectedGradingPeriod) {
          setRemarksBySubjectAndPeriod(prev => ({
            ...prev,
            [selectedSubject]: {
              ...(prev[selectedSubject] || {}),
              [selectedGradingPeriod]: newRemarks
            }
          }));
        }
      }
    }
  };

  const handleRemarkChange = (studentId: string, value: string) => {
    const newRemarks = { ...remarks, [studentId]: value };
    const newManualEdits = { ...isRemarkManuallyEdited, [studentId]: value.trim().length > 0 };
    
    setRemarks(newRemarks);
    setIsRemarkManuallyEdited(newManualEdits);
    
    // Cache by both subject AND grading period
    if (selectedSubject && selectedGradingPeriod) {
      setRemarksBySubjectAndPeriod(prev => ({
        ...prev,
        [selectedSubject]: {
          ...(prev[selectedSubject] || {}),
          [selectedGradingPeriod]: newRemarks
        }
      }));
      setIsRemarkManuallyEditedBySubjectAndPeriod(prev => ({
        ...prev,
        [selectedSubject]: {
          ...(prev[selectedSubject] || {}),
          [selectedGradingPeriod]: newManualEdits
        }
      }));
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.name.trim() || !newSubject.code.trim()) {
      setMessage({ type: 'error', text: 'Subject name and code are required' });
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
          code: newSubject.code.trim()
        })
      });

      if (response.ok) {
        const result = await response.json();
        const created: Subject = result.subject;
        setSubjects(prev => [...prev, created]);
        setSelectedSubject(created.id);
        setNewSubject({
          name: '',
          code: ''
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

  const handleAddStudent = async () => {
    if (!newStudent.name.trim()) {
      setMessage({ type: 'error', text: 'Student name is required' });
      return;
    }

    if (!newStudent.lrn.trim()) {
      setMessage({ type: 'error', text: 'LRN is required' });
      return;
    }

    if (studentSubjectId.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one subject first (this will determine the student category/grade level).' });
      return;
    }

    const targetGradeLevel = newStudent.gradeLevel || 'Grade 1';

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
          lrn: newStudent.lrn.trim(),
          gradeLevel: targetGradeLevel,
          section: selectedSection,
          schoolYear: newStudent.schoolYear,
          subjectIds: studentSubjectId // Send all selected subject IDs
        })
      });

      if (response.ok) {
        const result = await response.json();
        const studentsUrl = '/api/teacher/students?scope=school';

        const refreshedStudentsResponse = await fetch(studentsUrl, {
          headers: {
            'Authorization': `Bearer ${teacherUid}`
          }
        });

        if (refreshedStudentsResponse.ok) {
          const refreshedStudents = await refreshedStudentsResponse.json();
          setAllStudents(refreshedStudents);
        }
        const subjectNames = studentSubjectId.map(id => {
          const subject = subjects?.find(s => s.id === id);
          return subject?.name && subject?.code ? `${subject.name} (${subject.code})` : 'Unknown Subject';
        }).join(', ');
        
        setMessage({ type: 'success', text: `Student added successfully to ${subjectNames} (${targetGradeLevel})` });
        setNewStudent({ name: '', lrn: '', gradeLevel: '', section: '', schoolYear: '' });
        setSelectedSection('');
        setShowAddStudent(false);
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

      const response = await fetch(`/api/teacher/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${teacherUid}`
        }
      });

      if (response.ok) {
        setAllStudents(prev => prev.filter(student => student.id !== studentId));
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
        setMessage({ type: 'error', text: errorData.message || errorData.error || 'Failed to delete student' });
      }
    } catch (error) {
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

  const getGradeColor = (grade: string) => {
    if (!grade) return '';
    const numGrade = parseFloat(grade);
    if (numGrade >= 90) return 'text-green-600 font-bold';
    if (numGrade >= 80) return 'text-blue-600 font-semibold';
    if (numGrade >= 75) return 'text-yellow-600 font-medium';
    return 'text-red-600 font-medium';
  };

  const gradingOrder = (period: 'first' | 'second' | 'third' | 'fourth') => {
    switch (period) {
      case 'first': return 1;
      case 'second': return 2;
      case 'third': return 3;
      case 'fourth': return 4;
      default: return 0;
    }
  };

  const isLockedByDefault = gradingOrder(selectedGradingPeriod) < gradingOrder(activeGradingPeriod);
  const isReadOnly = isLockedByDefault && !isEditingUnlocked;

  const handleSave = async () => {
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

      const currentSelectedSubject = subjects?.find(s => s.id === selectedSubject);
      
      const gradeData: GradeInput[] = students.map(student => ({
        studentId: student.id,
        subjectId: selectedSubject,
        gradingPeriod: selectedGradingPeriod,
        grade: parseFloat(grades[student.id] || '0'),
        remarks: remarks[student.id] || '',
        teacherId: teacherUid,
        gradeLevel: student.gradeLevel || 'Unknown',
        section: student.section || 'Default',
        schoolYear: (student as any).schoolYear || currentSelectedSubject?.schoolYear || '2025-2026',
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
        }
        
        setMessage({ type: 'success', text: message });
        
        // Reload grades to ensure they persist after save
        if (selectedSubject) {
          await loadExistingGrades(teacherUid, selectedSubject, selectedGradingPeriod, currentSelectedSubject?.schoolYear);
        }
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || `Failed to save grades` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to save grades` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeGradeLevelFilter = (value: string) => {
    setSelectedGradeLevelFilter(value);
  };

  const handleChangeSectionFilter = (value: string) => {
    setSelectedSectionFilter(value);
  };

  const handleChangeStudentListSubjectFilter = (value: string) => {
    setStudentListSubjectFilter(value);
  };

  const handleStudentSectionChange = (sectionName: string) => {
    setSelectedSection(sectionName);
    
    // Auto-set grade level based on section if a match is found
    const sectionData = sections.find(s => s.name === sectionName);
    if (sectionData?.gradeLevel) {
      setNewStudent(prev => ({ ...prev, gradeLevel: sectionData.gradeLevel! }));
    }
  };

  const handleStudentGradeLevelChange = (gradeLevel: string) => {
    setNewStudent(prev => ({ ...prev, gradeLevel }));
    
    // If current selected section doesn't match this grade level, we might want to reset it
    // or keep it but update the student's grade level. 
    // For now, let's just update the grade level.
  };

  const handleAddSection = async () => {
    if (!newSectionName.trim()) {
      setMessage({ type: 'error', text: 'Section name is required' });
      return;
    }

    if (!teacherId) {
      setMessage({ type: 'error', text: 'Please login first' });
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
          section: newSectionName.trim(),
          gradeLevel: newSectionGradeLevel,
          subjectId: selectedSubject || 'global',
          action: 'addSection'
        })
      });

      if (response.ok) {
        const sectionsResponse = await fetch('/api/teacher/subjects', {
          headers: {
            'Authorization': `Bearer ${teacherUid}`
          }
        });

        if (sectionsResponse.ok) {
          const teacherSubjectsData = await sectionsResponse.json();
          const sectionsMap = new Map<string, { id: string; name: string; subjectId?: string; gradeLevel?: string }>();
          
          teacherSubjectsData.forEach((ts: any) => {
            if (ts.section) {
              const key = ts.section;
              sectionsMap.set(key, { 
                id: ts.id || key, 
                name: ts.section, 
                subjectId: ts.subjectId,
                gradeLevel: ts.gradeLevel
              });
            }
          });

          const normalized = Array.from(sectionsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
          setSections(normalized);
        }

        setSelectedSection(newSectionName.trim());
        setNewSectionName('');
        setNewSectionGradeLevel('Grade 1');
        setShowAddSection(false);
        setMessage({ type: 'success', text: `Section "${newSectionName}" for ${newSectionGradeLevel} added successfully` });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to add section' });
      }
    } catch (e) {
      console.error('Error adding section:', e);
      setMessage({ type: 'error', text: 'Failed to add section' });
    }
  };

  // Excel upload functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setExcelFile(file);
        parseExcelFile(file);
      } else {
        setMessage({ type: 'error', text: 'Please select a valid Excel file (.xlsx or .xls)' });
      }
    }
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to 2D array to find metadata and header row
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as any[][];
        
        console.log('📊 Raw 2D Excel data:', rawData);
        
        // Find school year
        let foundSchoolYear = '';
        
        // First, try to extract from filename (Papaya masterlist format)
        if (file.name) {
          const filenameMatch = file.name.match(/(\d{4}[-–]\d{4})/);
          if (filenameMatch) {
            foundSchoolYear = filenameMatch[1].replace('–', '-');
          }
        }
        
        // If not in filename, check the sheet
        if (!foundSchoolYear) {
          for (let r = 0; r < rawData.length; r++) {
            for (let c = 0; c < rawData[r].length; c++) {
              const cellValue = String(rawData[r][c] || '').trim();
              const cellLower = cellValue.toLowerCase();
              
              // Check for explicit "School Year" label
              if (cellLower === 'school year' && rawData[r][c + 1]) {
                foundSchoolYear = String(rawData[r][c + 1]).trim();
                break;
              }
              
              // Check for masterlist pattern with year
              if (cellLower.includes('masterlist')) {
                const match = cellValue.match(/(\d{4}[-–]\d{4})/);
                if (match) {
                  foundSchoolYear = match[1].replace('–', '-');
                  break;
                }
              }
              
              // Check for any year pattern
              const match = cellValue.match(/(\d{4}[-–]\d{4})/);
              if (match) {
                foundSchoolYear = match[1].replace('–', '-');
                break;
              }
            }
            if (foundSchoolYear) break;
          }
        }
        
        // Default fallback for Papaya masterlist
        if (!foundSchoolYear) {
          foundSchoolYear = '2025-2026';
        }

        // Helper function to convert Roman numerals to integers
        const romanToInt = (roman: string): number => {
          const romanUpper = roman.toUpperCase();
          const romanNumerals: { [key: string]: number } = {
            'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
            'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
            'XI': 11, 'XII': 12
          };
          return romanNumerals[romanUpper] || 0;
        };

        // Helper function to convert grade level with Roman numeral to whole number
        const convertGradeLevel = (gradeLevel: string): string => {
          if (!gradeLevel) return gradeLevel;
          
          const match = gradeLevel.match(/grade\s*(\w+)/i);
          if (match) {
            const gradePart = match[1];
            const romanNumeral = romanToInt(gradePart);
            if (romanNumeral > 0) {
              return `Grade ${romanNumeral}`;
            }
          }
          return gradeLevel;
        };
        
        // Find header row (contains "LRN NUMBER" or "NAME")
        let headerRowIndex = -1;
        for (let r = 0; r < rawData.length; r++) {
          const row = rawData[r];
          const rowStr = row.map((cell: any) => String(cell || '').toLowerCase()).join(' ');
          if (rowStr.includes('lrn') || rowStr.includes('name')) {
            headerRowIndex = r;
            console.log(`📋 Found header row at index ${r}:`, row);
            break;
          }
        }
        
        let jsonData: any[] = [];
        let defaultGradeLevel = '';
        let defaultSection = '';
        
        if (headerRowIndex >= 0) {
          // Extract grade/section from row before header (row 8 in Papaya format)
          if (headerRowIndex > 0) {
            const gradeSectionRow = rawData[headerRowIndex - 1];
            const gradeSectionText = gradeSectionRow.map((cell: any) => String(cell || '')).join(' ');
            console.log(`📋 Grade/Section row: ${gradeSectionText}`);
            
            // Parse "GRADE VI - DIAMOND"
            const gradeMatch = gradeSectionText.match(/GRADE\s+(\w+)/i);
            if (gradeMatch) {
              defaultGradeLevel = convertGradeLevel(`Grade ${gradeMatch[1]}`);
            }
            
            const sectionMatch = gradeSectionText.match(/-\s*(\w+)$/);
            if (sectionMatch) {
              defaultSection = sectionMatch[1].trim();
            }
            
            console.log(`📋 Default Grade: "${defaultGradeLevel}", Default Section: "${defaultSection}"`);
          }
          
          // Use the header row to parse data
          const headers = rawData[headerRowIndex].map((h: any) => String(h || '').trim());
          console.log('📋 Headers (raw):', headers);
          
          // Parse data rows (skip header row)
          for (let r = headerRowIndex + 1; r < rawData.length; r++) {
            const row = rawData[r];
            if (row.length === 0 || row.every((cell: any) => !cell)) continue; // Skip empty rows
            
            const obj: any = {};
            headers.forEach((header: string, index: number) => {
              if (header && row[index] !== undefined) {
                obj[header] = row[index];
              }
            });
            
            // Map Papaya masterlist column names to standard names
            if (obj['NAME']) {
              obj['Student Name'] = obj['NAME'];
            }
            if (obj['LRN NUMBER']) {
              obj['LRN'] = obj['LRN NUMBER'];
            }
            
            // Add default grade and section if not in data
            if (defaultGradeLevel && !obj['Grade Level'] && !obj['gradeLevel']) {
              obj['Grade Level'] = defaultGradeLevel;
            }
            if (defaultSection && !obj['Section'] && !obj['section']) {
              obj['Section'] = defaultSection;
            }
            
            // Convert Roman numerals in grade level to whole numbers
            if (obj['Grade Level']) {
              obj['Grade Level'] = convertGradeLevel(obj['Grade Level']);
            }
            if (obj['gradeLevel']) {
              obj['gradeLevel'] = convertGradeLevel(obj['gradeLevel']);
            }
            
            // Only add if it has meaningful data
            if (Object.keys(obj).length > 0) {
              jsonData.push(obj);
            }
          }
        } else {
          // Fallback: use default parsing
          jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
        }
        
        console.log('📊 Parsed student data:', jsonData);
        console.log('📊 Number of students:', jsonData.length);

        setExcelSchoolYear(foundSchoolYear);
        setExcelPreview(jsonData.slice(0, 5)); // Show first 5 rows as preview
        
        if (foundSchoolYear) {
          setMessage({ type: 'success', text: `Excel file loaded successfully for School Year: ${foundSchoolYear}. Found ${jsonData.length} students.` });
        } else {
          setMessage({ type: 'error', text: 'School Year not found in Excel file. Please ensure it follows the template.' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to parse Excel file. Please check the format.' });
        console.error('Excel parsing error:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExcelUpload = async () => {
    if (!excelFile || studentSubjectId.length === 0) {
      setMessage({ type: 'error', text: 'Please select an Excel file and at least one subject' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const session = localStorage.getItem('teacherSession');
      const teacherData = JSON.parse(session!);
      const t = teacherData?.teacher ?? teacherData;
      const teacherUid = t?.uid || t?.id || '';

      const formData = new FormData();
      formData.append('file', excelFile);
      formData.append('subjectIds', JSON.stringify(studentSubjectId));

      const response = await fetch('/api/teacher/students/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${teacherUid}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        console.log('🔍 Excel Upload Result:', {
          uploadedCount: result.uploadedCount,
          skippedCount: result.skippedCount,
          totalRows: result.totalRows,
          errors: result.errors
        });
        
        // Refresh students list
        const studentsUrl = '/api/teacher/students?scope=school';

        const refreshedStudentsResponse = await fetch(studentsUrl, {
          headers: {
            'Authorization': `Bearer ${teacherUid}`
          }
        });

        if (refreshedStudentsResponse.ok) {
          const refreshedStudents = await refreshedStudentsResponse.json();
          console.log('🔍 Students returned from API:', refreshedStudents.length, 'students');
          console.log('🔍 Student names:', (refreshedStudents as any[]).map((s: any) => s.name));
          setAllStudents(refreshedStudents);
          
          // Temporarily clear all filters to show all uploaded students
          setStudentListSubjectFilter('');
          setSelectedGradeLevelFilter('');
          setSelectedSectionFilter('');
          
          // Select the first subject from studentSubjectId to ensure uploaded students are visible
          if (studentSubjectId.length > 0) {
            setSelectedSubject(studentSubjectId[0]);
          }
        }

        setExcelFile(null);
        setExcelPreview([]);
        setShowExcelUpload(false);
        setMessage({ 
          type: 'success', 
          text: `Successfully uploaded ${result.uploadedCount} students. ${result.skippedCount || 0} duplicates skipped.` 
        });
      } else {
        const errorData = await response.json();
        let errorMessage = errorData.message || 'Failed to upload students';
        
        if (errorData.code === 'MISSING_SCHOOL_YEAR') {
          errorMessage = 'The School Year is missing from your Excel file. Please ensure Column A contains "School Year" and Column B contains the year (e.g., 2023-2024) as shown in the template.';
        }
        
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload students' });
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadExcelTemplate = () => {
    const data = [
      {
        'Student Name': 'Juan Dela Cruz',
        'LRN': '123456789012',
        'Grade Level': 'Grade 5',
        'Section': 'Section A'
      },
      {
        'Student Name': 'Maria Santos',
        'LRN': '123456789013',
        'Grade Level': 'Grade 5',
        'Section': 'Section A'
      },
      {}, // Empty row
      {
        'Student Name': 'School Year',
        'LRN': '2023-2024'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'student_template.xlsx');
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

  // Options prep
    const gradingOptions = [
      { label: "First Grading", value: "first" },
      { label: "Second Grading", value: "second" },
      { label: "Third Grading", value: "third" },
      { label: "Fourth Grading", value: "fourth" },
    ];
  const availableGradeLevels = ['Pre-School', 'Nursery', 'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
  const allSystemGradeLevels = availableGradeLevels;
  const gradeLevelFilterOptions = [
    { label: "All Grade Levels", value: "" }, 
    ...availableGradeLevels.map(g => ({ label: g, value: g }))
  ];

  const availableSections = Array.from(new Set(sections.map(s => s.name)));

  const sectionFilterOptions = [
    { label: "All Sections", value: "" },
    ...availableSections.map(name => ({ label: name, value: name }))
  ];

  const subjectFilterOptions = [
    ...(subjects?.map(s => ({ label: `${s.name} (${s.code})`, value: s.id })) || [])
  ];

  return (
    <TeacherLayout title="Input Grades" subtitle="Enter and manage student grades per subject and grading period.">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Message Popup Modal */}
        {message && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4 transform transition-all border-l-8 ${
              message.type === 'success' ? 'border-green-500' : 'border-red-500'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${message.type === 'success' ? 'bg-emerald-50 text-[#1B3E2A]' : 'bg-red-50 text-red-500'}`}>
                  {message.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${message.type === 'success' ? 'text-[#1B3E2A]' : 'text-red-700'}`}>
                    {message.type === 'success' ? 'Success' : 'Error'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{message.text}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <AnimatedButton
                  onClick={() => setMessage(null)}
                  className="flex items-center justify-center gap-2 px-6 rounded-md font-semibold text-xs tracking-normal border border-[#1B3E2A] border-b-2 shadow-sm transition-all duration-300 h-11"
                  style={{ width: 'auto' }}
                >
                  Okay
                </AnimatedButton>
              </div>
            </div>
          </div>
        )}

        {/* Subject Management Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-semibold text-[#1B3E2A] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#F2C94C]" />
              Subject Management
            </h3>
            <AnimatedButton
              onClick={() => setShowAddSubject(!showAddSubject)}
              className="flex items-center justify-center gap-2 px-5 rounded-md font-semibold text-xs tracking-normal border border-[#1B3E2A] border-b-2 shadow-sm transition-all duration-300 h-11"
              style={{ width: 'auto' }}
            >
              <Plus className="w-4 h-4" />
              Add Subject
            </AnimatedButton>
          </div>

          {showAddSubject && (
            <div className="border-t border-dashed border-gray-200 pt-6 animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Subject Name</label>
                  <input
                    type="text"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-[#1B3E2A] outline-none transition-all"
                    placeholder="e.g. Mathematics"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Code</label>
                  <input
                    type="text"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-[#1B3E2A] outline-none transition-all"
                    placeholder="e.g. MATH"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <AnimatedButton
                  onClick={handleAddSubject}
                  className="flex items-center justify-center gap-2 px-6 rounded-md font-semibold text-xs tracking-normal border border-[#1B3E2A] border-b-2 shadow-sm transition-all duration-300 h-11"
                  style={{ width: 'auto' }}
                >
                  Confirm Add Subject
                </AnimatedButton>
              </div>
            </div>
          )}
        </div>

        {/* Section Management Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-semibold text-[#1B3E2A] flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#F2C94C]" />
              Section Management
            </h3>
            <AnimatedButton
              onClick={() => setShowAddSection(!showAddSection)}
              className="flex items-center justify-center gap-2 px-4 rounded-md font-semibold text-xs tracking-normal border border-[#1B3E2A] border-b-2 shadow-sm transition-all duration-300 h-11"
              style={{ width: 'auto' }}
            >
              <Plus className="w-4 h-4" />
              Add Section
            </AnimatedButton>
          </div>

          {showAddSection && (
            <div className="border-t border-dashed border-gray-200 pt-6 animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Section Name</label>
                  <input
                    type="text"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-[#1B3E2A] outline-none transition-all"
                    placeholder="e.g. Section A"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Grade Level</label>
                  <div className="relative h-11">
                    <select
                      value={newSectionGradeLevel}
                      onChange={(e) => setNewSectionGradeLevel(e.target.value)}
                      className="w-full h-full px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] outline-none appearance-none bg-white transition-all"
                    >
                      {['Pre-School', 'Nursery', 'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-end justify-end">
                  <AnimatedButton
                    onClick={handleAddSection}
                    className="flex items-center justify-center gap-2 px-6 rounded-md font-semibold text-xs tracking-normal border border-[#1B3E2A] border-b-2 shadow-sm transition-all duration-300 h-11"
                    style={{ width: 'auto' }}
                  >
                    Confirm Add Section
                  </AnimatedButton>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Student Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#1B3E2A] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#F2C94C]" />
              Student Management
            </h3>
            <div className="flex flex-wrap gap-2">
              <AnimatedButton
                onClick={() => setShowExcelUpload(!showExcelUpload)}
                className="flex items-center justify-center gap-2 px-5 rounded-md font-semibold text-xs tracking-normal border border-[#1B3E2A] border-b-2 shadow-sm transition-all duration-300 h-11"
                style={{ width: 'auto', backgroundColor: '#10b981', color: '#FFFFFF' }}
              >
                <Upload className="w-4 h-4" />
                Upload Excel
              </AnimatedButton>
              <AnimatedButton
                onClick={downloadExcelTemplate}
                className="flex items-center justify-center gap-2 px-5 rounded-md font-semibold text-xs tracking-normal border border-[#1B3E2A] border-b-2 shadow-sm transition-all duration-300 h-11"
                style={{ width: 'auto', backgroundColor: '#3b82f6', color: '#FFFFFF' }}
              >
                <Download className="w-4 h-4" />
                Download Template
              </AnimatedButton>
              <AnimatedButton
                onClick={() => setShowAddStudent(!showAddStudent)}
                className="flex items-center justify-center gap-2 px-5 rounded-md font-semibold text-xs tracking-normal border border-[#1B3E2A] border-b-2 shadow-sm transition-all duration-300 h-11"
                style={{ width: 'auto' }}
              >
                <Plus className="w-4 h-4" />
                Add Student
              </AnimatedButton>
            </div>
          </div>

          {showAddStudent && (
            <div className="border-t border-dashed border-gray-200 pt-6 animate-in slide-in-from-top-4 duration-300">
              {/* Subject Selection Buttons */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Select Subject</label>
                <div className="flex flex-wrap gap-2">
                  {subjects?.filter(subject => subject.name && subject.code && subject.id).map((subject) => (
                    <AnimatedButton
                      key={subject.id}
                      onClick={() => {
                        setStudentSubjectId(currentIds => {
                          if (currentIds.includes(subject.id)) {
                            // Remove the subject
                            return currentIds.filter(id => id !== subject.id);
                          } else {
                            // Add the subject
                            return [...currentIds, subject.id];
                          }
                        });
                      }}
                      isActive={studentSubjectId.includes(subject.id)}
                      style={{ width: 'auto' }}
                    >
                      {subject.name} ({subject.code})
                    </AnimatedButton>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Student Name</label>
                  <input
                    type="text"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-[#1B3E2A] outline-none transition-all"
                    placeholder="Enter student name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">LRN</label>
                  <input
                    type="text"
                    value={newStudent.lrn}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, lrn: e.target.value }))}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-[#1B3E2A] outline-none transition-all"
                    placeholder="Enter LRN"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">School Year</label>
                  <input
                    type="text"
                    value={newStudent.schoolYear}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, schoolYear: e.target.value }))}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-[#1B3E2A] outline-none transition-all"
                    placeholder="e.g. 2024-2025"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Grade Level</label>
                  <div className="relative h-11">
                    <select
                      value={newStudent.gradeLevel}
                      onChange={(e) => handleStudentGradeLevelChange(e.target.value)}
                      className="w-full h-full px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] outline-none appearance-none bg-white transition-all"
                    >
                      {availableGradeLevelsForStudent.length === 0 ? (
                        <option value="">Select subject first</option>
                      ) : (
                        availableGradeLevelsForStudent.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Section</label>
                  <div className="relative h-11">
                    <select
                      value={selectedSection}
                      onChange={(e) => handleStudentSectionChange(e.target.value)}
                      className="w-full h-full px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] outline-none appearance-none bg-white transition-all"
                    >
                      <option value=""></option>
                      {sections
                        .filter((s) => {
                          // Show section if no subjectId (applies to all) 
                          // OR if no subjects selected for student (show all)
                          // OR if section matches selected student subjects or main selected subject
                          if (!s.subjectId) return true;
                          if (studentSubjectId.length === 0) return true;
                          return studentSubjectId.includes(s.subjectId) || s.subjectId === selectedSubject;
                        })
                        .map((s) => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                  {sections.filter((s) => {
                    if (!s.subjectId) return true;
                    if (studentSubjectId.length === 0) return true;
                    return studentSubjectId.includes(s.subjectId) || s.subjectId === selectedSubject;
                  }).length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No sections available for selected subjects. Add a section in Subject Management.</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <AnimatedButton
                  onClick={handleAddStudent}
                  className="flex items-center justify-center gap-2 px-6 rounded-md font-semibold text-xs tracking-normal border border-[#1B3E2A] border-b-2 shadow-sm transition-all duration-300 h-11"
                  style={{ width: 'auto' }}
                >
                  Confirm Add Student
                </AnimatedButton>
              </div>
            </div>
          )}

          {/* Excel Upload Section */}
          {showExcelUpload && (
            <div className="border-t border-dashed border-gray-200 pt-6 animate-in slide-in-from-top-4 duration-300">
              {/* Subject Selection for Excel Upload */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Select Subject(s) for Excel Upload</label>
                <div className="flex flex-wrap gap-2">
                  {subjects?.filter(subject => subject.name && subject.code && subject.id).map((subject) => (
                    <AnimatedButton
                      key={subject.id}
                      onClick={() => {
                        setStudentSubjectId(currentIds => {
                          if (currentIds.includes(subject.id)) {
                            return currentIds.filter(id => id !== subject.id);
                          } else {
                            return [...currentIds, subject.id];
                          }
                        });
                      }}
                      isActive={studentSubjectId.includes(subject.id)}
                      style={{ width: 'auto' }}
                    >
                      {subject.name} ({subject.code})
                    </AnimatedButton>
                  ))}
                </div>
                {studentSubjectId.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2">Please select at least one subject for the students</p>
                )}
              </div>

              {/* File Upload Area */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Upload Excel File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1B3E2A] transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label
                    htmlFor="excel-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <FileText className="w-12 h-12 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {excelFile ? excelFile.name : 'Click to upload Excel file'}
                      </p>
                      <p className="text-xs text-gray-500">.xlsx or .xls files only</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Preview Section */}
              {excelPreview.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview (First 5 rows)</label>
                    {excelSchoolYear && (
                      <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tighter">School Year</span>
                        <span className="text-xs font-bold text-amber-900">{excelSchoolYear}</span>
                      </div>
                    )}
                  </div>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LRN</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Level</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {excelPreview.map((row, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{row['Student Name'] || row['student_name'] || ''}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{row['LRN'] || row['lrn'] || ''}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{row['Grade Level'] || row['grade_level'] || ''}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{row['Section'] || row['section'] || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex justify-end">
                <AnimatedButton
                  onClick={handleExcelUpload}
                  disabled={!excelFile || studentSubjectId.length === 0 || isUploading}
                  className="flex items-center justify-center gap-2 px-6 rounded-md font-semibold text-xs tracking-normal border border-[#1B3E2A] border-b-2 shadow-sm transition-all duration-300 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ width: 'auto', backgroundColor: '#10b981', color: '#FFFFFF' }}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Students
                    </>
                  )}
                </AnimatedButton>
              </div>
            </div>
          )}
        </div>

        {/* Grades Table Section */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          {/* Enhanced Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-[#F2C94C] to-[#e5b840] text-[#1B3E2A] flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Users className="w-6 h-6 text-[#1B3E2A]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold leading-tight">Student Grades</h3>
                <p className="text-xs font-medium text-[#1B3E2A]/80">{students.length} students found</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
               {/* MAIN SUBJECT SELECTOR - This was missing! */}
               {subjects?.length > 0 && (
                 <div className="w-48">
                   <CustomDropdown 
                      value={selectedSubject}
                      options={subjects.filter(s => s.name && s.code && s.id).map(s => ({ label: `${s.name} (${s.code})`, value: s.id }))}
                      onChange={(value) => setSelectedSubject(value)}
                      placeholder="Select Subject"
                   />
                 </div>
               )}
                              {allSystemGradeLevels.length > 0 && (
                 <div className="w-40">
                    <CustomDropdown 
                      value={selectedGradeLevelFilter}
                      options={gradeLevelFilterOptions}
                      onChange={handleChangeGradeLevelFilter}
                      placeholder="Filter Grade"
                    />
                 </div>
               )}
               {availableSections.length > 0 && (
                 <div className="w-40">
                    <CustomDropdown 
                      value={selectedSectionFilter}
                      options={sectionFilterOptions}
                      onChange={handleChangeSectionFilter}
                      placeholder="Filter Section"
                    />
                 </div>
               )}
               <div className="w-40">
                  <CustomDropdown 
                    value={selectedGradingPeriod}
                    options={gradingOptions}
                    onChange={(val) => setSelectedGradingPeriod(val as any)}
                  />
               </div>
               <AnimatedButton
                  onClick={handleSave}
                  disabled={isSaving || !selectedSubject || isReadOnly}
                  className="flex items-center justify-center gap-2 px-6 rounded-md font-semibold text-xs tracking-normal border border-[#1B3E2A] border-b-2 shadow-sm transition-all duration-300 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ width: 'auto' }}
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Grades
                </AnimatedButton>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#f0f7f3]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#1B3E2A] uppercase tracking-wider w-[25%]">Student Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#1B3E2A] uppercase tracking-wider w-[15%]">Grade Level</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#1B3E2A] uppercase tracking-wider w-[20%]">Grade</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#1B3E2A] uppercase tracking-wider w-[30%]">Remarks</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#1B3E2A] uppercase tracking-wider w-[10%]">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {students.map((student, index) => (
                  <tr key={student.id} className={`hover:bg-[#f9fafb] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#fafdfb]'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B3E2A] to-[#F2C94C] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {student.name.charAt(0)}
                         </div>
                         <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-[#fef9e7] text-[#B48B1E] border border-[#fdeebb]">
                        {student.gradeLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative group">
                         <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={grades[student.id] || ''}
                          onChange={(e) => handleGradeChange(student.id, e.target.value)}
                          disabled={isReadOnly}
                          className={`w-28 px-3 py-2 border rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1B3E2A] transition-all ${getGradeColor(grades[student.id] || '')} ${isReadOnly ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-white border-gray-300 group-hover:border-[#1B3E2A]'}`}
                          placeholder="0"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={remarks[student.id] || ''}
                        onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1B3E2A] transition-all ${isReadOnly ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-white border-gray-300 hover:border-[#1B3E2A]'}`}
                        placeholder="Optional remarks..."
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete student"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {students.length === 0 && (
            <div className="text-center py-16 bg-gray-50">
              <div className="bg-white p-4 rounded-full inline-block shadow-sm mb-3">
                 <Search className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">No students found</h3>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or adding new students.</p>
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
