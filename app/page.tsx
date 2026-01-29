"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import WhatWeDo from '../components/WhatWeDo';
import Projects from '../components/Projects';
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
  const images = ['/images/1.jpg', '/images/3.jpg', '/images/jeep.jpg'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />

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

      {/* What We Do Section with Success Stories */}
      <div id="what-we-do" className="w-full">
        <WhatWeDo />
        {/*  */}
      {/* Success Stories Section - Temporarily Commented Out */}
      {/* 
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <ScrollReveal animation="fade-down">
              <h2 className="text-3xl font-bold text-papaya-green mb-12 text-center">Success Stories</h2>
            </ScrollReveal>
            
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <ScrollReveal animation="fade-up" delay={200}>
                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 w-20 h-20 rounded-full overflow-hidden border-4 border-papaya-green">
                      <img 
                        src="/images/student1.jpg" 
                        alt="Student success story"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-gray-600 italic mb-4">
                        "Thanks to Papaya Academy, I'm the first in my family to attend college."
                      </p>
                      <p className="text-sm font-semibold text-papaya-green">- Maria, Class of 2022</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={400}>
                <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 w-20 h-20 rounded-full overflow-hidden border-4 border-papaya-green">
                      <img 
                        src="/images/student2.jpg" 
                        alt="Student success story"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-gray-600 italic mb-4">
                        "The skills I learned helped me start my own small business."
                      </p>
                      <p className="text-sm font-semibold text-papaya-green">- Juan, Entrepreneur</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      */}
      </div> 

      {/* Papaya Academy Provides Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-down" delay={100}>
            <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-4 text-center">Papaya Academy Provides</h2>
            <div className="w-20 h-1 bg-papaya-green mx-auto mb-12"></div>
          </ScrollReveal>
          
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Program 1 */}
            <ScrollReveal animation="fade-up" delay={200} className="transform transition-all duration-500 hover:scale-[1.02]">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="md:flex">
                  <div className="md:w-2/5 bg-papaya-green/5 flex items-center justify-center p-6">
                    <div className="w-full h-56 bg-gray-100 rounded-lg overflow-hidden relative group">
                      <div className="absolute inset-0 bg-papaya-green/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <img 
                        src="/images/education.jpg" 
                        alt="Elementary Education"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  <div className="p-8 md:w-3/5">
                    <h3 className="text-2xl font-bold text-papaya-green mb-4">Elementary Education</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Schooling program to impoverished children in elementary level (Kinder to Grade 6), providing free education to less privileged children from Payatas and Rodriguez, Rizal.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Program 2 */}
            <ScrollReveal animation="fade-up" delay={250} className="transform transition-all duration-500 hover:scale-[1.02]">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="md:flex md:flex-row-reverse">
                  <div className="md:w-2/5 bg-papaya-green/5 flex items-center justify-center p-6">
                    <div className="w-full h-56 bg-gray-100 rounded-lg overflow-hidden relative group">
                      <div className="absolute inset-0 bg-papaya-green/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <img 
                        src="/images/transportation.jpg" 
                        alt="Transportation Service"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  <div className="p-8 md:w-3/5">
                    <h3 className="text-2xl font-bold text-papaya-green mb-4">Transportation Service</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Free transport to school back and forth from Payatas to Rodriguez, ensuring safe and reliable transportation for all students.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Program 3 */}
            <ScrollReveal animation="fade-up" delay={300} className="transform transition-all duration-500 hover:scale-[1.02]">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="md:flex">
                  <div className="md:w-2/5 bg-papaya-green/5 flex items-center justify-center p-6">
                    <div className="w-full h-56 bg-gray-100 rounded-lg overflow-hidden relative group">
                      <div className="absolute inset-0 bg-papaya-green/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <img 
                        src="/images/scholarship.jpg" 
                        alt="Scholarship Program"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  <div className="p-8 md:w-3/5">
                    <h3 className="text-2xl font-bold text-papaya-green mb-4">Apple Scholar Program</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Sponsorship up to college after graduating the elementary level, providing continuous support for our students' educational journey.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Program 4 */}
            <ScrollReveal animation="fade-up" delay={350} className="transform transition-all duration-500 hover:scale-[1.02]">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="md:flex md:flex-row-reverse">
                  <div className="md:w-2/5 bg-papaya-green/5 flex items-center justify-center p-6">
                    <div className="w-full h-56 bg-gray-100 rounded-lg overflow-hidden relative group">
                      <div className="absolute inset-0 bg-papaya-green/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <img 
                        src="/images/livelihood.jpg" 
                        alt="Livelihood Program"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  <div className="p-8 md:w-3/5">
                    <h3 className="text-2xl font-bold text-papaya-green mb-4">Pineapple Livelihood Project</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Supports livelihood program for the parents of the students, helping to uplift entire families and communities.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Program 5 */}
            <ScrollReveal animation="fade-up" delay={400} className="transform transition-all duration-500 hover:scale-[1.02]">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="md:flex">
                  <div className="md:w-2/5 bg-papaya-green/5 flex items-center justify-center p-6">
                    <div className="w-full h-56 bg-gray-100 rounded-lg overflow-hidden relative group">
                      <div className="absolute inset-0 bg-papaya-green/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <img 
                        src="/images/community.jpg" 
                        alt="Inclusive Community"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  <div className="p-8 md:w-3/5">
                    <h3 className="text-2xl font-bold text-papaya-green mb-4">Inclusive Community</h3>
                    <p className="text-gray-600 leading-relaxed">
                      We acknowledge and appreciate the diversity of religion and humanitarian beliefs, fostering an inclusive and respectful environment for all.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

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