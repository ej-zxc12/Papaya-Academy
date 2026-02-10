'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import AboutDropdown from './AboutDropdown';
import ProgramsDropdown from './ProgramsDropdown';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export default function Header() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <header className={`bg-papaya-green text-white ${montserrat.className} relative z-50`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo with Link to Home */}
        <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
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
          <h1 className="text-xl md:text-2xl font-bold tracking-wide">Papaya Academy, Inc.</h1>
        </Link>
        
        {/* Navigation */}
        <nav className="hidden md:flex space-x-8 items-center">
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
        
        {/* Donate Button - UPDATED LINK */}
        <Link href="/donate">
          <button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="px-8 py-2.5 rounded-md font-bold text-sm tracking-widest border border-[#F2C94C] shadow-md transition-all duration-300"
            style={{
              backgroundImage: 'linear-gradient(to top, #F2C94C 50%, #1B3E2A 50%)',
              backgroundSize: '100% 200%',
              backgroundPosition: isHovered ? 'bottom' : 'top',
              color: isHovered ? '#1B3E2A' : '#F2C94C',
            }}
          >
            DONATE
          </button>
        </Link>
      </div>
    </header>
  );
}