import Image from 'next/image';
import Link from 'next/link';
import WhatWeDo from '../components/WhatWeDo';
import Projects from '../components/Projects';
import ImpactMetrics from '../components/ImpactMetrics';
import DonationSection from '../components/DonationSection';
import Gallery from '../components/Gallery';
import GetInvolved from '../components/GetInvolved';
import NewsSection from '../components/NewsSection';
import Footer from '../components/Footer';
import AboutDropdown from '../components/AboutDropdown';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-papaya-green text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
              <Image 
                src="/images/papaya.jpg" 
                alt="Papaya Academy Logo" 
                width={40} 
                height={40} 
                className="object-cover w-full h-full"
              />
            </div>
            <h1 className="text-2xl font-bold">Papaya Academy, Inc. </h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="nav-link font-medium">Home</Link>
            <AboutDropdown />
            <Link href="/programs" className="nav-link font-medium">Programs</Link>
            <Link href="/news" className="nav-link font-medium">News</Link>
            <Link href="/contact" className="nav-link font-medium">Contact</Link>
          </nav>
          
          <button className="bg-papaya-yellow text-papaya-green px-6 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-all duration-200">
            DONATE
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow relative bg-gray-900 text-white">
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-papaya-green/30 to-transparent"></div>   
        
        {/* Hero background image */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/2.jpg)' }}></div>
        
        <div className="container mx-auto px-4 h-full flex items-center relative z-10 py-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Education for disadvantaged youth in the Philippines
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Papaya Academy, Inc. devotes itself to children in extreme poverty living in and around the Payatas rubbish dump in Manila (Philippines). We offer them tools with which they can build a better future for themselves.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="btn-primary bg-papaya-yellow text-papaya-green hover:bg-opacity-80">
                OUR PROGRAMS
              </button>
              <button className="btn-outline border-papaya-yellow text-papaya-yellow hover:bg-papaya-yellow hover:bg-opacity-10">
                LEARN MORE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Metrics Section */}
      <ImpactMetrics />

      {/* What We Do Section */}
      <WhatWeDo />

      {/* Projects Section */}
      <Projects />

      {/* Donation Section */}
      <DonationSection />

      {/* Gallery Section */}
      <Gallery />

      {/* Get Involved Section */}
      <GetInvolved />

      {/* News & Updates Section */}
      <NewsSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
