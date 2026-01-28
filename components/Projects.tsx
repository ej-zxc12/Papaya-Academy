import React from 'react';
import Link from 'next/link';

const Projects = () => {
  const projects = [
    {
      title: "Papaya School",
      description: "Our flagship school providing quality education to underprivileged children in Payatas, Manila.",
      image: "/images/project1.jpg",
      link: "/projects/papaya-school"
    },
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
        <h2 className="text-3xl md:text-4xl font-bold text-center text-papaya-green mb-12">
          Our Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center bg-papaya-green bg-opacity-20">
                  <span className="text-gray-500">Project Image</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <Link href={project.link} className="text-papaya-green font-medium hover:underline">
                  READ MORE →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
