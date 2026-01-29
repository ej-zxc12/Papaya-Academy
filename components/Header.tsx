'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import AboutDropdown from './AboutDropdown';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export default function Header() {
  const [isHovered, setIsHovered] = useState(false);

  const scrollToDonate = () => {
    const donateSection = document.getElementById('donate-section');
    if (donateSection) {
      donateSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className={`bg-papaya-green text-white ${montserrat.className} relative z-50`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo with Link to Home */}
        <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
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
          <Link href="/programs" className="nav-link text-base font-medium hover:text-[#F2C94C] transition-colors">
            Programs
          </Link>
          <Link href="/news" className="nav-link text-base font-medium hover:text-[#F2C94C] transition-colors">
            News
          </Link>
          <Link href="/contact" className="nav-link text-base font-medium hover:text-[#F2C94C] transition-colors">
            Contact
          </Link>
        </nav>
        
        {/* Donate Button */}
        <button
          onClick={scrollToDonate}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="px-8 py-2.5 rounded-md font-bold text-sm tracking-widest border border-[#F2C94C] shadow-md transition-all duration-300"
          style={{
            backgroundImage: 'linear-gradient(to top, #F2C94C 50%, #1B3E2A 50%)',
            backgroundSize: '100% 200%',
            backgroundPosition: isHovered ? 'bottom' : 'top',
            color: isHovered ? '#1B3E2A' : '#F2C94C',
            boxShadow: isHovered ? '0 6px 20px rgba(242,201,76,0.8)' : '0 4px 14px 0 rgba(242,201,76,0.5)',
          }}
        >
          DONATE
        </button>
      </div>
    </header>
  );
}
