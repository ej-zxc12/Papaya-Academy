// app/about/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import ScrollReveal from '@/components/ScrollReveal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
<<<<<<< HEAD
      <Header />
      
      {/* Hero Section - Matching Home Page */}
      <section id="our-story" className="flex-grow relative bg-gray-900 text-white min-h-[600px] flex items-center">
        {/* Background Image Carousel */}
        <div className="absolute inset-0 overflow-hidden">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.9) 0%, rgba(27, 62, 42, 0.6) 50%, rgba(0, 0, 0, 0.1) 100%), url(${image})`,
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
                  In 2003, Papaya Academy School was found by the Kalinga Foundation which offers free education to children from Montalban Rizal and Payatas, Quezon City. Our mission is to provide high-quality education and holistic development to students of all backgrounds, with a focus on promoting academic excellence, character formation, and social responsibility.
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
                <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-transform duration-300 ${
                  isExpanded ? 'bg-papaya-green text-white' : 'bg-papaya-yellow text-papaya-green group-hover:bg-papaya-green group-hover:text-white'
                }`}>
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
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-[1000px] mt-6' : 'max-h-0'
              }`}>
                <div className="pt-4 space-y-6 text-gray-700">
                  <p>
                    The Papaya Academy teaches Grades 1 to 6, covering subjects like Math, Science, English, Filipino, MAKABAYAN (EPP, CLE, and MSEP), and Computer. The school focuses not only on curricular activities but also on non-curricular activities like scouting, chess, taekwondo, drama, volleyball, basketball, and theater (drama, singing, and dancing).
                  </p>
                  <p>
                    The school has several facilities that help children in their learning, including classrooms that can cater to 30 children, a library, audio and computer room, administration office, gymnasium, kitchen, clinic, and science laboratory. Besides all the activities done annually, the children have educational tours, sports, and music competitions with other schools.
                  </p>
                  <p>
                    The children and teachers have different religious backgrounds, and all religions are respected. The teachers at Papaya Academy are professionals equipped with talents that can greatly benefit their students.
                  </p>
                </div>
              </div>
            </div>
          </div>
=======
      {/* Hero Section */}
      <section className="bg-papaya-green text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-
          6">About Papaya Academy</h1>
          <p className="text-xl max-w-3xl mx-auto">Empowering underprivileged children through quality education in the Philippines</p>
>>>>>>> dev-butterfinds
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
                  To nurture learners through a student-centered, value-driven education that prepares them for further studies, future careers, and responsible citizenship.
                </p>
                <div className="grid md:grid-cols-2 gap-8 mt-10">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-papaya-green mb-3">Our Vision</h3>
                    <p className="text-gray-600">
                     A community where every child-especially the underserved-has access to quality, holistic, and inclusive education that develops the whole person.
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

      {/* Organizational Chart Section */}
      <section id="team" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-down">
            <h2 className="text-3xl font-bold text-papaya-green mb-14 text-center">
              Organizational Chart
            </h2>
          </ScrollReveal>

          {/* PRINCIPAL */}
          <div className="flex justify-center mb-16">
            <ScrollReveal animation="fade-up">
              <div className="flex flex-col items-center">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-papaya-green shadow-lg mb-4 bg-white">
                  <img
                    src="/images/1.jpg"
                    alt="Sheryl Ann B. Queliza"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://ui-avatars.com/api/?name=Sheryl+Ann+B+Queliza&background=1A5F3F&color=fff&size=256';
                    }}
                  />
                </div>
                <div className="bg-white px-6 py-4 rounded-lg shadow-md border-2 border-papaya-green text-center w-72 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <h3 className="font-bold text-papaya-green">
                    Sheryl Ann B. Queliza
                  </h3>
                  <p className="text-sm text-gray-600">
                    School Principal
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* GRADE ADVISERS */}
          <ScrollReveal animation="fade-up">
            <h3 className="text-xl font-semibold text-papaya-green mb-8 text-center">
              Grade Advisers
            </h3>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              { 
                name: 'Jennie G. Ramos', 
                role: 'Grade 6 Adviser',
                image: '/images/staff/jennie-ramos.jpg'
              },
              { 
                name: 'Jerico T. Santos', 
                role: 'Grade 5 Adviser',
                image: '/images/staff/jerico-santos.jpg'
              },
              { 
                name: 'Daina Marie A. Roma', 
                role: 'Grade 4 Adviser',
                image: '/images/staff/daina-roma.jpg'
              },
              { 
                name: 'Aileen B. Villanueva', 
                role: 'Grade 3 Adviser',
                image: '/images/staff/aileen-villanueva.jpg'
              },
              { 
                name: 'Hazel R. Mercado', 
                role: 'Grade 2 Adviser',
                image: '/images/staff/hazel-mercado.jpg'
              },
              { 
                name: 'Jeanbel C. Borres', 
                role: 'Grade 1 Adviser',
                image: '/images/staff/jeanbel-borres.jpg'
              },
              { 
                name: 'Katrina A. Ocampo', 
                role: 'Kinder Adviser',
                image: '/images/staff/katrina-ocampo.jpg'
              },
              { 
                name: 'Marie Sean A. Barbacena', 
                role: 'Science / Registrar',
                image: '/images/staff/marie-barbacena.jpg'
              },
            ].map((person, index) => (
              <ScrollReveal key={index} animation="fade-up" delay={100 + index * 50}>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-papaya-green mb-4 shadow-md bg-gray-100">
                    <img 
                      src={person.image}
                      alt={person.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const t = e.target as HTMLImageElement;
                        t.src = `https://ui-avatars.com/api/?name=${person.name.replace(/\s+/g, '+')}&background=1A5F3F&color=fff&size=256`;
                      }}
                    />
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm text-center w-full border-t-4 border-papaya-green hover:shadow-md transition-shadow duration-300">
                    <p className="font-semibold text-papaya-green">{person.name}</p>
                    <p className="text-sm text-gray-600">{person.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* NON-ACADEMIC STAFF */}
          <ScrollReveal animation="fade-up">
            <h3 className="text-xl font-semibold text-papaya-green mb-8 text-center">
              Non-Academic Staff
            </h3>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { 
                name: 'Ma. Luzviminda M. Macabuhay', 
                role: 'Office Manager',
                image: '/images/staff/luzviminda-macabuhay.jpg'
              },
              { 
                name: 'Salvacion M. Macasacuit', 
                role: 'Housekeeper',
                image: '/images/staff/salvacion-macasacuit.jpg'
              },
              { 
                name: 'Roger C. Macasacuit', 
                role: 'Driver / Maintenance',
                image: '/images/staff/roger-macasacuit.jpg'
              },
            ].map((person, index) => (
              <ScrollReveal key={index} animation="fade-up" delay={100 + index * 50}>
                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-3 border-papaya-yellow mb-4 shadow-md bg-gray-100">
                    <img 
                      src={person.image}
                      alt={person.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const t = e.target as HTMLImageElement;
                        t.src = `https://ui-avatars.com/api/?name=${person.name.replace(/\s+/g, '+')}&background=1A5F3F&color=fff&size=256`;
                      }}
                    />
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm text-center w-full border-t-4 border-papaya-yellow hover:shadow-md transition-shadow duration-300">
                    <p className="font-semibold text-papaya-green">{person.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{person.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* OTHER SCHOOL STAFF */}
          <ScrollReveal animation="fade-up">
            <h3 className="text-xl font-semibold text-papaya-green mb-8 text-center mt-16">
              School Staff
            </h3>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              { 
                name: 'Maria Lourdes T. Cruz', 
                role: 'School Nurse',
                image: '/images/staff/maria-cruz.jpg'
              },
              { 
                name: 'Roberto M. Garcia', 
                role: 'Guidance Counselor',
                image: '/images/staff/roberto-garcia.jpg'
              },
              { 
                name: 'Lorna S. Reyes', 
                role: 'Librarian',
                image: '/images/staff/lorna-reyes.jpg'
              },
              { 
                name: 'Antonio B. Dela Cruz', 
                role: 'IT Support',
                image: '/images/staff/antonio-dela-cruz.jpg'
              },
              { 
                name: 'Teresa M. Santos', 
                role: 'Registrar',
                image: '/images/staff/teresa-santos.jpg'
              },
              { 
                name: 'Ricardo J. Gonzales', 
                role: 'Maintenance Head',
                image: '/images/staff/ricardo-gonzales.jpg'
              },
            ].map((staff, index) => (
              <ScrollReveal key={index} animation="fade-up" delay={100 + (index * 50)}>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-papaya-blue mb-4 shadow-md bg-gray-100">
                    <img 
                      src={staff.image}
                      alt={staff.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const t = e.target as HTMLImageElement;
                        t.src = `https://ui-avatars.com/api/?name=${staff.name.replace(/\s+/g, '+')}&background=1A5F3F&color=fff&size=256`;
                      }}
                    />
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm text-center w-full border-t-4 border-papaya-blue hover:shadow-md transition-shadow duration-300">
                    <p className="font-semibold text-papaya-green">{staff.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{staff.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* Board of Trustees Section */}
<section id="board-of-trustees" className="py-16 bg-white">
  <div className="container mx-auto px-4">
    <ScrollReveal animation="fade-down">
      <h2 className="text-3xl font-bold text-papaya-green mb-14 text-center">
        Board of Trustees
      </h2>
    </ScrollReveal>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {[
        {
          title: 'Papaya Academy Inc.',
          members: [
            { name: 'Ailyn C. Gardose', role: 'President', image: '/images/board/ailyn.jpg' },
            { name: 'Michelle Ann Salmorin', role: 'Treasurer', image: '/images/board/michelle.jpg' },
            { name: 'Hadassah A. Castro', role: 'Administrator', image: '/images/board/hadassah.jpg' },
            { name: 'Maria Julie Collado', role: 'Member', image: '' },
            { name: 'Tristan Ian C. Santos', role: 'Member', image: '' },
          ],
        },
        {
          title: 'Kalinga at Pag-ibig Foundation Board (PH)',
          members: [
            { name: 'John Van Dijk', role: 'President', image: '/images/board/john.jpg' },
            { name: 'Michelle Ann Salmorin', role: 'Treasurer', image: '/images/board/michelle.jpg' },
            { name: 'Ailyn C. Gardose', role: 'Corporate Secretary', image: '/images/board/ailyn.jpg' },
            { name: 'Hadassah A. Castro', role: 'Member', image: '/images/board/hadassah.jpg' },
            { name: 'Alberto Villamor', role: 'Member', image: '/images/board/alberto.jpg' },
            { name: 'Niall Highland', role: 'Member', image: '' },
          ],
        },
        {
          title: 'Stichting Kalingaboard (NL)',
          members: [
            { name: 'Janneke Heinen', role: 'Chairwoman', image: '/images/board/janneke.jpg' },
            { name: 'Arno Van Workum', role: 'Treasurer', image: '/images/board/arno.jpg' },
            { name: 'Miranda Van Loon', role: 'Secretary', image: '/images/board/miranda.jpg' },
            { name: 'Peter Van Schijndel', role: 'General Board Member', image: '/images/board/peter.jpg' },
            { name: 'Heleen Scheer', role: 'General Board Member', image: '/images/board/heleen.jpg' },
            { name: 'Daniel Van Scherpenzeel', role: 'General Board Member', image: '/images/board/daniel.jpg' },
          ],
        },
      ].map((board, colIndex) => (
        <ScrollReveal key={colIndex} animation="fade-up" delay={colIndex * 150}>
          <div className="rounded-lg shadow-md border border-papaya-green/20 overflow-hidden">
            {/* Column Header */}
            <div className="bg-papaya-green text-white text-center py-3 px-4 font-semibold text-sm tracking-wide">
              {board.title}
            </div>

            {/* Members */}
            <div className="p-6 space-y-5 bg-papaya-light">
              {board.members.map((member, index) => (
                <div key={index} className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-papaya-green bg-white flex-shrink-0">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement;
                          t.src = `https://ui-avatars.com/api/?name=${member.name.replace(
                            /\s+/g,
                            '+'
                          )}&background=1A5F3F&color=fff&size=128`;
                        }}
                      />
                    ) : (
                      <img
                        src={`https://ui-avatars.com/api/?name=${member.name.replace(
                          /\s+/g,
                          '+'
                        )}&background=1A5F3F&color=fff&size=128`}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="inline-block bg-papaya-yellow text-papaya-green text-[11px] font-semibold px-2 py-0.5 rounded mb-1">
                      {member.role}
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                      {member.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
=======
      {/* CTA Section */}
      <section className="py-16 bg-papaya-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Be part of our journey to transform lives through education
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/donate"
              className="bg-papaya-yellow text-papaya-green px-8 py-3 rounded-md font-semibold hover:bg-opacity-90 transition-all duration-200"
            >
              Donate Now
            </Link>
            <Link 
              href="/volunteer" 
              className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            >
              Volunteer
            </Link>
>>>>>>> dev-butterfinds
          </div>
        </ScrollReveal>
      ))}
    </div>
  </div>
</section>


      {/* Use the same Footer component as the home page */}
      <div id="footer" className="w-full">
        <Footer />
      </div>
    </div>
  );
}