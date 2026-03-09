'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, GraduationCap, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Montserrat } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!credentials.email || !credentials.password) {
      setError('Please fill in all fields.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setError('Please enter a valid email address (missing @ or domain).');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (credentials.role === 'teacher') {
        const response = await fetch('/api/portal/auth/teacher/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          setError(data?.message || 'Invalid email or password');
          return;
        }

        // The API sets an httpOnly cookie (teacherSession) used by middleware.
        // We also keep a localStorage copy for client-side pages/components.
        if (data?.session) {
          localStorage.setItem('teacherSession', JSON.stringify(data.session));
        } else if (data?.teacher) {
          localStorage.setItem('teacherSession', JSON.stringify({ teacher: data.teacher }));
        }

        router.push('/teacher/dashboard');
        return;
      }

      const endpoint = '/api/principal/auth/login';

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
        localStorage.setItem('principalSession', JSON.stringify(data));
        router.push('/principal/dashboard');
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
    <div className={`min-h-screen w-full flex bg-white font-sans text-slate-900 ${montserrat.className}`}>
      
      {/* Left Side: Branding & Image */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 lg:p-16"
        style={{ backgroundColor: '#0a241a' }}
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/storm/_DSC7078.jpg" 
            alt="Students in classroom" 
            className="w-full h-full object-cover opacity-40"
          />
          {/* Lessened opacity to show more of the background photo as requested */}
          <div 
            className="absolute inset-0 z-10" 
            style={{ backgroundColor: '#0a241a', opacity: 0.6 }}
          ></div>
        </div>

        {/* Top Logo */}
        <div className="relative z-20 flex items-center gap-4">
          <div className="bg-white p-2.5 rounded-xl shadow-lg flex items-center justify-center">
            <GraduationCap className="w-7 h-7" style={{ color: '#0a241a' }} strokeWidth={2.5} />
          </div>
          <span className="text-white text-2xl font-bold tracking-tight">Papaya Academy</span>
        </div>

        {/* Middle Content */}
        <div className="relative z-10 max-w-lg mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Empowering futures through education and community support.
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: '#CBD5DE' }}>
            Access the Papaya Web Application portal to manage student progress, track sponsor donations, and oversee academy operations.
          </p>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 flex items-center gap-2 text-sm">
          <ShieldCheck className="w-4 h-4" style={{ color: '#CBD5DE' }} />
          <span style={{ color: '#CBD5DE' }}>Secure Enterprise Portal &copy; 2026 Papaya Academy, Inc.</span>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div 
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16"
        style={{ backgroundColor: '#fcfcfc' }}
      >
        <div className="w-full max-w-md bg-transparent">
          {/* Back Button */}
          <motion.button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm transition-colors mb-8 group"
            style={{ color: '#475569' }}
            aria-label="Go back"
            whileHover="hover"
            initial="initial"
          >
            <motion.div
              variants={{
                initial: { x: 0 },
                hover: { x: -6 }
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.div>
            <motion.span
              variants={{
                initial: { color: '#475569' },
                hover: { color: '#1a3828' }
              }}
            >
              Back
            </motion.span>
          </motion.button>

          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2" style={{ color: '#0a192f' }}>Welcome back</h2>
            <p className="text-base" style={{ color: '#475569' }}>Please enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold" style={{ color: '#1e293b' }}>Select Portal Role</label>
              <div className="flex p-1 rounded-xl border relative" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                {/* Sliding background */}
                <motion.div
                  className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm border"
                  style={{ 
                    width: 'calc(50% - 4px)',
                    borderColor: '#e2e8f0',
                    left: credentials.role === 'teacher' ? '4px' : 'calc(50% + 0px)'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button
                  type="button"
                  onClick={() => setCredentials(prev => ({ ...prev, role: 'teacher' }))}
                  className="flex-1 py-3 text-sm font-bold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 relative z-10"
                  style={{ color: credentials.role === 'teacher' ? '#0f172a' : '#64748b' }}
                >
                  <GraduationCap className="w-4 h-4" />
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => setCredentials(prev => ({ ...prev, role: 'principal' }))}
                  className="flex-1 py-3 text-sm font-bold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 relative z-10"
                  style={{ color: credentials.role === 'principal' ? '#0f172a' : '#64748b' }}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Principal
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-3 relative">
              <motion.div
                className="absolute pointer-events-none z-20 flex items-center gap-2"
                initial={false}
                animate={{
                  top: (focusedInput === 'email' || credentials.email) ? -10 : 16,
                  left: (focusedInput === 'email' || credentials.email) ? 4 : 16,
                  scale: (focusedInput === 'email' || credentials.email) ? 0.85 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Mail 
                  className="h-5 w-5" 
                  style={{ color: (focusedInput === 'email') ? '#1b4332' : '#94a3b8', backgroundColor: '#ffffff' }} 
                />
                {(focusedInput === 'email' || credentials.email) && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs font-bold px-1"
                    style={{ color: '#1b4332', backgroundColor: '#ffffff' }}
                  >
                    Email Address
                  </motion.span>
                )}
              </motion.div>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  value={credentials.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  className="block w-full pl-12 pr-4 py-4 border rounded-xl outline-none text-base transition-colors"
                  style={{ backgroundColor: '#ffffff', borderColor: focusedInput === 'email' ? '#1b4332' : '#e2e8f0', color: '#0f172a' }}
                  placeholder={focusedInput === 'email' ? '' : (credentials.role === 'teacher' ? 'test@teacher.papaya.edu' : 'test@principal.papaya.edu')}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-3 relative">
              <div className="relative mt-4">
                <motion.div
                  className="absolute pointer-events-none z-20"
                  initial={false}
                  animate={{
                    top: (focusedInput === 'password' || credentials.password) ? -10 : 16,
                    left: (focusedInput === 'password' || credentials.password) ? 4 : 16,
                    scale: (focusedInput === 'password' || credentials.password) ? 0.85 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <div className="flex items-center gap-2">
                    <Lock 
                      className="h-5 w-5" 
                      style={{ color: (focusedInput === 'password') ? '#1b4332' : '#94a3b8', backgroundColor: '#ffffff' }} 
                    />
                    {(focusedInput === 'password' || credentials.password) && (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs font-bold px-1"
                        style={{ color: '#1b4332', backgroundColor: '#ffffff' }}
                      >
                        Password
                      </motion.span>
                    )}
                  </div>
                </motion.div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={credentials.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  className="block w-full pl-12 pr-12 py-4 border rounded-xl outline-none text-base transition-colors"
                  style={{ backgroundColor: '#ffffff', borderColor: focusedInput === 'password' ? '#1b4332' : '#e2e8f0', color: '#0f172a' }}
                  placeholder={focusedInput === 'password' ? '' : "Enter your password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center focus:outline-none z-20"
                  style={{ color: '#94a3b8' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={showPassword ? 'eye-off' : 'eye-on'}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm border font-medium" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              whileHover="hover"
              initial="initial"
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl text-base font-bold text-white disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-sm"
              style={{ backgroundColor: '#1a3828' }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center"
                  >
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </motion.div>
                ) : (
                  <motion.span
                    key="text"
                    variants={{
                      initial: { scale: 1 },
                      hover: { scale: 1.05 }
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {`Sign in as ${credentials.role === 'teacher' ? 'Teacher' : 'Principal'}`}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}