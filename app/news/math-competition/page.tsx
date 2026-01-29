import React from 'react';
import Link from 'next/link';

export default function MathCompetitionArticle() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <span className="text-sm text-green-300 font-semibold">Academic Achievement</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
              Students Excel in Regional Math Competition
            </h1>
            <p className="text-lg opacity-90">
              Published on March 15, 2024
            </p>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-lg shadow-lg p-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-6">
                We are incredibly proud to announce that our Grade 6 students have brought home three medals from the Regional Mathematics Competition held last week at the Regional Education Center. This outstanding achievement demonstrates the excellence of our mathematics program and the dedication of both our students and teachers.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Competition Results</h2>
              <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold mr-4">1</div>
                    <div>
                      <h3 className="font-semibold">Gold Medal - Juan Miguel Santos</h3>
                      <p className="text-gray-600">Individual Competition, Grade 6 Level</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold mr-4">2</div>
                    <div>
                      <h3 className="font-semibold">Silver Medal - Maria Reyes</h3>
                      <p className="text-gray-600">Individual Competition, Grade 6 Level</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold mr-4">3</div>
                    <div>
                      <h3 className="font-semibold">Bronze Medal - Team Papaya Academy</h3>
                      <p className="text-gray-600">Group Competition, Elementary Division</p>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">About the Competition</h2>
              <p className="mb-4">
                The Regional Mathematics Competition is an annual event that brings together the best young mathematicians from over 50 schools across the region. Students compete in various categories including problem-solving, mental mathematics, and collaborative team challenges.
              </p>
              <p className="mb-6">
                This year's competition saw participation from over 300 students, making our students' achievements even more remarkable.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Behind the Success</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">Dedicated Teachers</h3>
                  <p className="text-gray-700">
                    Special recognition goes to Mrs. Elena Cruz, our Mathematics Department Head, who spent countless hours preparing the students after school and on weekends.
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">Student Commitment</h3>
                  <p className="text-gray-700">
                    Our students demonstrated exceptional dedication, attending extra practice sessions and working through challenging problems for months leading up to the competition.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">Words from Our Winners</h2>
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-600">
                  <p className="italic mb-2">
                    "I never thought I could win a gold medal! The training was hard, but Mrs. Cruz believed in us. I want to thank my parents for supporting me and my classmates for practicing with me every day."
                  </p>
                  <p className="font-semibold">— Juan Miguel Santos, Gold Medalist</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-green-600">
                  <p className="italic mb-2">
                    "Being part of the winning team was amazing! We learned to work together and solve problems as a group. This experience taught me that mathematics can be fun when you work with friends."
                  </p>
                  <p className="font-semibold">— Maria Reyes, Silver Medalist</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">Looking Ahead</h2>
              <p className="mb-4">
                Building on this success, Papaya Academy will be enhancing its mathematics program with:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Advanced mathematics club for gifted students</li>
                <li>Regular participation in regional and national competitions</li>
                <li>Mathematics peer tutoring program</li>
                <li>Integration of technology in mathematics learning</li>
              </ul>

              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 mt-8">
                <p className="font-semibold">
                  Join us in congratulating our brilliant mathematicians! Their success inspires us all to strive for excellence in everything we do.
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <Link href="/news" className="text-blue-600 hover:text-blue-800 font-medium">
                  ← Back to News
                </Link>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Share Article
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
