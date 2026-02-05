// components/ProgramsDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ProgramsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div 
      ref={dropdownRef}
      className="relative flex items-center h-full"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        className="flex items-center nav-link text-base font-medium hover:text-[#F2C94C] transition-colors focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Programs
        {isOpen ? (
          <ChevronUp className="ml-1 w-4 h-4" />
        ) : (
          <ChevronDown className="ml-1 w-4 h-4" />
        )}
      </button>
      
      <div 
        className={`absolute left-0 top-full mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 transition-all duration-200 ease-in-out ${
          isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
        }`}
      >
        <Link 
          href="/projects/apple-scholarships" 
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1B3E2A]"
          onClick={handleLinkClick}
        >
          Apple Scholarships
        </Link>
        <Link 
          href="/projects/pineapple-project" 
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1B3E2A]"
          onClick={handleLinkClick}
        >
          Pineapple Project
        </Link>
      </div>
    </div>
  );
};

export default ProgramsDropdown;
