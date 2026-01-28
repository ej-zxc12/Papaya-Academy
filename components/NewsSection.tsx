'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Newspaper, Award } from 'lucide-react';

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
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-4">News & Updates</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay informed about our latest news, success stories, and upcoming events
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {newsItems.map((item) => (
            <article key={item.id} className="group border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <div className="bg-papaya-green/10 p-4 rounded-full">
                  {item.icon}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span>{item.category}</span>
                  <span className="mx-2">•</span>
                  <span>{item.date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-papaya-green transition-colors">
                  <Link href={`/news/${item.id}`} className="hover:underline">
                    {item.title}
                  </Link>
                </h3>
                <p className="text-gray-600 mb-4">{item.excerpt}</p>
                <Link 
                  href={`/news/${item.id}`}
                  className="inline-flex items-center text-papaya-green font-medium hover:underline"
                >
                  Read more
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>


        <div className="text-center mt-12">
          <Link 
            href="/news"
            className="inline-block border-2 border-papaya-green text-papaya-green px-6 py-3 rounded-md font-semibold hover:bg-papaya-green hover:text-white transition-colors"
          >
            View All News & Articles
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
