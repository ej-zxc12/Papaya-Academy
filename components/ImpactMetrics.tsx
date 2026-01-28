import React from 'react';
import ScrollReveal from './ScrollReveal'; // Import the reusable animator

const ImpactMetrics = () => {
  const metrics = [
    { value: '500+', label: 'Students Educated' },
    { value: '95%', label: 'Graduation Rate' },
    { value: '50+', label: 'Community Projects' },
    { value: '10+', label: 'Years of Service' },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        
        {/* HEADER ANIMATION */}
        <div className="text-center mb-12">
          <ScrollReveal animation="fade-down">
            <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-4">Our Impact</h2>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Transforming lives through education in the heart of Payatas
            </p>
          </ScrollReveal>
        </div>
        
        {/* METRICS GRID - POP IN EFFECT */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <ScrollReveal 
              key={index} 
              animation="zoom-in" 
              delay={index * 150} // 150ms delay between each card
            >
              <div className="bg-white p-6 rounded-lg shadow-md text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg h-full flex flex-col justify-center">
                <div className="text-3xl font-bold text-papaya-green mb-2">{metric.value}</div>
                <div className="text-gray-600">{metric.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* SUCCESS STORIES CONTAINER */}
        <ScrollReveal animation="fade-up" delay={400} className="w-full">
          <div className="mt-12 bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-papaya-green mb-8">Success Stories</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Story 1 */}
              <ScrollReveal animation="slide-left" delay={500}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-papaya-green">
                    <img 
                      src="/images/student1.jpg" 
                      alt="Student success story"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-600 italic">
                      "Thanks to Papaya Academy, I'm the first in my family to attend college."
                    </p>
                    <p className="text-sm text-gray-500 mt-2 font-semibold">- Maria, Class of 2022</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Story 2 */}
              <ScrollReveal animation="slide-left" delay={700}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-papaya-green">
                    <img 
                      src="/images/student2.jpg" 
                      alt="Student success story"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-600 italic">
                      "The skills I learned helped me start my own small business."
                    </p>
                    <p className="text-sm text-gray-500 mt-2 font-semibold">- Juan, Entrepreneur</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};

export default ImpactMetrics;