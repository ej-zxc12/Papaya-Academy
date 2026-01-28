"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import WhatWeDo from '../components/WhatWeDo';
import Projects from '../components/Projects';
import ImpactMetrics from '../components/ImpactMetrics';
import DonationSection from '../components/DonationSection';
import Gallery from '../components/Gallery';
import GetInvolved from '../components/GetInvolved';
import NewsSection from '../components/NewsSection';
import Footer from '../components/Footer';
import AboutDropdown from '../components/AboutDropdown';
import { Montserrat } from 'next/font/google';

// --- 1. SETUP FONTS ---
const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

// --- 2. REUSABLE ANIMATION COMPONENT ---
// (Kept so Hero elements can use it)
type AnimationType = 'fade-up' | 'fade-down' | 'slide-left' | 'slide-right' | 'zoom-in';

export const ScrollReveal = ({ 
  children, 
  animation = 'fade-up', 
  delay = 0, 
  duration = 700, 
  className = '' 
}: { 
  children: React.ReactNode, 
  animation?: AnimationType, 
  delay?: number, 
  duration?: number,
  className?: string 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 } 
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const getTransforms = () => {
    switch (animation) {
      case 'fade-up': return isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10';
      case 'fade-down': return isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10';
      case 'slide-left': return isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10';
      case 'slide-right': return isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10';
      case 'zoom-in': return isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 blur-sm';
      default: return isVisible ? 'opacity-100' : 'opacity-0';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${getTransforms()} ${className}`}
      style={{ transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- 3. MAIN PAGE COMPONENT ---
export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const images = ['/images/1.jpg', '/images/3.jpg', '/images/jeep.jpg'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const scrollToDonate = () => {
    const donateSection = document.getElementById('donate-section');
    if (donateSection) {
      donateSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      
      {/* HEADER */}
      <header className={`bg-papaya-green text-white ${montserrat.className} relative z-50`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
              <Image src="/images/papaya.jpg" alt="Logo" width={40} height={40} className="object-cover w-full h-full"/>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-wide">Papaya Academy, Inc.</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="nav-link text-base font-medium hover:text-[#F2C94C] transition-colors">Home</Link>
            <AboutDropdown />
            <Link href="/programs" className="nav-link text-base font-medium hover:text-[#F2C94C] transition-colors">Programs</Link>
            <Link href="/news" className="nav-link text-base font-medium hover:text-[#F2C94C] transition-colors">News</Link>
            <Link href="/contact" className="nav-link text-base font-medium hover:text-[#F2C94C] transition-colors">Contact</Link>
          </nav>
          
          {/* DONATE BUTTON */}
          <button
            onClick={scrollToDonate}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="px-8 py-2.5 rounded-md font-bold text-sm tracking-widest border border-[#F2C94C] shadow-md transition-shadow duration-300"
            style={{
              backgroundImage: 'linear-gradient(to top, #F2C94C 50%, #1B3E2A 50%)',
              backgroundSize: '100% 200%',
              backgroundPosition: isHovered ? 'bottom' : 'top',
              color: isHovered ? '#1B3E2A' : '#F2C94C',
              boxShadow: isHovered ? '0 6px 20px rgba(242,201,76,0.8)' : '0 4px 14px 0 rgba(242,201,76,0.5)',
              transition: 'background-position 0.4s ease-out, color 0.3s ease, box-shadow 0.3s ease'
            }}
          >
            DONATE
          </button>
        </div>
      </header>

      {/* HERO SECTION - ANIMATIONS KEPT HERE (Per Element) */}
      <section className="flex-grow relative bg-gray-900 text-white min-h-[600px] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
              style={{ 
                backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.9) 0%, rgba(27, 62, 42, 0.6) 50%, rgba(0, 0, 0, 0.1) 100%), url(${image})` 
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 h-full flex items-center relative z-10 py-20">
          <div className="max-w-4xl md:pl-10 lg:pl-16">
             
            {/* Gold Line Animation */}
            <ScrollReveal animation="slide-left" delay={100}>
              <div className="w-24 h-1.5 bg-[#F2C94C] mb-8 relative z-20 shadow-sm"></div>
            </ScrollReveal>

            {/* Header Animation */}
            <ScrollReveal animation="fade-up" delay={300}>
              <h1 className="text-5xl md:text-6xl font-light tracking-wide mb-6 leading-tight drop-shadow-lg text-white">
                Education for disadvantaged youth in the Philippines
              </h1>
            </ScrollReveal>
            
            {/* Paragraph Animation */}
            <ScrollReveal animation="fade-up" delay={500}>
              <p className="text-lg md:text-xl mb-8 text-gray-100 font-light leading-relaxed opacity-90 tracking-wide max-w-2xl">
                Papaya Academy, Inc. devotes itself to children in extreme poverty living in and around the Payatas rubbish dump in Manila.
              </p>
            </ScrollReveal>
            
            {/* Button Animation */}
            <ScrollReveal animation="zoom-in" delay={700}>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="bg-[#F2C94C] text-[#1B3E2A] hover:bg-opacity-90 px-8 py-3 rounded-sm font-medium tracking-widest text-sm transition-all duration-200 shadow-md">
                  OUR PROGRAMS
                </button>
                <button className="border border-[#F2C94C] text-[#F2C94C] hover:bg-[#F2C94C] hover:text-[#1B3E2A] px-8 py-3 rounded-sm font-medium tracking-widest text-sm transition-all duration-200">
                  LEARN MORE
                </button>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* SECTIONS - ANIMATION REMOVED (Static/Plain) */}
      
      <div id="impact-metrics" className="w-full">
        <ImpactMetrics />
      </div>

      <div id="what-we-do" className="w-full">
        <WhatWeDo />
      </div>

      <div id="projects" className="w-full">
        <Projects />
      </div>

      <div id="donate-section" className="w-full">
        <DonationSection />
      </div>

      <div id="gallery" className="w-full">
        <Gallery />
      </div>

      <div id="get-involved" className="w-full">
        <GetInvolved />
      </div>

      <div id="news" className="w-full">
        <NewsSection />
      </div>

      <div id="footer" className="w-full">
        <Footer />
      </div>
      
    </div>
  );
}