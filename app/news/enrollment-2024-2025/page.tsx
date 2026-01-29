import React from 'react';
import Link from 'next/link';

export default function EnrollmentArticle() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <span className="text-sm text-red-300 font-semibold">Important Notice</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
              Enrollment for School Year 2024-2025 Now Open
            </h1>
            <p className="text-lg opacity-90">
              Published on March 18, 2024
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
                We are pleased to announce that enrollment for the upcoming School Year 2024-2025 is now officially open at Papaya Academy. We invite parents and guardians to secure their children's spots for another year of quality education and personal growth.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Enrollment Schedule</h2>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-6">
                <ul className="space-y-2">
                  <li><strong>March 20-30, 2024:</strong> Regular enrollment period</li>
                  <li><strong>March 25, 2024:</strong> Orientation for new students and parents</li>
                  <li><strong>April 1-5, 2024:</strong> Late enrollment (with additional fees)</li>
                  <li><strong>June 10, 2024:</strong> First day of classes</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">Required Documents</h2>
              <p className="mb-4">
                Please prepare the following documents for enrollment:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Birth Certificate (original and photocopy)</li>
                <li>Report Card from previous school (for transferees)</li>
                <li>Certificate of Good Moral Character (for transferees)</li>
                <li>Parent's/Guardian's Valid ID</li>
                <li>2x2 ID pictures (2 copies)</li>
                <li>Accomplished enrollment form (available at school office)</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">Grade Levels Available</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Elementary</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Kindergarten</li>
                    <li>• Grade 1 - Grade 6</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Junior High School</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Grade 7 - Grade 10</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">Tuition and Fees</h2>
              <p className="mb-4">
                Papaya Academy continues to provide quality education at affordable rates. Scholarship programs are available for qualified students from disadvantaged families.
              </p>
              <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-6">
                <p className="font-semibold text-green-800">
                  For detailed information about tuition fees and scholarship applications, please visit the school office or call us at (02) 1234-5678.
                </p>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">Why Choose Papaya Academy?</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Experienced and dedicated teachers</li>
                <li>Modern facilities and learning resources</li>
                <li>Focus on holistic development</li>
                <li>Safe and nurturing environment</li>
                <li>Strong parent-teacher partnership</li>
                <li>Values-based education</li>
              </ul>

              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 mt-8">
                <p className="font-semibold">
                  <strong>Important:</strong> Slots are limited and will be filled on a first-come, first-served basis. Early enrollment is highly recommended to secure your child's place.
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
