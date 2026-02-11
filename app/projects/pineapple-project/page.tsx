"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Montserrat } from 'next/font/google';
import { Heart, Users, Target, Award, ArrowRight, Check, TreePine } from 'lucide-react';

// --- IMPORTS ---
import Header from '../../../components/layout/Header';
import ScrollReveal from '../../../components/ui/ScrollReveal';
import Footer from '../../../components/layout/Footer';

// --- FONT SETUP ---
const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export default function PineappleProjectPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col ${montserrat.className}`}>
      {/* --- HEADER --- */}
      <Header />

      {/* --- HERO SECTION --- */}
      <section className="relative bg-gray-900 text-white min-h-[600px] md:min-h-[700px] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <Image 
            src="/images/Pineapple.jpg" 
            alt="Pineapple Project Hero" 
            fill
            priority
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center py-12 md:py-24">
            
            <ScrollReveal animation="fade-down">
              <div className="w-24 h-1.5 bg-[#F2C94C] mb-6 shadow-sm mx-auto"></div>
            </ScrollReveal>
            
            <ScrollReveal animation="fade-up" delay={200}>
              <h1 className="text-5xl md:text-7xl font-light tracking-wide mb-8 leading-tight">
                Pineapple Project
              </h1>
            </ScrollReveal>
            
            <ScrollReveal animation="fade-up" delay={400}>
              <p className="text-xl md:text-2xl text-gray-200 font-light max-w-2xl mx-auto leading-relaxed opacity-90">
                Cultivating sustainable livelihoods through agricultural innovation and community empowerment.
              </p>
            </ScrollReveal>
            
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow">
        
        {/* --- ABOUT SECTION --- */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal animation="fade-down">
                <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-6 text-center">
                  About the Project
                </h2>
              </ScrollReveal>
              
              <ScrollReveal animation="fade-up" delay={200}>
                <p className="text-lg text-gray-600 leading-relaxed mb-8 text-center">
                  The Pineapple Project is a comprehensive community development initiative that focuses on 
                  sustainable agriculture as a pathway to economic empowerment. By training families in modern 
                  pineapple farming techniques, we create lasting income opportunities while promoting 
                  environmental sustainability.
                </p>
              </ScrollReveal>

              <div className="grid md:grid-cols-3 gap-8 mt-12">
                {[
                  {
                    icon: <TreePine className="w-8 h-8 text-[#F2C94C]" />,
                    title: "Sustainable Farming",
                    description: "Teaching modern agricultural techniques that maximize yield while preserving the environment."
                  },
                  {
                    icon: <Users className="w-8 h-8 text-[#F2C94C]" />,
                    title: "Community Empowerment",
                    description: "Building strong cooperative networks that support local farmers and their families."
                  },
                  {
                    icon: <Target className="w-8 h-8 text-[#F2C94C]" />,
                    title: "Economic Growth",
                    description: "Creating sustainable income streams that lift families out of poverty permanently."
                  }
                ].map((item, index) => (
                  <ScrollReveal key={index} animation="fade-up" delay={300 + (index * 100)}>
                    <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-white rounded-full shadow-sm">
                          {item.icon}
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-papaya-green mb-3">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- PROGRAM COMPONENTS --- */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal animation="fade-down">
                <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-12 text-center">
                  Program Components
                </h2>
              </ScrollReveal>

              <div className="grid md:grid-cols-2 gap-8">
                <ScrollReveal animation="slide-right" delay={200}>
                  <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-papaya-green mb-6">Training & Education</h3>
                    <ul className="space-y-4">
                      {[
                        "Modern farming techniques",
                        "Business management skills",
                        "Financial literacy training",
                        "Quality control standards"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="w-5 h-5 text-[#F2C94C] mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>

                <ScrollReveal animation="slide-left" delay={400}>
                  <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-papaya-green mb-6">Support Services</h3>
                    <ul className="space-y-4">
                      {[
                        "Access to quality seedlings",
                        "Equipment and tools provision",
                        "Market linkage assistance",
                        "Technical support visits"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="w-5 h-5 text-[#F2C94C] mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* --- IMPACT SECTION --- */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal animation="fade-down">
                <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-12 text-center">
                  Our Impact
                </h2>
              </ScrollReveal>

              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { number: "150+", label: "Farmers Trained" },
                  { number: "3", label: "Hectares Cultivated" },
                  { number: "85%", label: "Income Increase" },
                  { number: "50+", label: "Families Supported" }
                ].map((stat, index) => (
                  <ScrollReveal key={index} animation="fade-up" delay={200 + (index * 100)}>
                    <div className="text-center p-6 bg-papaya-green text-white rounded-lg">
                      <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                      <div className="text-sm opacity-90">{stat.label}</div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- CALL TO ACTION --- */}
        <section className="py-20 bg-papaya-green text-white">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal animation="fade-down">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Support Sustainable Livelihoods
              </h2>
            </ScrollReveal>
            
            <ScrollReveal animation="fade-up" delay={200}>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                Help us empower more families through sustainable agriculture. Your support creates lasting change.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="zoom-in" delay={400}>
              <Link href="/#donate-section">
                <button
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="px-8 py-3 rounded-md font-bold text-sm tracking-widest border border-[#F2C94C] shadow-md transition-all duration-300"
                  style={{
                    backgroundImage: 'linear-gradient(to top, #F2C94C 50%, #1B3E2A 50%)',
                    backgroundSize: '100% 200%',
                    backgroundPosition: isHovered ? 'bottom' : 'top',
                    color: isHovered ? '#1B3E2A' : '#F2C94C',
                    boxShadow: isHovered ? '0 6px 20px rgba(242,201,76,0.8)' : '0 4px 14px 0 rgba(242,201,76,0.5)',
                    transition: 'background-position 0.4s ease-out, color 0.3s ease, box-shadow 0.3s ease'
                  }}
                >
                  DONATE NOW
                </button>
              </Link>
            </ScrollReveal>
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <Footer />
    </div>
  );
}
