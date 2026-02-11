"use client";

import { useState, useEffect, use } from 'react';
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
import Header from '../../../components/layout/Header';
import ScrollReveal from '../../../components/ui/ScrollReveal';
import Footer from '../../../components/layout/Footer';
import { getNewsArticleBySlug, NewsArticle, formatNewsDate } from '@/lib/news';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export default function NewsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.id;
  
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const data = await getNewsArticleBySlug(slug);
        
        if (data) {
          setArticle(data);
        } else {
          setError('Article not found');
        }
      } catch (err) {
        setError('Failed to load article');
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${montserrat.className}`}>
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3E2A] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading article...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={`min-h-screen bg-gray-50 ${montserrat.className}`}>
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The article you are looking for does not exist.'}</p>
            <Link 
              href="/news"
              className="inline-flex items-center px-6 py-3 bg-[#1B3E2A] text-white rounded-lg hover:bg-[#163021] transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back to News
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${montserrat.className}`}>
      
      {/* --- HEADER --- */}
      <Header />

      {/* --- HERO SECTION --- */}
      <div className="relative h-[600px] md:h-[700px] bg-gradient-to-br from-papaya-green via-papaya-green/95 to-[#1B3E2A] overflow-hidden">
        {article.featured_image && (
          <div className="absolute inset-0">
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover opacity-20"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-4xl">
            <ScrollReveal animation="fade-up">
              <div className="flex flex-wrap items-center gap-4 text-white/95 mb-8">
                <div className="flex items-center space-x-2 bg-papaya-yellow/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Calendar className="w-4 h-4 text-papaya-yellow" />
                  <span className="text-sm font-medium">{formatNewsDate(article.published_at || article.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Tag className="w-4 h-4 text-papaya-yellow" />
                  <span className="text-sm font-medium">News</span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
                {article.title}
              </h1>
              
              {article.author && (
                <p className="text-xl text-white/90 mb-4">By {article.author}</p>
              )}
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
                      <p className="font-semibold text-gray-800">{formatNewsDate(article.published_at || article.created_at)}</p>
                    </div>
                  </div>
                  {article.author && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-papaya-yellow/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-papaya-yellow" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Author</p>
                        <p className="font-semibold text-gray-800">{article.author}</p>
                      </div>
                    </div>
                  )}
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
          {article.featured_image && (
            <ScrollReveal animation="fade-up" delay={200} className="mb-12">
              <div className="group relative h-[400px] md:h-[550px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={article.featured_image}
                  alt={article.title}
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
                    <p className="text-sm font-semibold text-gray-800">News Article</p>
                    <p className="text-xs text-gray-600 mt-1">Papaya Academy • {formatNewsDate(article.published_at || article.created_at)}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* --- ARTICLE CONTENT --- */}
          <div className="prose prose-lg max-w-none">
            <ScrollReveal animation="fade-up" delay={300}>
              <div className="bg-gradient-to-br from-white to-papaya-light/30 rounded-2xl p-8 md:p-12 shadow-lg border border-papaya-green/10 mb-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-1 bg-papaya-green rounded-full"></div>
                  <div className="w-12 h-1 bg-papaya-yellow rounded-full"></div>
                </div>
                
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  {article.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-lg">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </ScrollReveal>
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
