"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// Updated imports: Added ArrowRight
import { BookOpen, Heart, PenTool, Utensils, Check, ArrowRight } from 'lucide-react'; 
import { Montserrat } from 'next/font/google';

// --- IMPORTS ---
import ScrollReveal from '../../components/ScrollReveal'; 
import Footer from '../../components/Footer'; 
import AboutDropdown from '../../components/AboutDropdown'; 

// --- FONT SETUP ---
const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

// --- 1. DATA CONFIGURATION (Content & Links) ---
const programsData = [
  {
    id: 'early-childhood',
    link: '/programs/early-childhood', 
    title: "Early Childhood Education",
    subtitle: "Building Strong Foundations",
    description: "Our preschool and kindergarten programs focus on social-emotional development, basic literacy, and numeracy in a nurturing, play-based environment.",
    icon: <Heart className="w-6 h-6 text-[#F2C94C]" />,
    image: "/images/1.jpg", 
    features: ["Play-based learning", "Social skills development", "Nutritional support"],
    color: "bg-blue-50"
  },
  {
    id: 'k-12',
    link: '/programs/k-12',
    title: "K-12 Basic Education",
    subtitle: "Academic Excellence & Values",
    description: "A comprehensive curriculum compliant with DepEd standards, enriched with values education. We focus on holistic development and character building.",
    icon: <BookOpen className="w-6 h-6 text-[#F2C94C]" />,
    image: "/images/3.jpg", 
    features: ["STEM & Arts Integration", "Computer Literacy", "Values Formation"],
    color: "bg-white"
  },
  {
    id: 'tvl',
    link: '/programs/tvl',
    title: "Technical-Vocational (TVL)",
    subtitle: "Skills for Livelihood",
    description: "We equip our senior high school students and adult learners with practical skills for immediate employment or entrepreneurship.",
    icon: <PenTool className="w-6 h-6 text-[#F2C94C]" />,
    image: "/images/jeep.jpg", 
    features: ["Culinary Arts & Baking", "Electrical Installation", "Computer Systems Servicing"],
    color: "bg-blue-50"
  },
  {
    id: 'nutrition',
    link: '/programs/nutrition',
    title: "Nutrition & Health Program",
    subtitle: "Fueling the Mind",
    description: "Education is impossible on an empty stomach. Our feeding program ensures that every student receives daily nutritious meals.",
    icon: <Utensils className="w-6 h-6 text-[#F2C94C]" />,
    image: "/images/gallery/community1.jpg", 
    features: ["Daily Feeding Program", "Annual Medical Mission", "Health Education"],
    color: "bg-white"
  }
];

// --- 2. INTERNAL COMPONENT: LEARN MORE BUTTON ---
const LearnMoreButton = ({ href }: { href: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={href}>
      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        // UPDATES HERE: 
        // 1. Added 'flex items-center gap-2' to align text and arrow
        // 2. Added 'border-b-4' to create the solid bottom line
        className="flex items-center gap-2 px-8 py-3 rounded-md font-bold text-sm tracking-widest border border-[#1B3E2A] border-b-4 shadow-md transition-all duration-300"
        style={{
          backgroundImage: 'linear-gradient(to top, #1B3E2A 50%, transparent 50%)',
          backgroundSize: '100% 200%',
          backgroundPosition: isHovered ? 'bottom' : 'top',
          color: isHovered ? '#F2C94C' : '#1B3E2A', 
          borderColor: '#1B3E2A', // This ensures the solid line is the "coal" color
          boxShadow: isHovered ? '0 6px 20px rgba(27, 62, 42, 0.4)' : '0 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        LEARN MORE
        {/* ADDED: Arrow Icon with slide animation */}
        <ArrowRight 
          className={`w-4 h-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} 
        />
      </button>
    </Link>
  );
};

// --- 3. MAIN COMPONENT ---
export default function ProgramsPage() {
  const [isHovered, setIsHovered] = useState(false); 
  const [heroLoaded, setHeroLoaded] = useState(false); 

  return (
    <div className={`min-h-screen flex flex-col ${montserrat.className}`}>
      
      {/* --- HEADER --- */}
      <header className={`bg-papaya-green text-white relative z-50`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
              <Image src="/images/papaya.jpg" alt="Logo" width={40} height={40} className="object-cover w-full h-full"/>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-wide">Papaya Academy, Inc.</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="nav-link text-base font-medium hover:text-[#F2C94C] transition-colors">Home</Link>
            <AboutDropdown />
            <Link href="/programs" className="nav-link text-base font-bold text-[#F2C94C] transition-colors">Programs</Link>
            <Link href="/news" className="nav-link text-base font-medium hover:text-[#F2C94C] transition-colors">News</Link>
            <Link href="/contact" className="nav-link text-base font-medium hover:text-[#F2C94C] transition-colors">Contact</Link>
          </nav>
          
          <Link href="/#donate-section">
            <button
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="px-8 py-2.5 rounded-md font-bold text-sm tracking-widest border border-[#F2C94C] shadow-md transition-shadow duration-300"
              style={{
                backgroundImage: 'linear-gradient(to top, #F2C94C 50%, #1B3E2A 50%)',
                backgroundSize: '100% 200%',
                backgroundPosition: isHovered ? 'bottom' : 'top',
                color: isHovered ? '#1B3E2A' : '#F2C94C',
                boxShadow: isHovered ? '0 6px 20px rgba(242,201,76,0.8)' : '0 4px 14px 0 rgba(242,201,76,0.5)',
                transition: 'background-position 0.4s ease-out, color 0.3s ease, box-shadow 0.3s ease'
              }}
            >
              DONATE
            </button>
          </Link>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative bg-gray-900 text-white min-h-[600px] md:min-h-[700px] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <Image 
            src="/images/1.jpg" 
            alt="Programs Hero" 
            fill
            priority
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              heroLoaded ? 'opacity-25' : 'opacity-0'
            }`}
            onLoad={() => setHeroLoaded(true)}
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
                Our Educational Programs
              </h1>
            </ScrollReveal>
            
            <ScrollReveal animation="fade-up" delay={400}>
              <p className="text-xl md:text-2xl text-gray-200 font-light max-w-2xl mx-auto leading-relaxed opacity-90">
                Empowering the youth of Payatas through comprehensive, holistic, and practical education.
              </p>
            </ScrollReveal>
            
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow">
        {programsData.map((program, index) => (
          <section key={program.id} className={`py-20 ${program.color}`}>
            <div className="container mx-auto px-4">
              <div className={`flex flex-col md:flex-row items-center gap-12 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Image Side */}
                <div className="w-full md:w-1/2">
                  <ScrollReveal animation={index % 2 === 0 ? 'slide-right' : 'slide-left'}>
                    <div className="relative h-[300px] md:h-[450px] rounded-lg overflow-hidden shadow-2xl group">
                      <Image 
                        src={program.image}
                        alt={program.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-papaya-green/10 group-hover:bg-transparent transition-colors duration-300" />
                    </div>
                  </ScrollReveal>
                </div>

                {/* Text Side */}
                <div className="w-full md:w-1/2">
                  <ScrollReveal animation="fade-down" delay={100}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-white shadow-sm rounded-full border border-gray-100">
                        {program.icon}
                      </div>
                      <span className="text-[#F2C94C] font-bold tracking-widest text-sm uppercase">
                        {program.subtitle}
                      </span>
                    </div>
                  </ScrollReveal>
                  
                  <ScrollReveal animation="fade-up" delay={200}>
                    <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-6 leading-tight">
                      {program.title}
                    </h2>
                  </ScrollReveal>
                  
                  <ScrollReveal animation="fade-up" delay={300}>
                    <p className="text-gray-600 text-lg leading-relaxed mb-8">
                      {program.description}
                    </p>
                  </ScrollReveal>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {program.features.map((feature, i) => (
                      <ScrollReveal key={i} animation="slide-right" delay={400 + (i * 100)}>
                        <div className="flex items-center text-gray-700 group">
                          <span className="mr-3 flex-shrink-0">
                            <Check className="w-5 h-5 text-[#F2C94C]" />
                          </span>
                          <span className="font-medium group-hover:text-papaya-green transition-colors">
                            {feature}
                          </span>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>

                  {/* Updated Learn More Button */}
                  <ScrollReveal animation="zoom-in" delay={700}>
                    <LearnMoreButton href={program.link} />
                  </ScrollReveal>

                </div>
              </div>
            </div>
          </section>
        ))}
      </main>

      {/* --- FOOTER --- */}
      <Footer />
    </div>
  );
}