  "use client";

  import { useState, useRef, useEffect } from 'react';
  import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
  import Header from '../../components/Header';
  import Footer from '../../components/Footer';
  import ScrollReveal from '../../components/ScrollReveal';
  import { Montserrat } from 'next/font/google';
  import { Mail, Phone, MapPin, Clock, Users, Handshake, Award, Globe, MessageCircle, Send, X, Bot, ChevronDown, ChevronUp, FileText, HelpCircle } from 'lucide-react';

  const montserrat = Montserrat({ 
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
  });

  // Define Interfaces
  interface Message {
    id: number;
    text: string;
    sender: 'bot' | 'user';
    timestamp: Date;
  }

  interface FaqItem {
    question: string;
    answer: string;
  }

  export default function ContactPage() {
    // Chatbot states
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([
      {
        id: 1,
        text: "Hello! Welcome to Papaya Academy! \n\nI'm here to help answer your questions about our programs, partnerships, and how you can get involved.",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // FAQ State
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    const faqs: FaqItem[] = [
      {
        question: "What are the requirements for enrollment?",
        answer: "We typically require a PSA Birth Certificate, Form 138 (Report Card) from the previous school, and a Certificate of Good Moral Character. Please visit our Registrar's office for the complete checklist."
      },
      {
        question: "Do you accept transferees?",
        answer: "Yes, Papaya Academy welcomes transferees! We accept students at all grade levels, subject to the availability of slots and evaluation of previous academic records."
      },
      {
        question: "How can I apply for a scholarship?",
        answer: "We offer various scholarship programs for deserving students. Applications are usually processed before the start of the school year. You can visit the Administration Office to get an application form."
      },
      {
        question: "Where exactly is the school located?",
        answer: "Our campus is located at 123 Education Street, Manila, Philippines 1000. We are easily accessible via public transport. Check the map on our Home page for directions!"
      },
      {
        question: "What track/strands do you offer for Senior High?",
        answer: "We currently offer ABM (Accountancy, Business, and Management), STEM (Science, Technology, Engineering, and Mathematics), and HUMSS (Humanities and Social Sciences)."
      }
    ];

    const toggleFaq = (index: number) => {
      setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    // Predefined responses
    const getBotResponse = (userMessage: string): string => {
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('program') || lowerMessage.includes('what do you offer')) {
        return "We offer various educational programs including early childhood education, elementary tutoring, after-school programs, and vocational training for underprivileged children. Each program is designed to provide quality education and holistic development.";
      } else if (lowerMessage.includes('donate') || lowerMessage.includes('contribution') || lowerMessage.includes('give')) {
        return "Thank you for your interest in supporting us! You can donate through our website's donation section, or contact partnerships@papayaacademy.org for corporate sponsorships.";
      } else if (lowerMessage.includes('volunteer') || lowerMessage.includes('help') || lowerMessage.includes('get involved')) {
        return "We'd love to have you volunteer! You can help as a tutor, mentor, event organizer, or administrative support. Please email us at info@papayaacademy.org with your skills.";
      } else if (lowerMessage.includes('partner') || lowerMessage.includes('collaborate')) {
        return "We partner with corporations and educational institutions. Opportunities include CSR programs, employee volunteering, and curriculum development. Contact partnerships@papayaacademy.org to discuss.";
      } else if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
        return "Our main office is located at 123 Education Street, Manila, Philippines 1000. We're open Monday-Friday 8:00 AM - 5:00 PM.";
      } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
        return "You can reach us at:\n📞 Phone: +63 2 1234 5678\n📧 Email: info@papayaacademy.org";
      } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! How can I help you learn more about Papaya Academy today?";
      } else {
        return "I'd be happy to help you with that! For specific inquiries, please contact us at info@papayaacademy.org or call +63 2 1234 5678.";
      }
    };

    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = () => {
      if (inputMessage.trim() === '') return;

      const userMessage: Message = {
        id: Date.now(),
        text: inputMessage,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages([...messages, userMessage]);
      const messageToProcess = inputMessage;
      setInputMessage('');
      setIsTyping(true);

      setTimeout(() => {
        const botResponse: Message = {
          id: Date.now() + 1,
          text: getBotResponse(messageToProcess),
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 1500);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSendMessage();
      }
    };

    return (
      <div className={`min-h-screen ${montserrat.className} relative`}>
        <Header />
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-papaya-green to-green-800 text-white py-20 z-0">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal animation="fade-down" delay={100}>
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
                <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
                  Get in touch with Papaya Academy for partnerships, donations, or general inquiries
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Contact Info & FAQ Section */}
        <section className="py-16 bg-white z-0">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              
              {/* Left Side: Contact Information */}
              <ScrollReveal animation="slide-right" delay={200}>
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-papaya-green mb-6">Get in Touch</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      Have questions about Papaya Academy? Check our frequently asked questions or visit us directly. Our AI assistant is also available 24/7 to help you with immediate inquiries.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-papaya-green p-3 rounded-lg shadow-md">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Address</h3>
                        <p className="text-gray-600 mt-1">123 Education Street<br />Manila, Philippines 1000</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-papaya-green p-3 rounded-lg shadow-md">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Phone</h3>
                        <p className="text-gray-600 mt-1">+63 2 1234 5678</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-papaya-green p-3 rounded-lg shadow-md">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Email</h3>
                        <p className="text-gray-600 mt-1">info@papayaacademy.org</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-papaya-green p-3 rounded-lg shadow-md">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Office Hours</h3>
                        <p className="text-gray-600 mt-1">Monday - Friday: 8:00 AM - 5:00 PM<br />Saturday: 9:00 AM - 12:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Right Side: FAQ Accordion (Replaces Form) */}
              <ScrollReveal animation="slide-left" delay={300}>
                <div className="bg-gray-50 p-8 rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-papaya-yellow p-2 rounded-full">
                      <HelpCircle className="w-6 h-6 text-papaya-green" />
                    </div>
                    <h3 className="text-2xl font-bold text-papaya-green">Common Questions</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div 
                        key={index} 
                        className="bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-md"
                      >
                        <button
                          onClick={() => toggleFaq(index)}
                          className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                        >
                          <span className={`font-semibold ${openFaqIndex === index ? 'text-papaya-green' : 'text-gray-800'}`}>
                            {faq.question}
                          </span>
                          {openFaqIndex === index ? (
                            <ChevronUp className="w-5 h-5 text-papaya-green" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        
                        <div 
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            openFaqIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="p-4 pt-0 text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500 mb-3">Still have questions?</p>
                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="inline-flex items-center space-x-2 text-papaya-green font-semibold hover:text-green-700 transition-colors"
                    >
                      <span>Chat with our AI Assistant</span>
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </ScrollReveal>

            </div>
          </div>
        </section>

        {/* Partnership Information */}
       {/* Partnership Information - Updated for Dim Green Aesthetic */}
<section className="py-20 bg-[#1a2e25] relative overflow-hidden z-0">
  {/* Subtle background decoration for depth */}
  <div className="absolute top-0 left-0 w-full h-full opacity-5">
    <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-papaya-yellow rounded-full blur-3xl"></div>
    <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-papaya-green rounded-full blur-3xl"></div>
  </div>

  <div className="container mx-auto px-4 relative z-10">
    <ScrollReveal animation="fade-down" delay={100}>
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Partner With Us</h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Join us in our mission to provide quality education to underprivileged children
        </p>
        <div className="w-24 h-1.5 bg-papaya-yellow mx-auto mt-6 rounded-full"></div>
      </div>
    </ScrollReveal>

    <div className="grid md:grid-cols-3 gap-8">
      {/* Card Component - Repeated for each partnership type */}
      {[
        { title: "Corporate Partnerships", icon: Handshake, delay: 200 },
        { title: "Educational Institutions", icon: Award, delay: 300 },
        { title: "Community Organizations", icon: Users, delay: 400 }
      ].map((item, index) => (
        <ScrollReveal key={index} animation="fade-up" delay={item.delay}>
          <div className="bg-[#243d32] border border-white/10 rounded-2xl p-8 shadow-2xl transition-transform hover:-translate-y-2 duration-300">
            <div className="bg-papaya-yellow w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <item.icon className="w-8 h-8 text-papaya-green" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
            <p className="text-gray-300 mb-6">
              {item.title === "Corporate Partnerships" && "Partner through CSR, employee volunteering, or sponsorship."}
              {item.title === "Educational Institutions" && "Collaborate for student exchange and teacher training."}
              {item.title === "Community Organizations" && "Expand impact through joint programs and outreach."}
            </p>
            <ul className="text-sm text-gray-400 space-y-3">
              <li className="flex items-center"><span className="w-1.5 h-1.5 bg-papaya-yellow rounded-full mr-2"></span> Benefit 1</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 bg-papaya-yellow rounded-full mr-2"></span> Benefit 2</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 bg-papaya-yellow rounded-full mr-2"></span> Benefit 3</li>
            </ul>
          </div>
        </ScrollReveal>
      ))}
    </div>
  </div>
</section>

        {/* Partners Logos */}
        <section className="py-16 bg-white z-0">
          <div className="container mx-auto px-4">
            <ScrollReveal animation="fade-down" delay={100}>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-papaya-green mb-4">Our Valued Partners</h2>
                <p className="text-xl text-gray-600">We're grateful for the support of these organizations</p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-8 flex items-center justify-center h-24">
                  <Globe className="w-12 h-12 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />

        {/* --- AI CHATBOX --- */}
        
        {/* Floating Chat Icon */}
        {!isChatOpen && (
          <div 
            className="fixed bottom-6 right-6"
            style={{ zIndex: 2147483647 }} // MAX Z-INDEX to be in front of everything
          >
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-gradient-to-r from-papaya-green to-green-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce group"
            >
              <MessageCircle className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 bg-papaya-yellow text-papaya-green text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                1
              </span>
            </button>
          </div>
        )}

        {/* Chat Interface - HARDCODED STYLES & MAX Z-INDEX */}
        {isChatOpen && (
          <div 
            className="fixed bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300"
            style={{ 
              position: 'fixed',
              bottom: '24px', 
              right: '24px', 
              width: '380px', 
              height: '500px', 
              backgroundColor: '#ffffff',
              zIndex: 2147483647 // MAX Z-INDEX to be in front of everything
            }}
          >
            
            {/* 1. Header - Fixed Height: 70px */}
            <div 
              className="flex items-center justify-between bg-gradient-to-r from-papaya-green to-green-600 text-white p-4 shadow-md z-10"
              style={{ height: '70px', minHeight: '70px' }} 
            >
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-wide">Papaya Assistant</h2>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                    <p className="text-xs text-green-100 font-medium">Online now</p>
                  </div>
                </div>
              </div>
              
              {/* Close Button - Fixed with Cursor Pointer */}
              <div className="flex items-center">
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200 cursor-pointer relative z-50"
                  title="Close chat"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2. Messages Area - Fixed Height: 290px */}
            <div 
              className="overflow-y-auto bg-gray-50 p-4 scroll-smooth"
              style={{ height: '290px' }}
            >
                <div className="text-center text-[10px] text-gray-400 mb-4 font-medium uppercase tracking-wider">Today</div>
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div className={`flex flex-col max-w-[80%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-br from-papaya-green to-green-600 text-white rounded-br-none'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line">{message.text}</p>
                      </div>
                      {/* UPDATED: Tiny Time Size (text-[8px]) */}
                      <span className="text-[8px] text-gray-400 mt-1 px-1 font-medium opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-white text-gray-800 p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm">
                      <div className="flex space-x-1.5">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 3. Input Area - Fixed Height: 140px */}
            <div 
              className="bg-white border-t border-gray-100 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-10"
              style={{ height: '140px', minHeight: '140px' }}
            >
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-papaya-green/50 focus:border-transparent text-sm transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-papaya-green text-white p-3 rounded-full hover:bg-green-700 hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!inputMessage.trim()}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                {["Programs", "Donate", "Enroll", "Volunteer"].map((label) => (
                    <button
                    key={label}
                    onClick={() => {
                      const msg = label === "Programs" ? "What programs do you offer?" : 
                                label === "Donate" ? "How can I donate?" : 
                                label === "Enroll" ? "How do I enroll my child?" : "How can I volunteer?";
                      setInputMessage(msg);
                      handleSendMessage();
                    }}
                    className="whitespace-nowrap text-xs bg-gray-100 text-gray-600 hover:bg-papaya-green hover:text-white px-3 py-1.5 rounded-full transition-colors font-medium border border-gray-200 hover:border-transparent"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } 