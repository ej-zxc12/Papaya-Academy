"use client";

import { useState, useRef, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ScrollReveal from '../../components/ScrollReveal';
import { Montserrat } from 'next/font/google';
import { Mail, Phone, MapPin, Clock, Users, Handshake, Award, Globe, MessageCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! Welcome to Papaya Academy! I'm here to help answer your questions about our programs, partnerships, and how you can get involved. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Predefined responses for common questions
  const getBotResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('program') || lowerMessage.includes('what do you offer')) {
      return "We offer various educational programs including early childhood education, elementary tutoring, after-school programs, and vocational training for underprivileged children. Each program is designed to provide quality education and holistic development.";
    } else if (lowerMessage.includes('donate') || lowerMessage.includes('contribution') || lowerMessage.includes('give')) {
      return "Thank you for your interest in supporting us! You can donate through our website's donation section, or contact partnerships@papayaacademy.org for corporate sponsorships. Every contribution helps us provide quality education to more children.";
    } else if (lowerMessage.includes('volunteer') || lowerMessage.includes('help') || lowerMessage.includes('get involved')) {
      return "We'd love to have you volunteer! You can help as a tutor, mentor, event organizer, or administrative support. Please email us at info@papayaacademy.org with your skills and availability, and we'll match you with the right opportunity.";
    } else if (lowerMessage.includes('partner') || lowerMessage.includes('collaborate') || lowerMessage.includes('corporate')) {
      return "We partner with corporations, educational institutions, and community organizations. Partnership opportunities include CSR programs, employee volunteering, curriculum development, and community outreach. Contact partnerships@papayaacademy.org to discuss how we can work together.";
    } else if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
      return "Our main office is located at 123 Education Street, Manila, Philippines 1000. We're open Monday-Friday 8:00 AM - 5:00 PM and Saturday 9:00 AM - 12:00 PM. You're welcome to visit us!";
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      return "You can reach us at:\n📞 Phone: +63 2 1234 5678\n📧 Email: info@papayaacademy.org\n🏢 Address: 123 Education Street, Manila\nOur office hours are Monday-Friday 8AM-5PM and Saturday 9AM-12PM.";
    } else if (lowerMessage.includes('tuition') || lowerMessage.includes('fee') || lowerMessage.includes('cost')) {
      return "Thanks to our donors and partners, we provide quality education at minimal or no cost to underprivileged children. Specific program details and any applicable fees can be discussed during the enrollment process. No child is turned away due to financial constraints.";
    } else if (lowerMessage.includes('enroll') || lowerMessage.includes('admission') || lowerMessage.includes('apply')) {
      return "To enroll your child, please visit our office or email info@papayaacademy.org. You'll need to provide the child's birth certificate, previous school records (if any), and complete our enrollment form. We'll guide you through every step of the process.";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! How can I help you learn more about Papaya Academy today?";
    } else if (lowerMessage.includes('thank')) {
      return "You're welcome! Is there anything else you'd like to know about our programs or how you can support our mission?";
    } else {
      return "I'd be happy to help you with that! For more detailed information about specific programs, enrollment, or partnership opportunities, please contact us at info@papayaacademy.org or call +63 2 1234 5678. You can also browse our website for more details.";
    }
  };

  const scrollToBottom = () => {
    // block: "nearest" prevents the entire page from scrolling when a message is sent
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const userMessage = {
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
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(messageToProcess),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message. We will get back to you soon!');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className={`min-h-screen ${montserrat.className}`}>
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-papaya-green to-green-800 text-white py-20">
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

      {/* Contact Information & Chatbot Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Contact Information */}
            <ScrollReveal animation="slide-right" delay={200}>
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-papaya-green mb-6">Get in Touch</h2>
                  <p className="text-gray-600 mb-8">
                    Have questions about Papaya Academy? Our AI assistant is available 24/7 to help you with information about our programs, partnerships, and enrollment. For specific inquiries, you can also reach us directly.
                  </p>
                </div>

                <div className="space-y-4">
                  <ScrollReveal animation="fade-up" delay={300}>
                    <div className="flex items-start space-x-4">
                      <div className="bg-papaya-green p-3 rounded-lg">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Address</h3>
                        <p className="text-gray-600">123 Education Street<br />Manila, Philippines 1000</p>
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal animation="fade-up" delay={400}>
                    <div className="flex items-start space-x-4">
                      <div className="bg-papaya-green p-3 rounded-lg">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Phone</h3>
                        <p className="text-gray-600">+63 2 1234 5678</p>
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal animation="fade-up" delay={500}>
                    <div className="flex items-start space-x-4">
                      <div className="bg-papaya-green p-3 rounded-lg">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Email</h3>
                        <p className="text-gray-600">info@papayaacademy.org<br />partnerships@papayaacademy.org</p>
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal animation="fade-up" delay={600}>
                    <div className="flex items-start space-x-4">
                      <div className="bg-papaya-green p-3 rounded-lg">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Office Hours</h3>
                        <p className="text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM<br />Saturday: 9:00 AM - 12:00 PM</p>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </ScrollReveal>

            {/* AI Chatbot Interface */}
            <ScrollReveal animation="slide-right" delay={300}>
              <div className="bg-gray-50 rounded-xl p-6 h-[600px] flex flex-col">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-papaya-green p-2 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-papaya-green">AI Assistant</h2>
                    <p className="text-sm text-gray-600">Ask me anything about Papaya Academy!</p>
                  </div>
                </div>

                {/* Chat Messages - overflow-y-auto enables internal scrolling */}
                <div className="flex-1 overflow-y-auto bg-white rounded-lg p-4 space-y-3 mb-4 scroll-smooth">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-papaya-green text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-green-100' : 'text-gray-500'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="border-t pt-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask about programs, enrollment, donations..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-papaya-green focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-papaya-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </div>
                  
                  {/* Quick Question Suggestions */}
                  <div className="mt-3 flex flex-wrap gap-2">
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
                       className="text-xs bg-papaya-yellow text-papaya-green px-3 py-1 rounded-full hover:bg-opacity-80 transition-colors"
                     >
                       {label}
                     </button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-papaya-yellow to-yellow-500">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-down" delay={100}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Partner With Us</h2>
              <p className="text-xl text-yellow-50 max-w-3xl mx-auto">
                Join us in our mission to provide quality education to underprivileged children
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="bg-papaya-green w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Handshake className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-papaya-green mb-4">Corporate Partnerships</h3>
                <p className="text-gray-600 mb-4">
                  Partner with us through corporate social responsibility programs, employee volunteering, or direct sponsorship.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Brand visibility opportunities</li>
                  <li>• Employee engagement programs</li>
                  <li>• Tax-deductible contributions</li>
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={300}>
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="bg-papaya-green w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-papaya-green mb-4">Educational Institutions</h3>
                <p className="text-gray-600 mb-4">
                  Collaborate with us for student exchange programs, curriculum development, and teacher training initiatives.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Academic partnerships</li>
                  <li>• Research collaborations</li>
                  <li>• Faculty exchange programs</li>
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={400}>
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="bg-papaya-green w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-papaya-green mb-4">Community Organizations</h3>
                <p className="text-gray-600 mb-4">
                  Work together to expand our reach and impact in communities through joint programs and initiatives.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Community outreach programs</li>
                  <li>• Resource sharing</li>
                  <li>• Volunteer coordination</li>
                </ul>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal animation="zoom-in" delay={500}>
            <div className="text-center mt-12">
              <button className="bg-white text-papaya-green px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
                Become a Partner
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-down" delay={100}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-papaya-green mb-4">Our Valued Partners</h2>
              <p className="text-xl text-gray-600">
                We're grateful for the support of these amazing organizations
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {[1, 2, 3, 4].map((i) => (
              <ScrollReveal key={i} animation="zoom-in" delay={100 * (i + 1)}>
                <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center h-24">
                  <Globe className="w-12 h-12 text-gray-400" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}