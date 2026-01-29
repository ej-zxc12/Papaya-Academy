import React from 'react';
import Link from 'next/link';
import ScrollReveal from './ScrollReveal'; // Import the reusable animator

const Projects = () => {
  const projects = [
   
    {
      title: "Apple Scholarships",
      description: "Scholarship program supporting high-potential students through secondary and tertiary education.",
      image: "/images/project2.jpg",
      link: "/projects/apple-scholarships"
    },
    {
      title: "Pineapple Project",
      description: "Community development initiative focusing on sustainable livelihood programs for families.",
      image: "/images/project3.jpg",
      link: "/projects/pineapple-project"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        
        {/* HEADER ANIMATION */}
        <ScrollReveal animation="fade-down">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-papaya-green mb-12">
            Our Projects
          </h2>
        </ScrollReveal>

        {/* PROJECTS GRID - WAVE ANIMATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {projects.map((project, index) => (
            <ScrollReveal 
              key={index} 
              animation="fade-up" 
              delay={index * 200} // 0ms, 200ms, 400ms -> Creates a wave effect
              className="h-full"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col group border border-gray-100">
                
                {/* Image Area with Zoom Effect on Hover */}
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-papaya-green bg-opacity-20 transform transition-transform duration-500 group-hover:scale-110">
                    {/* Note: Ideally use Next/Image here when you have real images */}
                    <span className="text-gray-500 font-medium">Project Image</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-papaya-green transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-4 flex-grow">
                    {project.description}
                  </p>
                  <Link 
                    href={project.link} 
                    className="text-papaya-green font-bold text-sm tracking-wide hover:underline inline-flex items-center mt-auto"
                  >
                    READ MORE 
                    <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
