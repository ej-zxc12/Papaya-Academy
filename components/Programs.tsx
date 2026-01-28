import React from 'react';
import Link from 'next/link';

const Programs = () => {
  const programs = [
    {
      title: 'Elementary Education',
      description: 'Comprehensive primary education program focusing on foundational literacy and numeracy skills.',
      icon: '📚',
      link: '/programs/elementary'
    },
    {
      title: 'High School Program',
      description: 'Secondary education with STEM, arts, and vocational tracks to prepare students for higher education or employment.',
      icon: '🎓',
      link: '/programs/highschool'
    },
    {
      title: 'Vocational Training',
      description: 'Hands-on skills development in various trades to prepare students for immediate employment.',
      icon: '🔧',
      link: '/programs/vocational'
    },
    {
      title: 'Scholarship Program',
      description: 'Financial assistance for high-achieving students to continue their education at higher levels.',
      icon: '🏆',
      link: '/programs/scholarships'
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-4">Our Programs</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive educational programs designed to empower and transform lives
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {programs.map((program, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-lg p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-4xl mb-4">{program.icon}</div>
              <h3 className="text-xl font-semibold text-papaya-green mb-2">{program.title}</h3>
              <p className="text-gray-600 mb-4">{program.description}</p>
              <Link 
                href={program.link}
                className="inline-flex items-center text-papaya-green hover:text-papaya-green-dark font-medium"
              >
                Learn more
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link 
            href="/programs"
            className="inline-block bg-papaya-yellow text-papaya-green px-6 py-3 rounded-md font-semibold hover:bg-opacity-90 transition-all duration-200"
          >
            View All Programs
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Programs;
