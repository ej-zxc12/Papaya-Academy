import React from 'react';

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
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-4">Our Impact</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transforming lives through education in the heart of Payatas
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-md text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="text-3xl font-bold text-papaya-green mb-2">{metric.value}</div>
              <div className="text-gray-600">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white p-8 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-papaya-green mb-4">Success Stories</h3>
          <div className="grid md:grid-cols-2 gap-8">
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
                <p className="text-sm text-gray-500 mt-2">- Maria, Class of 2022</p>
              </div>
            </div>
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
                <p className="text-sm text-gray-500 mt-2">- Juan, Entrepreneur</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactMetrics;
