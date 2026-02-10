"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Montserrat } from 'next/font/google';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  Tag, 
  ChevronLeft,
  Share2,
  Heart,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  Music,
  Theater,
  Users,
  Star,
  Award
} from 'lucide-react';

// --- IMPORTS ---
import Header from '../../../components/Header';
import ScrollReveal from '../../../components/ScrollReveal';
import Footer from '../../../components/Footer';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

// Base news article data structure - customize this for each article
interface NewsArticle {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  category: string;
  readTime: string;
  featuredImage: string;
  imageAlt: string;
  content: {
    introduction: string;
    culturalPerformances?: string;
    musicalExcellence?: string;
    eventHighlights?: {
      title: string;
      description: string;
    }[];
  };
  relatedArticles?: {
    title: string;
    href: string;
  }[];
}

// Sample article data - replace with props or data fetching for dynamic content
const sampleArticle: NewsArticle = {
  id: 3,
  title: "Folk Dance Competition",
  subtitle: "ROPRISA 2025",
  date: "September 13, 2025",
  category: "Cultural Events",
  readTime: "3 minutes",
  featuredImage: "/images/itik.jpg",
  imageAlt: "Folk Dance Competition ROPRISA 2025",
  content: {
    introduction: "The Papaya Folk Dancers delivered an energetic performance of the traditional 'Itik-Itik' dance, earning 3rd Place in the prestigious ROPRISA Literary and Musical Competition. This achievement showcases our students' dedication to preserving Filipino cultural heritage.",
    culturalPerformances: "Students performed the traditional 'Itik-Itik' dance with remarkable grace and enthusiasm, demonstrating their understanding of Filipino cultural movements and traditions.",
    musicalExcellence: "The performance was accompanied by traditional Filipino music that enhanced the cultural authenticity of the presentation.",
    eventHighlights: [
      {
        title: "3rd Place Achievement",
        description: "Earned recognition among competing schools from the region, highlighting the quality of our cultural program."
      },
      {
        title: "Traditional Dance Mastery",
        description: "Students showcased their mastery of traditional Filipino dance forms and movements."
      },
      {
        title: "Cultural Representation",
        description: "Successfully represented Papaya Academy's commitment to cultural education and preservation."
      }
    ]
  },
  relatedArticles: [
    { title: "FILIPINIANA Event", href: "/news/1" },
    { title: "Kalinga Gala Dinner", href: "/news/2" }
  ]
};

export default function NewsArticlePage({ params }: { params: { id: string } }) {
  const [isLiked, setIsLiked] = useState(false);
  
  // In a real app, you would fetch article data based on params.id
  const article = sampleArticle; // Replace with data fetching logic

  return (
    <div className={`min-h-screen bg-gray-50 ${montserrat.className}`}>
      
      {/* --- HEADER --- */}
      <Header />

      {/* --- HERO SECTION --- */}
      <div className="relative h-[600px] md:h-[700px] bg-gradient-to-br from-papaya-green via-papaya-green/95 to-[#1B3E2A] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={article.featuredImage}
            alt={article.imageAlt}
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-4xl">
            <ScrollReveal animation="fade-up">
              <div className="flex flex-wrap items-center gap-4 text-white/95 mb-8">
                <div className="flex items-center space-x-2 bg-papaya-yellow/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Calendar className="w-4 h-4 text-papaya-yellow" />
                  <span className="text-sm font-medium">{article.date}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Tag className="w-4 h-4 text-papaya-yellow" />
                  <span className="text-sm font-medium">{article.category}</span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
                {article.title}
                <span className="block text-3xl md:text-4xl font-normal text-papaya-yellow mt-3">{article.subtitle}</span>
              </h1>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* --- BREADCRUMB --- */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-papaya-green transition-colors font-medium">
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <Link href="/news" className="text-gray-500 hover:text-papaya-green transition-colors font-medium">
              News & Updates
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-papaya-green font-semibold">{article.title}</span>
          </nav>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* --- ARTICLE HEADER --- */}
          <ScrollReveal animation="fade-up" className="mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-papaya-green/10 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-papaya-green" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Published</p>
                      <p className="font-semibold text-gray-800">{article.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-papaya-yellow/10 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-papaya-yellow" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Reading Time</p>
                      <p className="font-semibold text-gray-800">{article.readTime}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                      isLiked 
                        ? 'bg-red-50 text-red-600 border border-red-200' 
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="font-medium">{isLiked ? 'Liked' : 'Like'}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-4 py-2.5 bg-papaya-green text-white rounded-lg hover:bg-papaya-green/90 transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="font-medium">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* --- FEATURED IMAGE --- */}
          <ScrollReveal animation="fade-up" delay={200} className="mb-12">
            <div className="group relative h-[400px] md:h-[550px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={article.featuredImage}
                alt={article.imageAlt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-papaya-green rounded-full"></div>
                    <div className="w-2 h-2 bg-papaya-yellow rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{article.subtitle} - Cultural Competition</p>
                  <p className="text-xs text-gray-600 mt-1">Papaya Academy • September 2025</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* --- ARTICLE CONTENT --- */}
          <div className="prose prose-lg max-w-none">
            <ScrollReveal animation="fade-up" delay={300}>
              <div className="bg-gradient-to-br from-white to-papaya-light/30 rounded-2xl p-8 md:p-12 shadow-lg border border-papaya-green/10 mb-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-1 bg-papaya-green rounded-full"></div>
                  <div className="w-12 h-1 bg-papaya-yellow rounded-full"></div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-6 leading-tight">
                  Excellence in Traditional Dance
                </h2>
                
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-lg">
                    {article.content.introduction}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Cultural Performances and Musical Excellence */}
            {article.content.culturalPerformances && article.content.musicalExcellence && (
              <ScrollReveal animation="fade-up" delay={400}>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="group bg-gradient-to-br from-papaya-green/5 to-papaya-yellow/5 rounded-2xl p-8 border border-papaya-green/20 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-papaya-green/20 rounded-full flex items-center justify-center">
                        <Theater className="w-6 h-6 text-papaya-green" />
                      </div>
                      <h3 className="text-xl font-bold text-papaya-green">Cultural Performances</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {article.content.culturalPerformances}
                    </p>
                    <div className="mt-4 flex items-center text-papaya-green font-medium group-hover:text-papaya-yellow transition-colors">
                      <span className="text-sm">Learn more</span>
                      <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  
                  <div className="group bg-gradient-to-br from-papaya-yellow/5 to-papaya-green/5 rounded-2xl p-8 border border-papaya-yellow/20 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-papaya-yellow/20 rounded-full flex items-center justify-center">
                        <Music className="w-6 h-6 text-papaya-green" />
                      </div>
                      <h3 className="text-xl font-bold text-papaya-green">Musical Excellence</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {article.content.musicalExcellence}
                    </p>
                    <div className="mt-4 flex items-center text-papaya-green font-medium group-hover:text-papaya-yellow transition-colors">
                      <span className="text-sm">Learn more</span>
                      <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Event Highlights */}
            {article.content.eventHighlights && (
              <ScrollReveal animation="fade-up" delay={500}>
                <div className="bg-gradient-to-br from-white to-papaya-light/20 rounded-2xl p-8 md:p-12 shadow-lg border border-papaya-green/10 mb-8">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-8 h-8 bg-papaya-green rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-papaya-green">Competition Highlights</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {article.content.eventHighlights.map((highlight, index) => (
                      <div key={index} className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-papaya-green/5 transition-colors">
                        <div className="w-10 h-10 bg-papaya-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                          <span className="text-papaya-green font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-2 text-lg">{highlight.title}</h4>
                          <p className="text-gray-600 leading-relaxed">{highlight.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>

          {/* --- NAVIGATION --- */}
          <ScrollReveal animation="fade-up" delay={800}>
            <div className="bg-gradient-to-br from-papaya-green/5 to-papaya-yellow/5 rounded-2xl p-8 border border-papaya-green/20">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-papaya-green rounded-full flex items-center justify-center">
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <Link 
                      href="/news"
                      className="text-papaya-green hover:text-papaya-yellow transition-colors font-bold text-lg"
                    >
                      Back to News & Updates
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">Explore more stories and events</p>
                  </div>
                </div>
                
                {article.relatedArticles && article.relatedArticles.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-papaya-green/20">
                    <p className="text-sm font-semibold text-papaya-green mb-3">More Cultural Events:</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {article.relatedArticles.map((related, index) => (
                        <Link 
                          key={index}
                          href={related.href}
                          className="group flex items-center space-x-2 text-papaya-green hover:text-papaya-yellow transition-colors font-medium"
                        >
                          <span>{related.title}</span>
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <Footer />
    </div>
  );
}
