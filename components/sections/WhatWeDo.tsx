"use client";

import React from 'react';
import Link from 'next/link';
import ScrollReveal from '../ui/ScrollReveal'; // Import reusable animator

const WhatWeDo = () => {

  return (
    <section className="py-16 bg-papaya-light">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sub-Section - Text Content */}
          <div className="lg:w-1/2 w-full">
            <ScrollReveal animation="slide-left">
              <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-6">
                What we do
              </h2>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={200}>
              <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                Papaya Academy is a private charity school in Rodriguez (Montalban), Rizal. It Offers not just quality education but also free lunch, transportation, books, uniforms, school supplies, free tuition and educational tours for the less fortunate children. We provide education to impoverished elementary students around Payatas dump and Rodriguez, Rizal
              </p>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={400}>
              <Link 
                href="/about" 
                className="inline-block bg-papaya-green hover:bg-opacity-90 text-white font-medium py-3 px-8 rounded-md transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                ABOUT PAPAYA ACADEMY
              </Link>
            </ScrollReveal>
          </div>
          
          {/* Right Sub-Section - Video */}
          <div className="lg:w-1/2 w-full">
            <div 
              className="w-full bg-gray-200 rounded-lg shadow-xl overflow-hidden"
              style={{ height: '300px' }}
            >
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/NjeY6iQxPAY?autoplay=1&mute=1&loop=1&playlist=NjeY6iQxPAY"
                allow="autoplay"
                allowFullScreen
                title="Papaya Academy Video"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;