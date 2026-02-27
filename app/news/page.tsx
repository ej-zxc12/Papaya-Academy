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
  Lock,
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

const CATEGORIES = ["All", "Features", "Cultural", "Academic", "Support"];

export default function NewsPage() {
  const [isHovered, setIsHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeCategoryKey = activeCategory.trim().toLowerCase();

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

  const filteredArticles = (() => {
    if (activeCategoryKey === 'all') return articles;

    if (activeCategoryKey === 'features') {
      return articles.filter((item) => Boolean(item.imageUrl));
    }

    const categoryMappings: Record<string, string[]> = {
      'features': ['featured', 'features'],
      'cultural': ['cultural'],
      'academic': ['academic'],
      'support': ['support']
    };
    const validCategories = categoryMappings[activeCategoryKey] || [activeCategoryKey];

    return articles.filter((item) => {
      const rawCategory = (item as any).category ?? (item as any).categoryType ?? (item as any).type;
      const normalizedItemCategory = typeof rawCategory === 'string' ? rawCategory.toLowerCase() : '';

      if (!normalizedItemCategory) return true;

      return validCategories.includes(normalizedItemCategory);
    });
  })();

  // All and Features both show filtered results directly
  const standardStories = filteredArticles;

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
                Stay informed about our community milestones.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* --- MAIN CONTENT AREA --- */}
          <div className="lg:w-2/3">

            {/* CATEGORY FILTER (Mobile Only - usually) */}
            <div className="flex overflow-x-auto pb-4 mb-8 gap-2 lg:hidden no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex items-center justify-center text-center px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors min-h-[40px] leading-none ${
                    activeCategory === cat
                      ? 'bg-papaya-green text-white border border-papaya-green'
                      : 'bg-white text-papaya-green border border-papaya-green/40'
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
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-white border border-gray-200 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">Coming Soon</div>
                    <div className="text-xs text-gray-500">Upcoming events will be posted here.</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}