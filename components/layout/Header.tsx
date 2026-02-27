'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import AboutDropdown from '../AboutDropdown';
import ProgramsDropdown from '../ProgramsDropdown';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export default function Header() {
  const [isHovered, setIsHovered] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className={`bg-papaya-green text-white ${montserrat.className} relative z-50`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo with Link to Home */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image 
              src="/images/papaya.jpg" 
              alt="Papaya Academy Logo" 
              width={40} 
              height={40} 
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <h1 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold tracking-wide leading-tight">Papaya Academy, Inc.</h1>
        </Link>
        
        {/* Navigation */}
        <nav className="hidden md:flex space-x-3 lg:space-x-4 xl:space-x-6 items-center flex-1 justify-center">

          <Link href="/" className="nav-link text-xs sm:text-sm md:text-base font-medium hover:text-[#F2C94C] transition-colors whitespace-nowrap">
            Home
          </Link>
          <AboutDropdown />
          <ProgramsDropdown />
          <Link href="/news" className="nav-link text-xs sm:text-sm md:text-base font-medium hover:text-[#F2C94C] transition-colors whitespace-nowrap">
            News
          </Link>
          <Link href="/contact" className="nav-link text-xs sm:text-sm md:text-base font-medium hover:text-[#F2C94C] transition-colors whitespace-nowrap">
            Contact
          </Link>
        </nav>
        
        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
          {/* Donate Button */}
          <Link href="/donate">
            <button
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="px-4 sm:px-6 lg:px-8 py-2 lg:py-2.5 rounded-md font-bold text-xs sm:text-sm tracking-widest border border-[#F2C94C] shadow-md transition-all duration-300"
              style={isClient ? {
                backgroundImage: 'linear-gradient(to top, #F2C94C 50%, #1B3E2A 50%)',
                backgroundSize: '100% 200%',
                backgroundPosition: isHovered ? 'bottom' : 'top',
                color: isHovered ? '#1B3E2A' : '#F2C94C',
              } : {
                backgroundImage: 'linear-gradient(to top, #F2C94C 50%, #1B3E2A 50%)',
                backgroundSize: '100% 200%',
                backgroundPosition: 'top',
                color: '#F2C94C',
              }}
            >
              DONATE
            </button>
          </Link>

          {/* Portal Login Icon (Graduation Cap) - Updated with md:flex breakpoint */}
          <Link 
            href="/portal/login" 
            className="flex items-center justify-center hover:opacity-80 transition-opacity" 
            aria-label="Teacher Portal Login"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-8 h-8 text-white"
            >
              <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
              <path d="M22 10v6" />
              <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
            </svg>
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md border border-white/20 p-2 hover:bg-white/10 transition-colors"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            {mobileMenuOpen ? (
              <>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </>
            ) : (
              <>
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/15 bg-papaya-green">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block py-2 font-semibold tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            <div className="py-1">
              <AboutDropdown />
            </div>
            <div className="py-1">
              <ProgramsDropdown />
            </div>

            <Link
              href="/news"
              className="block py-2 font-semibold tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              News
            </Link>
            <Link
              href="/contact"
              className="block py-2 font-semibold tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>

            <div className="pt-3 border-t border-white/15 flex items-center gap-3">
              <Link href="/donate" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <button
                  className="w-full px-4 py-3 rounded-md font-bold text-sm tracking-widest border border-[#F2C94C] shadow-md transition-all duration-300"
                  style={{
                    backgroundImage: 'linear-gradient(to top, #F2C94C 50%, #1B3E2A 50%)',
                    backgroundSize: '100% 200%',
                    backgroundPosition: 'top',
                    color: '#F2C94C',
                  }}
                >
                  DONATE
                </button>
              </Link>

              <Link
                href="/portal/login"
                className="inline-flex items-center justify-center w-12 h-12 rounded-md border border-white/20 hover:bg-white/10 transition-colors"
                aria-label="Teacher Portal Login"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-7 h-7 text-white"
                >
                  <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
                  <path d="M22 10v6" />
                  <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}