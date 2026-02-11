"use client";

import { useState, useEffect } from 'react';
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
import Header from '../../components/layout/Header';
import ScrollReveal from '../../components/ui/ScrollReveal'; 
import Footer from '../../components/layout/Footer'; 
import AboutDropdown from '../../components/AboutDropdown';
import NewsArticleCard from '../../components/NewsArticleCard';
import { getNewsArticles, NewsArticle, formatNewsDate } from '@/lib/news';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const CATEGORIES = ["All", "Featured", "Cultural", "Academic", "Sports"];

export default function NewsPage() {
  const [isHovered, setIsHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        console.log('Starting to fetch articles...');
        const data = await getNewsArticles();
        console.log('Articles fetched successfully:', data);
        setArticles(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error fetching articles:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Filter logic
  const filteredArticles = activeCategory === "All" 
    ? articles 
    : articles.filter(item => {
        if (activeCategory === "Featured") {
          return item.featured_image !== null; // Consider articles with images as featured
        }
        // For other categories, you might want to add a category field to your database
        return true; // For now, show all for non-featured categories
      });

  const featuredStory = filteredArticles.find(item => item.featured_image !== null);
  const standardStories = filteredArticles.filter(item => !item.featured_image || activeCategory !== "All");

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col bg-gray-50 ${montserrat.className}`}>
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3E2A] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading news articles...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col bg-gray-50 ${montserrat.className}`}>
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Loading News</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-[#1B3E2A] text-white rounded-lg hover:bg-[#163021] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 ${montserrat.className}`}>
      
      {/* --- HEADER --- */}
      <Header />

{/* --- NEWS PAGE HEADER --- */}
      <section className="relative bg-gradient-to-br from-papaya-green to-green-800 text-white py-20 z-0">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal animation="fade-down" delay={100}>
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-light tracking-wide mb-6 leading-tight drop-shadow-lg text-white">
                Latest Updates
              </h1>
              <p className="text-xl md:text-2xl font-light text-green-100 max-w-3xl mx-auto">
                Stay informed about our global donation impact and community milestones.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* --- MAIN CONTENT AREA --- */}
          <div className="lg:w-2/3">
            
            {/* FEATURED STORY (Hero Card) - Only shows if 'All' is selected */}
            {activeCategory === "All" && featuredStory && (
              <ScrollReveal animation="fade-up" className="mb-12">
                <div className="group relative rounded-xl overflow-hidden shadow-xl bg-white">
                  <div className="h-[400px] relative overflow-hidden">
                    {featuredStory.featured_image && (
                      <Image 
                        src={featuredStory.featured_image} 
                        alt={featuredStory.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#F2C94C] text-[#1B3E2A] px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-sm">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                    <div className="flex items-center space-x-4 text-sm mb-3 opacity-90">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-[#F2C94C]" /> 
                        {formatNewsDate(featuredStory.published_at || featuredStory.created_at)}
                      </span>
                      {featuredStory.author && (
                        <span className="flex items-center">
                          <Tag className="w-4 h-4 mr-1 text-[#F2C94C]" /> 
                          {featuredStory.author}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight group-hover:text-[#F2C94C] transition-colors">
                      <Link href={`/news/${featuredStory.slug}`}>{featuredStory.title}</Link>
                    </h2>
                    <p className="text-gray-200 mb-6 max-w-2xl line-clamp-2 md:line-clamp-none">
                      {featuredStory.content.substring(0, 200)}...
                    </p>
                    <Link href={`/news/${featuredStory.slug}`}>
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
                  <NewsArticleCard article={item} />
                </ScrollReveal>
              ))}
            </div>
            
            {/* No articles message */}
            {standardStories.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No articles found in this category.</p>
              </div>
            )}
            
            {/* Load More */}
            {standardStories.length > 0 && (
              <div className="mt-12 text-center">
                <button className="px-8 py-3 border border-gray-300 text-gray-600 font-bold rounded-md hover:bg-papaya-green hover:text-white hover:border-papaya-green transition-all">
                  LOAD MORE ARTICLES
                </button>
              </div>
            )}
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