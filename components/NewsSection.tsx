'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Newspaper, Award } from 'lucide-react';
import ScrollReveal from './ScrollReveal'; // Reusable animator

const NewsSection = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would handle the form submission here
    console.log('Subscribed with email:', email);
    setIsSubscribed(true);
    setEmail('');
    // Reset the success message after 5 seconds
    setTimeout(() => setIsSubscribed(false), 5000);
  };

  const newsItems = [
    {
      id: 1,
      title: 'New Literacy Program Launches',
      excerpt: 'Our new after-school literacy initiative is showing promising results after just three months.',
      date: 'January 15, 2024',
      category: 'Programs',
      icon: <BookOpen className="w-5 h-5 text-papaya-green" />
    },
    {
      id: 2,
      title: 'Annual Report 2023',
      excerpt: 'Read about our achievements and impact in the community over the past year.',
      date: 'December 20, 2023',
      category: 'News',
      icon: <Newspaper className="w-5 h-5 text-papaya-green" />
    },
    {
      id: 3,
      title: 'Student Achievements',
      excerpt: 'Celebrating our students who have excelled in national competitions this quarter.',
      date: 'November 5, 2023',
      category: 'Success Stories',
      icon: <Award className="w-5 h-5 text-papaya-green" />
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        
        {/* HEADER ANIMATION */}
        <div className="text-center mb-12">
          <ScrollReveal animation="fade-down">
            <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-4">News & Updates</h2>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay informed about our latest news, success stories, and upcoming events
            </p>
          </ScrollReveal>
        </div>

        {/* NEWS GRID - STAGGERED FADE UP */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {newsItems.map((item, index) => (
            <ScrollReveal 
              key={item.id} 
              animation="fade-up" 
              delay={index * 150} // 0ms, 150ms, 300ms
              className="h-full"
            >
              <article className="group border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col hover:-translate-y-1">
                
                {/* Image Placeholder Area */}
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <div className="bg-papaya-green/10 p-4 rounded-full transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    {item.icon}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="font-medium text-papaya-green">{item.category}</span>
                    <span className="mx-2">•</span>
                    <span>{item.date}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-papaya-green transition-colors">
                    <Link href={`/news/${item.id}`} className="hover:underline">
                      {item.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 mb-4 flex-grow">{item.excerpt}</p>
                  
                  <Link 
                    href={`/news/${item.id}`}
                    className="inline-flex items-center text-papaya-green font-medium hover:underline mt-auto group/link"
                  >
                    Read more
                    <svg className="w-4 h-4 ml-1 transform transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>

        {/* VIEW ALL BUTTON */}
        <div className="text-center mt-12 mb-20">
          <ScrollReveal animation="fade-up" delay={400}>
            <Link 
              href="/news"
              className="inline-block border-2 border-papaya-green text-papaya-green px-6 py-3 rounded-md font-semibold hover:bg-papaya-green hover:text-white transition-all duration-200"
            >
              View All News & Articles
            </Link>
          </ScrollReveal>
        </div>

        {/* NEWSLETTER SUBSCRIPTION - ZOOM IN CALL TO ACTION */}
        <ScrollReveal animation="zoom-in" delay={200}>
          <div className="bg-papaya-light rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-papaya-green mb-4">Subscribe to Our Newsletter</h3>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Get the latest updates on our programs, events, and impact stories delivered directly to your inbox.
            </p>
            
            <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-papaya-green focus:border-transparent"
                />
                <button 
                  type="submit"
                  className="bg-papaya-green text-white px-6 py-3 rounded-md font-semibold hover:bg-opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Subscribe
                </button>
              </div>
              
              {isSubscribed && (
                <div className="absolute top-full left-0 right-0 mt-2 text-green-600 font-medium animate-pulse">
                  Thank you for subscribing!
                </div>
              )}
            </form>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};

export default NewsSection;