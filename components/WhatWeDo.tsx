import React from 'react';
import Link from 'next/link';

const WhatWeDo = () => {
  return (
    <section className="py-16 bg-papaya-light">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-6">
              What we do
            </h2>
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">
              Papaya Academy is dedicated to providing quality education to underprivileged children in the Philippines. 
              Our mission is to break the cycle of poverty through education, offering comprehensive learning programs 
              that empower children to build a better future for themselves and their communities.
            </p>
            <Link 
              href="/about" 
              className="inline-block bg-papaya-green hover:bg-opacity-90 text-white font-medium py-3 px-8 rounded-md transition-all duration-200"
            >
              ABOUT PAPAYA ACADEMY
            </Link>
          </div>
          
          {/* Right Column - Video Placeholder */}
          <div className="md:w-1/2 bg-gray-200 rounded-lg overflow-hidden aspect-video">
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
              <div className="text-center p-8">
                <div className="text-2xl mb-4">Video Coming Soon</div>
                <p className="text-gray-300">We're working on our story video</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
