'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrincipalCredentials } from '@/types';
import { Eye, EyeOff, LogIn, User, Lock, Shield, GraduationCap } from 'lucide-react';

export default function PrincipalLogin() {
  const [credentials, setCredentials] = useState<PrincipalCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/principal/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
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
    <div className="min-h-screen bg-gradient-to-br from-[#1B3E2A] to-[#2d5a3f] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F2C94C]/20 rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-[#1B3E2A]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Principal Portal</h1>
          <p className="text-gray-600 mt-2">Sign in to access administrative dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent outline-none transition"
                placeholder="principal@school.edu"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent outline-none transition"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1B3E2A] text-white py-2 px-4 rounded-lg hover:bg-[#2d5a3f] focus:ring-4 focus:ring-[#1B3E2A]/20 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Contact IT support for login assistance
          </p>
        </div>
      </div>
    </div>
  );
}
