import React from 'react';

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
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-papaya-green mb-4">Support Our Mission</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your donation helps provide education and opportunities to underprivileged children
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-2xl font-semibold text-papaya-green mb-6">Make a Donation</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {donationOptions.map((option, index) => (
                <div 
                  key={index}
                  className={`relative p-6 border rounded-lg hover:shadow-md transition-shadow ${option.popular ? 'border-2 border-papaya-yellow' : 'border-gray-200'}`}
                >
                  {option.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-papaya-yellow text-white text-xs font-semibold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="text-3xl font-bold text-papaya-green mb-2">${option.amount}</div>
                  <p className="text-gray-600 mb-4">{option.description}</p>
                  <button 
                    className={`w-full py-2 rounded-md font-medium ${option.popular ? 'bg-papaya-yellow text-papaya-green hover:bg-opacity-90' : 'bg-papaya-green text-white hover:bg-opacity-90'}`}
                  >
                    Donate ${option.amount}
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-papaya-green mb-4">Other Ways to Give</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🔄</div>
                  <h5 className="font-semibold mb-1">Monthly Giving</h5>
                  <p className="text-sm text-gray-600">Become a sustaining donor</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🏢</div>
                  <h5 className="font-semibold mb-1">Corporate Matching</h5>
                  <p className="text-sm text-gray-600">Double your impact</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🎁</div>
                  <h5 className="font-semibold mb-1">In-Kind Donations</h5>
                  <p className="text-sm text-gray-600">School supplies & more</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonationSection;
