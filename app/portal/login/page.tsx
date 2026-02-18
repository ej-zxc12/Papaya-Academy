'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, User, Lock, GraduationCap, ChevronDown, Check, ArrowLeft } from 'lucide-react';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export default function UnifiedPortalLogin() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    role: 'teacher'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Custom Dropdown State
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Button Animation State
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRoleOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRoleSelect = (roleValue: 'teacher' | 'principal') => {
    setCredentials(prev => ({ ...prev, role: roleValue }));
    setIsRoleOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = credentials.role === 'teacher' 
        ? '/api/teacher/auth/login' 
        : '/api/principal/auth/login';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (credentials.role === 'teacher') {
          localStorage.setItem('teacherSession', JSON.stringify(data));
          router.push('/teacher/dashboard');
        } else {
          localStorage.setItem('principalSession', JSON.stringify(data));
          router.push('/principal/dashboard');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#1B3E2A] to-green-900 flex items-center justify-center p-4 ${montserrat.className}`}>
      {/* Added 'relative' here to position the back button absolutely within the card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-100 animate-in fade-in zoom-in duration-500 relative">
        
        {/* NEW: Modern Back Button */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-6 left-6 p-2 text-gray-400 hover:text-[#1B3E2A] hover:bg-[#1B3E2A]/5 rounded-full transition-all duration-300 flex items-center gap-2 group z-50"
          aria-label="Back to website"
        >
          <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="text-sm font-medium max-w-0 overflow-hidden group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out whitespace-nowrap">
            Back to Website
          </span>
        </button>

        {/* Header Section */}
        <div className="text-center mb-8 mt-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#F2C94C]/20 rounded-full mb-4 shadow-inner animate-bounce-slow">
            <GraduationCap className="w-10 h-10 text-[#1B3E2A]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#1B3E2A] tracking-tight">Papaya Academy Portal</h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* CUSTOM DROPDOWN */}
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100 fill-mode-backwards relative z-20" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">
              SELECT ROLE
            </label>
            
            <div className="relative group">
              <button
                type="button"
                onClick={() => setIsRoleOpen(!isRoleOpen)}
                className={`w-full px-4 py-3 border rounded-lg outline-none bg-gray-50 font-medium text-gray-700 text-left flex justify-between items-center transition-all duration-300 ease-in-out hover:border-[#1B3E2A]/50 ${
                  isRoleOpen 
                    ? 'border-[#1B3E2A] bg-white ring-2 ring-[#1B3E2A]/20 scale-[1.02] shadow-lg' 
                    : 'border-gray-200'
                }`}
              >
                <span className="capitalize">{credentials.role}</span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${isRoleOpen ? 'rotate-180 text-[#1B3E2A]' : ''}`} />
              </button>

              <div 
                className={`absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden transition-all duration-300 origin-top ${
                  isRoleOpen 
                    ? 'opacity-100 translate-y-0 scale-100 visible' 
                    : 'opacity-0 -translate-y-2 scale-95 invisible'
                }`}
              >
                {(['teacher', 'principal'] as const).map((role) => (
                  <div
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors duration-200 hover:bg-[#1B3E2A]/5 group-hover:bg-gray-50 ${
                      credentials.role === role ? 'bg-[#1B3E2A]/10 text-[#1B3E2A] font-medium' : 'text-gray-600'
                    }`}
                  >
                    <span className="capitalize">{role}</span>
                    {credentials.role === role && (
                      <Check className="h-4 w-4 text-[#1B3E2A] animate-in zoom-in duration-200" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Email Input */}
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200 fill-mode-backwards relative z-10">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">
              EMAIL ADDRESS
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-[#1B3E2A]/60 transition-colors duration-300 group-focus-within:text-[#1B3E2A]" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg outline-none transition-all duration-300 ease-in-out bg-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-[#1B3E2A]/20 focus:border-[#1B3E2A] focus:bg-white focus:scale-[1.02] focus:shadow-lg hover:border-[#1B3E2A]/50"
                placeholder={credentials.role === 'teacher' ? 'test@papaya.edu' : 'principal@papaya.edu'}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 fill-mode-backwards relative z-0">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">
              PASSWORD
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#1B3E2A]/60 transition-colors duration-300 group-focus-within:text-[#1B3E2A]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg outline-none transition-all duration-300 ease-in-out bg-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-[#1B3E2A]/20 focus:border-[#1B3E2A] focus:bg-white focus:scale-[1.02] focus:shadow-lg hover:border-[#1B3E2A]/50"
                placeholder="Enter your password"
                required
              />
              
              {/* ANIMATED EYE ICON BUTTON */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center w-10 transition-transform duration-200 active:scale-95 group/eye"
              >
                <div className="relative w-5 h-5">
                   {/* Icon 1: Eye (Open) - Shows when Text is visible (showPassword=true) */}
                   <Eye 
                     className={`absolute inset-0 w-5 h-5 text-gray-400 group-hover/eye:text-[#1B3E2A] transition-all duration-500 ease-in-out ${
                       showPassword 
                         ? 'opacity-100 rotate-0 scale-100' 
                         : 'opacity-0 -rotate-180 scale-50'
                     }`} 
                   />
                   
                   {/* Icon 2: EyeOff (Crossed) - Shows when Text is hidden (showPassword=false) */}
                   <EyeOff 
                     className={`absolute inset-0 w-5 h-5 text-gray-400 group-hover/eye:text-[#1B3E2A] transition-all duration-500 ease-in-out ${
                       !showPassword 
                         ? 'opacity-100 rotate-0 scale-100' 
                         : 'opacity-0 rotate-180 scale-50'
                     }`} 
                   />
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm animate-pulse">
              {error}
            </div>
          )}

          {/* Button */}
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-500 fill-mode-backwards">
            <button
              type="submit"
              disabled={isLoading}
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              className="w-full py-3.5 px-4 rounded-lg font-semibold text-sm tracking-widest border border-[#1B3E2A] border-b-4 shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed transform active:translate-y-1 active:border-b-0"
              style={{
                backgroundImage: 'linear-gradient(to top, #F2C94C 50%, #1B3E2A 50%)',
                backgroundSize: '100% 200%',
                backgroundPosition: isBtnHovered ? 'bottom' : 'top',
                color: isBtnHovered ? '#1B3E2A' : '#FFFFFF',
              }}
            >
              {isLoading ? (
                <>
                  <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${isBtnHovered ? 'border-[#1B3E2A]' : 'border-white'}`}></div>
                  SIGNING IN...
                </>
              ) : (
                <>
                  <LogIn className={`w-4 h-4 transition-transform duration-300 ${isBtnHovered ? 'translate-x-1' : ''}`} />
                  SIGN IN AS {credentials.role === 'teacher' ? 'TEACHER' : 'PRINCIPAL'}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center animate-in fade-in duration-1000 delay-700">
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            Protected Area • Papaya Academy, Inc.
          </p>
        </div>
      </div>
    </div>
  );
}