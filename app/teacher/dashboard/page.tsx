'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContributionQuota, MonthlyContribution, SF10Record, Teacher } from '@/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
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

// Activity Skeleton Component
const ActivitySkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="relative pl-6">
        {i !== 5 && (
          <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-gray-100" />
        )}
        <div className="flex items-start gap-4">
          <div className="absolute left-0 w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex justify-between items-start mb-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

type ActivityItem = {
  id: string;
  kind: 'sf10' | 'contribution';
  title: string;
  description: string;
  timestamp: number;
  timestampLabel: string;
  icon: any;
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
  // Using 'any' temporarily to support the incoming flat Firebase object 
  // Update your '@/types' Teacher interface to include 'uid' and 'username' later
  const [teacher, setTeacher] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [sf10Records, setSf10Records] = useState<SF10Record[]>([]);
  const [contributions, setContributions] = useState<MonthlyContribution[]>([]);
  const [summary, setSummary] = useState<{ totalCollected: number; totalExpected: number; collectionRate: number } | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('');
  const [availableSchoolYears, setAvailableSchoolYears] = useState<string[]>([]);

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
        // Supports both legacy nested structure and new flat Firebase structure
        const teacherData = parsed?.teacher || parsed;
        setTeacher(teacherData);

        // Uses Firebase uid or legacy id
        const teacherId = teacherData?.uid || teacherData?.id;
        const year = new Date().getFullYear().toString();
        const currentSchoolYear = `${year}-${(parseInt(year) + 1).toString()}`;

        if (!teacherId) {
          setLoadError('Missing teacher session. Please login again.');
          setIsLoading(false);
          return;
        }

        // Real-time: Only students belonging to this teacher
        const studentsQ = query(collection(db, 'students'), where('teacherId', '==', teacherId));
        const unsubStudents = onSnapshot(
          studentsQ,
          (snap) => {
            const next = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
            setStudents(Array.isArray(next) ? next : []);
          },
          () => {
            setLoadError('Some dashboard data could not be loaded.');
          }
        );

        // Fetch available school years first (like SF10 list page)
        const gradesRes = await fetch('/api/teacher/grades/student?studentId=all', {
          headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
        });
        
        const schoolYearsSet = new Set<string>();
        if (gradesRes.ok) {
          const gradesData = await gradesRes.json();
          gradesData.forEach((g: any) => {
            if (g.schoolYear) schoolYearsSet.add(g.schoolYear);
          });
        }
        
        // Add current school year if not present
        schoolYearsSet.add(currentSchoolYear);
        
        const schoolYears = Array.from(schoolYearsSet).sort().reverse(); // Most recent first
        setAvailableSchoolYears(schoolYears);
        
        // Use the most recent school year for dashboard
        const dashboardSchoolYear = schoolYears[0] || currentSchoolYear;
        setSelectedSchoolYear(dashboardSchoolYear);

        // Fetch SF10 records from API with the correct school year and contributions summary
        const [sf10Res, contributionsRes, summaryRes] = await Promise.all([
          fetch(`/api/teacher/sf10?schoolYear=${encodeURIComponent(dashboardSchoolYear)}`, {
            headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
          }),
          fetch('/api/contributions?scope=school', {
            headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
          }),
          fetch(`/api/contributions/summary?year=${encodeURIComponent(year)}&scope=school`, {
            headers: { Authorization: `Bearer ${encodeURIComponent(teacherId)}` },
          }),
        ]);

        if (!sf10Res.ok) throw new Error('Failed to load SF10 records');
        if (!contributionsRes.ok) throw new Error('Failed to load contributions');
        if (!summaryRes.ok) throw new Error('Failed to load contribution summary');

        const [sf10Json, contributionsJson, summaryJson] = await Promise.all([
          sf10Res.json(),
          contributionsRes.json(),
          summaryRes.json(),
        ]);

        // SF10 API returns { sf10Records: [...] }
        const sf10Data = sf10Json.sf10Records || [];
        setSf10Records(sf10Data);
        setContributions(Array.isArray(contributionsJson) ? contributionsJson : []);
        setSummary({
          totalCollected: Number(summaryJson?.totalCollected ?? 0),
          totalExpected: Number(summaryJson?.totalExpected ?? 0),
          collectionRate: Number(summaryJson?.collectionRate ?? 0),
        });
        setIsActivityLoading(false);
        setLoadError(null);

        // Stop blocking UI: layout renders immediately; data streams in.
        setIsLoading(false);

        return () => {
          unsubStudents();
        };
      } catch {
        setLoadError('Some dashboard data could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    const cleanupPromise = run();
    return () => {
      // If run() returned a cleanup function (after teacherId resolved), call it.
      if (typeof (cleanupPromise as any) === 'function') {
        (cleanupPromise as any)();
      }
    };
  }, [router]);

  const metrics = useMemo(() => {
    const totalStudents = students.length;
    const totalSf10 = sf10Records.length;

    // Use summary data from API (same as contributions page with scope=school)
    const totalExpected = summary?.totalExpected || 0;
    const totalCollected = summary?.totalCollected || 0;
    const collectionRate = summary?.collectionRate 
      ? Math.round(summary.collectionRate) 
      : (totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0);

    return { totalStudents, totalSf10, totalExpected, totalCollected, collectionRate };
  }, [students, sf10Records, summary]);

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
        icon: () => <span className="text-[12px] font-extrabold text-green-600">₱</span>,
        color: 'text-green-500',
        bg: 'bg-green-50',
      };
    });

    return [...sf10Items, ...contributionItems]
      .filter((x) => x.timestamp > 0)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6);
  }, [sf10Records, contributions]);

  return (
    <TeacherLayout title="Dashboard" subtitle={`Welcome back, ${teacher?.username || teacher?.name || 'Teacher'}!`}>
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
        {/* Total Students Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 border-l-[6px] border-l-blue-500 p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group cursor-pointer">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full scale-[2] group-hover:scale-[2.5] transition-transform duration-700 ease-out"></div>
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-100 rounded-full opacity-20 scale-[1.5] group-hover:opacity-30 group-hover:scale-[2] transition-all duration-500 delay-100"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1 uppercase tracking-wider transition-colors">Total Students</p>
              <h3 className="text-3xl font-extrabold text-gray-900 transition-transform origin-left">{metrics.totalStudents}</h3>
            </div>
            <div className="p-0 bg-white rounded-lg shadow-sm border border-gray-50 hover:shadow-md transition-all duration-300 overflow-hidden">
              <img src="/images/DashboardIcon/StudentIcon.jpg" alt="Students" className="w-12 h-12 object-cover rounded-lg" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center text-sm">
            <div className="flex items-center bg-blue-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-4 h-4 text-blue-500 mr-1 group-hover:animate-pulse" />
              <span className="text-blue-600 font-medium">Roster snapshot</span>
            </div>
          </div>
        </div>

        {/* SF10 Records Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 border-l-[6px] border-l-purple-500 p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group cursor-pointer">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full scale-[2] group-hover:scale-[2.5] transition-transform duration-700 ease-out"></div>
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-100 rounded-full opacity-20 scale-[1.5] group-hover:opacity-30 group-hover:scale-[2] transition-all duration-500 delay-100"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1 uppercase tracking-wider transition-colors">SF10 Records</p>
              <h3 className="text-3xl font-extrabold text-gray-900 transition-transform origin-left">{metrics.totalSf10}</h3>
            </div>
            <div className="p-0 bg-white rounded-lg shadow-sm border border-gray-50 hover:shadow-md transition-all duration-300 overflow-hidden">
              <img src="/images/DashboardIcon/SF10Icon.jpg" alt="SF10 Records" className="w-12 h-12 object-cover rounded-lg" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center text-sm">
            <div className="flex items-center bg-purple-50 px-2 py-1 rounded-full">
              <FileText className="w-4 h-4 text-purple-500 mr-1 group-hover:animate-pulse" />
              <span className="text-purple-600 font-medium">Available in system</span>
            </div>
          </div>
        </div>

        {/* Collection Rate Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 border-l-[6px] border-l-green-500 p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group cursor-pointer">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full scale-[2] group-hover:scale-[2.5] transition-transform duration-700 ease-out"></div>
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-100 rounded-full opacity-20 scale-[1.5] group-hover:opacity-30 group-hover:scale-[2] transition-all duration-500 delay-100"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1 uppercase tracking-wider transition-colors">Collection Rate</p>
              <h3 className="text-3xl font-extrabold text-gray-900 transition-transform origin-left">{metrics.collectionRate}%</h3>
            </div>
            <div className="p-0 bg-white rounded-lg shadow-sm border border-gray-50 hover:shadow-md transition-all duration-300 overflow-hidden">
              <img src="/images/DashboardIcon/CollectionRateIcon.jpg" alt="Collection Rate" className="w-12 h-12 object-cover rounded-lg" />
            </div>
          </div>
          <div className="relative z-10 mt-4 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${metrics.collectionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Collected Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 border-l-[6px] border-l-yellow-500 p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group cursor-pointer">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-50 rounded-full scale-[2] group-hover:scale-[2.5] transition-transform duration-700 ease-out"></div>
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-100 rounded-full opacity-20 scale-[1.5] group-hover:opacity-30 group-hover:scale-[2] transition-all duration-500 delay-100"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-yellow-600 mb-1 uppercase tracking-wider transition-colors">Collected</p>
              <h3 className="text-2xl font-extrabold text-gray-900 transition-transform origin-left">₱{metrics.totalCollected.toLocaleString()}</h3>
            </div>
            <div className="p-0 bg-white rounded-lg shadow-sm border border-gray-50 hover:shadow-md transition-all duration-300 overflow-hidden">
              <img src="/images/DashboardIcon/GrowthIcon.jpg" alt="Collected" className="w-12 h-12 object-cover rounded-lg" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center text-sm">
            <span className="text-yellow-600 font-medium">Expected: ₱{metrics.totalExpected.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-gradient-to-r from-[#1B3E2A] to-[#2d5a3f]">
              <h3 className="text-lg font-semibold text-black">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-3">
              <button
                onClick={() => router.push('/teacher/grades/input')}
                className="w-full flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <div className="p-2 bg-white rounded-md shadow-sm mr-3 relative z-10">
                  <School className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left flex-1 relative z-10">
                  <p className="font-semibold text-gray-900">Input Grades</p>
                  <p className="text-xs text-gray-500">Enter student grades</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all relative z-10" />
              </button>

              <button
                onClick={() => router.push('/teacher/sf10/list')}
                className="w-full flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <div className="p-2 bg-white rounded-md shadow-sm mr-3 relative z-10">
                  <FileText className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left flex-1 relative z-10">
                  <p className="font-semibold text-gray-900">View SF10</p>
                  <p className="text-xs text-gray-500">Browse student forms</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all relative z-10" />
              </button>

              <button
                onClick={() => router.push('/teacher/contributions')}
                className="w-full flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <div className="p-2 bg-white rounded-md shadow-sm mr-3 relative z-10">
                  <PlusCircle className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left flex-1 relative z-10">
                  <p className="font-semibold text-gray-900">Record Payment</p>
                  <p className="text-xs text-gray-500">Manage contributions</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all relative z-10" />
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
              {isActivityLoading ? (
                <ActivitySkeleton />
              ) : (
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
                            {typeof activity.icon === 'function' ? (
                              <activity.icon className={`w-3 h-3 ${activity.color}`} />
                            ) : (
                              activity.icon
                            )}
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
              )}
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}