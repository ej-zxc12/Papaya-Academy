'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ContributionQuota, MonthlyContribution, SF10Record, Teacher } from '@/types';
import { 
  Users,
  Clock,
  FileText,
  DollarSign,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  FilePlus,
  AlertCircle
} from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';

type ActivityItem = {
  id: string;
  type: 'sf10' | 'contribution';
  title: string;
  description: string;
  timestampLabel: string;
  icon: typeof FileText;
  color: string;
  bg: string;
};

function formatRelativeTime(input: string | undefined) {
  if (!input) return '—';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '—';
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / (60 * 1000));
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
}

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sf10Records, setSf10Records] = useState<SF10Record[]>([]);
  const [contributions, setContributions] = useState<MonthlyContribution[]>([]);
  const [quotas, setQuotas] = useState<ContributionQuota[]>([]);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const session = localStorage.getItem('teacherSession');
      if (!session) {
        router.push('/teacher/login');
        return;
      }

      try {
        const parsed = JSON.parse(session);
        const teacherData: Teacher | undefined = parsed?.teacher;
        setTeacher(teacherData ?? null);

        const year = new Date().getFullYear().toString();
        const teacherId = teacherData?.id;

        const [sf10Res, contributionsRes, quotasRes] = await Promise.all([
          fetch(`/api/teacher/sf10${teacherId ? `?teacherId=${encodeURIComponent(teacherId)}` : ''}`),
          fetch('/api/contributions'),
          fetch(`/api/contributions/quotas?year=${encodeURIComponent(year)}`),
        ]);

        if (!sf10Res.ok) throw new Error('Failed to load SF10 records');
        if (!contributionsRes.ok) throw new Error('Failed to load contributions');
        if (!quotasRes.ok) throw new Error('Failed to load contribution quotas');

        const [sf10Json, contributionsJson, quotasJson] = await Promise.all([
          sf10Res.json(),
          contributionsRes.json(),
          quotasRes.json(),
        ]);

        setSf10Records(Array.isArray(sf10Json) ? sf10Json : []);
        setContributions(Array.isArray(contributionsJson) ? contributionsJson : []);
        setQuotas(Array.isArray(quotasJson) ? quotasJson : []);
        setLoadError(null);
      } catch {
        setLoadError('Some dashboard data could not be loaded.');
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    load();
  }, [router]);

  const totalStudents = quotas.length;
  const totalSf10 = sf10Records.length;

  const totalExpected = quotas.reduce((sum, q) => sum + (q.yearlyQuota || 0), 0);
  const totalCollected = quotas.reduce((sum, q) => sum + (q.totalPaid || 0), 0);
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const recentActivities: ActivityItem[] = (() => {
    const sf10Items: ActivityItem[] = sf10Records
      .slice()
      .sort((a, b) => new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime())
      .slice(0, 6)
      .map((r) => ({
        id: r.id,
        type: 'sf10',
        title: 'SF10 Generated',
        description: `Generated form for ${r.studentName} (${r.gradeLevel})`,
        timestampLabel: formatRelativeTime(r.dateCompleted),
        icon: FileText,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
      }));

    const contribItems: ActivityItem[] = contributions
      .slice()
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 6)
      .map((c) => ({
        id: c.id,
        type: 'contribution',
        title: 'Payment Recorded',
        description: `Received ₱${c.amount} from ${c.studentName}`,
        timestampLabel: formatRelativeTime(c.paymentDate),
        icon: DollarSign,
        color: 'text-green-500',
        bg: 'bg-green-50',
      }));

    return [...sf10Items, ...contribItems]
      .slice()
      .sort((a, b) => {
        const getTime = (x: ActivityItem) => {
          if (x.type === 'sf10') {
            const found = sf10Records.find(r => r.id === x.id);
            return found ? new Date(found.dateCompleted).getTime() : 0;
          }
          const found = contributions.find(c => c.id === x.id);
          return found ? new Date(found.paymentDate).getTime() : 0;
        };
        return getTime(b) - getTime(a);
      })
      .slice(0, 6);
  })();


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
    <TeacherLayout title="Dashboard" subtitle={`Welcome back, ${teacher?.name || 'Teacher'}!`}>
      {loadError && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-semibold">Dashboard partially loaded</div>
            <div className="text-yellow-700">{loadError}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Total Students</p>
              <h3 className="text-3xl font-extrabold text-gray-900">{totalStudents}</h3>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-50">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">Based on contribution quotas</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">SF10 Forms</p>
              <h3 className="text-3xl font-extrabold text-gray-900">{totalSf10}</h3>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-50">
              <FileText className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center text-sm">
            <span className="text-gray-500">Records available in system</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Collection Rate</p>
              <h3 className="text-3xl font-extrabold text-gray-900">{collectionRate}%</h3>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-50">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="relative z-10 mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-green-500 h-full rounded-full" style={{ width: `${collectionRate}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-gradient-to-r from-[#1B3E2A] to-[#2d5a3f] text-white">
              <h3 className="text-lg font-semibold flex items-center gap-2">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-3">
              <button
                onClick={() => router.push('/teacher/sf10/create')}
                className="w-full flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#F2C94C] hover:bg-[#fef9e7] transition-all group"
              >
                <div className="p-2 bg-white rounded-md shadow-sm mr-3">
                  <FilePlus className="w-5 h-5 text-gray-600 group-hover:text-[#1B3E2A]" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-[#1B3E2A]">Generate SF10</p>
                  <p className="text-xs text-gray-500">Create a new SF10 form</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1B3E2A] transform group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => router.push('/teacher/sf10/list')}
                className="w-full flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#F2C94C] hover:bg-[#fef9e7] transition-all group"
              >
                <div className="p-2 bg-white rounded-md shadow-sm mr-3">
                  <FileText className="w-5 h-5 text-gray-600 group-hover:text-[#1B3E2A]" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-[#1B3E2A]">View SF10</p>
                  <p className="text-xs text-gray-500">Manage existing records</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1B3E2A] transform group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => router.push('/teacher/contributions')}
                className="w-full flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#F2C94C] hover:bg-[#fef9e7] transition-all group"
              >
                <div className="p-2 bg-white rounded-md shadow-sm mr-3">
                  <PlusCircle className="w-5 h-5 text-gray-600 group-hover:text-[#1B3E2A]" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-[#1B3E2A]">Record Payment</p>
                  <p className="text-xs text-gray-500">Log student contributions</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1B3E2A] transform group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 h-full">
            <div className="px-6 py-4 bg-gradient-to-r from-[#F2C94C] to-[#e5b840] text-[#1B3E2A] flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </h3>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {recentActivities.length === 0 ? (
                  <div className="text-center py-10 text-sm text-gray-500">
                    No recent activity yet. Start by creating an SF10 or recording a payment.
                  </div>
                ) : recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="relative pl-6">
                      {index !== recentActivities.length - 1 && (
                        <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-gray-100"></div>
                      )}

                      <div className="flex items-start gap-4">
                        <div className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${activity.bg}`}>
                          <Icon className={`w-3 h-3 ${activity.color}`} />
                        </div>

                        <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-bold text-gray-900">{activity.title}</h4>
                            <span className="text-xs font-medium text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100">
                              {activity.timestampLabel}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}