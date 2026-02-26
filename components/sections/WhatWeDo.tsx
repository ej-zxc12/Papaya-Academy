"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import ScrollReveal from '../ui/ScrollReveal'; // Import the reusable animator

const WhatWeDo = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const videoEl = videoRef.current;

    if (!sectionEl || !videoEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          void videoEl.play();
        } else {
          videoEl.pause();
        }
      },
      {
        threshold: 0.6,
      }
    );

    observer.observe(sectionEl);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-papaya-light">
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
                Papaya Academy is a private charity school in Rodriguez (Montalban), Rizal. It Offers not just quality education but also free lunch, transportation, books, uniforms, school supplies, free tuition and educational tours for the less fortunate children. We provide education to impoverished elementary students around Payatas dump and Rodriguez, Rizal
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
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  src="/videos/papaya-academy-vtr.mp4"
                  muted
                  playsInline
                  preload="metadata"
                  controls
                />
              </div>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;