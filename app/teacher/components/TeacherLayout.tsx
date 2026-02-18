'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Teacher } from '@/types';
import { 
  Home,
  School,
  FilePlus,
  Eye,
  Table,
  DollarSign,
  Menu,
  X,
  LogOut,
  GraduationCap
} from 'lucide-react';

// --- Skeleton Components ---
const SkeletonText = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

const PageSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-32 bg-gray-200 rounded-xl"></div>
      <div className="h-32 bg-gray-200 rounded-xl"></div>
      <div className="h-32 bg-gray-200 rounded-xl"></div>
    </div>
    <div className="h-64 bg-gray-200 rounded-xl mt-6"></div>
  </div>
);

interface TeacherLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function TeacherLayout({ children, title, subtitle }: TeacherLayoutProps) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = () => {
      const session = localStorage.getItem('teacherSession');
      if (session) {
        setTeacher(JSON.parse(session));
        setTimeout(() => setIsLoading(false), 500); 
      } else {
        router.push('/teacher/login');
      }
    };
    checkSession();
  }, [router]);

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/teacher/dashboard' },
    { icon: School, label: 'Input Grades', href: '/teacher/grades/input' },
    { icon: FilePlus, label: 'Create SF10', href: '/teacher/sf10/create' },
    { icon: Eye, label: 'View SF10', href: '/teacher/sf10/list' },
    { icon: Table, label: 'Class Records', href: '/teacher/grades/view' },
    { icon: DollarSign, label: 'Contributions', href: '/teacher/contributions' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('teacherSession');
    router.push('/teacher/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      
      {/* Desktop sidebar toggle - Shifted right for better margin */}
      <div className={`hidden lg:flex fixed top-6 z-50 transition-all duration-300 ${isCollapsed ? 'left-8' : 'left-[234px]'}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex items-center justify-center"
        >
          {isCollapsed ? <Menu className="w-4 h-4 text-[#1B3E2A]" /> : <X className="w-4 h-4 text-[#1B3E2A]" />}
        </button>
      </div>

      {/* Mobile menu button - Increased margin from edge */}
      <div className="lg:hidden fixed top-6 left-6 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-50"
        >
          {sidebarOpen ? <X className="w-5 h-5 text-[#1B3E2A]" /> : <Menu className="w-5 h-5 text-[#1B3E2A]" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 bg-white shadow-xl lg:shadow-md transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} 
        w-64 flex flex-col
      `}>
        <div className={`flex flex-col h-full ${isCollapsed ? 'items-center py-8' : 'p-6'}`}>
          
          {/* Header / Logo */}
          <div className={`flex items-center mb-10 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className={`shrink-0 inline-flex items-center justify-center bg-[#F2C94C]/20 rounded-full transition-all duration-300 w-10 h-10 ${isCollapsed ? '' : 'mr-3'}`}>
              <GraduationCap className="w-5 h-5 text-[#1B3E2A]" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="text-xl font-bold text-[#1B3E2A]">Teacher Portal</h1>
                {isLoading ? (
                   <SkeletonText className="h-4 w-20 mt-1" />
                ) : (
                   <p className="text-sm text-gray-500">Grade {teacher?.gradeLevel}</p>
                )}
              </div>
            )}
          </div>

          {/* User Info */}
          {!isCollapsed && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
              {isLoading ? (
                <>
                  <SkeletonText className="h-4 w-24 mb-2" />
                  <SkeletonText className="h-3 w-32" />
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-900 truncate">{teacher?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{teacher?.email}</p>
                </>
              )}
            </div>
          )}

          {/* Navigation Items */}
          <nav className={`flex-1 space-y-3 ${isCollapsed ? 'w-full px-3' : 'w-full'}`}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              const isHovered = hoveredItem === item.href;
              const isInteract = isActive || isHovered;

              return (
                <button
                  key={item.href}
                  onClick={() => {
                    if (pathname !== item.href) {
                      router.push(item.href);
                    }
                    setSidebarOpen(false);
                  }}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={isCollapsed ? item.label : ''}
                  className={`
                    w-full flex items-center rounded-md font-semibold text-xs tracking-normal
                    border border-[#1B3E2A] border-b-2 shadow-sm 
                    transition-all duration-500 ease-in-out
                    ${isCollapsed ? 'justify-center p-3 h-12' : 'px-4 py-3 gap-2 h-11'}
                  `}
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #1B3E2A 50%, transparent 50%)',
                    backgroundSize: '200% 100%',
                    backgroundPosition: isInteract ? '0%' : '100%',
                    color: isInteract ? '#F2C94C' : '#1B3E2A', 
                    borderColor: '#1B3E2A',
                    boxShadow: isInteract ? '0 4px 12px rgba(27, 62, 42, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  <Icon 
                    className={`
                      transition-transform duration-500
                      ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}
                      ${isInteract ? 'scale-110' : ''}
                    `} 
                  />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className={`mt-auto pt-6 border-t border-gray-100 ${isCollapsed ? 'w-full px-3' : 'w-full'}`}>
            <button
              onClick={handleLogout}
              onMouseEnter={() => setHoveredItem('logout')}
              onMouseLeave={() => setHoveredItem(null)}
              className={`
                w-full flex items-center rounded-lg font-medium text-sm
                border-2 border-red-500/20 shadow-sm
                transition-all duration-500 ease-in-out
                ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-2'}
              `}
              style={{
                backgroundImage: 'linear-gradient(90deg, #ef4444 50%, transparent 50%)',
                backgroundSize: '200% 100%',
                backgroundPosition: hoveredItem === 'logout' ? '0%' : '100%',
                color: hoveredItem === 'logout' ? '#ffffff' : '#ef4444',
                borderColor: '#ef4444',
              }}
              title={isCollapsed ? 'Logout' : ''}
            >
              <LogOut className={`transition-all duration-500 ${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'}`} />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-8 transition-all duration-300 overflow-y-auto h-screen">
        <div className="h-10 lg:hidden"></div> {/* Mobile header spacer */}
        
        {isLoading ? (
          <PageSkeleton />
        ) : (
          <div className="animate-in fade-in duration-500">
            {(title || subtitle) && (
              <div className="mb-6">
                {title && <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>}
                {subtitle && <p className="text-gray-500">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>
        )}
      </main>
    </div>
  );
}