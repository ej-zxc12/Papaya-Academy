import React from 'react';
import Link from 'next/link';
import ScrollReveal from './ScrollReveal'; // Import the reusable animator

const WhatWeDo = () => {
  return (
    <section className="py-16 bg-papaya-light">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          
          {/* Left Column - Text Content */}
          <div className="md:w-1/2">
            
            {/* Title: Slides in from the left */}
            <ScrollReveal animation="slide-left">
              <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-6">
                What we do
              </h2>
            </ScrollReveal>

            {/* Paragraph: Fades up after the title */}
            <ScrollReveal animation="fade-up" delay={200}>
              <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                Papaya Academy is dedicated to providing quality education to underprivileged children in the Philippines. 
                Our mission is to break the cycle of poverty through education, offering comprehensive learning programs 
                that empower children to build a better future for themselves and their communities.
              </p>
            </ScrollReveal>

            {/* Button: Fades up last */}
            <ScrollReveal animation="fade-up" delay={400}>
              <Link 
                href="/about" 
                className="inline-block bg-papaya-green hover:bg-opacity-90 text-white font-medium py-3 px-8 rounded-md transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                ABOUT PAPAYA ACADEMY
              </Link>
            </ScrollReveal>
          </div>
          
          {/* Right Column - Video Placeholder */}
          <div className="md:w-1/2 w-full">
            {/* Video Box: Slides in from the right to meet the text */}
            <ScrollReveal animation="slide-right" delay={200}>
              <div className="bg-gray-200 rounded-lg overflow-hidden aspect-video shadow-lg relative group">
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white transition-colors duration-500 group-hover:bg-gray-700">
                  <div className="text-center p-8">
                    <div className="text-4xl mb-4 opacity-50 group-hover:opacity-100 transition-opacity duration-300">▶</div>
                    <div className="text-2xl mb-4 font-semibold">Video Coming Soon</div>
                    <p className="text-gray-300">We're working on our story video</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;