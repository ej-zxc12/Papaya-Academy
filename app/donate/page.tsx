'use client';



import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import PolicyModal from './PolicyModal';

import { Wallet, Globe, Heart, CheckCircle2, HandCoins, User, Mail } from 'lucide-react';

import Header from '@/components/layout/Header';

import { Montserrat } from 'next/font/google';



const montserrat = Montserrat({

  subsets: ['latin'],

  weight: ['400', '500', '600', '700'],

});



// --- CONFIGURATION ---

const CAROUSEL_IMAGES = [

  '/images/storm/_DSC6876.jpg',

  '/images/storm/_DSC6898.jpg',

  '/images/storm/_DSC6953.jpg',

  '/images/storm/_DSC7078.jpg',

  '/images/storm/_DSC7086.jpg',

  '/images/storm/_DSC7089.jpg',

  '/images/storm/_DSC7092.jpg',

];



const LOCAL_PRESETS = [500, 1000, 2000, 5000];

const INTL_PRESETS = [10, 25, 50, 100];

const MAX_AMOUNT_LIMIT = 500000;

const MAX_EMAIL_CHARS = 50;

const DEFAULT_EUR_TO_PHP_RATE = 62;



export default function DonatePage() {

  const [method, setMethod] = useState<'local' | 'international'>('local');

  const [intlCurrency, setIntlCurrency] = useState<'USD' | 'EUR'>('USD');

  const [amount, setAmount] = useState<number>(1000);

  const [customAmount, setCustomAmount] = useState<string>('');

  const [fullName, setFullName] = useState<string>('');

  const [email, setEmail] = useState<string>('');

  const [emailError, setEmailError] = useState<string>('');

  const [isCheckingEmail, setIsCheckingEmail] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_EUR_TO_PHP_RATE);

  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [shakeTerms, setShakeTerms] = useState<boolean>(false);

  const [currentSlide, setCurrentSlide] = useState(0);


  // Load terms accepted state from localStorage on mount
  useEffect(() => {
    const savedTerms = localStorage.getItem('donateTermsAccepted');
    if (savedTerms === 'true') {
      setTermsAccepted(true);
    }
  }, []);

  // Save terms accepted state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('donateTermsAccepted', termsAccepted.toString());
  }, [termsAccepted]);

  // Fetch real-time EUR to PHP exchange rate on mount

  useEffect(() => {

    const fetchExchangeRate = async () => {

      try {

        const response = await fetch('https://open.er-api.com/v6/latest/EUR');

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        const phpRate = data.rates?.PHP;

        if (phpRate && typeof phpRate === 'number') {

          setExchangeRate(phpRate);

          console.log('[DonatePage] Fetched EUR to PHP rate:', phpRate);

        } else {

          throw new Error('Invalid rate data');

        }

      } catch (error: any) {

        console.warn('[DonatePage] Failed to fetch exchange rate, using fallback:', error.message);

        setExchangeRate(DEFAULT_EUR_TO_PHP_RATE);

      }

    };



    fetchExchangeRate();

  }, []);



  useEffect(() => {

    // Auto-advance carousel every 5 seconds through all images

    const interval = setInterval(() => {

      setCurrentSlide((prevIndex) => (prevIndex + 1) % CAROUSEL_IMAGES.length);

    }, 5000);

    return () => clearInterval(interval);

  }, []);



  const handleAmountSelect = (val: number) => {

    setAmount(val);

    setCustomAmount('');

  };



  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const val = e.target.value;

    if (val.includes('-') || Number(val) < 0) return;

    if (val.length > 6) return;

    if (val && Number(val) > MAX_AMOUNT_LIMIT) return;



    setCustomAmount(val);

    setAmount(Number(val) || 0);

  };



  const VALID_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'yahoo.co.uk', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'protonmail.com', 'zoho.com', 'yandex.com', 'mail.com', 'gmx.com', 'gmx.net', 'fastmail.com', 'tutanota.com', 'hey.com', 'qq.com', '163.com', '126.com', 'sina.com', 'sohu.com', 'naver.com', 'daum.net', 'hanmail.net', 'nate.com', 'foxmail.com', 'rediffmail.com', 'bol.com.br', 'terra.com.br', 'uol.com.br', 'globo.com', 'ig.com.br', 'r7.com', 'zipmail.com.br', 'pop.com.br', 'bol.com', 'uol.com', 'terra.es', 'terra.com', 'mixmail.com', 'msn.com', 'live.nl', 'live.co.uk', 'live.de', 'live.fr', 'live.it', 'live.es', 'live.com.au', 'hotmail.co.uk', 'hotmail.de', 'hotmail.fr', 'hotmail.it', 'hotmail.es', 'outlook.co.uk', 'outlook.de', 'outlook.fr', 'outlook.it', 'outlook.es', 'outlook.com.au', 'yahoo.co.jp', 'yahoo.de', 'yahoo.fr', 'yahoo.it', 'yahoo.es', 'yahoo.ca', 'yahoo.com.au', 'yahoo.co.in', 'ymail.com', 'rocketmail.com', 'att.net', 'verizon.net', 'comcast.net', 'bellsouth.net', 'cox.net', 'charter.net', 'earthlink.net', 'juno.com', 'netzero.net', 'aim.com', 'walla.com', 'walla.co.il', '013net.net', 'bezeqint.net', 'zahav.net.il', 'internet-zahav.co.il', 'actcom.co.il', 'netvision.net.il', 'xtra.co.nz', 'vodafone.co.nz', 'slingshot.co.nz', 'orcon.net.nz', 'clear.net.nz', 'spark.co.nz', 'gmail.co.uk', 'googlemail.com', 'google.com', 'apple.com', 'microsoft.com', 'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'github.com', 'gitlab.com', 'bitbucket.org', 'atlassian.com', 'slack.com', 'discord.com', 'telegram.org', 'whatsapp.com', 'skype.com', 'zoom.us', 'webex.com', 'gotomeeting.com', 'join.me', 'uber.com', 'lyft.com', 'airbnb.com', 'booking.com', 'expedia.com', 'tripadvisor.com', 'kayak.com', 'hotels.com', 'priceline.com', 'agoda.com', 'hostelworld.com', 'couchsurfing.com', 'wework.com', 'regus.com', 'servcorp.com', 'workspace.com'];



  const checkMXRecord = async (domain: string): Promise<boolean> => {

    try {

      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);

      const data = await response.json();

      return data.Answer && data.Answer.length > 0;

    } catch {

      return true;

    }

  };



  const validateEmail = async (email: string): Promise<boolean> => {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) return false;

    

    const domain = email.split('@')[1]?.toLowerCase();

    if (!VALID_EMAIL_DOMAINS.includes(domain)) return false;

    

    // Check MX record

    const hasMX = await checkMXRecord(domain);

    return hasMX;

  };



  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const value = e.target.value;

    setEmail(value);

    setEmailError('');

    

    if (value && value.includes('@')) {

      setIsCheckingEmail(true);

      const isValid = await validateEmail(value);

      if (!isValid) {

        setEmailError('Please enter a valid, reachable email address');

      }

      setIsCheckingEmail(false);

    }

  };



  const handleDonate = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!amount || amount <= 0) {

      setError('Please enter a valid amount');

      return;

    }

    // Email is optional - only validate if provided

    if (email && !await validateEmail(email)) {

      setError('Please enter a valid email from a recognized provider (Gmail, Yahoo, Outlook, etc.)');

      return;

    }



    setIsLoading(true);

    setError(null);



    try {

      const currency = method === 'local' ? 'PHP' : intlCurrency;

      const response = await fetch('/api/donate', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          amount,

          currency,

          email,

          name: fullName.trim()

        })

      });



      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to create donation');

      

      // Redirect to Xendit payment page

      if (data.invoiceUrl) window.location.href = data.invoiceUrl;

    } catch (err: any) {

      setError(err.message || 'Something went wrong. Please try again.');

      setIsLoading(false);

    }

  };



  const PaymentIcons = () => (

    <div className="flex items-center justify-center gap-6 bg-white p-4 rounded-xl border border-slate-100">

      <img src="/images/Donation/gcash-logo.png" alt="GCash" className="h-6 object-contain" />

      <img src="/images/Donation/mastercard-logo.png" alt="Mastercard" className="h-6 object-contain" />

      <img src="/images/Donation/visa-logo.png" alt="Visa" className="h-6 object-contain" />

    </div>

  );



  return (

    <main className={`min-h-screen flex flex-col bg-gray-50 selection:bg-green-100 ${montserrat.className}`}>

      <Header />



      <div className="flex-grow flex items-center justify-center p-4 lg:p-12">

        <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100 min-h-[750px]">

          

          {/* Left Side: Impact Story with Carousel */}

          <div 

            className="md:w-1/2 relative overflow-hidden flex flex-col justify-between p-8 md:p-12"

            style={{ backgroundColor: '#0a241a' }}

          >

            {/* Background Image Carousel with Overlay */}

            <div className="absolute inset-0 z-0">

              {CAROUSEL_IMAGES.map((img, index) => (

                <img

                  key={index}

                  src={img}

                  alt={`Storm image ${index + 1}`}

                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}

                  style={{ transitionDelay: `${index === currentSlide ? '0s' : '1s'}` }}

                />

              ))}

              {/* Stronger green overlay for donate page */}

              <div 

                className="absolute inset-0 z-10" 

                style={{ backgroundColor: '#0a241a', opacity: 0.5 }}

              ></div>

              <div 

                className="absolute inset-0 z-20"

                style={{ background: 'linear-gradient(to top, rgba(10,36,26,0.95) 0%, transparent 50%, rgba(10,36,26,0.4) 100%)' }}

              ></div>

            </div>



            <div className="relative z-30">

              <div className="inline-flex items-center gap-2 bg-emerald-800/60 px-3 py-1 rounded-full text-sm font-medium mb-6 backdrop-blur-md border border-white/20">

                <Heart className="w-4 h-4 text-white fill-white animate-pulse" />

                <span className="text-white">Sponsor a Child</span>

              </div>

              <h1 className="text-5xl font-bold leading-tight mb-6 text-white tracking-tight">

                Empower the children of Payatas.

              </h1>

              <p className="text-white leading-relaxed text-lg max-w-md">

                Your donation provides quality education, meals, and a safe environment for those living in Manila&apos;s most vulnerable communities.

              </p>

            </div>



            <div className="mt-auto space-y-6 relative z-30">

              <div className="flex items-start gap-4">

                <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/20">

                  <CheckCircle2 className="w-5 h-5 text-white" />

                </div>

                <div>

                  <p className="font-semibold text-white text-lg">Direct Impact</p>

                  <p className="text-sm text-white">100% of your donation goes to student resources.</p>

                </div>

              </div>



              <div className="flex gap-2 pt-8">

                {CAROUSEL_IMAGES.map((_, i) => (

                  <button 

                    key={i} 

                    onClick={() => setCurrentSlide(i)}

                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-emerald-400 shadow-sm' : 'w-2 bg-white/30'}`}

                  />

                ))}

              </div>

            </div>

          </div>



          {/* Right Side: Donation Form */}

          <div className="md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">

            <form onSubmit={handleDonate} className="space-y-6 max-w-md mx-auto w-full">

              

              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">

                <button

                  type="button"

                  onClick={() => { setMethod('local'); setAmount(1000); }}

                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all duration-200 text-sm font-bold border-[2px] ${

                    method === 'local' 

                    ? 'bg-white border-emerald-500 text-emerald-600 shadow-md outline outline-2 outline-emerald-400 outline-offset-1' 

                    : 'border-transparent text-slate-500 hover:text-emerald-600 hover:border-emerald-300'

                  }`}

                >

                  <Wallet style={{ width: '1rem', height: '1rem', color: method === 'local' ? '#059669' : 'currentColor' }} />

                  Local (GCash)

                </button>

                <button

                  type="button"

                  onClick={() => { setMethod('international'); setAmount(25); }}

                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all duration-200 text-sm font-bold border-[2px] ${

                    method === 'international' 

                    ? 'bg-white border-emerald-500 text-emerald-600 shadow-md outline outline-2 outline-emerald-400 outline-offset-1' 

                    : 'border-transparent text-slate-500 hover:text-emerald-600 hover:border-emerald-300'

                  }`}

                >

                  <Globe style={{ width: '1rem', height: '1rem', color: method === 'international' ? '#059669' : 'currentColor' }} />

                  International

                </button>

              </div>



              {method === 'international' && (

                <div className="flex gap-2 p-1 bg-slate-50 rounded-lg border border-slate-100 w-fit mx-auto shadow-sm">

                  <button

                    type="button"

                    onClick={() => setIntlCurrency('USD')}

                    className={`px-4 py-1.5 rounded-md text-xs font-bold border-[2px] transition-all ${

                      intlCurrency === 'USD' 

                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-md outline outline-2 outline-emerald-400 outline-offset-1' 

                        : 'border-transparent text-slate-400 hover:border-emerald-300 hover:text-emerald-600'

                    }`}

                  >

                    USD ($)

                  </button>

                  <button

                    type="button"

                    onClick={() => setIntlCurrency('EUR')}

                    className={`px-4 py-1.5 rounded-md text-xs font-bold border-[2px] transition-all ${

                      intlCurrency === 'EUR' 

                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-md outline outline-2 outline-emerald-400 outline-offset-1' 

                        : 'border-transparent text-slate-400 hover:border-emerald-300 hover:text-emerald-600'

                    }`}

                  >

                    EUR (€)

                  </button>

                </div>

              )}



              {/* Payment Amount Section */}

              <div>

                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">

                  Payment Amount {method === 'local' ? '(PHP)' : intlCurrency === 'EUR' ? '(EUR → PHP)' : '(USD)'}

                </label>

                <div className="grid grid-cols-4 gap-2 mb-4">

                  {(method === 'local' ? LOCAL_PRESETS : INTL_PRESETS).map((val) => (

                    <button

                      key={val}

                      type="button"

                      onClick={() => handleAmountSelect(val)}

                      className={`py-3 rounded-xl border-[3px] transition-all font-bold text-sm ${

                        amount === val && customAmount === ''

                          ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-md outline outline-2 outline-emerald-400 outline-offset-2'

                          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-600'

                      }`}

                    >

                      <span style={{ color: amount === val && customAmount === '' ? '#059669' : undefined }}>

                        {method === 'local' ? '₱' : intlCurrency === 'USD' ? '$' : '€'}{val}

                      </span>

                    </button>

                  ))}

                </div>

                <div className="relative group">

                  <span className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-slate-400 font-bold text-lg transition-colors group-focus-within:text-emerald-700">

                    {method === 'local' ? '₱' : intlCurrency === 'USD' ? '$' : '€'}

                  </span>

                  <input

                    type="number"

                    placeholder="Custom amount"

                    value={customAmount}

                    onChange={handleCustomAmountChange}

                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-600 transition-all text-lg font-bold text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"

                  />

                </div>

              </div>



              {/* User Information Section */}

              <div className="space-y-4">

                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">

                  User Information

                </label>

                <div className="space-y-3">

                  <div className="relative flex items-center">

                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none">

                      <User className="w-5 h-5 text-slate-400" />

                    </div>

                    <input

                      type="text"

                      placeholder="Full Name (Optional)"

                      value={fullName}

                      onChange={(e) => setFullName(e.target.value)}

                      maxLength={50}

                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-600 transition-all text-slate-700 font-medium"

                    />

                  </div>

                  <div className="relative flex items-center">

                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none">

                      <Mail className="w-5 h-5 text-slate-400" />

                    </div>

                    <input

                      type="email"

                      placeholder="Email Address (Optional)"

                      value={email}

                      onChange={handleEmailChange}

                      maxLength={MAX_EMAIL_CHARS}

                      className={`w-full pl-12 pr-5 py-4 bg-slate-50 border-2 rounded-2xl outline-none focus:bg-white transition-all text-slate-700 font-medium ${emailError ? 'border-red-300 focus:border-red-500' : 'border-slate-100 focus:border-emerald-600'}`}

                    />

                    {isCheckingEmail && (

                      <div className="absolute right-4 top-1/2 -translate-y-1/2">

                        <div className="w-4 h-4 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin"></div>

                      </div>

                    )}

                  </div>

                  {emailError && (

                    <p className="text-xs text-red-500 mt-1">{emailError}</p>

                  )}

                </div>

              </div>



              {/* Donate Button */}

              <div className="pt-2">

                <button

                  disabled={isLoading}

                  type="submit"

                  onClick={(e) => {
                    if (!termsAccepted) {
                      e.preventDefault();
                      setShakeTerms(true);
                      setTimeout(() => setShakeTerms(false), 500);
                    }
                  }}

                  className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl text-base font-bold text-white disabled:opacity-70 disabled:cursor-not-allowed shadow-sm transition-all active:scale-[0.98] hover:opacity-90"

                  style={{ backgroundColor: '#1a3828', opacity: termsAccepted ? 1 : 0.5 }}

                >

                  {isLoading ? (

                    <div className="flex items-center justify-center">

                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>

                    </div>

                  ) : (

                    <span className="text-white flex items-center gap-2">

                      <HandCoins className="w-5 h-5" />

                      {method === 'local' ? (

                        <>Donate ₱{amount} Now</>

                      ) : intlCurrency === 'EUR' ? (

                        <>Donate €{amount} (~₱{Math.round(amount * exchangeRate)}) Now</>

                      ) : (

                        <>Donate ${amount} Now</>

                      )}

                    </span>

                  )}

                </button>

                

                {/* QR Code Button - moved below donate button */}

                <div className="mt-4 text-center">

                  <button

                    type="button"

                    onClick={() => {
                      if (!termsAccepted) {
                        setShakeTerms(true);
                        setTimeout(() => setShakeTerms(false), 500);
                      } else {
                        setShowQRModal(true);
                      }
                    }}

                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-sm font-medium transition-colors border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-50"

                    style={{ opacity: termsAccepted ? 1 : 0.5 }}

                  >

                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />

                    </svg>

                    Pay via QR Scan instead?

                  </button>

                </div>



                {/* Terms and Conditions Checkbox */}

                <div className="mt-6">

                  <label className="flex items-center gap-3 cursor-pointer">

                    <input

                      type="checkbox"

                      checked={termsAccepted}

                      onChange={(e) => {

                        if (termsAccepted) {

                          setTermsAccepted(e.target.checked);

                        } else {

                          setShowPolicyModal(true);

                        }

                      }}

                      className="w-5 h-5 rounded border-slate-300 cursor-pointer"

                      style={{ accentColor: '#185FA5' }}

                    />

                    <span 

                      className="text-sm font-medium"

                      style={{ color: '#185FA5' }}

                    >

                      Terms & Conditions

                    </span>

                    <span

                      className={`text-xs font-semibold text-red-500 transition-transform ${shakeTerms ? 'animate-pulse' : ''}`}

                      style={{
                        animation: shakeTerms ? 'shake 0.5s ease-in-out' : 'none',
                      }}

                    >
                      (Required to proceed)
                    </span>

                  </label>

                </div>



                {/* Shake Animation Keyframes */}
                <style jsx>{`
                  @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
                    20%, 40%, 60%, 80% { transform: translateX(3px); }
                  }
                `}</style>



                <div className="mt-8 pt-6 border-t border-slate-100">

                  <PaymentIcons />

                  <p className="text-center mt-6 text-xs text-slate-500 flex items-center justify-center gap-2 font-medium">

                    <Heart className="w-4 h-4 fill-emerald-500" style={{ color: '#10b981' }} />

                    Thank you for making a difference in a child's life

                  </p>

                </div>

              </div>

            </form>

          </div>

        </div>

      </div>



      {/* QR Code Modal with Animation */}

      <AnimatePresence>

        {showQRModal && (

          <motion.div

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            transition={{ duration: 0.3 }}

            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"

            onClick={() => setShowQRModal(false)}

          >

            <motion.div

              initial={{ scale: 0.8, opacity: 0, y: 20 }}

              animate={{ scale: 1, opacity: 1, y: 0 }}

              exit={{ scale: 0.8, opacity: 0, y: 20 }}

              transition={{ duration: 0.3, ease: "easeOut" }}

              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"

              onClick={(e) => e.stopPropagation()}

            >

              <div className="flex justify-between items-center mb-4">

                <h3 className="text-lg font-bold text-slate-800">Scan to Donate</h3>

                <button

                  onClick={() => setShowQRModal(false)}

                  className="p-1 hover:bg-slate-100 rounded-full transition-colors"

                >

                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />

                  </svg>

                </button>

              </div>

              <div className="text-center">

                <img

                  src="/images/Donation/paymentlink.png"

                  alt="QR Code for direct donation"

                  className="w-48 h-48 mx-auto object-contain"

                />

                <p className="text-sm text-slate-500 mt-4">

                  Scan this QR code with your payment app

                </p>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>



      {/* Policy Modal */}

      <PolicyModal

        isOpen={showPolicyModal}

        onClose={() => setShowPolicyModal(false)}

        onAgree={() => {

          setTermsAccepted(true);

          setShowPolicyModal(false);

        }}

        onDecline={() => {

          setTermsAccepted(false);

          setShowPolicyModal(false);

        }}

      />

    </main>

  );

}