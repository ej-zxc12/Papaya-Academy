'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Search, Filter, Users, Mail, Briefcase, GraduationCap, CheckCircle, XCircle, User as UserIcon } from 'lucide-react';
import PrincipalLayout from '../components/PrincipalLayout';

interface Teacher {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  subjects: string[];
  gradeLevel: string;
  isActive: boolean;
  role: string;
  imageUrl: string | null;
  createdAt: string | null;
  lastLoginAt: string | null;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('principalSession');
    if (!session) {
      router.push('/principal/login');
      return;
    }

    loadTeachers();
  }, [router]);

  useEffect(() => {
    filterTeachers();
  }, [teachers, searchTerm, statusFilter]);

  const loadTeachers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const session = localStorage.getItem('principalSession');
      const parsedSession = JSON.parse(session!);
      const principalData = parsedSession?.principal ?? parsedSession;
      const principalId = principalData?.uid || principalData?.id;

      const response = await fetch(`/api/principal/teachers?status=${statusFilter}`, {
        headers: {
          Authorization: `Bearer ${encodeURIComponent(principalId)}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/principal/login');
          return;
        }
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Teachers API error:', response.status, errorData);
        throw new Error(errorData.message || `Failed to fetch teachers (${response.status})`);
      }

      const data = await response.json();
      setTeachers(data);
    } catch (err) {
      console.error('Error loading teachers:', err);
      setError('Failed to load teachers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTeachers = () => {
    let filtered = [...teachers];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          t.email.toLowerCase().includes(term) ||
          t.employeeId.toLowerCase().includes(term) ||
          t.department.toLowerCase().includes(term)
      );
    }

    setFilteredTeachers(filtered);
  };

  const handleStatusFilterChange = (newStatus: 'all' | 'active' | 'inactive') => {
    setStatusFilter(newStatus);
    // Reload with new filter
    const session = localStorage.getItem('principalSession');
    if (!session) return;

    const parsedSession = JSON.parse(session);
    const principalData = parsedSession?.principal ?? parsedSession;
    const principalId = principalData?.uid || principalData?.id;

    setIsLoading(true);
    fetch(`/api/principal/teachers?status=${newStatus}`, {
      headers: {
        Authorization: `Bearer ${encodeURIComponent(principalId)}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTeachers(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error loading teachers:', err);
        setError('Failed to load teachers');
        setIsLoading(false);
      });
  };

  const getActiveTeachersCount = () => teachers.filter((t) => t.isActive).length;
  const getInactiveTeachersCount = () => teachers.filter((t) => !t.isActive).length;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <PrincipalLayout title="Teachers" subtitle="Manage and view teacher accounts">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
        </div>
      </PrincipalLayout>
    );
  }

  return (
    <PrincipalLayout title="Teachers" subtitle="View and manage active teacher accounts">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Accounts</p>
              <p className="text-2xl font-bold text-green-600">{getActiveTeachersCount()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Inactive Accounts</p>
              <p className="text-2xl font-bold text-red-600">{getInactiveTeachersCount()}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, employee ID, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
            >
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="all">All Teachers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Teachers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredTeachers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No teachers found</h3>
            <p className="text-gray-500">
              {searchTerm
                ? 'Try adjusting your search terms'
                : statusFilter === 'active'
                ? 'No active teacher accounts found'
                : statusFilter === 'inactive'
                ? 'No inactive teacher accounts found'
                : 'No teacher accounts have been created yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Teacher
                  </th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                          {teacher.imageUrl ? (
                            <img
                              src={teacher.imageUrl}
                              alt={teacher.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-purple-100">
                              <UserIcon size={20} className="text-purple-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{teacher.name}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{teacher.email || 'No email'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          teacher.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {teacher.isActive ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-500">
                        {formatDate(teacher.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Results count */}
        {filteredTeachers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{filteredTeachers.length}</span> of{' '}
              <span className="font-medium text-gray-900">{teachers.length}</span> teachers
            </p>
          </div>
        )}
      </div>
    </PrincipalLayout>
  );
}
