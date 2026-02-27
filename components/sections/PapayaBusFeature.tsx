"use client";

import React, { useEffect, useMemo, useState, useRef } from 'react';

const PapayaBusFeature = () => {
  const images = useMemo(
    () => [
      '/images/papaya-bus/79f78901-2ef4-4164-9542-2721a5cc7201.jpeg',
      '/images/papaya-bus/IMG_1225.jpeg',
      '/images/papaya-bus/IMG_1227.jpeg',
      '/images/papaya-bus/IMG_1230.jpeg',
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold text-papaya-green mb-4 transition-all duration-700 ease-out transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
          }`}>
            Our New School Bus Has Arrived
          </h2>
          <div className={`w-20 h-1 bg-papaya-green mx-auto transition-all duration-700 ease-out delay-100 transform ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}></div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-100">
              <div className="relative w-full h-80 md:h-[460px]">
                {/* Optimized image carousel with fade transitions */}
                {images.map((src, index) => (
                  <img
                    key={src}
                    src={src}
                    alt="Papaya Academy e-bus"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                      index === activeIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>

              {/* Simplified dots indicator */}
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to image ${i + 1}`}
                    onClick={() => setActiveIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === activeIndex ? 'w-8 bg-papaya-green' : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="w-full">
            <h3 className={`text-2xl md:text-3xl font-bold text-papaya-green mb-5 transition-all duration-700 ease-out delay-200 transform ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              Arrival of the New School Bus
            </h3>

            <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
              <p className={`transition-all duration-700 ease-out delay-300 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                Papaya Academy proudly celebrates the arrival of our new school bus—a significant
                achievement made possible through the generosity and shared vision of our valued
                partners.
              </p>

              <p className={`transition-all duration-700 ease-out delay-400 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                With heartfelt gratitude to Wilde Ganzen, International School Manila, Stichting
                Kalinga, our dedicated parents, and our supportive alumni, we acknowledge your
                invaluable financial contributions in making this project possible.
              </p>

              <p className={`transition-all duration-700 ease-out delay-500 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                More than just a vehicle, this bus represents opportunity, safety, and our continued
                commitment to serving our learners with excellence. Your support drives our mission
                forward and strengthens the future of our students.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PapayaBusFeature;
