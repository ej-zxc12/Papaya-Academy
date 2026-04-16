'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Heart, ArrowLeft, Download, Receipt } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function DonationSuccessPage() {
  const searchParams = useSearchParams();
  const donationId = searchParams.get('donationId') || '';

  const [status, setStatus] = useState<'paid' | 'pending' | 'unknown' | 'not_found'>('unknown');
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [paidCurrency, setPaidCurrency] = useState<'PHP' | 'USD' | 'EUR' | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      if (!donationId) return;
      try {
        const res = await fetch(`/api/donate/status?donationId=${encodeURIComponent(donationId)}`);
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setStatus('unknown');
          return;
        }

        setStatus((data.status as any) ?? 'unknown');
        setPaidAmount(typeof data.paidAmount === 'number' ? data.paidAmount : null);
        setPaidCurrency((data.paidCurrency as any) ?? null);
      } catch {
        if (cancelled) return;
        setStatus('unknown');
      }
    };

    fetchStatus();
    return () => {
      cancelled = true;
    };
  }, [donationId]);

  const currencySymbol = useMemo(() => {
    const c = paidCurrency ?? 'PHP';
    return c === 'PHP' ? '₱' : c === 'USD' ? '$' : '€';
  }, [paidCurrency]);

  const amountDisplay = paidAmount !== null ? String(paidAmount) : '—';

  return (
    <main className={`min-h-screen flex flex-col bg-gray-50 ${montserrat.className}`}>
      <Header />

      <div className="flex-grow flex items-center justify-center p-4 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Success Header */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Thank You!</h1>
            <p className="text-emerald-100">Your donation has been received</p>
          </div>

          {/* Donation Details */}
          <div className="p-8">
            <div className="bg-slate-50 rounded-2xl p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-sm text-slate-500 uppercase tracking-wider mb-1">Donation Amount</p>
                <p className="text-4xl font-bold text-slate-800">
                  {currencySymbol}{amountDisplay}
                </p>
              </div>
              
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Donation ID</span>
                  <span className="text-slate-700 font-medium">{donationId || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Currency</span>
                  <span className="text-slate-700 font-medium">{paidCurrency ?? 'PHP'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  {status === 'paid' ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      Completed
                    </span>
                  ) : status === 'pending' ? (
                    <span className="text-amber-600 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      Pending
                    </span>
                  ) : (
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                      Verifying
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Impact Message */}
            <div className="bg-emerald-50 rounded-2xl p-6 mb-6 border border-emerald-100">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-emerald-500 fill-emerald-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-emerald-800 mb-1">Your Impact</h3>
                  <p className="text-sm text-emerald-700 leading-relaxed">
                    Your generous donation will help provide education, meals, and a safe environment 
                    for children in Payatas. Thank you for making a difference!
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
              >
                <Receipt className="w-5 h-5" />
                Print Receipt
              </button>
              
              <Link 
                href="/" 
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Return to Home
              </Link>
            </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-slate-400 mt-6">
              A confirmation email has been sent to your email address.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
