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
  Instagram
} from 'lucide-react';

// --- IMPORTS ---
import Header from '../../../components/Header';
import ScrollReveal from '../../../components/ScrollReveal';
import Footer from '../../../components/Footer';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export default function FilipinianaEventPage() {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className={`min-h-screen bg-gray-50 ${montserrat.className}`}>
      
      {/* --- HEADER --- */}
      <Header />

      {/* --- HERO SECTION --- */}
      <div className="relative h-[400px] md:h-[500px] bg-gradient-to-br from-[#1B3E2A] to-[#2d5f3f] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Filipina.jpg"
            alt="FILIPINIANA Event at ISM"
            fill
            className="object-cover opacity-30"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-4xl">
            <ScrollReveal animation="fade-up">
              <div className="flex items-center space-x-4 text-white/90 mb-4">
                <span className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-[#F2C94C]" />
                  December 12, 2025
                </span>
                <span className="flex items-center text-sm">
                  <Tag className="w-4 h-4 mr-2 text-[#F2C94C]" />
                  Cultural Events
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Amazing FILIPINIANA Event at ISM! 🇵🇭
              </h1>
              
              <p className="text-xl text-white/90 max-w-3xl">
                This year's theme, KUNDIMAN, truly captured the heart of our Filipino culture — full of grace, tradition, and pride.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* --- BREADCRUMB --- */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-[#1B3E2A] transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/news" className="text-gray-500 hover:text-[#1B3E2A] transition-colors">
              News & Updates
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-[#1B3E2A] font-medium">FILIPINIANA Event</span>
          </nav>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* --- ARTICLE HEADER --- */}
          <ScrollReveal animation="fade-up" className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200">
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>December 12, 2025</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>5 min read</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* --- FEATURED IMAGE --- */}
          <ScrollReveal animation="fade-up" delay={200} className="mb-12">
            <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-xl">
              <Image
                src="/images/Filipina.jpg"
                alt="FILIPINIANA Event KUNDIMAN Theme"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-sm font-medium text-gray-800">KUNDIMAN Theme - Filipino Cultural Celebration</p>
              </div>
            </div>
          </ScrollReveal>

          {/* --- ARTICLE CONTENT --- */}
          <div className="prose prose-lg max-w-none">
            <ScrollReveal animation="fade-up" delay={300}>
              <div className="bg-white rounded-xl p-8 md:p-12 shadow-sm border border-gray-100 mb-8">
                <h2 className="text-3xl font-bold text-[#1B3E2A] mb-6">
                  Celebrating Filipino Heritage Through KUNDIMAN
                </h2>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  The International School Manila (ISM) recently hosted an extraordinary FILIPINIANA event that brought the vibrant spirit of Filipino culture to life. This year's theme, KUNDIMAN, served as a beautiful tribute to traditional Filipino art forms, music, and dance that have shaped our cultural identity.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6">
                  KUNDIMAN, a traditional genre of Filipino love songs, became the perfect backdrop for showcasing the depth and beauty of our heritage. The event featured exceptional performances from our talented students who demonstrated remarkable skill in interpreting various Filipino cultural pieces.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={400}>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gradient-to-br from-[#F2C94C]/10 to-[#1B3E2A]/10 rounded-xl p-6 border border-[#F2C94C]/20">
                  <h3 className="text-xl font-bold text-[#1B3E2A] mb-4">🎭 Cultural Performances</h3>
                  <p className="text-gray-700">
                    Students showcased traditional Filipino dances and musical performances that highlighted the grace and elegance of our cultural heritage.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-[#1B3E2A]/10 to-[#F2C94C]/10 rounded-xl p-6 border border-[#1B3E2A]/20">
                  <h3 className="text-xl font-bold text-[#1B3E2A] mb-4">🎵 Musical Excellence</h3>
                  <p className="text-gray-700">
                    The KUNDIMAN theme provided a platform for students to demonstrate their vocal talents through traditional Filipino songs.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={500}>
              <div className="bg-white rounded-xl p-8 md:p-12 shadow-sm border border-gray-100 mb-8">
                <h3 className="text-2xl font-bold text-[#1B3E2A] mb-6">
                  Event Highlights
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#F2C94C] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#1B3E2A] font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Traditional Dance Showcase</h4>
                      <p className="text-gray-600">Students performed various regional dances that represent different provinces of the Philippines.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#F2C94C] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#1B3E2A] font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">KUNDIMAN Musical Numbers</h4>
                      <p className="text-gray-600">Beautiful renditions of classic Filipino love songs that touched the hearts of the audience.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#F2C94C] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#1B3E2A] font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Cultural Costume Display</h4>
                      <p className="text-gray-600">Students wore stunning traditional Filipino costumes that showcased our rich textile heritage.</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={600}>
              <div className="bg-gradient-to-r from-[#1B3E2A] to-[#2d5f3f] rounded-xl p-8 md:p-12 text-white mb-8">
                <h3 className="text-2xl font-bold mb-6">Impact and Significance</h3>
                <p className="text-white/90 leading-relaxed mb-4">
                  The FILIPINIANA event serves as more than just a performance – it's an educational journey that connects our students to their roots. Through events like these, we ensure that the next generation grows up with a deep appreciation for Filipino culture and traditions.
                </p>
                <p className="text-white/90 leading-relaxed">
                  The success of this year's KUNDIMAN-themed celebration demonstrates our commitment to preserving and promoting Filipino heritage while providing students with opportunities to develop their artistic talents.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* --- SOCIAL SHARING --- */}
          <ScrollReveal animation="fade-up" delay={700}>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-[#1B3E2A] mb-4">Share this story</h3>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Facebook className="w-5 h-5" />
                  <span>Facebook</span>
                </a>
                <a href="#" className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                  <Twitter className="w-5 h-5" />
                  <span>Twitter</span>
                </a>
                <a href="#" className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
                  <Instagram className="w-5 h-5" />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* --- NAVIGATION --- */}
          <ScrollReveal animation="fade-up" delay={800}>
            <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6">
              <Link 
                href="/news"
                className="flex items-center space-x-2 text-[#1B3E2A] hover:text-[#F2C94C] transition-colors font-medium"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back to News & Updates</span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">More Cultural Events:</span>
                <Link 
                  href="/news/3"
                  className="text-[#1B3E2A] hover:text-[#F2C94C] transition-colors font-medium"
                >
                  Folk Dance Competition →
                </Link>
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
