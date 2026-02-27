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

      <div className="container mx-auto px-4 py-4 flex justify-between items-center gap-4">

        {/* Logo with Link to Home - fixed width to prevent compression */}
        <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity flex-shrink-0">

          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">

            <Image 

              src="/images/papaya.jpg" 

              alt="Papaya Academy Logo" 

              width={40} 

              height={40} 

              className="object-cover w-full h-full"

              priority

            />

          </div>

          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-wide leading-tight whitespace-nowrap">Papaya Academy, Inc.</h1>

        </Link>

        

        {/* Navigation */}
        <nav className="hidden lg:flex space-x-6 xl:space-x-8 items-center flex-shrink-0">



          <Link href="/" className="nav-link text-base font-medium hover:text-[#F2C94C] transition-colors">

            Home

          </Link>

          <AboutDropdown />

          <ProgramsDropdown />

          <Link href="/news" className="nav-link text-base font-medium hover:text-[#F2C94C] transition-colors">

            News

          </Link>

          <Link href="/contact" className="nav-link text-base font-medium hover:text-[#F2C94C] transition-colors">

            Contact

          </Link>

        </nav>

        

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 flex-shrink-0">

          {/* Donate Button */}

          <Link href="/donate">

            <button

              onMouseEnter={() => setIsHovered(true)}

              onMouseLeave={() => setIsHovered(false)}

              className="px-8 py-2.5 rounded-md font-bold text-sm tracking-widest border border-[#F2C94C] shadow-md transition-all duration-300"

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



          {/* Portal Login Icon (Graduation Cap) */}

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
          className="lg:hidden inline-flex items-center justify-center rounded-md border border-white/20 p-2 hover:bg-white/10 transition-colors"
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

      {/* Mobile Navigation Menu - Smooth Fade In/Out Animation */}
      <div 
        className={`fixed inset-x-0 top-0 bg-papaya-green border-t border-white/15 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] origin-top transform lg:hidden ${
          mobileMenuOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
        style={{ 
          position: 'fixed',
          top: '64px', // Position directly below header
          left: '0',
          right: '0',
          zIndex: 40
        }}
      >
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Link
              href="/"
              className="block py-3 px-4 font-semibold tracking-wide text-base hover:bg-white/10 rounded-md transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            <div className="py-1">
              <div className="mobile-dropdown">
                <button 
                  className="w-full py-3 px-4 font-semibold tracking-wide text-base hover:bg-white/10 rounded-md transition-colors duration-200 flex items-center justify-between"
                  onClick={() => {
                    const aboutDropdown = document.getElementById('mobile-about-dropdown');
                    aboutDropdown?.classList.toggle('hidden');
                  }}
                >
                  About Us
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="mobile-about-dropdown" className="hidden pl-4 space-y-1 mt-1">
                  <Link href="/about#our-story" className="block py-2 px-4 text-sm hover:bg-white/10 rounded transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Our Story</Link>
                  <Link href="/about#mission" className="block py-2 px-4 text-sm hover:bg-white/10 rounded transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Our Mission & Vision</Link>
                  <Link href="/about#team" className="block py-2 px-4 text-sm hover:bg-white/10 rounded transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Organizational Chart</Link>
                  <Link href="/about#partners" className="block py-2 px-4 text-sm hover:bg-white/10 rounded transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Partners & Sponsors</Link>
                </div>
              </div>
            </div>

            <div className="py-1">
              <div className="mobile-dropdown">
                <button 
                  className="w-full py-3 px-4 font-semibold tracking-wide text-base hover:bg-white/10 rounded-md transition-colors duration-200 flex items-center justify-between"
                  onClick={() => {
                    const programsDropdown = document.getElementById('mobile-programs-dropdown');
                    programsDropdown?.classList.toggle('hidden');
                  }}
                >
                  Programs
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="mobile-programs-dropdown" className="hidden pl-4 space-y-1 mt-1">
                  <Link href="/projects/apple-scholarships" className="block py-2 px-4 text-sm hover:bg-white/10 rounded transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Apple Scholarships</Link>
                  <Link href="/projects/pineapple-project" className="block py-2 px-4 text-sm hover:bg-white/10 rounded transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Pineapple Project</Link>
                  <Link href="/programs/foundation-day" className="block py-2 px-4 text-sm hover:bg-white/10 rounded transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>Foundation Day</Link>
                </div>
              </div>
            </div>

            <Link
              href="/news"
              className="block py-3 px-4 font-semibold tracking-wide text-base hover:bg-white/10 rounded-md transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              News
            </Link>

            <Link
              href="/contact"
              className="block py-3 px-4 font-semibold tracking-wide text-base hover:bg-white/10 rounded-md transition-colors duration-200"
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
    </header>
  );
}