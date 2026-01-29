"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Montserrat } from 'next/font/google';
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  Calendar, 
  ArrowLeft, 
  BookOpen,
  Heart,
  Award
} from 'lucide-react';

// Adjust these imports if needed based on your folder structure
import ScrollReveal from '../../../components/ScrollReveal'; 
import Footer from '../../../components/Footer'; 
import AboutDropdown from '../../../components/AboutDropdown'; 

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

// Define the interface for the data we are receiving
interface ProgramContent {
  title: string;
  tagline: string;
  heroImage: string;
  description: string;
  stats: { label: string; value: string; icon: any }[];
  curriculum: { title: string; desc: string }[];
  impactText: string;
}

export default function ProgramClient({ content }: { content: ProgramContent }) {
  
  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 ${montserrat.className}`}>
      
      {/* --- HEADER (Updated: Donate Button Removed) --- */}
      <header className="bg-papaya-green text-white relative z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link href="/programs" className="flex items-center text-sm font-medium hover:text-[#F2C94C] transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK TO PROGRAMS
            </Link>
          </div>
          
          {/* REMOVED: Donate Button was here */}
          
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
        <Image 
          src={content.heroImage} 
          alt={content.title}
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10 text-center text-white pt-20">
          <ScrollReveal animation="fade-down">
            <span className="inline-block py-1 px-3 border border-[#F2C94C] text-[#F2C94C] text-xs font-bold tracking-widest uppercase mb-4 rounded-full">
              PROGRAM OVERVIEW
            </span>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{content.title}</h1>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-xl md:text-2xl font-light text-gray-200">{content.tagline}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow container mx-auto px-4 py-16 -mt-20 relative z-20">
        
        {/* KEY STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {content.stats.map((stat: any, index: number) => (
            <ScrollReveal key={index} animation="zoom-in" delay={index * 100}>
              <div className="bg-white p-6 rounded-lg shadow-lg border-b-4 border-[#F2C94C] text-center h-full flex flex-col items-center justify-center">
                <div className="mb-3 text-papaya-green bg-green-50 p-3 rounded-full">
                   {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">{stat.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          
          {/* LEFT COLUMN */}
          <div className="md:col-span-2 space-y-12">
            <ScrollReveal animation="fade-up">
              <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-papaya-green mb-6 flex items-center">
                  <BookOpen className="w-6 h-6 mr-3 text-[#F2C94C]" />
                  About the Program
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {content.description}
                </p>
              </section>
            </ScrollReveal>

            <section>
              <ScrollReveal animation="fade-up" delay={200}>
                <h2 className="text-2xl font-bold text-papaya-green mb-8">Program Highlights</h2>
              </ScrollReveal>
              <div className="grid sm:grid-cols-2 gap-6">
                {content.curriculum.map((item: any, index: number) => (
                  <ScrollReveal key={index} animation="slide-right" delay={index * 100}>
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-papaya-green hover:shadow-md transition-shadow">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            <ScrollReveal animation="slide-left" delay={300}>
              <div className="bg-[#1B3E2A] text-white p-8 rounded-xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[#F2C94C] rounded-full opacity-20"></div>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-[#F2C94C]" />
                  Our Impact
                </h3>
                <p className="text-gray-200 italic leading-relaxed">
                  "{content.impactText}"
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="slide-left" delay={500}>
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Support this Program</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Your donation ensures we can keep providing these essential services to the children of Payatas.
                </p>
                <Link href="/#donate-section">
                  <button className="w-full py-3 bg-[#F2C94C] text-[#1B3E2A] font-bold rounded-md hover:bg-opacity-90 transition-all shadow-md">
                    MAKE A DONATION
                  </button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}