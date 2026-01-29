"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Montserrat } from 'next/font/google';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  Search, 
  Tag, 
  ChevronRight,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react';

// --- IMPORTS (Adjust based on your folder structure) ---
import ScrollReveal from '../../components/ScrollReveal'; 
import Footer from '../../components/Footer'; 
import AboutDropdown from '../../components/AboutDropdown'; 

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

// --- MOCK DATA ---
const NEWS_DATA = [
  {
    id: 1,
    title: "Enrollment for School Year 2024-2025 Now Open",
    category: "Admissions",
    date: "March 18, 2024",
    image: "/images/1.jpg", // Ensure this exists
    excerpt: "Registration for the upcoming school year is now open. Parents can enroll their children from March 20-30, 2024. Early bird discounts available.",
    isFeatured: true
  },
  {
    id: 2,
    title: "Students Excel in Regional Math Competition",
    category: "Academic",
    date: "March 15, 2024",
    image: "/images/3.jpg",
    excerpt: "Our Grade 6 students brought home 3 gold medals from the Regional Mathematics Competition, surpassing 50 other schools.",
    isFeatured: false
  },
  {
    id: 3,
    title: "Annual Family Day Celebration Set for April",
    category: "Events",
    date: "March 12, 2024",
    image: "/images/gallery/community1.jpg",
    excerpt: "Join us for our annual Family Day! Fun activities, food stalls, and games await students and parents alike.",
    isFeatured: false
  },
  {
    id: 4,
    title: "New Computer Lab Facilities Inaugurated",
    category: "Facilities",
    date: "March 08, 2024",
    image: "/images/jeep.jpg",
    excerpt: "We are excited to announce the opening of our state-of-the-art computer lab equipped with 30 new workstations.",
    isFeatured: false
  },
  {
    id: 5,
    title: "Ms. Reyes Named Teacher of the Year",
    category: "Faculty",
    date: "March 05, 2024",
    image: "/images/1.jpg",
    excerpt: "Recognizing excellence in teaching and dedication to student growth. Congratulations to Ms. Reyes!",
    isFeatured: false
  }
];

const CATEGORIES = ["All", "Admissions", "Academic", "Events", "Facilities", "Faculty"];

export default function NewsPage() {
  const [isHovered, setIsHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  // Filter logic
  const filteredNews = activeCategory === "All" 
    ? NEWS_DATA 
    : NEWS_DATA.filter(item => item.category === activeCategory);

  const featuredStory = NEWS_DATA.find(item => item.isFeatured);
  const standardStories = filteredNews.filter(item => !item.isFeatured || activeCategory !== "All");

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 ${montserrat.className}`}>
      
      {/* --- HEADER (Reused from Main Page) --- */}
      <header className="bg-papaya-green text-white relative z-50 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
              <Image src="/images/papaya.jpg" alt="Logo" width={40} height={40} className="object-cover w-full h-full"/>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-wide">Papaya Academy, Inc.</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="nav-link text-base font-medium hover:text-[#F2C94C] transition-colors">Home</Link>
            <AboutDropdown />
            <Link href="/programs" className="nav-link text-base font-medium hover:text-[#F2C94C] transition-colors">Programs</Link>
            {/* Active State for News */}
            <Link href="/news" className="nav-link text-base font-bold text-[#F2C94C] transition-colors">News</Link>
            <Link href="/contact" className="nav-link text-base font-medium hover:text-[#F2C94C] transition-colors">Contact</Link>
          </nav>
          
          <Link href="/#donate-section">
            <button
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="px-8 py-2.5 rounded-md font-bold text-sm tracking-widest border border-[#F2C94C] shadow-md transition-shadow duration-300"
              style={{
                backgroundImage: 'linear-gradient(to top, #F2C94C 50%, #1B3E2A 50%)',
                backgroundSize: '100% 200%',
                backgroundPosition: isHovered ? 'bottom' : 'top',
                color: isHovered ? '#1B3E2A' : '#F2C94C',
                boxShadow: isHovered ? '0 6px 20px rgba(242,201,76,0.8)' : '0 4px 14px 0 rgba(242,201,76,0.5)',
                transition: 'background-position 0.4s ease-out, color 0.3s ease, box-shadow 0.3s ease'
              }}
            >
              DONATE
            </button>
          </Link>
        </div>
      </header>

      {/* --- PAGE HEADER --- */}
      <div className="bg-[#1B3E2A] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal animation="fade-down">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">News & Updates</h1>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Stay connected with the latest happenings, achievements, and announcements from Papaya Academy.
            </p>
          </ScrollReveal>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* --- MAIN CONTENT AREA --- */}
          <div className="lg:w-2/3">
            
            {/* FEATURED STORY (Hero Card) - Only shows if 'All' is selected */}
            {activeCategory === "All" && featuredStory && (
              <ScrollReveal animation="fade-up" className="mb-12">
                <div className="group relative rounded-xl overflow-hidden shadow-xl bg-white">
                  <div className="h-[400px] relative overflow-hidden">
                    <Image 
                      src={featuredStory.image} 
                      alt={featuredStory.title} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#F2C94C] text-[#1B3E2A] px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-sm">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                    <div className="flex items-center space-x-4 text-sm mb-3 opacity-90">
                      <span className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-[#F2C94C]" /> {featuredStory.date}</span>
                      <span className="flex items-center"><Tag className="w-4 h-4 mr-1 text-[#F2C94C]" /> {featuredStory.category}</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight group-hover:text-[#F2C94C] transition-colors">
                      <Link href={`/news/${featuredStory.id}`}>{featuredStory.title}</Link>
                    </h2>
                    <p className="text-gray-200 mb-6 max-w-2xl line-clamp-2 md:line-clamp-none">
                      {featuredStory.excerpt}
                    </p>
                    <Link href={`/news/${featuredStory.id}`}>
                      <button className="flex items-center font-bold text-[#F2C94C] hover:text-white transition-colors">
                        READ FULL STORY <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* CATEGORY FILTER (Mobile Only - usually) */}
            <div className="flex overflow-x-auto pb-4 mb-8 gap-2 lg:hidden no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat 
                      ? 'bg-[#1B3E2A] text-white' 
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* STANDARD STORIES GRID */}
            <div className="grid md:grid-cols-2 gap-8">
              {standardStories.map((item, index) => (
                <ScrollReveal key={item.id} animation="fade-up" delay={index * 100}>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col">
                    <div className="h-48 relative overflow-hidden">
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4">
                         <span className="bg-papaya-green/90 text-white px-2 py-1 text-xs font-bold rounded-sm uppercase">
                            {item.category}
                         </span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                         <Calendar className="w-3 h-3 mr-1" /> {item.date}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3 leading-snug group-hover:text-papaya-green transition-colors">
                        <Link href={`/news/${item.id}`}>{item.title}</Link>
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                        {item.excerpt}
                      </p>
                      <Link href={`/news/${item.id}`} className="inline-flex items-center text-papaya-green font-bold text-sm hover:text-[#F2C94C] mt-auto">
                        Read More <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            
            {/* Load More */}
            <div className="mt-12 text-center">
              <button className="px-8 py-3 border border-gray-300 text-gray-600 font-bold rounded-md hover:bg-papaya-green hover:text-white hover:border-papaya-green transition-all">
                LOAD MORE ARTICLES
              </button>
            </div>
          </div>

          {/* --- SIDEBAR --- */}
          <div className="lg:w-1/3 space-y-8">
            
            {/* Search Widget */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-papaya-green mb-4">Search News</h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search articles..." 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F2C94C]"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Categories Widget (Desktop) */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hidden lg:block">
              <h3 className="text-lg font-bold text-papaya-green mb-4">Categories</h3>
              <ul className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <button 
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full flex justify-between items-center px-3 py-2 rounded-md transition-colors ${
                        activeCategory === cat ? 'bg-green-50 text-papaya-green font-bold' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{cat}</span>
                      {activeCategory === cat && <ChevronRight className="w-4 h-4" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Upcoming Events Widget */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-papaya-green mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                {[
                  { title: "Family Day", date: "April 05", time: "8:00 AM" },
                  { title: "Quarterly Exams", date: "Mar 25", time: "All Day" },
                  { title: "Graduation", date: "Apr 15", time: "1:00 PM" }
                ].map((event, i) => (
                  <div key={i} className="flex items-start group cursor-pointer">
                    <div className="bg-gray-100 text-gray-600 rounded-md p-2 text-center min-w-[60px] group-hover:bg-[#F2C94C] group-hover:text-[#1B3E2A] transition-colors">
                      <div className="text-xs font-bold uppercase">{event.date.split(' ')[0]}</div>
                      <div className="text-lg font-bold">{event.date.split(' ')[1]}</div>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-800 group-hover:text-papaya-green transition-colors">{event.title}</h4>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" /> {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Follow */}
            <div className="bg-[#1B3E2A] p-6 rounded-lg shadow-md text-white">
              <h3 className="text-lg font-bold text-[#F2C94C] mb-4">Follow Us</h3>
              <p className="text-sm text-gray-300 mb-6">Stay updated with our daily activities on social media.</p>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-[#F2C94C] hover:text-[#1B3E2A] transition-colors"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-[#F2C94C] hover:text-[#1B3E2A] transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-[#F2C94C] hover:text-[#1B3E2A] transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-[#F2C94C] hover:text-[#1B3E2A] transition-colors"><Youtube className="w-5 h-5" /></a>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}