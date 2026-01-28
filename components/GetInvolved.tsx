'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, HeartHandshake } from 'lucide-react';

const GetInvolved = () => {
  const [activeTab, setActiveTab] = useState('volunteer');

  const tabs = [
    {
      id: 'volunteer',
      icon: <Users className="w-6 h-6" />,
      title: 'Volunteer',
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-papaya-green">Make a Difference</h3>
          <p className="text-gray-600">
            Join our team of dedicated volunteers and help shape the future of underprivileged children. We're looking for passionate individuals who can contribute their time and skills.
          </p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-papaya-green mr-2">•</span>
              <span>Teaching assistants</span>
            </li>
            <li className="flex items-start">
              <span className="text-papaya-green mr-2">•</span>
              <span>Mentorship programs</span>
            </li>
            <li className="flex items-start">
              <span className="text-papaya-green mr-2">•</span>
              <span>Event volunteers</span>
            </li>
            <li className="flex items-start">
              <span className="text-papaya-green mr-2">•</span>
              <span>Skill-based volunteering</span>
            </li>
          </ul>
          <Link 
            href="/volunteer"
            className="inline-block mt-4 bg-papaya-yellow text-papaya-green px-6 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-all duration-200"
          >
            Apply to Volunteer
          </Link>
        </div>
      )
    },
    {
      id: 'sponsor',
      icon: <HeartHandshake className="w-6 h-6" />,
      title: 'Sponsor',
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-papaya-green">Become a Sponsor</h3>
          <p className="text-gray-600">
            Your sponsorship can change lives. Choose from various sponsorship programs that align with your passion and budget.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-lg mb-2">Student Sponsorship</h4>
              <p className="text-gray-600 text-sm mb-4">Support a child's education for a full year</p>
              <div className="text-papaya-green font-bold">$500/year</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-lg mb-2">Classroom Sponsor</h4>
              <p className="text-gray-600 text-sm mb-4">Fund essential supplies for a classroom</p>
              <div className="text-papaya-green font-bold">$1,000/year</div>
            </div>
          </div>
          <Link 
            href="/sponsor"
            className="inline-block mt-4 bg-papaya-green text-white px-6 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-all duration-200"
          >
            Learn About Sponsorship
          </Link>
        </div>
      )
    },
    {
      id: 'events',
      icon: <Calendar className="w-6 h-6" />,
      title: 'Events',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-papaya-green">Upcoming Events</h3>
          
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
              <div key={index} className="flex items-start p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                <div className="bg-papaya-green text-white text-center p-2 rounded w-16 mr-4">
                  <div className="font-bold">{event.date.split(' ')[0]}</div>
                  <div className="text-xs">{event.date.split(' ')[1]}</div>
                </div>
                <div>
                  <h4 className="font-semibold">{event.title}</h4>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  <div className="text-sm text-papaya-green mt-1">{event.time}</div>
                </div>
              </div>
            ))}
          </div>
          
          <Link 
            href="/events"
            className="inline-block mt-4 border border-papaya-green text-papaya-green px-6 py-2 rounded-md font-semibold hover:bg-papaya-green hover:bg-opacity-10 transition-all duration-200"
          >
            View All Events
          </Link>
        </div>
      )
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-4">Get Involved</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join us in making a difference. Your time, skills, and support can change lives.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="flex flex-wrap border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 font-medium text-sm md:text-base transition-colors ${
                  activeTab === tab.id
                    ? 'text-papaya-green border-b-2 border-papaya-green'
                    : 'text-gray-500 hover:text-papaya-green/80'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.title}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {tabs.find((tab) => tab.id === activeTab)?.content}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetInvolved;
