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

interface TeacherLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function TeacherLayout({ children, title, subtitle }: TeacherLayoutProps) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const session = localStorage.getItem('teacherSession');
    if (session) {
      const teacherData = JSON.parse(session);
      setTeacher(teacherData);
    } else {
      router.push('/teacher/login');
    }
  }, [router]);

  const menuItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      href: '/teacher/dashboard',
      active: pathname === '/teacher/dashboard'
    },
    { 
      icon: School, 
      label: 'Input Grades', 
      href: '/teacher/grades/input',
      active: pathname === '/teacher/grades/input'
    },
    { 
      icon: FilePlus, 
      label: 'Create SF10', 
      href: '/teacher/sf10/create',
      active: pathname === '/teacher/sf10/create'
    },
    { 
      icon: Eye, 
      label: 'View SF10', 
      href: '/teacher/sf10/list',
      active: pathname === '/teacher/sf10/list'
    },
    { 
      icon: Table, 
      label: 'Class Records', 
      href: '/teacher/grades/view',
      active: pathname === '/teacher/grades/view'
    },
    { 
      icon: DollarSign, 
      label: 'Contributions', 
      href: '/teacher/contributions',
      active: pathname === '/teacher/contributions'
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('teacherSession');
    router.push('/teacher/login');
  };

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B3E2A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      {/* Desktop sidebar toggle button */}
      <div className="hidden lg:flex fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          {isCollapsed ? <Menu className="w-6 h-6 text-[#1B3E2A]" /> : <X className="w-6 h-6 text-[#1B3E2A]" />}
        </button>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          {sidebarOpen ? <X className="w-6 h-6 text-[#1B3E2A]" /> : <Menu className="w-6 h-6 text-[#1B3E2A]" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 bg-white shadow-md transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64
      `}>
        <div className={`p-6 ${isCollapsed ? 'lg:p-4' : ''}`}>
          <div className={`flex items-center mb-6 ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="inline-flex items-center justify-center w-10 h-10 bg-[#F2C94C]/20 rounded-full mr-3">
              <GraduationCap className="w-5 h-5 text-[#1B3E2A]" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-[#1B3E2A]">Teacher Portal</h1>
                <p className="text-sm text-gray-500">Grade {teacher.gradeLevel}</p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700">{teacher.name}</p>
              <p className="text-xs text-gray-500">{teacher.email}</p>
            </div>
          )}

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center p-3 rounded-lg transition-colors duration-200 font-medium text-sm
                    ${isCollapsed ? 'lg:justify-center' : ''}
                    ${item.active 
                      ? 'bg-[#F2C94C]/20 text-[#1B3E2A]' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {!isCollapsed && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center p-3 rounded-lg transition-colors duration-200 font-medium text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          )}
          {isCollapsed && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-3 rounded-lg transition-colors duration-200 font-medium text-sm text-red-600 hover:bg-red-50"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`flex-1 p-8 transition-all duration-300 ${isCollapsed ? 'lg:ml-0' : 'lg:ml-0'}`}>
        {(title || subtitle) && (
          <div className="mb-6">
            {title && <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>}
            {subtitle && <p className="text-gray-500">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
