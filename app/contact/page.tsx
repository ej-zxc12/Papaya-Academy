"use client";

import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ScrollReveal from '../../components/ScrollReveal';
import { Montserrat } from 'next/font/google';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Users, 
  Handshake, 
  Award, 
  Globe, 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  Navigation,
  Copy,
  Bus,
  Car
} from 'lucide-react';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

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
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! Welcome to Papaya Academy! \n\nI'm here to help answer your questions about our programs, partnerships, and to  you can get involved.",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);
  
  // State for the Get Directions Button Hover Effect
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText("Kasiglahan Village, San Jose, Rodriguez, 1860 Rizal");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      answer: "Our campus is located at Kasiglahan Village, San Jose, Rodriguez, Rizal. We are easily accessible via public transport. Check the map on our Home page for directions!"
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Static Knowledge Base - Teacher Papaya's Brain
  const KNOWLEDGE_BASE = [
    {
      id: 'out_of_scope',
      patterns: ['high school', 'shs', 'senior high', 'college', 'university'],
      responses: [
        "I want to be honest with you—we currently only specialize in Elementary Education (Kindergarten to Grade 6). We do not have high school levels yet.",
        "Thank you for asking! At Papaya Academy, we focus specifically on Elementary education (K-6). We don't offer high school programs at this time."
      ]
    },
    {
      id: 'grade_7_plus',
      patterns: ['grade 7', 'grade 8', 'grade 9', 'grade 10'],
      responses: [
        "I want to be honest with you—we currently only specialize in Elementary Education (Kindergarten to Grade 6). We do not have those grade levels yet."
      ]
    },
    {
      id: 'stem_abm',
      patterns: ['stem', 'abm'],
      responses: [
        "I want to be honest with you—we currently only specialize in Elementary Education (Kindergarten to Grade 6). We don't offer STEM or ABM tracks as those are for Senior High."
      ]
    },
    {
      id: 'self_awareness_robot',
      patterns: ['are you a robot', 'are you an ai', 'are you a bot'],
      responses: [
        "I'm Teacher Papaya, your Admin Assistant! I'm here to help you learn about our wonderful Elementary programs. While I'm an AI assistant, I'm dedicated to supporting our school's mission of nurturing young minds.",
        "That's a great question! I'm Teacher Papaya, an AI assistant designed to help parents with information about our Elementary school. I'm here to support you!"
      ]
    },
    {
      id: 'who_are_you',
      patterns: ['who are you', 'what is your name'],
      responses: [
        "I'm Teacher Papaya, your Admin Assistant at Papaya Academy! I'm here to help you with information about our Elementary programs (K-6).",
        "Hello! I'm Teacher Papaya, your guide to Papaya Academy. I can help you learn about our K-6 Elementary programs!"
      ]
    },
    {
      id: 'tuition_cost',
      patterns: ['how much is the tuition', 'how much is enrollment', 'tuition fee', 'enrollment fee', 'cost of enrollment'],
      responses: [
        "Our tuition fees are designed to be affordable for elementary education. Please visit the Admin Office for the exact breakdown based on your child's grade level.",
        "We strive to keep our tuition reasonable for families. For specific fee information based on your child's grade level, please visit our Admin Office."
      ]
    },
    {
      id: 'payment_methods',
      patterns: ['how can i pay', 'payment methods', 'bank transfer', 'cash payment'],
      responses: [
        "We accept payments via Cash at the Finance Office or Bank Transfer. Do you need our bank details?",
        "You can pay through cash at our Finance Office or via bank transfer. Would you like our bank account information?"
      ]
    },
    {
      id: 'location',
      patterns: ['where is the school', 'school location', 'school address', 'where are you located'],
      responses: [
        "Our safe and secure campus is located at Kasiglahan Village, San Jose, Rodriguez, Rizal. We'd love to show you around!",
        "You can find us at Kasiglahan Village, San Jose, Rodriguez, Rizal. Our campus is designed to be a safe and nurturing environment for young learners."
      ]
    },
    {
      id: 'contact_phone',
      patterns: ['what is your number', 'phone number', 'contact number', 'how to call'],
      responses: [
        "You can speak to our Registrar directly at +63 2 1234 5678 during office hours.",
        "Feel free to call our Registrar at +63 2 1234 5678. We're available during office hours to assist you."
      ]
    },
    {
      id: 'how_to_enroll_child',
      patterns: ['how to enroll my child', 'how to enroll my kid', 'enroll my child', 'enroll my kid'],
      responses: [
        "To enroll your child at Papaya Academy, you'll need to bring their PSA Birth Certificate and latest Report Card (Form 138) to our Registrar's Office. We're open Monday to Friday, 8 AM to 5 PM. Our staff will guide you through the complete enrollment process!",
        "Enrolling your child is simple! Please visit our Registrar's Office with your child's PSA Birth Certificate and previous Report Card. We're here from 8 AM to 5 PM to assist you with the enrollment forms and answer any questions."
      ]
    },
    {
      id: 'enrollment_process',
      patterns: ['how to enroll', 'enrollment process', 'how to register', 'requirements for enrollment'],
      responses: [
        "To enroll at Papaya Academy, you'll need a PSA Birth Certificate and Report Card (Form 138). Please visit our Registrar's Office from 8 AM to 5 PM, Monday to Friday. Our team will guide you through the entire process!",
        "The enrollment process is straightforward! Bring your PSA Birth Certificate and latest Report Card to our Registrar's Office. We're open 8 AM to 5 PM and our staff will help you complete all necessary paperwork."
      ]
    },
    {
      id: 'want_to_enroll',
      patterns: ['i want to enroll', 'interested to enroll', 'want to register'],
      responses: [
        "That is wonderful news! To join our Papaya family, please bring a PSA Birth Certificate and Report Card to the Registrar's Office. We are open 8 AM to 5 PM.",
        "We'd be delighted to have you join us! Please visit our Registrar's Office with your PSA Birth Certificate and Report Card. We're here from 8 AM to 5 PM."
      ]
    },
    {
      id: 'greetings',
      patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      responses: [
        "Hello! I'm Teacher Papaya, your Admin Assistant. How can I help you with our Elementary programs today?",
        "Hi there! I'm Teacher Papaya. Welcome to Papaya Academy! How may I assist you with our K-6 programs?"
      ]
    },
    {
      id: 'programs',
      patterns: ['what programs do you offer', 'what do you teach', 'what subjects', 'curriculum'],
      responses: [
        "We offer a holistic Elementary curriculum focused on foundational literacy, mathematics, science, and values education for children.",
        "Our Elementary program covers core subjects like reading, math, science, plus values education. We focus on building strong foundations for lifelong learning."
      ]
    },
    {
      id: 'grade_levels',
      patterns: ['kindergarten', 'grade 1', 'grade 2', 'grade 3', 'grade 4', 'grade 5', 'grade 6', 'elementary'],
      responses: [
        "Yes! We offer all Elementary levels from Kindergarten through Grade 6. Each grade level is designed to provide age-appropriate learning and development for your child.",
        "We proudly serve students from Kindergarten through Grade 6. Each grade level is carefully structured to support your child's developmental needs."
      ]
    },
    {
      id: 'scholarships',
      patterns: ['scholarship', 'financial assistance', 'discount', 'free education'],
      responses: [
        "We offer assistance for deserving elementary students. Please visit the Admin office to discuss scholarship applications.",
        "Financial assistance is available for qualified students. Please visit our Admin office to learn about scholarship opportunities."
      ]
    },
    {
      id: 'thanks',
      patterns: ['thank you', 'thanks', 'appreciate'],
      responses: [
        "You are very welcome! We hope to see you and your child soon.",
        "My pleasure! We look forward to welcoming you and your child to Papaya Academy."
      ]
    },
    {
      id: 'goodbye',
      patterns: ['bye', 'goodbye', 'see you', 'take care'],
      responses: [
        "Take care! Have a wonderful day ahead.",
        "Goodbye! Have a lovely day, and we hope to see you soon!"
      ]
    },
    {
      id: 'leadership',
      patterns: ['principal', 'school head', 'administrator', 'owner'],
      responses: [
        "Our school is led by a dedicated School Administrator committed to values-based education.",
        "Papaya Academy is guided by a passionate School Administrator focused on providing quality Elementary education."
      ]
    },
    {
      id: 'how_are_you',
      patterns: ['how are you', 'how are you doing'],
      responses: [
        "I'm doing wonderfully, thank you for asking! I'm always excited to help parents learn about our nurturing Elementary environment.",
        "I'm doing great, thank you! I'm here to help you learn about our wonderful Elementary programs."
      ]
    },
    {
      id: 'facilities',
      patterns: ['facilities', 'classrooms', 'playground', 'library'],
      responses: [
        "Our Elementary campus features child-friendly classrooms, a safe playground area, a library with age-appropriate books, and clean facilities designed specifically for young learners.",
        "We have wonderful facilities including bright classrooms, a safe playground, and a library filled with books perfect for young readers."
      ]
    },
    {
      id: 'school_hours',
      patterns: ['school hours', 'class schedule', 'what time', 'when are you open'],
      responses: [
        "Our Elementary school operates Monday to Friday from 8:00 AM to 3:00 PM, with special Saturday activities. We follow a schedule that's appropriate for young children's attention spans and energy levels.",
        "We're open Monday to Friday, 8 AM to 3 PM, with some Saturday activities. Our schedule is designed to work well for young children."
      ]
    },
    {
      id: 'about_academy',
      patterns: ['what is papaya academy', 'tell me about papaya academy', 'about your school'],
      responses: [
        "Papaya Academy is a dedicated Elementary School providing quality education from Kindergarten to Grade 6. We focus on building strong foundations for lifelong learning in a nurturing environment.",
        "We're a specialized Elementary school serving K-6 students. At Papaya Academy, we create a nurturing environment where children can build strong educational foundations."
      ]
    },
    {
      id: 'mission',
      patterns: ['mission', 'vision', 'purpose', 'goal'],
      responses: [
        "Our mission is to provide excellent Elementary education that nurtures young minds and builds strong character. We believe in creating a solid foundation for every child's educational journey.",
        "Our purpose is to nurture young minds through quality Elementary education. We focus on character building and academic excellence for K-6 students."
      ]
    },
    {
      id: 'teachers',
      patterns: ['teachers', 'faculty', 'who teaches', 'staff'],
      responses: [
        "Our Elementary teachers are highly qualified and experienced in early childhood and primary education. They're dedicated to creating a supportive and engaging learning environment for young students.",
        "Our teachers are wonderful! They're specially trained in Elementary education and truly care about nurturing each child's potential."
      ]
    },
    {
      id: 'student_life',
      patterns: ['student life', 'activities', 'extracurricular', 'what do students do', 'what activities do students have', 'what extracurricular activities do students have'],
      responses: [
        "Our Elementary students enjoy age-appropriate activities including arts, music, physical education, and special events. We balance academics with creative and physical development for well-rounded growth.",
        "Students have lots of fun activities! We include arts, music, PE, and special events that make learning exciting while supporting their development."
      ]
    },
    {
      id: 'contact_email',
      patterns: ['email address', 'email', 'how to email'],
      responses: [
        "You can reach us at info@papayaacademy.org or call +63 2 1234 5678 during office hours. We'd love to hear from you!",
        "Feel free to email us at info@papayaacademy.org or call +63 2 1234 5678. We're here to help!"
      ]
    },
    {
      id: 'donation_how_to',
      patterns: ['want to donate', 'how to donate', 'donate but', 'donation guide', 'can you guide me to donate'],
      responses: [
        "That's wonderful that you want to support our mission! You can donate through our website's 'Donate' section, or visit our Admin Office for cash donations. We also accept bank transfers. Every contribution helps us provide quality education to our young learners!",
        "Thank you for your generosity! We'd be happy to guide you. You can donate online through our website, visit our Admin Office during school hours, or we can provide our bank details for transfers. Your support makes a real difference in our students' lives!"
      ]
    },
    {
      id: 'donation_info',
      patterns: ['donate', 'donation', 'contribution', 'give', 'support financially'],
      responses: [
        "Your generosity changes lives! You can donate easily through our website's 'Donate' section. For corporate sponsorships or bank transfers, please email partnerships@papayaacademy.org. Every contribution, big or small, helps us provide quality education to more children.",
        "Thank you for considering supporting Papaya Academy! We accept donations through our website, at our Admin Office, or via bank transfer. Please email us at info@papayaacademy.org for more information on how you can help our students."
      ]
    },
    {
      id: 'casual_positive',
      patterns: ['nice', 'great', 'awesome', 'cool', 'wonderful'],
      responses: [
        "Thank you! We think our Elementary programs are pretty wonderful too! 😊 Is there something specific about our K-6 education that caught your interest?",
        "That's kind of you to say! We're very proud of our Elementary programs. What would you like to know more about?"
      ]
    }
  ];

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Loop through knowledge base to find matches
    for (const item of KNOWLEDGE_BASE) {
      // Check if any pattern matches exactly
      const patternMatch = item.patterns.some(pattern => lowerMessage.includes(pattern));
      
      if (patternMatch) {
        // Return random response from the responses array
        const randomIndex = Math.floor(Math.random() * item.responses.length);
        return item.responses[randomIndex];
      }
    }
    
    // Fallback response
    return "I'm Teacher Papaya, and I'm here to help with our Elementary programs. For more detailed information, please feel free to call our Registrar at +63 2 1234 5678. We'd love to assist you personally!";
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
              <h1 className="text-5xl md:text-6xl font-light tracking-wide mb-6 leading-tight drop-shadow-lg text-white">
                Contact Us
              </h1>
              <p className="text-xl md:text-2xl font-light text-green-100 max-w-3xl mx-auto">
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
                  {/* Clickable Address to scroll to Map */}
                  <div 
                    className="flex items-start space-x-4 cursor-pointer group"
                    onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <div className="bg-papaya-green p-3 rounded-lg shadow-md group-hover:bg-papaya-yellow transition-colors">
                      <MapPin className="w-6 h-6 text-white group-hover:text-papaya-green" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Address</h3>
                      <p className="text-gray-600 mt-1 group-hover:text-papaya-green transition-colors">
                        Kasiglahan Village<br />San Jose, Rodriguez, 1860 Rizal
                      </p>
                      <p className="text-xs text-papaya-green font-semibold mt-1 underline">See on Map</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-papaya-green p-3 rounded-lg shadow-md">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Phone</h3>
                      <p className="text-gray-600 mt-1">+6399327081188</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-papaya-green p-3 rounded-lg shadow-md">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Email</h3>
                      <p className="text-gray-600 mt-1">papayaacademykapf@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-papaya-green p-3 rounded-lg shadow-md">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Office Hours</h3>
                      <p className="text-gray-600 mt-1">Monday - Friday: 8:00 AM - 5:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right Side: FAQ Accordion */}
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
                        {/* SMOOTHER ROTATION: Using a single icon that rotates instead of swapping two icons */}
                        <ChevronDown 
                          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ease-in-out ${
                            openFaqIndex === index ? 'rotate-180 text-papaya-green' : ''
                          }`} 
                        />
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
                    <span>Chat with our Papaya Assistant</span>
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* --- UPDATED GOOGLE MAPS SECTION START --- */}
      <section id="map-section" className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(46,139,87,0.05)_0%,transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-papaya-green">Visit Our Campus</h2>
               <p className="text-gray-600 mt-2">Plan your trip to Papaya Academy.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                
                {/* LEFT: THE MAP BOX (Spans 2 columns) - FIXED HEIGHT */}
                <div className="lg:col-span-2 bg-white p-2 rounded-[2rem] shadow-xl border border-gray-100 h-full min-h-[600px]">
                    <div className="relative w-full h-full rounded-[1.8rem] overflow-hidden">
                        <iframe 
                            src="https://maps.google.com/maps?q=Kasiglahan%20Village%2C%20San%20Jose%2C%20Rodriguez%2C%20Rizal&t=&z=14&ie=UTF8&iwloc=&output=embed" 
                            className="w-full h-full"
                            style={{ border: 0 }} 
                            allowFullScreen 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>

                {/* RIGHT: ACTION BUTTONS DASHBOARD (Spans 1 column) */}
                <div className="space-y-6">
                    
                    {/* 1. Main Location Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-start space-x-4">
                           <div className="bg-papaya-green/10 p-3 rounded-full">
                              <MapPin className="w-6 h-6 text-papaya-green" />
                           </div>
                           <div>
                              <h3 className="font-bold text-gray-800 text-lg">Papaya Academy</h3>
                              <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                                Kasiglahan Village, San Jose<br/>Rodriguez, 1860 Rizal
                              </p>
                              <button 
                                onClick={handleCopyAddress}
                                className="mt-3 flex items-center space-x-2 text-xs font-semibold text-papaya-green hover:text-green-700 transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200"
                              >
                                {copied ? (
                                    <>
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy Address</span>
                                    </>
                                )}
                              </button>
                           </div>
                        </div>
                    </div>

                    {/* 2. Action Buttons (Updated: Design Copied & Directions URL) */}
                    <div className="w-full">
                        <a 
                           href="https://www.google.com/maps/dir/?api=1&destination=Papaya+Academy+Inc.,+Kasiglahan+Village,+San+Jose,+Rodriguez,+Rizal"
                           target="_blank" 
                           rel="noopener noreferrer"
                           onMouseEnter={() => setIsBtnHovered(true)}
                           onMouseLeave={() => setIsBtnHovered(false)}
                           className="flex items-center justify-center gap-2 px-8 py-4 w-full rounded-md font-bold text-sm tracking-widest border border-[#1B3E2A] border-b-4 shadow-md transition-all duration-300"
                           style={{
                             backgroundImage: 'linear-gradient(to top, #1B3E2A 50%, transparent 50%)',
                             backgroundSize: '100% 200%',
                             backgroundPosition: isBtnHovered ? 'bottom' : 'top',
                             color: isBtnHovered ? '#F2C94C' : '#1B3E2A', 
                             borderColor: '#1B3E2A',
                             boxShadow: isBtnHovered ? '0 6px 20px rgba(27, 62, 42, 0.4)' : '0 4px 6px rgba(0,0,0,0.1)',
                           }}
                        >
                            {/* Icon on Left with slide animation */}
                            <Navigation 
                                className={`w-5 h-5 transition-transform duration-300 ${isBtnHovered ? '-translate-y-1' : ''}`} 
                            />
                            GET DIRECTIONS
                        </a>
                    </div>

                    {/* 3. Transport Info */}
                    <div className="bg-[#f8faf9] p-6 rounded-2xl border border-dashed border-gray-300">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                            <Bus className="w-4 h-4 mr-2 text-gray-500" />
                            How to get here
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="min-w-[4px] h-full bg-papaya-yellow rounded-full"></div>
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-900 block mb-0.5">By Jeepney</span>
                                    Take the "Montalban/San Jose" route jeepney. Drop off at Education Street intersection.
                                </p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="min-w-[4px] h-full bg-papaya-green rounded-full"></div>
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-900 block mb-0.5">By Car</span>
                                    Parking is available at the main gate. Visitor passes required upon entry.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      {/* --- UPDATED GOOGLE MAPS SECTION END --- */}

      <Footer />

      {/* --- AI CHATBOX --- */}
      
      {/* Floating Chat Icon (Smoother In/Out) */}
      <div 
        className={`fixed bottom-6 right-6 transition-all duration-500 ease-in-out transform ${
          !isChatOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-10 pointer-events-none'
        }`}
        style={{ zIndex: 2147483647 }}
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

      {/* Chat Interface - (Smoother In/Out Animation) */}
      {/* Changed logic: removed {isChatOpen && ...} wrapping to allow CSS transition on exit */}
      <div 
        className={`fixed bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] origin-bottom-right transform ${
          isChatOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'
        }`}
        style={{ 
          position: 'fixed',
          bottom: '24px', 
          right: '24px', 
          width: '380px', 
          height: '500px', 
          backgroundColor: '#ffffff',
          zIndex: 2147483647
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
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}
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
                  {/* Tiny Time Size (text-[8px]) */}
                  <span className="text-[8px] text-gray-400 mt-1 px-1 font-medium opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start mb-4 animate-in fade-in zoom-in duration-300">
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
    </div>
  );
}