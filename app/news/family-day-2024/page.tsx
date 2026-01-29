import React from 'react';
import Link from 'next/link';

export default function FamilyDayArticle() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <span className="text-sm text-purple-300 font-semibold">School Event</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
              Annual Family Day Celebration
            </h1>
            <p className="text-lg opacity-90">
              Published on March 12, 2024
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
                Get ready for our most anticipated event of the year! Papaya Academy's Annual Family Day Celebration is happening on April 5, 2024, and we promise a day filled with fun, laughter, and wonderful memories for the entire family.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Event Details</h2>
              <div className="bg-purple-50 border-l-4 border-purple-600 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Date:</strong> April 5, 2024 (Saturday)</p>
                    <p><strong>Time:</strong> 8:00 AM - 5:00 PM</p>
                    <p><strong>Venue:</strong> Papaya Academy Campus</p>
                  </div>
                  <div>
                    <p><strong>Theme:</strong> "Family Unity: Building Stronger Bonds"</p>
                    <p><strong>Attire:</strong> Casual/Family Color Coding (Optional)</p>
                    <p><strong>Registration:</strong> Free for all enrolled students and their families</p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">Exciting Activities Planned</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🎮 Fun Games</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Family Relay Races</li>
                    <li>• Three-legged Race</li>
                    <li>• Sack Race</li>
                    <li>• Tug of War</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🎭 Entertainment</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Student Performances</li>
                    <li>• Parent Talent Show</li>
                    <li>• Magic Show</li>
                    <li>• Live Band</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🍔 Food & Drinks</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Food Stalls</li>
                    <li>• BBQ Station</li>
                    <li>• Ice Cream Corner</li>
                    <li>• Refreshment Booths</li>
                  </ul>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🎨 Creative Activities</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Face Painting</li>
                    <li>• Art Corner</li>
                    <li>• Photo Booth</li>
                    <li>• DIY Crafts</li>
                  </ul>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🏆 Competitions</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Best Family Costume</li>
                    <li>• Family Cheer Competition</li>
                    <li>• Cooking Contest</li>
                    <li>• Dance Challenge</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🎁 Raffle & Prizes</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Grand Raffle Draw</li>
                    <li>• Game Winners</li>
                    <li>• Participation Awards</li>
                    <li>• Special Surprises</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">Schedule of Activities</h2>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-gray-50 rounded-lg">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="px-4 py-2 text-left">Time</th>
                      <th className="px-4 py-2 text-left">Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-2">8:00 AM</td>
                      <td className="px-4 py-2">Registration & Opening Program</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">9:00 AM</td>
                      <td className="px-4 py-2">Family Games (Field)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">11:00 AM</td>
                      <td className="px-4 py-2">Student Performances (Stage)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">12:00 PM</td>
                      <td className="px-4 py-2">Lunch Break</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">1:00 PM</td>
                      <td className="px-4 py-2">Parent Talent Show</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">2:30 PM</td>
                      <td className="px-4 py-2">Family Competitions</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">4:00 PM</td>
                      <td className="px-4 py-2">Raffle Draw & Awarding</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2">4:30 PM</td>
                      <td className="px-4 py-2">Closing Program</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">What to Bring</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Extra clothes for changing</li>
                <li>Towels and personal hygiene items</li>
                <li>Camera for capturing memories</li>
                <li>Water bottles (refilling stations available)</li>
                <li>Sun protection (hats, sunscreen)</li>
                <li>Cash for food stalls and raffle tickets</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">Volunteer Opportunities</h2>
              <p className="mb-4">
                We need parent volunteers to make this event successful! If you'd like to help with:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Game facilitation</li>
                <li>Food booth management</li>
                <li>Registration desk</li>
                <li>Clean-up crew</li>
              </ul>
              <p className="mb-6">
                Please contact the PTA Office or sign up at the school administration office.
              </p>

              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 mt-8">
                <p className="font-semibold">
                  This Family Day is more than just fun and games—it's about strengthening the bonds within our school community and creating lasting memories together. We look forward to seeing every family there!
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
