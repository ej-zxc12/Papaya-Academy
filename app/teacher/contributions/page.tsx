'use client';

import { useState, useEffect, useRef } from 'react';
import { MonthlyContribution, ContributionQuota, Student, Teacher } from '@/types';
import { realtimeContributionService } from '@/lib/realtime-contributions-client';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  Download,
  ChevronDown,
  Check,
  Save,
  X
} from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';

// Papaya Theme Colors (Reference)
const PAPAYA_THEME = {
  green: '#1B3E2A',
  gold: '#F2C94C',
  greenHover: '#2d5a3f',
  goldHover: '#e5b840',
  greenLight: '#f0f7f3',
  goldLight: '#fef9e7'
};

const GRADE_LEVELS = [
  'Pre-School',
  'Kinder',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6'
];

const TARGET_AMOUNT_PER_STUDENT = 2000;

export default function ContributionManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [contributions, setContributions] = useState<MonthlyContribution[]>([]);
  const [quotas, setQuotas] = useState<ContributionQuota[]>([]);
  const [derivedTotals, setDerivedTotals] = useState<{ collected: number; expected: number }>({
    collected: 0,
    expected: 0,
  });
  const [totalsScope, setTotalsScope] = useState<'teacher' | 'school'>('teacher');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  // State for Custom Dropdown
  const [selectedGrade, setSelectedGrade] = useState('');
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [editingPayment, setEditingPayment] = useState<MonthlyContribution | null>(null);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<Student | null>(null);
  const [studentPaymentData, setStudentPaymentData] = useState<{
    studentId: string;
    studentName: string;
    totalRequired: number;
    totalPaid: number;
    remainingBalance: number;
    monthlyPayments: { [key: string]: number };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // UI Interaction States
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [isExportBtnHovered, setIsExportBtnHovered] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [formData, setFormData] = useState<{
    studentId: string;
    amount: number;
    month: string;
    year: string;
    paymentMethod: 'cash' | 'bank' | 'online' | 'other';
    receiptNumber: string;
    notes: string;
  }>({
    studentId: '',
    amount: 0,
    month: new Date().toISOString().slice(0, 7),
    year: new Date().getFullYear().toString(),
    paymentMethod: 'cash',
    receiptNumber: '',
    notes: ''
  });

  const [paymentFormData, setPaymentFormData] = useState<{
    month: string;
    amount: number;
    paymentMethod: 'cash' | 'bank' | 'online' | 'other';
    receiptNumber: string;
    notes: string;
  }>({
    month: new Date().toISOString().slice(0, 7),
    amount: 0,
    paymentMethod: 'cash',
    receiptNumber: '',
    notes: ''
  });

  // Handle Click Outside for Dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsGradeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  useEffect(() => {
    const run = async () => {
      const session = localStorage.getItem('teacherSession');
      if (!session) {
        setIsLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(session);
        const teacherData = parsed?.teacher ?? parsed;

        const teacherId = teacherData?.uid || teacherData?.id;
        if (!teacherId) throw new Error('Missing teacher id');

        // Initialize real-time listener for contributions
        realtimeContributionService.initialize();

        // Subscribe to real-time updates
        const unsubscribe = realtimeContributionService.subscribe(teacherId, (update) => {
          console.log('Real-time contribution update received:', update);
          
          // Handle real-time updates for contributions
          if (update.type === 'contribution_added' && update.contribution) {
            setContributions(prev => {
              // Check if contribution already exists to avoid duplicates
              const exists = prev.some(c => c.id === update.contribution.id);
              if (exists) return prev;
              
              // Add new contribution to the list
              return [update.contribution, ...prev];
            });
          } else if (update.type === 'contribution_updated' && update.contribution) {
            setContributions(prev => 
              prev.map(c => c.id === update.contribution.id ? update.contribution : c)
            );
          } else if (update.type === 'contribution_deleted' && update.contribution) {
            setContributions(prev => 
              prev.filter(c => c.id !== update.contribution.id)
            );
          }
        });

        const year = selectedYear;
        const gradeParam = selectedGrade ? `&gradeLevel=${encodeURIComponent(selectedGrade)}` : '';
        const scopeParam = totalsScope === 'school' ? '&scope=school' : '';

        const studentsScopeParam = totalsScope === 'school' ? 'scope=school' : '';
        const studentsGradeParam = selectedGrade ? `gradeLevel=${encodeURIComponent(selectedGrade)}` : '';
        const studentsQuery = [studentsScopeParam, studentsGradeParam].filter(Boolean).join('&');
        const studentsUrl = `/api/teacher/students${studentsQuery ? `?${studentsQuery}` : ''}`;

        const [studentsRes, contributionsRes, quotasRes, summaryRes] = await Promise.all([
          fetch(studentsUrl, {
            headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
          }),
          fetch(`/api/contributions?year=${encodeURIComponent(year)}${selectedMonth ? `&month=${encodeURIComponent(selectedMonth)}` : ''}`),
          fetch(`/api/contributions/quotas?year=${encodeURIComponent(year)}${gradeParam}${scopeParam}`, {
            headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
          }),
          fetch(`/api/contributions/summary?year=${encodeURIComponent(year)}${gradeParam}${scopeParam}`, {
            headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
          }),
        ]);

        const [studentsJson, contributionsJson, quotasJson, summaryJson] = await Promise.all([
          studentsRes.ok ? studentsRes.json() : Promise.resolve([]),
          contributionsRes.ok ? contributionsRes.json() : Promise.resolve([]),
          quotasRes.ok ? quotasRes.json() : Promise.resolve([]),
          summaryRes.ok ? summaryRes.json() : Promise.resolve(null),
        ]);

        setStudents(Array.isArray(studentsJson) ? studentsJson : []);
        setContributions(Array.isArray(contributionsJson) ? contributionsJson : []);
        setQuotas(Array.isArray(quotasJson) ? quotasJson : []);

        const summaryCollected = Number(summaryJson?.totalCollected ?? 0);
        const summaryExpected = Number(summaryJson?.totalExpected ?? 0);

        setDerivedTotals({
          collected: summaryCollected,
          expected: summaryExpected,
        });

        // Cleanup on unmount
        return () => {
          unsubscribe();
        };
      } catch {
        setStudents([]);
        setContributions([]);
        setQuotas([]);
        setDerivedTotals({ collected: 0, expected: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [selectedGrade, selectedMonth, selectedYear, totalsScope]);

  const handleAddPayment = () => {
    setShowAddPayment(true);
    setEditingPayment(null);
    setFormData({
      studentId: '',
      amount: TARGET_AMOUNT_PER_STUDENT,
      month: selectedMonth,
      year: selectedYear,
      paymentMethod: 'cash',
      receiptNumber: '',
      notes: ''
    });
  };

  const handleStudentSelectForPayment = async (student: Student) => {
    setSelectedStudentForPayment(student);
    
    // Calculate student's payment status
    const studentContributions = contributions.filter(c => c.studentId === student.id);
    const monthlyPayments: { [key: string]: number } = {};
    let totalPaid = 0;
    
    studentContributions.forEach(contribution => {
      const monthKey = `${contribution.year}-${contribution.month}`;
      monthlyPayments[monthKey] = (monthlyPayments[monthKey] || 0) + contribution.amount;
      totalPaid += contribution.amount;
    });
    
    // Calculate required amount (assuming monthly target)
    const monthsInYear = 12;
    const totalRequired = TARGET_AMOUNT_PER_STUDENT * monthsInYear;
    const remainingBalance = totalRequired - totalPaid;
    
    setStudentPaymentData({
      studentId: student.id,
      studentName: student.name,
      totalRequired,
      totalPaid,
      remainingBalance,
      monthlyPayments
    });
    
    // Reset payment form
    setPaymentFormData({
      month: new Date().toISOString().slice(0, 7),
      amount: 0,
      paymentMethod: 'cash',
      receiptNumber: '',
      notes: ''
    });
  };

  // State for tracking unsaved payments
  const [unsavedPayments, setUnsavedPayments] = useState<{[key: string]: number}>({});
  const [isSavingPayments, setIsSavingPayments] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<Student | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);

  // Handle payment input changes
  const handlePaymentInputChange = (studentId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setUnsavedPayments(prev => ({
      ...prev,
      [studentId]: numAmount
    }));
  };

  // Save all payments (new and updated)
  const handleSaveAllPayments = async () => {
    const paymentsToSave = Object.entries(unsavedPayments).filter(([_, amount]) => amount > 0);
    
    if (paymentsToSave.length === 0) {
      setMessage({ type: 'error', text: 'No payments to save' });
      return;
    }

    setIsSavingPayments(true);
    setMessage(null);

    try {
      const session = localStorage.getItem('teacherSession');
      const teacherData = session ? JSON.parse(session) : null;
      const t = teacherData?.teacher ?? teacherData;
      const teacherId = t?.uid || t?.id;

      if (!teacherId) {
        setMessage({ type: 'error', text: 'Missing teacher session. Please login again.' });
        return;
      }

      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentYear = new Date().getFullYear().toString();

      // Process each payment
      const savePromises = paymentsToSave.map(async ([studentId, amount]) => {
        const student = students.find(s => s.id === studentId);
        if (!student) return null;

        // Check if payment already exists for this student and month
        const existingPayment = contributions.find(c => 
          c.studentId === studentId && 
          c.month === currentMonth && 
          c.year === currentYear
        );

        const paymentData = {
          studentId,
          studentName: student.name,
          gradeLevel: student.gradeLevel,
          amount,
          month: currentMonth,
          year: currentYear,
          paymentMethod: 'cash',
          receiptNumber: '',
          notes: '',
          recordedByUid: teacherId,
          recordedByName: String(t?.name ?? t?.username ?? 'Teacher'),
          paymentDate: new Date().toISOString(),
          status: 'paid'
        };

        if (existingPayment) {
          // Update existing payment
          const response = await fetch(`/api/contributions/${existingPayment.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
          });
          return response.ok ? { type: 'updated', studentName: student.name, amount } : null;
        } else {
          // Create new payment
          const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
          });
          return response.ok ? { type: 'created', studentName: student.name, amount } : null;
        }
      });

      const results = await Promise.all(savePromises);
      const successful = results.filter(r => r !== null);
      
      if (successful.length > 0) {
        const newCount = successful.filter(r => r.type === 'created').length;
        const updateCount = successful.filter(r => r.type === 'updated').length;
        
        setMessage({ 
          type: 'success', 
          text: `Saved ${successful.length} payments: ${newCount} new, ${updateCount} updated` 
        });
        
        // Clear unsaved payments
        setUnsavedPayments({});
        
        // Refresh data
        const year = selectedYear;
        const gradeParam = selectedGrade ? `&gradeLevel=${encodeURIComponent(selectedGrade)}` : '';
        const scopeParam = totalsScope === 'school' ? '&scope=school' : '';
        const [contributionsRes, quotasRes, summaryRes] = await Promise.all([
          fetch(`/api/contributions?year=${encodeURIComponent(year)}${selectedMonth ? `&month=${encodeURIComponent(selectedMonth)}` : ''}`),
          fetch(`/api/contributions/quotas?year=${encodeURIComponent(year)}${gradeParam}${scopeParam}`, {
            headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
          }),
          fetch(`/api/contributions/summary?year=${encodeURIComponent(year)}${gradeParam}${scopeParam}`, {
            headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
          }),
        ]);

        const [contributionsJson, quotasJson, summaryJson] = await Promise.all([
          contributionsRes.ok ? contributionsRes.json() : Promise.resolve([]),
          quotasRes.ok ? quotasRes.json() : Promise.resolve([]),
          summaryRes.ok ? summaryRes.json() : Promise.resolve(null),
        ]);

        setContributions(Array.isArray(contributionsJson) ? contributionsJson : []);
        setQuotas(Array.isArray(quotasJson) ? quotasJson : []);
        setDerivedTotals({
          collected: Number(summaryJson?.totalCollected ?? 0),
          expected: Number(summaryJson?.totalExpected ?? 0),
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to save payments' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setIsSavingPayments(false);
    }
  };

  // Handle student row click to show details
  const handleStudentRowClick = (student: Student) => {
    setSelectedStudentForDetails(student);
    setShowStudentDetails(true);
  };

  // Handle payment for selected student in details modal
  const handleStudentDetailPayment = async () => {
    if (!selectedStudentForDetails || !paymentFormData.amount) {
      setMessage({ type: 'error', text: 'Please enter payment amount' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const session = localStorage.getItem('teacherSession');
      const teacherData = session ? JSON.parse(session) : null;
      const t = teacherData?.teacher ?? teacherData;
      const teacherId = t?.uid || t?.id;

      if (!teacherId) {
        setMessage({ type: 'error', text: 'Missing teacher session. Please login again.' });
        return;
      }

      const paymentData = {
        studentId: selectedStudentForDetails.id,
        studentName: selectedStudentForDetails.name,
        gradeLevel: selectedStudentForDetails.gradeLevel,
        amount: paymentFormData.amount,
        month: paymentFormData.month,
        year: paymentFormData.month.split('-')[0],
        paymentMethod: paymentFormData.paymentMethod,
        receiptNumber: paymentFormData.receiptNumber,
        notes: paymentFormData.notes,
        recordedByUid: teacherId,
        recordedByName: String(t?.name ?? t?.username ?? 'Teacher'),
        paymentDate: new Date().toISOString(),
        status: 'paid'
      };

      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Payment recorded successfully!` });
        
        // Reset payment form
        setPaymentFormData({
          month: new Date().toISOString().slice(0, 7),
          amount: 0,
          paymentMethod: 'cash',
          receiptNumber: '',
          notes: ''
        });
        
        // Refresh data
        const year = selectedYear;
        const gradeParam = selectedGrade ? `&gradeLevel=${encodeURIComponent(selectedGrade)}` : '';
        const scopeParam = totalsScope === 'school' ? '&scope=school' : '';
        const [contributionsRes, quotasRes, summaryRes] = await Promise.all([
          fetch(`/api/contributions?year=${encodeURIComponent(year)}${selectedMonth ? `&month=${encodeURIComponent(selectedMonth)}` : ''}`),
          fetch(`/api/contributions/quotas?year=${encodeURIComponent(year)}${gradeParam}${scopeParam}`, {
            headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
          }),
          fetch(`/api/contributions/summary?year=${encodeURIComponent(year)}${gradeParam}${scopeParam}`, {
            headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
          }),
        ]);

        const [contributionsJson, quotasJson, summaryJson] = await Promise.all([
          contributionsRes.ok ? contributionsRes.json() : Promise.resolve([]),
          quotasRes.ok ? quotasRes.json() : Promise.resolve([]),
          summaryRes.ok ? summaryRes.json() : Promise.resolve(null),
        ]);

        setContributions(Array.isArray(contributionsJson) ? contributionsJson : []);
        setQuotas(Array.isArray(quotasJson) ? quotasJson : []);
        setDerivedTotals({
          collected: Number(summaryJson?.totalCollected ?? 0),
          expected: Number(summaryJson?.totalExpected ?? 0),
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to record payment' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setIsSaving(false);
    }
  };

  // Get student's payment history
  const getStudentPaymentHistory = (studentId: string) => {
    return contributions
      .filter(c => c.studentId === studentId)
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  };

  // Quick payment function for inline payment input
  const handleQuickPayment = async (studentId: string, studentName: string, gradeLevel: string, amount: number) => {
    if (!amount || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const session = localStorage.getItem('teacherSession');
      const teacherData = session ? JSON.parse(session) : null;
      const t = teacherData?.teacher ?? teacherData;
      const teacherId = t?.uid || t?.id;

      if (!teacherId) {
        setMessage({ type: 'error', text: 'Missing teacher session. Please login again.' });
        return;
      }

      const paymentData = {
        studentId,
        studentName,
        gradeLevel,
        amount,
        month: new Date().toISOString().slice(0, 7),
        year: new Date().getFullYear().toString(),
        paymentMethod: 'cash',
        receiptNumber: '',
        notes: '',
        recordedByUid: teacherId,
        recordedByName: String(t?.name ?? t?.username ?? 'Teacher'),
        paymentDate: new Date().toISOString(),
        status: 'paid'
      };

      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Payment of ₱${amount.toLocaleString()} recorded for ${studentName}!` });
        
        // Refresh data
        const year = selectedYear;
        const gradeParam = selectedGrade ? `&gradeLevel=${encodeURIComponent(selectedGrade)}` : '';
        const scopeParam = totalsScope === 'school' ? '&scope=school' : '';
        const [contributionsRes, quotasRes, summaryRes] = await Promise.all([
          fetch(`/api/contributions?year=${encodeURIComponent(year)}${selectedMonth ? `&month=${encodeURIComponent(selectedMonth)}` : ''}`),
          fetch(`/api/contributions/quotas?year=${encodeURIComponent(year)}${gradeParam}${scopeParam}`, {
            headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
          }),
          fetch(`/api/contributions/summary?year=${encodeURIComponent(year)}${gradeParam}${scopeParam}`, {
            headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
          }),
        ]);

        const [contributionsJson, quotasJson, summaryJson] = await Promise.all([
          contributionsRes.ok ? contributionsRes.json() : Promise.resolve([]),
          quotasRes.ok ? quotasRes.json() : Promise.resolve([]),
          summaryRes.ok ? summaryRes.json() : Promise.resolve(null),
        ]);

        setContributions(Array.isArray(contributionsJson) ? contributionsJson : []);
        setQuotas(Array.isArray(quotasJson) ? quotasJson : []);
        setDerivedTotals({
          collected: Number(summaryJson?.totalCollected ?? 0),
          expected: Number(summaryJson?.totalExpected ?? 0),
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to record payment' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setIsSaving(false);
    }
  };

  // New function to handle payment submission for selected student
  const handleStudentPaymentSubmit = async () => {
    if (!selectedStudentForPayment || !paymentFormData.amount) {
      setMessage({ type: 'error', text: 'Please enter payment amount' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const session = localStorage.getItem('teacherSession');
      const teacherData = session ? JSON.parse(session) : null;
      const t = teacherData?.teacher ?? teacherData;
      const teacherId = t?.uid || t?.id;

      if (!teacherId) {
        setMessage({ type: 'error', text: 'Missing teacher session. Please login again.' });
        return;
      }

      const paymentData = {
        studentId: selectedStudentForPayment.id,
        studentName: selectedStudentForPayment.name,
        gradeLevel: selectedStudentForPayment.gradeLevel,
        amount: paymentFormData.amount,
        month: paymentFormData.month,
        year: paymentFormData.month.split('-')[0],
        paymentMethod: paymentFormData.paymentMethod,
        receiptNumber: paymentFormData.receiptNumber,
        notes: paymentFormData.notes,
        recordedByUid: teacherId,
        recordedByName: String(t?.name ?? t?.username ?? 'Teacher'),
        paymentDate: new Date().toISOString(),
        status: 'paid'
      };

      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Payment recorded successfully!` });
        
        // Refresh student payment data
        await handleStudentSelectForPayment(selectedStudentForPayment);
        
        // Refresh overall data
        const year = selectedYear;
        const gradeParam = selectedGrade ? `&gradeLevel=${encodeURIComponent(selectedGrade)}` : '';
        const scopeParam = totalsScope === 'school' ? '&scope=school' : '';
        const [contributionsRes, quotasRes, summaryRes] = await Promise.all([
          fetch(`/api/contributions?year=${encodeURIComponent(year)}${selectedMonth ? `&month=${encodeURIComponent(selectedMonth)}` : ''}`),
          fetch(`/api/contributions/quotas?year=${encodeURIComponent(year)}${gradeParam}${scopeParam}`, {
            headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
          }),
          fetch(`/api/contributions/summary?year=${encodeURIComponent(year)}${gradeParam}${scopeParam}`, {
            headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
          }),
        ]);

        const [contributionsJson, quotasJson, summaryJson] = await Promise.all([
          contributionsRes.ok ? contributionsRes.json() : Promise.resolve([]),
          quotasRes.ok ? quotasRes.json() : Promise.resolve([]),
          summaryRes.ok ? summaryRes.json() : Promise.resolve(null),
        ]);

        setContributions(Array.isArray(contributionsJson) ? contributionsJson : []);
        setQuotas(Array.isArray(quotasJson) ? quotasJson : []);
        setDerivedTotals({
          collected: Number(summaryJson?.totalCollected ?? 0),
          expected: Number(summaryJson?.totalExpected ?? 0),
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to record payment' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!formData.studentId || !formData.amount) {
      setMessage({ type: 'error', text: 'Please select a student and enter amount' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const session = localStorage.getItem('teacherSession');
      const teacherData = session ? JSON.parse(session) : null;
      const t = teacherData?.teacher ?? teacherData;
      const teacherId = t?.uid || t?.id;

      if (!teacherId) {
        setMessage({ type: 'error', text: 'Missing teacher session. Please login again.' });
        return;
      }

      const selectedStudent = students.find((s) => s.id === formData.studentId);

      const paymentData = {
        ...formData,
        studentName: selectedStudent?.name ?? '',
        gradeLevel: selectedStudent?.gradeLevel ?? '',
        recordedByUid: teacherId,
        recordedByName: String(t?.name ?? t?.username ?? 'Teacher'),
        paymentDate: new Date().toISOString(),
        status: 'paid'
      };

      const url = '/api/contributions';
      const method = 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Payment ${editingPayment ? 'updated' : 'recorded'} successfully!` });
        setShowAddPayment(false);
        setEditingPayment(null);
        const year = selectedYear;
        const gradeParam = selectedGrade ? `&gradeLevel=${encodeURIComponent(selectedGrade)}` : '';
        const scopeParam = totalsScope === 'school' ? '&scope=school' : '';
        const [contributionsRes, quotasRes, summaryRes] = await Promise.all([
          fetch(`/api/contributions?year=${encodeURIComponent(year)}${selectedMonth ? `&month=${encodeURIComponent(selectedMonth)}` : ''}`),
          fetch(`/api/contributions/quotas?year=${encodeURIComponent(year)}${gradeParam}${scopeParam}`, {
            headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
          }),
          fetch(`/api/contributions/summary?year=${encodeURIComponent(year)}${gradeParam}${scopeParam}`, {
            headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
          }),
        ]);

        const [contributionsJson, quotasJson, summaryJson] = await Promise.all([
          contributionsRes.ok ? contributionsRes.json() : Promise.resolve([]),
          quotasRes.ok ? quotasRes.json() : Promise.resolve([]),
          summaryRes.ok ? summaryRes.json() : Promise.resolve(null),
        ]);

        setContributions(Array.isArray(contributionsJson) ? contributionsJson : []);
        setQuotas(Array.isArray(quotasJson) ? quotasJson : []);
        setDerivedTotals({
          collected: Number(summaryJson?.totalCollected ?? 0),
          expected: Number(summaryJson?.totalExpected ?? 0),
        });
      } else {
        setMessage({ type: 'error', text: `Failed to ${editingPayment ? 'update' : 'record'} payment` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    setMessage({ type: 'error', text: 'Delete is not enabled yet.' });
  };

  const handleEditPayment = (contribution: MonthlyContribution) => {
    setEditingPayment(contribution);
    setFormData({
      studentId: contribution.studentId,
      amount: contribution.amount,
      month: contribution.month,
      year: contribution.year,
      paymentMethod: contribution.paymentMethod,
      receiptNumber: contribution.receiptNumber || '',
      notes: contribution.notes || ''
    });
    setShowAddPayment(true);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'fully_paid': return 'bg-green-100 text-green-800';
      case 'partially_paid': return 'bg-yellow-100 text-yellow-800';
      case 'not_paid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContributions = contributions.filter(contribution =>
    contribution.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contribution.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(contribution =>
    !selectedGrade || contribution.gradeLevel === selectedGrade
  );

  const filteredQuotas = quotas.filter(quota =>
    quota.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quota.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(quota =>
    !selectedGrade || quota.gradeLevel === selectedGrade
  );

  const totalCollected = derivedTotals.collected;
  const totalExpected = derivedTotals.expected;
  const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

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
    <TeacherLayout title="Contributions" subtitle="Manage student monthly contributions.">
      <style jsx global>{`
        @keyframes jump {
          0%, 100% { transform: translateY(-50%); }
          50% { transform: translateY(-80%); }
        }
        .animate-icon-jump {
          animation: jump 0.4s ease-in-out;
        }
        .dropdown-enter {
          animation: scaleIn 0.2s ease-out forwards;
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        /* Custom scrollbar for the dropdown */
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

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {showAddPayment ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6">
            {editingPayment ? 'Edit Payment' : 'Record New Payment'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
                required
              >
                <option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.gradeLevel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <input
                type="month"
                value={formData.month}
                onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => {
                  const value = e.target.value as 'cash' | 'bank' | 'online' | 'other';
                  setFormData(prev => ({ ...prev, paymentMethod: value }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="online">Online Payment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Number (Optional)
              </label>
              <input
                type="text"
                value={formData.receiptNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, receiptNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
                placeholder="Enter receipt number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
                placeholder="Add any notes..."
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSubmitPayment}
              disabled={isSaving}
              className="bg-[#1B3E2A] text-white px-6 py-2 rounded-lg hover:bg-[#2d5a3f] disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  {editingPayment ? 'Update' : 'Record'} Payment
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowAddPayment(false);
                setEditingPayment(null);
              }}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-end mb-4">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white overflow-hidden">
              <button
                onClick={() => setTotalsScope('teacher')}
                className={`px-4 py-2 text-sm font-semibold ${totalsScope === 'teacher' ? 'bg-[#1B3E2A] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                My Students
              </button>
              <button
                onClick={() => setTotalsScope('school')}
                className={`px-4 py-2 text-sm font-semibold ${totalsScope === 'school' ? 'bg-[#1B3E2A] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Whole School
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Collected</p>
                  <p className="text-3xl font-bold text-[#1B3E2A]">₱{totalCollected.toLocaleString()}</p>
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>12% from last month</span>
                  </div>
                </div>
                <div className="bg-[#f0f7f3] p-3 rounded-full">
                  <DollarSign className="w-8 h-8 text-[#1B3E2A]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Expected This Year</p>
                  <p className="text-3xl font-bold text-gray-900">₱{totalExpected.toLocaleString()}</p>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Annual target</span>
                  </div>
                </div>
                <div className="bg-[#fef9e7] p-3 rounded-full">
                  <TrendingUp className="w-8 h-8 text-[#F2C94C]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Collection Rate</p>
                  <p className="text-3xl font-bold text-purple-600">{collectionRate.toFixed(1)}%</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#1B3E2A] to-[#F2C94C] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(collectionRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-full">
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Students</p>
                  <p className="text-3xl font-bold text-orange-600">{quotas.length}</p>
                  <div className="mt-2 flex items-center text-xs text-orange-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    <span>All enrolled</span>
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded-full">
                  <CheckCircle className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Toolbar: FIXED ALIGNMENT */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-48">
                <button 
                  className="flex items-center justify-center gap-2 px-5 w-full rounded-md font-semibold text-xs tracking-normal border border-gray-600 border-b-2 shadow-sm transition-all duration-300 h-11"
                  onMouseEnter={() => setIsExportBtnHovered(true)}
                  onMouseLeave={() => setIsExportBtnHovered(false)}
                  style={{
                    backgroundImage: 'linear-gradient(to top, #4B5563 50%, transparent 50%)',
                    backgroundSize: '100% 200%',
                    backgroundPosition: isExportBtnHovered ? 'bottom' : 'top',
                    color: isExportBtnHovered ? '#FFFFFF' : '#4B5563', 
                    borderColor: '#4B5563',
                    boxShadow: isExportBtnHovered ? '0 4px 12px rgba(75, 85, 99, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  <Download 
                    className={`w-4 h-4 transition-transform duration-300 ${isExportBtnHovered ? '-translate-y-1' : ''}`} 
                  />
                  Export Report
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 z-20">
              {/* Search Bar: Aligned Height */}
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r from-[#1B3E2A] to-[#F2C94C] rounded-lg opacity-0 transition-opacity duration-300 blur-sm ${isSearchFocused ? 'opacity-100' : 'group-hover:opacity-100'}`}></div>
                <div className="relative flex items-center h-11"> {/* Container h-11 */}
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
                    className="h-full pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent bg-white transition-all duration-300 w-64 group-hover:border-[#1B3E2A]"
                  />
                </div>
              </div>

              {/* Enhanced Custom Dropdown: Aligned Height */}
              <div className="relative group" ref={dropdownRef}>
                <div className={`absolute inset-0 bg-gradient-to-r from-[#F2C94C] to-[#1B3E2A] rounded-lg opacity-0 transition-opacity duration-300 blur-sm ${isGradeDropdownOpen ? 'opacity-100' : 'group-hover:opacity-100'}`}></div>
                <div className="relative h-11"> {/* Container h-11 */}
                  <button
                    onClick={() => setIsGradeDropdownOpen(!isGradeDropdownOpen)}
                    className="h-full flex items-center justify-between w-40 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none transition-all duration-300 group-hover:border-[#F2C94C]"
                  >
                    <span className={`text-sm ${selectedGrade ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {selectedGrade || "All Grades"}
                    </span>
                    <ChevronDown 
                      className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isGradeDropdownOpen ? 'rotate-180 text-[#F2C94C]' : 'group-hover:text-[#F2C94C]'}`} 
                    />
                  </button>

                  {isGradeDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 dropdown-enter">
                      <div className="py-1 max-h-64 overflow-y-auto custom-scrollbar">
                        <button
                          onClick={() => {
                            setSelectedGrade('');
                            setIsGradeDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-[#f0f7f3] transition-colors ${!selectedGrade ? 'bg-[#f0f7f3] text-[#1B3E2A] font-medium' : 'text-gray-700'}`}
                        >
                          All Grades
                          {!selectedGrade && <Check className="w-4 h-4 text-[#1B3E2A]" />}
                        </button>
                        {GRADE_LEVELS.map((grade) => (
                          <button
                            key={grade}
                            onClick={() => {
                              setSelectedGrade(grade);
                              setIsGradeDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-[#f0f7f3] transition-colors ${selectedGrade === grade ? 'bg-[#f0f7f3] text-[#1B3E2A] font-medium' : 'text-gray-700'}`}
                          >
                            {grade}
                            {selectedGrade === grade && <Check className="w-4 h-4 text-[#1B3E2A]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Payment Button */}
              <button
                onClick={handleSaveAllPayments}
                disabled={isSavingPayments || Object.keys(unsavedPayments).length === 0}
                className="flex items-center justify-center gap-2 px-5 h-11 rounded-md font-semibold text-xs tracking-normal border border-[#1B3E2A] border-b-2 shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundImage: 'linear-gradient(to top, #1B3E2A 50%, transparent 50%)',
                  backgroundSize: '100% 200%',
                  backgroundPosition: 'bottom',
                  color: '#F2C94C',
                  borderColor: '#1B3E2A',
                  boxShadow: '0 4px 12px rgba(27, 62, 42, 0.3)',
                }}
              >
                {isSavingPayments ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#F2C94C]"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Payment
                    {Object.keys(unsavedPayments).length > 0 && (
                      <span className="bg-[#F2C94C] text-[#1B3E2A] px-2 py-0.5 rounded-full text-xs font-bold">
                        {Object.keys(unsavedPayments).length}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Student Quotas Table: FIXED LAYOUT */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 z-0">
            {/* Header with ENHANCED VISIBILITY */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#F2C94C] to-[#e5b840] text-[#1B3E2A]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Student Contribution Status ({filteredQuotas.length})
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Last 30 days</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {/* FIXED: Removed extra whitespace inside table */}
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-[#f0f7f3]">
                  <tr>
                    {/* Explicit widths totaling 100% */}
                    <th className="w-[25%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                      Student
                    </th>
                    <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                      Total Paid
                    </th>
                    <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                      Remaining
                    </th>
                    <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                      Add Payment
                    </th>
                    <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredQuotas.length > 0 ? (
                    filteredQuotas.map((quota, index) => {
                      const student = students.find(s => s.id === quota.studentId);
                      return (
                        <tr 
                          key={quota.studentId} 
                          className={`hover:bg-[#f0f7f3] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} cursor-pointer`}
                          onClick={() => student && handleStudentRowClick(student)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#1B3E2A] to-[#F2C94C] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {quota.studentName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="min-w-0"> {/* min-w-0 allows truncation within flex */}
                                <div className="text-sm font-semibold text-gray-900 truncate" title={quota.studentName}>
                                  {quota.studentName}
                                </div>
                                <div className="text-xs text-gray-500 truncate">ID: {quota.studentId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 bg-[#fef9e7] px-3 py-1 rounded-full text-center inline-block truncate max-w-full">
                              {quota.gradeLevel}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-bold text-green-600 truncate">₱{quota.totalPaid.toLocaleString()}</div>
                              {quota.totalPaid > 0 && (
                                <CheckCircle className="flex-shrink-0 w-4 h-4 text-green-500" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              ₱{quota.remainingBalance.toLocaleString()}
                            </div>
                            {quota.remainingBalance > 0 && (
                              <div className="text-xs text-orange-600 mt-1 truncate">Pending</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <input
                                type="number"
                                placeholder="Amount"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1B3E2A] focus:border-[#1B3E2A]"
                                min="0"
                                step="0.01"
                                value={unsavedPayments[quota.studentId] || ''}
                                onChange={(e) => handlePaymentInputChange(quota.studentId, e.target.value)}
                                onClick={(e) => e.stopPropagation()} // Prevent row click
                              />
                              <div className="text-xs text-gray-500 text-center">
                                {unsavedPayments[quota.studentId] > 0 ? 'Ready to save' : 'Enter amount'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${getPaymentStatusColor(quota.paymentStatus)}`}>
                              {quota.paymentStatus.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <Search className="w-12 h-12 text-gray-300 mb-2" />
                          <p>No students found matching your search.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Payments Table: FIXED LAYOUT */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#F2C94C] to-[#e5b840] text-[#1B3E2A]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Recent Payments ({filteredContributions.length})
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Last 30 days</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-[#fef9e7]">
                  <tr>
                    <th className="w-[30%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                      Student
                    </th>
                    <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                      Month
                    </th>
                    <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                      Method
                    </th>
                    <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                      Recorded By
                    </th>
                    <th className="w-[10%] px-6 py-4 text-left text-xs font-semibold text-[#1B3E2A] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredContributions.map((contribution, index) => (
                    <tr key={contribution.id} className={`hover:bg-[#fef9e7] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#1B3E2A] to-[#F2C94C] rounded-full flex items-center justify-center text-green-500 font-semibold text-sm">
                            {contribution.studentName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">{contribution.studentName}</div>
                            <div className="text-xs text-gray-500 truncate">ID: {contribution.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {new Date(contribution.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {new Date(contribution.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-[#1B3E2A] bg-[#fef9e7] px-3 py-1 rounded-full truncate">
                            ₱{contribution.amount.toLocaleString()}
                          </div>
                          <DollarSign className="flex-shrink-0 w-4 h-4 text-[#F2C94C]" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900 capitalize truncate">{contribution.paymentMethod}</div>
                          <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                            contribution.paymentMethod === 'cash' ? 'bg-green-500' :
                            contribution.paymentMethod === 'bank' ? 'bg-blue-500' :
                            contribution.paymentMethod === 'online' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 truncate">{contribution.recordedByName}</div>
                        <div className="text-xs text-gray-500 truncate">Teacher</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditPayment(contribution)}
                            className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(contribution.id)}
                            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Details Modal */}
          {showStudentDetails && selectedStudentForDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1B3E2A] to-[#F2C94C] text-white p-6 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold">
                          {selectedStudentForDetails.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedStudentForDetails.name}</h2>
                        <p className="text-white/80">{selectedStudentForDetails.gradeLevel} • ID: {selectedStudentForDetails.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowStudentDetails(false)}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                  {/* Payment Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-[#f0f7f3] p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Required</p>
                      <p className="text-2xl font-bold text-[#1B3E2A]">₱{(TARGET_AMOUNT_PER_STUDENT * 12).toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₱{getStudentPaymentHistory(selectedStudentForDetails.id).reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Remaining Balance</p>
                      <p className="text-2xl font-bold text-orange-600">
                        ₱{Math.max(0, (TARGET_AMOUNT_PER_STUDENT * 12) - getStudentPaymentHistory(selectedStudentForDetails.id).reduce((sum, p) => sum + p.amount, 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Add Payment Form */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-[#1B3E2A] mb-4">Add New Payment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Month
                        </label>
                        <input
                          type="month"
                          value={paymentFormData.month}
                          onChange={(e) => setPaymentFormData(prev => ({ ...prev, month: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount
                        </label>
                        <input
                          type="number"
                          value={paymentFormData.amount}
                          onChange={(e) => setPaymentFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
                          min="0"
                          step="0.01"
                          placeholder="Enter amount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method
                        </label>
                        <select
                          value={paymentFormData.paymentMethod}
                          onChange={(e) => setPaymentFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
                        >
                          <option value="cash">Cash</option>
                          <option value="bank">Bank Transfer</option>
                          <option value="online">Online Payment</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Receipt Number (Optional)
                        </label>
                        <input
                          type="text"
                          value={paymentFormData.receiptNumber}
                          onChange={(e) => setPaymentFormData(prev => ({ ...prev, receiptNumber: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
                          placeholder="Enter receipt number"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={paymentFormData.notes}
                        onChange={(e) => setPaymentFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A]"
                        placeholder="Add any notes..."
                      />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleStudentDetailPayment}
                        disabled={isSaving || !paymentFormData.amount}
                        className="bg-[#1B3E2A] text-white px-6 py-2 rounded-lg hover:bg-[#2d5a3f] disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4" />
                            Record Payment
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setPaymentFormData({
                          month: new Date().toISOString().slice(0, 7),
                          amount: 0,
                          paymentMethod: 'cash',
                          receiptNumber: '',
                          notes: ''
                        })}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Payment History */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#1B3E2A] mb-4">Payment History</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded By</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getStudentPaymentHistory(selectedStudentForDetails.id).length > 0 ? (
                            getStudentPaymentHistory(selectedStudentForDetails.id).map((payment) => (
                              <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {new Date(payment.paymentDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {new Date(payment.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-2 text-sm font-semibold text-green-600">
                                  ₱{payment.amount.toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                                  {payment.paymentMethod}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {payment.recordedByName}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                No payment records found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </TeacherLayout>
  );
}