'use client';

import { useState, useEffect } from 'react';
import { MonthlyContribution, ContributionQuota, Student, Teacher } from '@/types';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Download
} from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';

export default function ContributionManagement() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [contributions, setContributions] = useState<MonthlyContribution[]>([]);
  const [quotas, setQuotas] = useState<ContributionQuota[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedGrade, setSelectedGrade] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [editingPayment, setEditingPayment] = useState<MonthlyContribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    amount: 500, // Default monthly contribution
    month: new Date().toISOString().slice(0, 7),
    year: new Date().getFullYear().toString(),
    paymentMethod: 'cash',
    receiptNumber: '',
    notes: ''
  });

  useEffect(() => {
    // Load mock data for demonstration
    const loadMockData = () => {
      // Mock students data
      const mockStudents: Student[] = [
        { id: '1', name: 'Ana Santos', grade: 'Grade 7', enrolledDate: '2024-01-15', attendance: [], grades: [] },
        { id: '2', name: 'Ben Reyes', grade: 'Grade 7', enrolledDate: '2024-01-15', attendance: [], grades: [] },
        { id: '3', name: 'Cruz Martinez', grade: 'Grade 7', enrolledDate: '2024-01-15', attendance: [], grades: [] },
        { id: '4', name: 'Diana Lim', grade: 'Grade 7', enrolledDate: '2024-01-15', attendance: [], grades: [] },
        { id: '5', name: 'Eduardo Tan', grade: 'Grade 7', enrolledDate: '2024-01-15', attendance: [], grades: [] },
      ];

      // Mock contributions data
      const mockContributions: MonthlyContribution[] = [
        {
          id: '1',
          studentId: '1',
          studentName: 'Ana Santos',
          amount: 500,
          month: '2024-01',
          year: '2024',
          paymentMethod: 'cash',
          paymentDate: '2024-01-15',
          recordedBy: 'teacher1',
          recordedByName: 'Juan Dela Cruz',
          status: 'paid'
        },
        {
          id: '2',
          studentId: '2',
          studentName: 'Ben Reyes',
          amount: 500,
          month: '2024-01',
          year: '2024',
          paymentMethod: 'bank',
          paymentDate: '2024-01-16',
          recordedBy: 'teacher1',
          recordedByName: 'Juan Dela Cruz',
          status: 'paid'
        }
      ];

      // Mock quotas data
      const mockQuotas: ContributionQuota[] = mockStudents.map(student => ({
        studentId: student.id,
        studentName: student.name,
        gradeLevel: student.grade,
        monthlyAmount: 500,
        yearlyQuota: 6000, // 500 per month
        totalPaid: mockContributions.filter(c => c.studentId === student.id).reduce((sum, c) => sum + c.amount, 0),
        remainingBalance: 6000 - mockContributions.filter(c => c.studentId === student.id).reduce((sum, c) => sum + c.amount, 0),
        paymentStatus: mockContributions.filter(c => c.studentId === student.id).reduce((sum, c) => sum + c.amount, 0) >= 6000 ? 'fully_paid' : 'partially_paid',
        monthsPaid: mockContributions.filter(c => c.studentId === student.id).map(c => c.month),
        monthsUnpaid: [],
        lastUpdated: new Date().toISOString()
      }));

      setStudents(mockStudents);
      setContributions(mockContributions);
      setQuotas(mockQuotas);
      setIsLoading(false);
    };

    loadMockData();
  }, []);

  const handleAddPayment = () => {
    setShowAddPayment(true);
    setEditingPayment(null);
    setFormData({
      studentId: '',
      amount: 500,
      month: selectedMonth,
      year: selectedYear,
      paymentMethod: 'cash',
      receiptNumber: '',
      notes: ''
    });
  };

  const handleEditPayment = (payment: MonthlyContribution) => {
    setShowAddPayment(true);
    setEditingPayment(payment);
    setFormData({
      studentId: payment.studentId,
      amount: payment.amount,
      month: payment.month,
      year: payment.year,
      paymentMethod: payment.paymentMethod,
      receiptNumber: payment.receiptNumber || '',
      notes: payment.notes || ''
    });
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
      const teacherData = JSON.parse(session!);

      const paymentData = {
        ...formData,
        recordedBy: teacherData.teacher.id,
        recordedByName: teacherData.teacher.name,
        paymentDate: new Date().toISOString(),
        status: 'paid'
      };

      const url = editingPayment 
        ? `/api/contributions/${editingPayment.id}`
        : '/api/contributions';
      
      const method = editingPayment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Payment ${editingPayment ? 'updated' : 'recorded'} successfully!` });
        setShowAddPayment(false);
        setEditingPayment(null);
        // In a real app, reload data here
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
    if (!confirm('Are you sure you want to delete this payment record?')) return;

    try {
      const response = await fetch(`/api/contributions/${paymentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Payment deleted successfully' });
        // In a real app, reload data here
      } else {
        setMessage({ type: 'error', text: 'Failed to delete payment' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Operation failed' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const totalCollected = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalExpected = quotas.length * 500 * 12; // Assuming 500 monthly, 12 months
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
                    {student.name} - {student.grade}
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Collected</p>
                  <p className="text-2xl font-bold text-gray-900">₱{totalCollected.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expected This Year</p>
                  <p className="text-2xl font-bold text-gray-900">₱{totalExpected.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{collectionRate.toFixed(1)}%</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900">{quotas.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Add Payment Button */}
          <div className="mb-6">
            <button
              onClick={handleAddPayment}
              className="bg-[#1B3E2A] text-white px-4 py-2 rounded-lg hover:bg-[#2d5a3f] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Record Payment
            </button>
          </div>

          {/* Student Quotas Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Student Contribution Status ({filteredQuotas.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Yearly Quota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotas.map((quota) => (
                    <tr key={quota.studentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{quota.studentName}</div>
                        <div className="text-xs text-gray-500">{quota.studentId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{quota.gradeLevel}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">₱{quota.yearlyQuota.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-green-600">₱{quota.totalPaid.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">₱{quota.remainingBalance.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(quota.paymentStatus)}`}>
                          {quota.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Payments ({filteredContributions.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Recorded By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContributions.map((contribution) => (
                    <tr key={contribution.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{contribution.studentName}</div>
                        <div className="text-xs text-gray-500">{contribution.studentId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(contribution.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">₱{contribution.amount.toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 capitalize">{contribution.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{contribution.recordedByName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditPayment(contribution)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(contribution.id)}
                            className="text-red-600 hover:text-red-900"
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
        </>
      )}
    </TeacherLayout>
  );
}
