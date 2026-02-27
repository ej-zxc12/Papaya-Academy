"use client";

import React, { useEffect, useMemo, useState } from 'react';
import ScrollReveal from '../ui/ScrollReveal';

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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <ScrollReveal animation="fade-down" delay={100}>
            <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-4">
              Our New School Bus Has Arrived
            </h2>
            <div className="w-20 h-1 bg-papaya-green mx-auto"></div>
          </ScrollReveal>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="w-full">
            <ScrollReveal animation="slide-left" delay={150}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
                <div className="relative w-full h-80 md:h-[460px]">
                  {images.map((src, index) => (
                    <div
                      key={src}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === activeIndex ? 'opacity-100' : 'opacity-0'}`}
                    >
                      <img
                        src={src}
                        alt="Papaya Academy e-bus"
                        className="w-full h-full object-cover"
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                    </div>
                  ))}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0"></div>
                </div>

                <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white">
                  <div className="flex items-center gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Go to image ${i + 1}`}
                        onClick={() => setActiveIndex(i)}
                        className={`h-2.5 rounded-full transition-all ${i === activeIndex ? 'w-8 bg-papaya-green' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
                      className="h-11 w-11 inline-flex items-center justify-center rounded-full border-2 border-papaya-green text-papaya-green hover:bg-papaya-green hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <span className="text-2xl font-bold leading-none">←</span>
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
                      className="h-11 w-11 inline-flex items-center justify-center rounded-full border-2 border-papaya-green text-papaya-green hover:bg-papaya-green hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <span className="text-2xl font-bold leading-none">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="w-full">
            <ScrollReveal animation="slide-right" delay={200}>
              <h3 className="text-2xl md:text-3xl font-bold text-papaya-green mb-5">
                Arrival of the New School Bus
              </h3>
            </ScrollReveal>

            <div className="space-y-5 text-gray-700 leading-relaxed text-lg">
              <ScrollReveal animation="fade-up" delay={300}>
                <p>
                  Papaya Academy proudly celebrates the arrival of our new school bus—a significant
                  achievement made possible through the generosity and shared vision of our valued
                  partners.
                </p>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={400}>
                <p>
                  With heartfelt gratitude to Wilde Ganzen, International School Manila, Stichting
                  Kalinga, our dedicated parents, and our supportive alumni, we acknowledge your
                  invaluable financial contributions in making this project possible.
                </p>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={500}>
                <p>
                  More than just a vehicle, this bus represents opportunity, safety, and our continued
                  commitment to serving our learners with excellence. Your support drives our mission
                  forward and strengthens the future of our students.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PapayaBusFeature;
