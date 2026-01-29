// app/about/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import ScrollReveal from '@/components/ScrollReveal';
import Header from '@/components/Header';

export default function AboutPage() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle smooth scrolling when the page loads with a hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [pathname, searchParams]);

  // Image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = ['/images/1.jpg', '/images/3.jpg', '/images/jeep.jpg'];

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section - Matching Home Page */}
      <section id="our-story" className="flex-grow relative bg-gray-900 text-white min-h-[600px] flex items-center">
        {/* Background Image Carousel */}
        <div className="absolute inset-0 overflow-hidden">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
              style={{ 
                backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.9) 0%, rgba(27, 62, 42, 0.6) 50%, rgba(0, 0, 0, 0.1) 100%), url(${image})` 
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 h-full flex items-center relative z-10 py-20">
          <div className="max-w-4xl md:pl-10 lg:pl-16">
            {/* Gold Line Animation */}
            <ScrollReveal animation="slide-left" delay={100}>
              <div className="w-24 h-1.5 bg-[#F2C94C] mb-8 relative z-20 shadow-sm"></div>
            </ScrollReveal>

            {/* Header Animation */}
            <ScrollReveal animation="fade-up" delay={300}>
              <h1 className="text-5xl md:text-6xl font-light tracking-wide mb-6 leading-tight drop-shadow-lg text-white">
                 Papaya Academy
              </h1>
            </ScrollReveal>
            
            {/* Paragraph Animation */}
            <ScrollReveal animation="fade-up" delay={500}>
              <p className="text-lg md:text-xl mb-8 text-gray-100 font-light leading-relaxed opacity-90 tracking-wide max-w-2xl">
                Empowering underprivileged children through quality education in the Philippines
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Text Content */}
            <div className="lg:w-1/2">
              <ScrollReveal animation="fade-right">
                <div className="w-24 h-1.5 bg-[#F2C94C] mb-6"></div>
                <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-6">
                  About Our Academy
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  In 2003, Papaya Academy School was found by the Kalinga Foundation which offers free education in every children from the Montalban Rizal and Payatas, Quezon City. Our mission is to provide high-quality education and holistic development to students of all backgrounds, with a focus on promoting academic excellence, character formation, and social responsibility. We offer a comprehensive curriculum that includes both academic subjects and extracurricular activities to ensure that our students receive a well-rounded education.
                </p>
              </ScrollReveal>
            </div>
            
            {/* Image Grid */}
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              <ScrollReveal animation="zoom-in" delay={200}>
                <div className="relative h-64 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-500 hover:scale-105">
                  <img 
                    src="/images/school-building.jpg" 
                    alt="Papaya Academy Building"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-papaya-green/20 hover:bg-transparent transition-all duration-300"></div>
                </div>
              </ScrollReveal>
              <ScrollReveal animation="zoom-in" delay={300}>
                <div className="relative h-64 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-500 hover:scale-105">
                  <img 
                    src="/images/classroom.jpg" 
                    alt="Students in classroom"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-papaya-green/20 hover:bg-transparent transition-all duration-300"></div>
                </div>
              </ScrollReveal>
              <ScrollReveal animation="zoom-in" delay={400} className="col-span-2">
                <div className="relative h-48 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-500 hover:scale-105">
                  <img 
                    src="/images/students-group.jpg" 
                    alt="Group of students"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-papaya-green/20 hover:bg-transparent transition-all duration-300"></div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum & Facilities Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-papaya-light p-8 rounded-lg shadow-md">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full text-left group"
                aria-expanded={isExpanded}
              >
                <h2 className="text-2xl font-bold text-papaya-green">
                  Our Curriculum
                </h2>
                <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-transform duration-300 ${isExpanded ? 'bg-papaya-green text-white' : 'bg-papaya-yellow text-papaya-green group-hover:bg-papaya-green group-hover:text-white'}`}>
                  {isExpanded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] mt-6' : 'max-h-0'}`}>
                <div className="pt-4 space-y-6 text-gray-700">
                  <p>
                    The Papaya Academy is teaching Grades 1 to 6 and taught different subjects like Math, Science, English, Filipino, MAKABAYAN (EPP, CLE and MSEP) and Computer. The school also focuses not only on the curricular activities but also in non-curricular activities like scouting, chess, taekwondo, drama, volleyball, basketball, and even theater (drama, singing and dancing).
                  </p>
                  <p>
                    The school has several facilities that help the children in their learning. A classroom which can cater to 30 children, a library, audio and computer room, administration office, gymnasium, kitchen, clinic and a science laboratory. Besides all the activities done annually, the children have their educational tour, sports and music competitions between other schools.
                  </p>
                  <p>
                    The children and the teachers have different religious backgrounds, and all religions are respected. The Teachers in Papaya Academy are professionals and are equipped with talents which can be of good help for their students.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal animation="fade-down">
              <h2 className="text-3xl font-bold text-papaya-green mb-8 text-center">Our Mission</h2>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="bg-papaya-light p-8 rounded-lg shadow-md">
                <p className="text-lg text-gray-700 mb-6">
                  At Papaya Academy, we believe that every child deserves access to quality education, 
                  regardless of their socioeconomic background. Our mission is to break the cycle of 
                  poverty through education by providing comprehensive learning programs that empower 
                  children to build a better future for themselves and their communities.
                </p>
                <div className="grid md:grid-cols-2 gap-8 mt-10">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-papaya-green mb-3">Our Vision</h3>
                    <p className="text-gray-600">
                      A world where every child has the opportunity to reach their full potential through education.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-papaya-green mb-3">Our Values</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Compassion and Empathy</li>
                      <li>• Excellence in Education</li>
                      <li>• Community Empowerment</li>
                      <li>• Sustainable Impact</li>
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-down">
            <h2 className="text-3xl font-bold text-papaya-green mb-12 text-center">Organizational Chart</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Maria Santos', role: 'Founder & Director', image: '/images/team1.jpg' },
              { name: 'Juan Dela Cruz', role: 'Head of Education', image: '/images/team2.jpg' },
              { name: 'Ana Reyes', role: 'Community Outreach', image: '/images/team3.jpg' },
            ].map((member, index) => (
              <ScrollReveal key={index} animation="fade-up" delay={200 + (index * 100)}>
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden border-4 border-papaya-green">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
                  <p className="text-papaya-green">{member.role}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-down">
            <h2 className="text-3xl font-bold text-papaya-green mb-12 text-center">Partners & Sponsors</h2>
          </ScrollReveal>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {[
              { name: 'Partner 1', logo: '/images/partner1.png' },
              { name: 'Partner 2', logo: '/images/partner2.png' },
              { name: 'Partner 3', logo: '/images/partner3.png' },
            ].map((partner, index) => (
              <ScrollReveal key={index} animation="zoom-in" delay={index * 150}>
                <div className="w-40 h-20 flex items-center justify-center">
                  <img 
                    src={partner.logo} 
                    alt={partner.name}
                    className="max-h-full max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}