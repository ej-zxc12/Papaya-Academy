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

  useEffect(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    setIsCollapsed(stored === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isCollapsed));
  }, [isCollapsed]);

  const toggleDesktopSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
  };

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
      
      {/* Mobile menu button - Hidden when sidebar is open */}
      <div className={`lg:hidden fixed top-6 left-6 z-50 transition-opacity duration-300 ${sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-50"
        >
          <Menu className="w-5 h-5 text-[#1B3E2A]" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 bg-white shadow-xl lg:shadow-md transform transition-all duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} 
        w-64
      `}>
        <div className={`flex flex-col h-full transition-all duration-300 ${isCollapsed ? 'p-4 items-center' : 'p-6'}`}>
          
          {/* Header Section */}
          <div className="flex flex-col w-full mb-8">
            
            {/* Logo and Portal Title Row */}
            <div className={`flex items-center w-full transition-all duration-300 ${isCollapsed ? 'justify-center mb-0' : 'justify-between mb-6'}`}>
              
              {/* Title and Icon */}
              <div className={`flex items-center overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>
                <div className="shrink-0 inline-flex items-center justify-center bg-[#F2C94C]/20 rounded-full w-10 h-10">
                  <GraduationCap className="w-5 h-5 text-[#1B3E2A]" />
                </div>
                <div className="whitespace-nowrap overflow-hidden ml-3">
                  <h1 className="text-[15px] font-semibold tracking-wide text-[#1B3E2A]">Teacher Portal</h1>
                  {isLoading ? (
                     <SkeletonText className="h-3 w-16 mt-1" />
                  ) : (
                     <p className="text-xs text-gray-500">Grade {teacher?.gradeLevel}</p>
                  )}
                </div>
              </div>

              {/* Desktop Toggle Button */}
              <button
                onClick={toggleDesktopSidebar}
                className="hidden lg:flex p-1.5 bg-white rounded-md shadow-sm hover:shadow-md transition-all border border-gray-100 items-center justify-center shrink-0"
              >
                {isCollapsed ? <Menu className="w-5 h-5 text-[#1B3E2A]" /> : <X className="w-5 h-5 text-[#1B3E2A]" />}
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex items-center justify-center shrink-0"
              >
                <X className="w-5 h-5 text-[#1B3E2A]" />
              </button>
            </div>

            {/* Flat User Greeting Profile */}
            <div className={`transition-all duration-300 overflow-hidden w-full ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
              <div className="px-2 w-full">
                {isLoading ? (
                  <div className="space-y-2">
                    <SkeletonText className="h-3 w-20" />
                    <SkeletonText className="h-5 w-32" />
                  </div>
                ) : (
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Welcome back,</span>
                    <span className="text-[15px] font-bold text-[#1B3E2A] truncate mt-0.5 whitespace-nowrap">
                      {teacher?.name || 'Juan Dela Cruz'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-3 w-full">
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
                    w-full flex items-center rounded-md font-semibold text-xs tracking-normal overflow-hidden
                    transition-all duration-300 ease-in-out
                    ${isCollapsed ? 'justify-center p-3 h-12' : 'px-4 py-3 h-11'}
                  `}
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #1B3E2A 50%, transparent 50%)',
                    backgroundSize: '200% 100%',
                    backgroundPosition: isInteract ? '0%' : '100%',
                    color: isInteract ? '#F2C94C' : '#1B3E2A', 
                  }}
                >
                  <Icon 
                    className={`
                      shrink-0 transition-transform duration-300
                      ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}
                      ${isInteract ? 'scale-110' : ''}
                    `} 
                  />
                  <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-2'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Footer Area: Logout */}
          <div className="mt-auto pt-5 border-t border-gray-100 w-full overflow-hidden">
            <button
              onClick={handleLogout}
              onMouseEnter={() => setHoveredItem('logout')}
              onMouseLeave={() => setHoveredItem(null)}
              className={`
                w-full flex items-center rounded-lg font-medium text-sm
                transition-all duration-300 ease-in-out
                ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'}
              `}
              style={{
                backgroundImage: 'linear-gradient(90deg, #ef4444 50%, transparent 50%)',
                backgroundSize: '200% 100%',
                backgroundPosition: hoveredItem === 'logout' ? '0%' : '100%',
                color: hoveredItem === 'logout' ? '#ffffff' : '#ef4444',
              }}
              title={isCollapsed ? 'Logout' : ''}
            >
              <LogOut className={`shrink-0 transition-all duration-300 ${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'}`} />
              <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[100px] opacity-100 ml-2'}`}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
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