"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Montserrat } from 'next/font/google';
import { BookOpen, Users, Target, Award, ArrowRight, Check } from 'lucide-react';

// --- IMPORTS ---
import Header from '../../../components/layout/Header';
import ScrollReveal from '../../../components/ui/ScrollReveal';
import Footer from '../../../components/layout/Footer';

// --- FONT SETUP ---
const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export default function AppleScholarshipsPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col ${montserrat.className}`}>
      {/* --- HEADER --- */}
      <Header />

      {/* --- HERO SECTION --- */}
      <section className="relative bg-gray-900 text-white min-h-[600px] md:min-h-[700px] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <Image 
            src="/images/apple.jpg" 
            alt="Apple Scholarships Hero" 
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
                Apple Scholarships
              </h1>
            </ScrollReveal>
            
            <ScrollReveal animation="fade-up" delay={400}>
              <p className="text-xl md:text-2xl text-gray-200 font-light max-w-2xl mx-auto leading-relaxed opacity-90">
                Empowering bright minds through education, transforming futures one scholarship at a time.
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
                  About the Program
                </h2>
              </ScrollReveal>
              
              <ScrollReveal animation="fade-up" delay={200}>
                <p className="text-lg text-gray-600 leading-relaxed mb-8 text-center">
                  The Apple Scholarships program provides comprehensive educational support to high-potential students 
                  from underserved communities in Payatas. We believe that education is the key to breaking the cycle 
                  of poverty and creating lasting change in our community.
                </p>
              </ScrollReveal>

              <div className="grid md:grid-cols-3 gap-8 mt-12">
                {[
                  {
                    icon: <BookOpen className="w-8 h-8 text-[#F2C94C]" />,
                    title: "Academic Excellence",
                    description: "Supporting students from elementary through tertiary education with comprehensive academic assistance."
                  },
                  {
                    icon: <Users className="w-8 h-8 text-[#F2C94C]" />,
                    title: "Holistic Development",
                    description: "Beyond financial support, we provide mentorship, counseling, and character formation programs."
                  },
                  {
                    icon: <Target className="w-8 h-8 text-[#F2C94C]" />,
                    title: "Long-term Impact",
                    description: "Creating sustainable change by investing in the next generation of leaders and professionals."
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

        {/* --- BENEFITS SECTION --- */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal animation="fade-down">
                <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-12 text-center">
                  Scholarship Benefits
                </h2>
              </ScrollReveal>

              <div className="grid md:grid-cols-2 gap-8">
                <ScrollReveal animation="slide-right" delay={200}>
                  <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-papaya-green mb-6">Financial Support</h3>
                    <ul className="space-y-4">
                      {[
                        "Full tuition coverage",
                        "Book and learning materials allowance",
                        "Transportation stipend",
                        "Uniform and school supplies"
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="w-5 h-5 text-[#F2C94C] mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>

                <ScrollReveal animation="slide-left" delay={400}>
                  <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold text-papaya-green mb-6">Academic Support</h3>
                    <ul className="space-y-4">
                      {[
                        "Regular tutoring sessions",
                        "Mentorship program",
                        "Career guidance counseling",
                        "Leadership development workshops"
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="w-5 h-5 text-[#F2C94C] mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* --- ELIGIBILITY SECTION --- */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal animation="fade-down">
                <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-12 text-center">
                  Eligibility Requirements
                </h2>
              </ScrollReveal>

              <div className="bg-gray-50 p-8 rounded-lg">
                <ScrollReveal animation="fade-up" delay={200}>
                  <ul className="space-y-4">
                    {[
                      "Resident of Payatas or nearby communities",
                      "Demonstrated financial need",
                      "Strong academic performance and potential",
                      "Good moral character and conduct",
                      "Commitment to community service",
                      "Parent/guardian support and involvement"
                    ].map((requirement, i) => (
                      <li key={i} className="flex items-start">
                        <Award className="w-5 h-5 text-[#F2C94C] mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* --- CALL TO ACTION --- */}
        <section className="py-20 bg-papaya-green text-white">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal animation="fade-down">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Support a Student's Future
              </h2>
            </ScrollReveal>
            
            <ScrollReveal animation="fade-up" delay={200}>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                Your generosity can transform a life. Join us in providing quality education to deserving students.
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
