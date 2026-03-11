"use client";

import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ScrollReveal from '../../components/ui/ScrollReveal';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

interface MissionVisionData {
  id: string;
  mission?: {
    title: string;
    content: string;
    image: string;
  };
  vision?: {
    title: string;
    content: string;
    image: string;
  };
  values?: Array<{
    title: string;
    description?: string;
    icon?: string;
    id: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export default function MissionVisionPage() {
  const [data, setData] = useState<MissionVisionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMissionVisionData = async () => {
      try {
        const response = await fetch('/api/mission-vision');
        if (!response.ok) {
          throw new Error('Failed to fetch mission and vision data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMissionVisionData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3E2A] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading mission and vision...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${montserrat.className}`}>
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#1B3E2A] to-[#2A5F3F] text-white py-20">
          <div className="container mx-auto px-4">
            <ScrollReveal animation="fade-up" delay={100}>
              <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-6 text-center">
                Our Mission & Vision
              </h1>
              <div className="w-24 h-1 bg-[#F2C94C] mx-auto"></div>
            </ScrollReveal>
          </div>
        </section>

        {/* Mission Section */}
        {data?.mission && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <ScrollReveal animation="fade-up" delay={200}>
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#1B3E2A] mb-8 text-center">
                    {data.mission.title}
                  </h2>
                  <div className="w-20 h-1 bg-[#F2C94C] mx-auto mb-8"></div>
                  <p className="text-lg text-gray-700 leading-relaxed text-center">
                    {data.mission.content}
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* Vision Section */}
        {data?.vision && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <ScrollReveal animation="fade-up" delay={300}>
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#1B3E2A] mb-8 text-center">
                    {data.vision.title}
                  </h2>
                  <div className="w-20 h-1 bg-[#F2C94C] mx-auto mb-8"></div>
                  <p className="text-lg text-gray-700 leading-relaxed text-center">
                    {data.vision.content}
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* Values Section */}
        {data?.values && data.values.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <ScrollReveal animation="fade-down" delay={100}>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1B3E2A] mb-4 text-center">
                  Our Core Values
                </h2>
                <div className="w-20 h-1 bg-[#F2C94C] mx-auto mb-12"></div>
              </ScrollReveal>

              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.values.map((value, index) => (
                  <ScrollReveal
                    key={value.id}
                    animation="fade-up"
                    delay={200 + index * 100}
                    className="transform transition-all duration-300 hover:scale-105"
                  >
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
                      <div className="text-center">
                        {value.icon && (
                          <div className="text-4xl mb-4">
                            {value.icon === 'star' && '⭐'}
                            {value.icon === 'heart' && '❤️'}
                            {value.icon === 'shield' && '🛡️'}
                            {value.icon === 'lightbulb' && '💡'}
                            {value.icon !== 'star' && value.icon !== 'heart' && value.icon !== 'shield' && value.icon !== 'lightbulb' && '🌟'}
                          </div>
                        )}
                        <h3 className="text-xl font-semibold text-[#1B3E2A] mb-3">
                          {value.title}
                        </h3>
                        {value.description && (
                          <p className="text-gray-600 leading-relaxed">
                            {value.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
