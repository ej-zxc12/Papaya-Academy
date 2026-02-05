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

// --- IMPORTS ---
import Header from '../../components/Header';
import ScrollReveal from '../../components/ScrollReveal'; 
import Footer from '../../components/Footer'; 
import AboutDropdown from '../../components/AboutDropdown'; 

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

// --- ACHIEVEMENTS DATA ---
const ACHIEVEMENTS_DATA = [
  // 2025 Events
  {
    id: 1,
    title: "Amazing FILIPINIANA Event at ISM! 🇵🇭",
    category: "Cultural",
    date: "December 12, 2025",
    image: "/images/placeholder-filipiniana.jpg",
    excerpt: "This year's theme, KUNDIMAN, truly captured the heart of our Filipino culture — full of grace, tradition, and pride. Our students showcased exceptional performances celebrating Filipino heritage.",
    isFeatured: false
  },
  {
    id: 2,
    title: "Papaya Academy Shines at ROPRISA 2025 with Multiple Championships",
    category: "Featured",
    date: "September 13, 2025",
    image: "/images/placeholder-feature.jpg",
    excerpt: "Outstanding performances across folk dance, vocal solo, table tennis, and volleyball competitions bring home multiple medals and championships to Papaya Academy.",
    isFeatured: true
  },
  {
    id: 3,
    title: "Folk Dance – ROPRISA Competition (3rd Place)",
    category: "Cultural",
    date: "September 13, 2025",
    image: "/images/placeholder-folk-dance.jpg",
    excerpt: "The Papaya Folk Dancers delivered an energetic performance of the traditional 'Itik-Itik' dance, earning 3rd Place in the ROPRISA Literary and Musical Competition.",
    isFeatured: false
  },
  {
    id: 4,
    title: "Intermediate Vocal Solo – ROPRISA Competition (2nd Place)",
    category: "Cultural",
    date: "September 13, 2025",
    image: "/images/placeholder-vocal.jpg",
    excerpt: "Mygs Filaro achieved 2nd Place in the Intermediate Vocal Solo Category under the guidance of coach Ms. Geen, showcasing exceptional vocal talent.",
    isFeatured: false
  },
  {
    id: 5,
    title: "Table Tennis – ROPRISA Sports Fest 2025 (Championship)",
    category: "Sports",
    date: "2025",
    image: "/images/placeholder-table-tennis.jpg",
    excerpt: "Elementary boys and girls athletes secured the championship title in Table Tennis Elementary Division, demonstrating exceptional teamwork and skill.",
    isFeatured: false
  },
  {
    id: 6,
    title: "Volleyball – ROPRISA Sports Fest 2025 (Championship)",
    category: "Sports",
    date: "2025",
    image: "/images/placeholder-volleyball.jpg",
    excerpt: "Papaya Academy celebrated victory after securing the championship title in Volleyball Elementary Division for both Boys and Girls.",
    isFeatured: false
  },
  
  // 2024 Events
  {
    id: 7,
    title: "Folk Dance – ROPRISA 2024 (2nd Place)",
    category: "Cultural",
    date: "2024",
    image: "/images/placeholder-subli.jpg",
    excerpt: "The Papaya Folk Dancers won 2nd Place with their Subli Folk Dance presentation, showcasing the richness of Filipino culture.",
    isFeatured: false
  },
  {
    id: 8,
    title: "Declamation – ROPRISA LITMUS (2nd Place)",
    category: "Academic",
    date: "2024",
    image: "/images/placeholder-declamation.jpg",
    excerpt: "Mcqueen Imperial earned 2nd Place in the Declamation Contest with 'Respect Starts with Me,' under the coaching of Sir Erwin.",
    isFeatured: false
  },
  {
    id: 9,
    title: "Poetry Recitation – ROPRISA 2024 (2nd Place)",
    category: "Academic",
    date: "2024",
    image: "/images/placeholder-poetry.jpg",
    excerpt: "Grade 2 student Aaron 'Chok' Sargento won 2nd Place in Poetry Recitation, impressing judges with outstanding tula delivery.",
    isFeatured: false
  },
  {
    id: 10,
    title: "Provincial Volleyball Sports Competition (Silver Medalist)",
    category: "Sports",
    date: "2024",
    image: "/images/placeholder-provincial-volley.jpg",
    excerpt: "Proudly represented Team Rodriguez, earning Silver Medal in Provincial Volleyball for Elementary Boys and Girls Division.",
    isFeatured: false
  },
  {
    id: 11,
    title: "Table Tennis – Rizal Province (Multiple Gold Medals)",
    category: "Sports",
    date: "2024",
    image: "/images/placeholder-rizal-table.jpg",
    excerpt: "Outstanding results in Rizal Province Table Tennis Competition: Boys Division - Gold in Single A & B, Silver in Doubles; Girls Division - Gold in Single A & B and Doubles.",
    isFeatured: false
  },
  {
    id: 12,
    title: "Municipal Meet 2024 – Montalban, Rizal (Multiple Medals)",
    category: "Sports",
    date: "2024",
    image: "/images/placeholder-municipal.jpg",
    excerpt: "Athletes earned multiple medals: Golds from Daniela Joy Napa and Ahira Faith Mantos, Silvers from Princesca Valencia and Aldrich Agarin, and Bronzes from Jannel Imperial, Ronyhiel Mark Agustin, and Xackaree Dylan Mamansag.",
    isFeatured: false
  },
  {
    id: 13,
    title: "Provincial Volleyball – Girls Division (1st Place)",
    category: "Sports",
    date: "2024",
    image: "/images/placeholder-girls-volley.jpg",
    excerpt: "Girls' volleyball team secured 1st Place and Gold Medal at Provincial Volleyball Sports Competition in Montalban.",
    isFeatured: false
  },
  
  // 2019 Events
  {
    id: 14,
    title: "Table Tennis – ROPRISA SY 2018-2019 (Championships)",
    category: "Sports",
    date: "2019",
    image: "/images/placeholder-2019-table.jpg",
    excerpt: "Raymond Pesidas and Elias Bulseco won 1st Place in Doubles; Alexis Versaga earned 2nd Place in Singles; Chris Artaghin won 1st Place in Singles.",
    isFeatured: false
  },
  {
    id: 15,
    title: "DAMA Girls – ROPRISA SY 2018-2019 (2nd Place)",
    category: "Sports",
    date: "2019",
    image: "/images/placeholder-dama.jpg",
    excerpt: "Nicole Mahinay earned 2nd Place in DAMA Girls category, showcasing impressive performance and bringing honor to the school.",
    isFeatured: false
  }
];

const CATEGORIES = ["All", "Featured", "Cultural", "Academic", "Sports"];

export default function NewsPage() {
  const [isHovered, setIsHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  // Filter logic
  const filteredNews = activeCategory === "All" 
    ? ACHIEVEMENTS_DATA 
    : ACHIEVEMENTS_DATA.filter(item => item.category === activeCategory);

  const featuredStory = ACHIEVEMENTS_DATA.find(item => item.isFeatured);
  const standardStories = filteredNews.filter(item => !item.isFeatured || activeCategory !== "All");

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 ${montserrat.className}`}>
      
      {/* --- HEADER --- */}
      <Header />

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