'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe outside of component to avoid recreating it on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function DonatePage() {
  const [amount, setAmount] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    setLoading(true);

    try {
      // 1. Send request to your internal API
      const res = await fetch('/api/donate/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          paymentMethod,
          email: 'donor@example.com', // In a real app, add an input field for this
          name: 'Generous Donor',     // In a real app, add an input field for this
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // 2. Handle Redirection
      if (paymentMethod === 'card') {
        // Stripe: Redirect using their library
        window.location.href = data.url; 
      } else {
        // Xendit: Redirect directly to the invoice URL
        window.location.href = data.url;
      }

    } catch (error) {
      console.error('Donation failed:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold text-center text-papaya-green mb-8">
            Make a Donation
          </h1>

          {/* Amount Selection */}
          <div className="mb-8">
            <label className="block text-gray-700 font-bold mb-2">Select Amount (PHP)</label>
            <div className="grid grid-cols-3 gap-4">
              {[100, 500, 1000].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`py-3 rounded-lg border-2 transition ${
                    amount === val 
                      ? 'border-papaya-green bg-green-50 text-papaya-green font-bold' 
                      : 'border-gray-200 hover:border-green-200'
                  }`}
                >
                  ₱{val}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-4 w-full p-3 border rounded-lg focus:ring-2 focus:ring-papaya-green outline-none"
              placeholder="Enter custom amount"
            />
          </div>

          {/* Payment Method */}
          <div className="mb-8">
            <label className="block text-gray-700 font-bold mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-3 border rounded-lg bg-white"
            >
              <option value="card">Credit/Debit Card (Stripe)</option>
              <option value="gcash">GCash (Xendit)</option>
              <option value="paymaya">PayMaya (Xendit)</option>
              <option value="grabpay">GrabPay (Xendit)</option>
            </select>
          </div>

          {/* Donate Button */}
          <button
            onClick={handleDonate}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-papaya-green to-green-700 text-white font-bold rounded-lg text-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Donate ₱${amount}`}
          </button>
          
          <p className="text-center text-gray-400 text-sm mt-4">
            Secure payment powered by Stripe & Xendit
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}