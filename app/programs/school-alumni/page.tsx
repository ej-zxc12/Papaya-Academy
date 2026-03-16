"use client";

import { useEffect, useMemo, useState, useRef } from 'react';
import Image from 'next/image';
import { Montserrat } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, Search, Users, School, BookOpen, User, ChevronDown, Award, Calendar } from 'lucide-react';

import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import ScrollReveal from '../../../components/ui/ScrollReveal';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

type AlumniDoc = {
  name?: string;
  age?: number;
  batchYear?: number;
  educationalStatus?: string;
  imagePath?: string;
  imageUrl?: string;
  nameOfSchool?: string;
  programOrGrade?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type Alumni = {
  id: string;
  name: string;
  age?: number;
  batchYear?: number;
  educationalStatus?: string;
  imageUrl?: string;
  nameOfSchool?: string;
  programOrGrade?: string;
};

function normalizeName(raw: string | undefined) {
  return (raw ?? '').trim();
}

const getInitials = (name: string) => {
  const parts = name.split(',').map(part => part.trim());
  if (parts.length >= 2) {
    return `${parts[1][0]}${parts[0][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatName = (name: string) => {
  const parts = name.split(',').map(part => part.trim());
  if (parts.length >= 2) {
    return `${parts[1]} ${parts[0]}`;
  }
  return name;
};

export default function SchoolAlumniPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alumni, setAlumni] = useState<Alumni[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Use cached API endpoint instead of direct Firestore
        const res = await fetch('/api/alumni');
        if (!res.ok) throw new Error('Failed to fetch alumni');
        const rows: Alumni[] = await res.json();

        if (!mounted) return;
        setAlumni(rows);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load alumni.');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const batches = useMemo(() => {
    const years = new Set<number>();
    for (const a of alumni) {
      if (typeof a.batchYear === 'number') years.add(a.batchYear);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [alumni]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return alumni.filter((a) => {
      const matchesBatch =
        selectedBatch === 'all' ||
        (typeof a.batchYear === 'number' && String(a.batchYear) === selectedBatch);

      const matchesQuery =
        q.length === 0 ||
        a.name.toLowerCase().includes(q) ||
        (a.nameOfSchool ?? '').toLowerCase().includes(q) ||
        (a.programOrGrade ?? '').toLowerCase().includes(q) ||
        (a.educationalStatus ?? '').toLowerCase().includes(q);

      return matchesBatch && matchesQuery;
    });
  }, [alumni, searchTerm, selectedBatch]);

  return (
    <div className={`min-h-screen flex flex-col bg-white ${montserrat.className}`}>
      <Header />

      <main className="flex-grow">
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <ScrollReveal animation="fade-down" className="relative z-50">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-2 tracking-wider">
                    <GraduationCap size={18} />
                    ALUMNI NETWORK
                  </div>
                  <h1 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight">Our Graduates</h1>
                  <p className="text-gray-600 mt-2 max-w-2xl">
                    Connect with former students and see their academic progress.
                  </p>
                </div>

                <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4 relative z-50">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search name or school..."
                      className="block w-full sm:w-64 pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-papaya-green focus:border-transparent outline-none transition-shadow text-sm bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="relative w-full sm:w-48" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center justify-between w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-papaya-green transition-all duration-200 text-sm font-medium text-gray-700 relative z-50"
                    >
                      <span>
                        {selectedBatch === 'all' ? 'All Batches' : `Batch ${selectedBatch}`}
                      </span>
                      <ChevronDown 
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                      />
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 4, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute left-0 right-0 z-[100] mt-1 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden py-1"
                        >
                          <button
                            onClick={() => {
                              setSelectedBatch('all');
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              selectedBatch === 'all' 
                                ? 'bg-green-50 text-[#2f7b31] font-semibold' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            All Batches
                          </button>
                          {batches.map(batch => (
                            <button
                              key={batch}
                              onClick={() => {
                                setSelectedBatch(String(batch));
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                selectedBatch === String(batch)
                                  ? 'bg-green-50 text-[#2f7b31] font-semibold'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              Batch {batch}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <div className="mt-8">
              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                      <div className="h-24 bg-gray-200" />
                      <div className="px-6 pb-6">
                        <div className="-mt-10 flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full border-4 border-white shadow-md bg-gray-200" />
                          <div className="space-y-2">
                            <div className="h-5 w-32 bg-gray-200 rounded" />
                            <div className="h-3 w-20 bg-gray-200 rounded" />
                          </div>
                        </div>
                        <div className="mt-5 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 w-9 h-9 rounded-lg bg-gray-200" />
                            <div className="flex-1 space-y-2">
                              <div className="h-2 w-24 bg-gray-200 rounded" />
                              <div className="h-4 w-40 bg-gray-200 rounded" />
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 w-9 h-9 rounded-lg bg-gray-200" />
                            <div className="flex-1 space-y-2">
                              <div className="h-2 w-24 bg-gray-200 rounded" />
                              <div className="h-4 w-40 bg-gray-200 rounded" />
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 w-9 h-9 rounded-lg bg-gray-200" />
                            <div className="flex-1 space-y-2">
                              <div className="h-2 w-24 bg-gray-200 rounded" />
                              <div className="h-4 w-40 bg-gray-200 rounded" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-sm text-red-600">{error}</div>
              ) : filtered.length === 0 ? (
                <div className="text-sm text-gray-500">No alumni found.</div>
              ) : (
                <div className="text-sm text-green-700 mb-4">Showing {filtered.length} results</div>
              )}
            </div>

            <div className="mt-8">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`${selectedBatch}-${searchTerm}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {filtered.map((a, idx) => (
                    <motion.div
                      key={a.id}
                      layout
                      initial={{ opacity: 0, y: 18, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 18, scale: 0.98 }}
                      transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.2) }}
                      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden"
                    >
                      <div className="relative h-24" style={{ backgroundColor: '#2f7b31' }}>
                        <div className="absolute top-4 right-4 bg-green-500/30 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold tracking-wider flex items-center gap-1.5 border border-white/20">
                          <Award size={14} className="text-white" />
                          Batch {a.batchYear}
                        </div>
                      </div>

                      <div className="px-6 pb-6 relative flex-grow flex flex-col">
                        <div className="-mt-10 mb-5 relative z-10">
                          {a.imageUrl ? (
                            <Image
                              src={a.imageUrl}
                              alt={formatName(a.name)}
                              width={80}
                              height={80}
                              className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-100 text-gray-400 flex items-center justify-center shadow-md">
                              <User size={40} strokeWidth={1.5} />
                            </div>
                          )}
                        </div>

                        <div className="-mt-1 flex-grow flex flex-col">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{formatName(a.name)}</h3>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <User size={14} />
                            <span>{a.age} years old</span>
                          </div>

                          <div className="space-y-3 mt-2 flex-grow">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 bg-green-50 p-1.5 rounded-md text-green-700">
                                <School size={16} />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">School / Institution</p>
                                <p className="text-sm font-medium text-gray-800">{a.nameOfSchool || '—'}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 bg-green-50 p-1.5 rounded-md text-green-700">
                                <BookOpen size={16} />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Program / Grade</p>
                                <p className="text-sm font-medium text-gray-800">{a.programOrGrade || '—'}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 bg-green-50 p-1.5 rounded-md text-green-700">
                                <Calendar size={16} />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Status</p>
                                <p className="text-sm font-medium text-gray-800">{a.educationalStatus || '—'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
