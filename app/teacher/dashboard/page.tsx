'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContributionQuota, MonthlyContribution, SF10Record, Teacher } from '@/types';
import { 
  Users,
  Clock,
  FileText,
  DollarSign,
  ArrowRight,
  TrendingUp,
  FilePlus,
  PlusCircle,
  School,
  AlertCircle
} from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';

type ActivityItem = {
  id: string;
  kind: 'sf10' | 'contribution';
  title: string;
  description: string;
  timestamp: number;
  timestampLabel: string;
  icon: typeof FileText;
  color: string;
  bg: string;
};

function relativeTimeFromTimestamp(timestampMs: number) {
  if (!Number.isFinite(timestampMs)) return '—';
  const diffMs = Date.now() - timestampMs;
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
  const [students, setStudents] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const session = localStorage.getItem('teacherSession');
      if (!session) {
        router.push('/teacher/login');
        return;
      }

      try {
        const parsed = JSON.parse(session);
        const teacherData: Teacher | undefined = parsed?.teacher;
        setTeacher(teacherData ?? null);

        const teacherId = teacherData?.id;
        const year = new Date().getFullYear().toString();

        const [sf10Res, contributionsRes, quotasRes, studentsRes] = await Promise.all([
          fetch(`/api/teacher/sf10${teacherId ? `?teacherId=${encodeURIComponent(teacherId)}` : ''}`),
          fetch('/api/contributions'),
          fetch(`/api/contributions/quotas?year=${encodeURIComponent(year)}`),
          fetch('/api/teacher/students'),
        ]);

        if (!sf10Res.ok) throw new Error('Failed to load SF10 records');
        if (!contributionsRes.ok) throw new Error('Failed to load contributions');
        if (!quotasRes.ok) throw new Error('Failed to load contribution quotas');
        if (!studentsRes.ok) throw new Error('Failed to load students');

        const [sf10Json, contributionsJson, quotasJson, studentsJson] = await Promise.all([
          sf10Res.json(),
          contributionsRes.json(),
          quotasRes.json(),
          studentsRes.json(),
        ]);

        setSf10Records(Array.isArray(sf10Json) ? sf10Json : []);
        setContributions(Array.isArray(contributionsJson) ? contributionsJson : []);
        setQuotas(Array.isArray(quotasJson) ? quotasJson : []);
        setStudents(Array.isArray(studentsJson) ? studentsJson : []);
        setLoadError(null);
      } catch {
        setLoadError('Some dashboard data could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [router]);

  const metrics = useMemo(() => {
    const totalStudents = students.length;
    const totalSf10 = sf10Records.length;

    const totalExpected = quotas.reduce((sum, q) => sum + (q.yearlyQuota || 0), 0);
    const totalCollected = quotas.reduce((sum, q) => sum + (q.totalPaid || 0), 0);
    const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    return { totalStudents, totalSf10, totalExpected, totalCollected, collectionRate };
  }, [students, sf10Records, quotas]);

  const recentActivities: ActivityItem[] = useMemo(() => {
    const sf10Items: ActivityItem[] = sf10Records.map((r) => {
      const ts = new Date(r.dateCompleted).getTime();
      return {
        id: r.id,
        kind: 'sf10',
        title: 'SF10 Generated',
        description: `Generated form for ${r.studentName} (${r.gradeLevel})`,
        timestamp: Number.isFinite(ts) ? ts : 0,
        timestampLabel: relativeTimeFromTimestamp(ts),
        icon: FileText,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
      };
    });

    const contributionItems: ActivityItem[] = contributions.map((c) => {
      const ts = new Date(c.paymentDate).getTime();
      return {
        id: c.id,
        kind: 'contribution',
        title: 'Payment Recorded',
        description: `Received ₱${c.amount} from ${c.studentName}`,
        timestamp: Number.isFinite(ts) ? ts : 0,
        timestampLabel: relativeTimeFromTimestamp(ts),
        icon: DollarSign,
        color: 'text-green-500',
        bg: 'bg-green-50',
      };
    });

    return [...sf10Items, ...contributionItems]
      .filter((x) => x.timestamp > 0)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6);
  }, [sf10Records, contributions]);

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Total Students</p>
              <h3 className="text-3xl font-extrabold text-gray-900">{metrics.totalStudents}</h3>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-50">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">Roster snapshot</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">SF10 Records</p>
              <h3 className="text-3xl font-extrabold text-gray-900">{metrics.totalSf10}</h3>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-50">
              <FileText className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center text-sm">
            <span className="text-gray-500">Available in system</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Collection Rate</p>
              <h3 className="text-3xl font-extrabold text-gray-900">{metrics.collectionRate}%</h3>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-50">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="relative z-10 mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-green-500 h-full rounded-full" style={{ width: `${metrics.collectionRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Collected</p>
              <h3 className="text-3xl font-extrabold text-gray-900">₱{metrics.totalCollected.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-50">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center text-sm">
            <span className="text-gray-500">Expected: ₱{metrics.totalExpected.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-gradient-to-r from-[#1B3E2A] to-[#2d5a3f] text-white">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-3">
              <button
                onClick={() => router.push('/teacher/grades/input')}
                className="w-full flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#F2C94C] hover:bg-[#fef9e7] transition-all group"
              >
                <div className="p-2 bg-white rounded-md shadow-sm mr-3">
                  <School className="w-5 h-5 text-gray-600 group-hover:text-[#1B3E2A]" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-[#1B3E2A]">Input Grades</p>
                  <p className="text-xs text-gray-500">Enter student grades</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1B3E2A] transform group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => router.push('/teacher/sf10/create')}
                className="w-full flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#F2C94C] hover:bg-[#fef9e7] transition-all group"
              >
                <div className="p-2 bg-white rounded-md shadow-sm mr-3">
                  <FilePlus className="w-5 h-5 text-gray-600 group-hover:text-[#1B3E2A]" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-[#1B3E2A]">Generate SF10</p>
                  <p className="text-xs text-gray-500">Create a new record</p>
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
                  <p className="text-xs text-gray-500">Browse student forms</p>
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
                  <p className="text-xs text-gray-500">Manage contributions</p>
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
                    No recent activity yet.
                  </div>
                ) : recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={`${activity.kind}-${activity.id}`} className="relative pl-6">
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