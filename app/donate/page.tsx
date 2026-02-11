  'use client';

<<<<<<< Updated upstream
import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { loadStripe } from '@stripe/stripe-js';
=======
  import { useState, useEffect } from 'react';
  import Image from 'next/image';
  import { motion, AnimatePresence } from 'framer-motion';
  import { Smartphone, Globe, Heart, CheckCircle2 } from 'lucide-react';
  import Header from '@/components/Header';
>>>>>>> Stashed changes

  // --- CONFIGURATION ---
  const CAROUSEL_IMAGES = [
    '/images/1.jpg',   
    '/images/3.jpg',
    '/images/jeep.jpg'
  ];

  const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

  export default function DonatePage() {
    const [activeTab, setActiveTab] = useState('local');
    const [amount, setAmount] = useState(500);
    const [customAmount, setCustomAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [isBtnHovered, setIsBtnHovered] = useState(false);
    
    // Carousel State
    const [currentImage, setCurrentImage] = useState(0);

    // Auto-play Carousel
    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
      }, 5000);
      return () => clearInterval(timer);
    }, []);

    const handleAmountSelect = (val: number) => {
      setAmount(val);
      setCustomAmount('');
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomAmount(e.target.value);
      setAmount(Number(e.target.value));
    };

    const handleDonate = async () => {
      if (!amount || amount <= 0) return alert('Please enter a valid amount');
      setLoading(true);

      try {
        const endpoint = activeTab === 'local' ? '/api/donate/local' : '/api/donate/international';
        
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Payment failed');

        if (data.url || data.checkoutUrl) {
          window.location.href = data.url || data.checkoutUrl;
        }
      } catch (error) {
        console.error('Donation failed:', error);
        alert('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <main className="min-h-screen flex flex-col bg-gray-50 font-sans selection:bg-green-100">
        <Header />

        {/* WIDE CONTAINER SECTION */}
        <div className="flex-grow flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
          {/* CARD CONTAINER */}
          <div className="w-full max-w-[1600px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
            
            {/* --- LEFT SIDE: CAROUSEL --- */}
            <div className="relative w-full lg:w-1/2 bg-gray-900 overflow-hidden h-[300px] lg:h-auto group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                  <div className="absolute inset-0 bg-black/10 z-10" />
                  <Image 
                    src={CAROUSEL_IMAGES[currentImage]} 
                    alt="Impact" 
                    fill 
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Text Overlay */}
              <div className="absolute bottom-24 left-8 right-8 lg:left-16 lg:right-16 z-20 text-white">
                <motion.h2 
                  key={currentImage}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-4xl lg:text-5xl font-light tracking-wide mb-4 leading-tight"
                >
                  {currentImage === 0 && "Empower a Child"}
                  {currentImage === 1 && "Build a Future"}
                  {currentImage === 2 && "Transform Communities"}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-lg md:text-xl text-gray-100 font-light leading-relaxed opacity-90 tracking-wide max-w-2xl"
                >
                  Papaya Academy, Inc. devotes itself to children in extreme poverty living in and around the Payatas rubbish dump in Manila.
                </motion.p>
              </div>

              {/* Liquid Dots */}
              <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center">
                <div className="flex gap-4 p-4" style={{ filter: "url('#gooey')" }}>
                  {CAROUSEL_IMAGES.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentImage(idx)} className="relative w-4 h-4 outline-none">
                      <div className="absolute inset-0 rounded-full bg-white/30" />
                      {currentImage === idx && (
                        <motion.div
                          layoutId="liquid-dot"
                          className="absolute inset-0 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)]"
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
                <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                  <defs>
                    <filter id="gooey">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
                      <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
                    </filter>
                  </defs>
                </svg>
              </div>
            </div>

            {/* --- RIGHT SIDE: PAYMENT FORM --- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 lg:p-12 relative">
              <div className="w-full max-w-lg">
                
                <div className="flex items-center space-x-3 mb-6">
                  <Heart className="text-[#1B3E2A] fill-[#1B3E2A] w-5 h-5 animate-pulse" />
                  <span className="text-sm font-light tracking-[0.25em] text-gray-400 uppercase">Secure Donation</span>
                </div>

                {/* STYLED SLIDING TABS - UPDATED RADIUS TO 16px (2xl) */}
                <div className="flex p-1.5 bg-gray-50 rounded-2xl mb-8 relative border border-gray-100">
                  <button
                    onClick={() => setActiveTab('local')}
                    // Updated inner radius to rounded-xl to fit the new container
                    className={`flex-1 flex items-center justify-center py-4 text-sm font-medium tracking-wide rounded-xl transition-colors duration-300 relative outline-none ${
                      activeTab === 'local' ? 'text-[#F2C94C]' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <span className="relative z-10 flex items-center">
                      <Smartphone className="w-4 h-4 mr-3" />
                      Local (GCash)
                    </span>
                    {activeTab === 'local' && (
                      <motion.div
                        layoutId="tab-highlight"
                        // Updated highlight radius to rounded-xl
                        className="absolute inset-0 bg-[#1B3E2A] rounded-xl shadow-md z-0"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('international')}
                    // Updated inner radius to rounded-xl
                    className={`flex-1 flex items-center justify-center py-4 text-sm font-medium tracking-wide rounded-xl transition-colors duration-300 relative outline-none ${
                      activeTab === 'international' ? 'text-[#F2C94C]' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <span className="relative z-10 flex items-center">
                      <Globe className="w-4 h-4 mr-3" />
                      International
                    </span>
                    {activeTab === 'international' && (
                      <motion.div
                        layoutId="tab-highlight"
                        // Updated highlight radius to rounded-xl
                        className="absolute inset-0 bg-[#1B3E2A] rounded-xl shadow-md z-0"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                </div>

                {/* PAYMENT ICONS */}
                <div className="mb-6 flex justify-start h-8">
                  <AnimatePresence mode="wait">
                    {activeTab === 'local' ? (
                      <motion.div 
                        key="local-icons"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex space-x-4"
                      >
                        <img src="/images/gcash-logo.png" className="h-7 object-contain grayscale opacity-80" alt="GCash" />
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="intl-icons"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex space-x-4"
                      >
                        <img src="/images/visa-logo.png" className="h-7 object-contain grayscale opacity-80" alt="Visa" />
                        <img src="/images/mastercard-logo.png" className="h-7 object-contain grayscale opacity-80" alt="Mastercard" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* AMOUNT SELECTION */}
                <label className="block text-gray-800 font-light tracking-wide mb-4 text-lg">Select Amount</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {PRESET_AMOUNTS.map((val) => (
                    <motion.button
                      key={val}
                      onClick={() => handleAmountSelect(val)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`
                        py-4 px-2 rounded-lg text-sm font-semibold tracking-wide border-2 transition-all duration-200
                        ${amount === val 
                          ? 'border-[#1B3E2A] bg-[#1B3E2A] text-[#F2C94C] shadow-lg ring-2 ring-[#1B3E2A] ring-offset-2' 
                          : 'border-gray-100 bg-white text-gray-500 hover:border-[#1B3E2A] hover:bg-green-50 hover:text-[#1B3E2A] hover:shadow-md'
                        }
                      `}
                    >
                      {activeTab === 'local' ? '₱' : '$'}{val.toLocaleString()}
                    </motion.button>
                  ))}
                </div>

                {/* CUSTOM AMOUNT */}
                <div className="relative mb-8 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className={`text-xl font-light transition-colors duration-300 ${customAmount ? 'text-[#1B3E2A]' : 'text-gray-300'}`}>
                      {activeTab === 'local' ? '₱' : '$'}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="Enter custom amount"
                    className="block w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1B3E2A] focus:bg-white focus:ring-1 focus:ring-[#1B3E2A] transition-all font-light tracking-wide text-lg"
                  />
                </div>

                {/* PAY BUTTON */}
                <div className="w-full">
                  <button
                    onClick={handleDonate}
                    disabled={loading}
                    onMouseEnter={() => setIsBtnHovered(true)}
                    onMouseLeave={() => setIsBtnHovered(false)}
                    className="flex items-center justify-center gap-2 px-8 py-4 w-full rounded-md font-bold text-sm tracking-widest border border-[#1B3E2A] border-b-4 shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      backgroundImage: 'linear-gradient(to top, #1B3E2A 50%, transparent 50%)',
                      backgroundSize: '100% 200%',
                      backgroundPosition: isBtnHovered ? 'bottom' : 'top',
                      color: isBtnHovered ? '#F2C94C' : '#1B3E2A', 
                      borderColor: '#1B3E2A',
                      boxShadow: isBtnHovered ? '0 6px 20px rgba(27, 62, 42, 0.4)' : '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  >
                    <CheckCircle2 
                      className={`w-5 h-5 transition-transform duration-300 ${isBtnHovered ? '-translate-y-1' : ''}`} 
                    />
                    {loading ? 'PROCESSING...' : `DONATE ${activeTab === 'local' ? '₱' : '$'}${amount.toLocaleString()}`}
                  </button>
                </div>

                <p className="text-center text-[10px] font-light tracking-widest text-gray-400 mt-6 flex items-center justify-center gap-2 uppercase opacity-60">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> 
                  256-bit SSL Encrypted Payment
                </p>

              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }