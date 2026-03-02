"use client";



import Image from 'next/image';

import Link from 'next/link';

import { useState, useEffect } from 'react';

import Header from '../components/layout/Header';

import WhatWeDo from '../components/sections/WhatWeDo';

import PapayaBusFeature from '../components/sections/PapayaBusFeature';

import Projects from '../components/sections/Projects';

import Gallery from '../components/sections/Gallery';

import Footer from '../components/layout/Footer';

import AboutDropdown from '../components/AboutDropdown';

import ScrollReveal from '../components/ui/ScrollReveal';

import { Montserrat } from 'next/font/google';



// --- 1. SETUP FONTS ---

const montserrat = Montserrat({ 

  subsets: ['latin'],

  weight: ['300', '400', '500', '600', '700'],

});



// --- 2. MAIN PAGE COMPONENT ---

export default function Home() {

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const images = ['/images/1.jpg', '/images/3.jpg', '/images/jeep.jpg'];



  useEffect(() => {

    // Check for reduced motion preference

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    setIsReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);

    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);

  }, []);

  useEffect(() => {

    if (isReducedMotion) return; // Don't auto-change images if reduced motion
    
    const interval = setInterval(() => {

      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);

    }, 6000); // Slower interval for better performance

    return () => clearInterval(interval);

  }, [images.length, isReducedMotion]);



  return (

    <div className="min-h-screen flex flex-col overflow-x-hidden">

      <Header />



      {/* HERO SECTION - ANIMATIONS KEPT HERE (Per Element) */}

      <section className="flex-grow relative bg-gray-900 text-white min-h-[600px] flex items-center">

        <div className="absolute inset-0 overflow-hidden">

          {images.map((image, index) => (

            <div

              key={index}

              className={`absolute inset-0 bg-cover bg-center ${isReducedMotion ? 'opacity-100' : 'transition-opacity duration-1000 ease-in-out'} ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}

              style={{ 

                backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.9) 0%, rgba(27, 62, 42, 0.6) 50%, rgba(0, 0, 0, 0.1) 100%), url(${image})` 

              }}

            />

          ))}

        </div>

        

        <div className="container mx-auto px-4 h-full flex items-center relative z-10 py-20">

          <div className="max-w-4xl md:pl-10 lg:pl-16">

             

            {/* Gold Line Animation */}

            <ScrollReveal animation={isReducedMotion ? "fade-up" : "slide-left"} delay={isReducedMotion ? 0 : 100}>

              <div className="w-24 h-1.5 bg-[#F2C94C] mb-8 relative z-20 shadow-sm"></div>

            </ScrollReveal>

            {/* Header Animation */}

            <ScrollReveal animation={isReducedMotion ? "fade-up" : "fade-up"} delay={isReducedMotion ? 0 : 300}>

              <h1 className="text-5xl md:text-6xl font-light tracking-wide mb-6 leading-tight drop-shadow-lg text-white">

                Education for disadvantaged youth in the Philippines

              </h1>

            </ScrollReveal>

            

            {/* Paragraph Animation */}

            <ScrollReveal animation={isReducedMotion ? "fade-up" : "fade-up"} delay={isReducedMotion ? 0 : 500}>

              <p className="text-lg md:text-xl mb-8 text-gray-100 font-light leading-relaxed opacity-90 tracking-wide max-w-2xl">

                Papaya Academy, Inc. provides free education, meals, and transportation to disadvantaged children from Payatas and Rodriguez, Rizal. We help students achieve their full potential and become positive contributors to their communities.

              </p>

            </ScrollReveal>

            

          </div>

        </div>

      </section>



      {/* What We Do Section with Success Stories */}

      <div id="what-we-do" className="w-full">

        <WhatWeDo />

      </div> 



      <div id="papaya-bus" className="w-full">

        <PapayaBusFeature />

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

                        src="/images/grade-6.jpg" 

                        alt="Pre-School to Elementary Education"

                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"

                      />

                    </div>

                  </div>

                  <div className="p-8 md:w-3/5">

                    <h3 className="text-2xl font-bold text-papaya-green mb-4">Pre-School to Elementary Education</h3>

                    <p className="text-gray-600 mb-4 leading-relaxed">

                      Schooling program to underserved children in elementary level (Kinder to Grade 6), providing free education to less privileged children from Payatas and Rodriguez, Rizal.

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

                        src="/images/jeep.jpg" 

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

                        src="/images/apple.jpg" 

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

                        src="/images/pineapple.jpg" 

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

                        src="/images/group.jpg" 

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



      <div id="gallery" className="w-full">

        <Gallery />

      </div>



      <div id="footer" className="w-full">

        <Footer />

      </div>

      

    </div>

  );

}