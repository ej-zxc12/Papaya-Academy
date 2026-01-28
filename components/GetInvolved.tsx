'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, HeartHandshake } from 'lucide-react';
import ScrollReveal from './ScrollReveal'; // Reusable animator

const GetInvolved = () => {
  const [activeTab, setActiveTab] = useState('volunteer');

  const tabs = [
    // --- 1. VOLUNTEER TAB (Added default since it was active in state but missing in tabs array) ---
    {
      id: 'volunteer',
      icon: <Users className="w-6 h-6" />,
      title: 'Volunteer',
      content: (
        <div className="space-y-4">
          <ScrollReveal animation="slide-right">
            <h3 className="text-xl font-semibold text-papaya-green">Join Our Team</h3>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <p className="text-gray-600">
              We are always looking for passionate individuals to help us with our programs. Whether you can teach, mentor, or help with administration, we need you.
            </p>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <ScrollReveal animation="zoom-in" delay={200}>
              <div className="bg-gray-50 p-6 rounded-lg h-full">
                <h4 className="font-semibold text-lg mb-2">Teaching Assistant</h4>
                <p className="text-gray-600 text-sm mb-4">Help teachers in classrooms and organize activities.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="zoom-in" delay={300}>
              <div className="bg-gray-50 p-6 rounded-lg h-full">
                <h4 className="font-semibold text-lg mb-2">Event Volunteer</h4>
                <p className="text-gray-600 text-sm mb-4">Assist with logistics during our fundraising events.</p>
              </div>
            </ScrollReveal>
          </div>
          
          <ScrollReveal animation="fade-up" delay={400}>
            <Link 
              href="/volunteer"
              className="inline-block mt-4 bg-papaya-green text-white px-6 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-all duration-200"
            >
              Sign Up to Volunteer
            </Link>
          </ScrollReveal>
        </div>
      )
    },
    // --- 2. SPONSOR TAB ---
    {
      id: 'sponsor',
      icon: <HeartHandshake className="w-6 h-6" />,
      title: 'Sponsor',
      content: (
        <div className="space-y-4">
          <ScrollReveal animation="fade-down">
            <h3 className="text-xl font-semibold text-papaya-green">Become a Sponsor</h3>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <p className="text-gray-600">
              Your sponsorship can change lives. Choose from various sponsorship programs that align with your passion and budget.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <ScrollReveal animation="zoom-in" delay={200}>
              <div className="bg-gray-50 p-6 rounded-lg h-full hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg mb-2">Student Sponsorship</h4>
                <p className="text-gray-600 text-sm mb-4">Support a child's education for a full year</p>
                <div className="text-papaya-green font-bold">$500/year</div>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="zoom-in" delay={300}>
              <div className="bg-gray-50 p-6 rounded-lg h-full hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg mb-2">Classroom Sponsor</h4>
                <p className="text-gray-600 text-sm mb-4">Fund essential supplies for a classroom</p>
                <div className="text-papaya-green font-bold">$1,000/year</div>
              </div>
            </ScrollReveal>
          </div>
          
          <ScrollReveal animation="fade-up" delay={400}>
            <Link 
              href="/sponsor"
              className="inline-block mt-4 bg-papaya-green text-white px-6 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-all duration-200"
            >
              Learn About Sponsorship
            </Link>
          </ScrollReveal>
        </div>
      )
    },
    // --- 3. EVENTS TAB ---
    {
      id: 'events',
      icon: <Calendar className="w-6 h-6" />,
      title: 'Events',
      content: (
        <div className="space-y-6">
          <ScrollReveal animation="fade-down">
            <h3 className="text-xl font-semibold text-papaya-green">Upcoming Events</h3>
          </ScrollReveal>
          
          <div className="space-y-4">
            {[
              {
                date: 'FEB 15',
                title: 'Open House Day',
                description: 'Tour our facilities and meet our students',
                time: '10:00 AM - 2:00 PM'
              },
              {
                date: 'MAR 5',
                title: 'Fundraising Gala',
                description: 'Annual fundraising dinner and auction',
                time: '6:00 PM - 10:00 PM'
              },
              {
                date: 'APR 10',
                title: 'Community Cleanup',
                description: 'Help us keep our community beautiful',
                time: '8:00 AM - 12:00 PM'
              }
            ].map((event, index) => (
              <ScrollReveal key={index} animation="slide-left" delay={index * 150}>
                <div className="flex items-start p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow bg-white">
                  <div className="bg-papaya-green text-white text-center p-2 rounded w-16 mr-4 flex-shrink-0">
                    <div className="font-bold">{event.date.split(' ')[0]}</div>
                    <div className="text-xs">{event.date.split(' ')[1]}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <div className="text-sm text-papaya-green mt-1 font-medium">{event.time}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          
          <ScrollReveal animation="fade-up" delay={500}>
            <Link 
              href="/events"
              className="inline-block mt-4 border border-papaya-green text-papaya-green px-6 py-2 rounded-md font-semibold hover:bg-papaya-green hover:text-white transition-all duration-200"
            >
              View All Events
            </Link>
          </ScrollReveal>
        </div>
      )
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        
        {/* SECTION HEADER */}
        <div className="text-center mb-12">
          <ScrollReveal animation="fade-down">
            <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-4">Get Involved</h2>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join us in making a difference. Your time, skills, and support can change lives.
            </p>
          </ScrollReveal>
        </div>

        {/* TABBED INTERFACE */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          
          {/* Tabs Navigation */}
          <div className="flex flex-wrap border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-6 py-4 font-medium text-sm md:text-base transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-papaya-green border-b-2 border-papaya-green bg-gray-50'
                    : 'text-gray-500 hover:text-papaya-green/80 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2 transform transition-transform group-hover:scale-110">{tab.icon}</span>
                {tab.title}
              </button>
            ))}
          </div>

          {/* Tab Content Area (Re-animates on switch) */}
          <div className="p-6 md:p-8 min-h-[400px]">
             {/* Key={activeTab} forces the animation to replay when switching tabs */}
             <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {tabs.find((tab) => tab.id === activeTab)?.content}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetInvolved;