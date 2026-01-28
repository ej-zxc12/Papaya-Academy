import React from 'react';
import ScrollReveal from './ScrollReveal'; // Import the reusable component

const DonationSection = () => {
  const donationOptions = [
    {
      amount: 25,
      description: 'Provides school supplies for one student for a month',
      popular: false
    },
    {
      amount: 50,
      description: 'Supports a student\'s meals for two weeks',
      popular: true
    },
    {
      amount: 100,
      description: 'Sponsors educational materials for a classroom',
      popular: false
    },
    {
      amount: 250,
      description: 'Funds a month of vocational training for one student',
      popular: false
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        
        {/* HEADER AREA */}
        <div className="text-center mb-12">
          <ScrollReveal animation="fade-down">
            <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-4">Support Our Mission</h2>
          </ScrollReveal>
          
          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your donation helps provide education and opportunities to underprivileged children
            </p>
          </ScrollReveal>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            
            <ScrollReveal animation="slide-right" delay={0}>
              <h3 className="text-2xl font-semibold text-papaya-green mb-6">Make a Donation</h3>
            </ScrollReveal>
            
            {/* DONATION CARDS - Staggered Animation */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {donationOptions.map((option, index) => (
                <ScrollReveal 
                  key={index} 
                  animation="zoom-in" 
                  delay={index * 150} // Creates the wave effect (0ms, 150ms, 300ms...)
                  className="h-full"
                >
                  <div 
                    className={`relative h-full p-6 border rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${option.popular ? 'border-2 border-papaya-yellow' : 'border-gray-200'}`}
                  >
                    {option.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-papaya-yellow text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                        MOST POPULAR
                      </div>
                    )}
                    <div className="text-3xl font-bold text-papaya-green mb-2">${option.amount}</div>
                    <p className="text-gray-600 mb-4 text-sm">{option.description}</p>
                    <button 
                      className={`w-full py-2 rounded-md font-medium transition-colors duration-200 ${option.popular ? 'bg-papaya-yellow text-papaya-green hover:bg-opacity-90' : 'bg-papaya-green text-white hover:bg-opacity-90'}`}
                    >
                      Donate ${option.amount}
                    </button>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* OTHER WAYS TO GIVE - Staggered Animation */}
            <div className="border-t pt-6">
              <ScrollReveal animation="fade-up">
                <h4 className="text-lg font-semibold text-papaya-green mb-4">Other Ways to Give</h4>
              </ScrollReveal>
              
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: '🔄', title: 'Monthly Giving', desc: 'Become a sustaining donor' },
                  { icon: '🏢', title: 'Corporate Matching', desc: 'Double your impact' },
                  { icon: '🎁', title: 'In-Kind Donations', desc: 'School supplies & more' }
                ].map((item, i) => (
                  <ScrollReveal key={i} animation="fade-up" delay={i * 100 + 400}>
                    <div className="p-4 bg-gray-50 rounded-lg h-full hover:bg-gray-100 transition-colors">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <h5 className="font-semibold mb-1">{item.title}</h5>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default DonationSection;