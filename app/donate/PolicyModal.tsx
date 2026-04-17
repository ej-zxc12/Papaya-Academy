'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  onDecline: () => void;
}

export default function PolicyModal({ isOpen, onClose, onAgree, onDecline }: PolicyModalProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'refund' | 'privacy'>('terms');
  const [agreed, setAgreed] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleTabChange = (tab: 'terms' | 'refund' | 'privacy') => {
    setActiveTab(tab);
    // Reset scroll to top when tab changes
    const contentArea = document.getElementById('policy-content-area');
    if (contentArea) {
      contentArea.scrollTop = 0;
    }
  };

  const handleAgreeClick = () => {
    if (agreed) {
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onAgree();
      }, 1500);
    }
  };

  const handleDeclineClick = () => {
    onDecline();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-2xl flex flex-col"
              style={{ maxWidth: '480px', width: '90%', maxHeight: '560px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Tabs */}
              <div className="flex-shrink-0 border-b border-slate-200">
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <h2 className="text-lg font-bold text-slate-800">Policies</h2>
                  <button
                    onClick={handleClose}
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Tabs */}
                <div className="flex px-4 pb-3 gap-2">
                  <button
                    onClick={() => handleTabChange('terms')}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'terms'
                        ? 'text-white'
                        : 'text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                    style={activeTab === 'terms' ? { backgroundColor: '#185FA5' } : {}}
                  >
                    Terms & Conditions
                  </button>
                  <button
                    onClick={() => handleTabChange('refund')}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'refund'
                        ? 'text-white'
                        : 'text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                    style={activeTab === 'refund' ? { backgroundColor: '#185FA5' } : {}}
                  >
                    Refund Policy
                  </button>
                  <button
                    onClick={() => handleTabChange('privacy')}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'privacy'
                        ? 'text-white'
                        : 'text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                    style={activeTab === 'privacy' ? { backgroundColor: '#185FA5' } : {}}
                  >
                    Privacy Policy
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div 
                id="policy-content-area"
                className="flex-1 overflow-y-auto px-6 py-4"
                style={{ fontSize: '13.5px', lineHeight: '1.6' }}
              >
                {activeTab === 'terms' && (
                  <div className="space-y-4">
                    {/* Info Banner */}
                    <div 
                      className="px-4 py-3 rounded-lg"
                      style={{ backgroundColor: '#E6F1FB' }}
                    >
                      <p className="text-sm font-medium" style={{ color: '#185FA5' }}>
                        Please read these terms carefully before making a donation.
                      </p>
                    </div>

                    <div className="space-y-4 text-slate-700">
                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>Acceptance of Terms</h3>
                        <p>By making a donation to Papaya Academy, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.</p>
                      </section>

                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>Eligibility</h3>
                        <p>You must be at least 18 years old to make a donation. By donating, you represent and warrant that you meet this age requirement.</p>
                      </section>

                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>Nature of Donations</h3>
                        <p>All donations are voluntary and non-refundable unless otherwise specified in our Refund Policy. Donations do not create any contractual relationship between you and Papaya Academy.</p>
                      </section>

                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>Use of Funds</h3>
                        <p>Donations are used to support educational programs, meals, and resources for children in the Papaya Community. We strive to use funds efficiently and transparently.</p>
                      </section>

                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>Tax Considerations</h3>
                        <p>Donations to Papaya Academy may be tax-deductible depending on your local tax laws. Please consult with a tax professional regarding your specific situation.</p>
                      </section>

                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>Payment Processing</h3>
                        <p>Payment processing is handled through secure third-party payment processors. We do not store your full payment information on our servers.</p>
                      </section>

                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>Limitation of Liability</h3>
                        <p>Papaya Academy shall not be liable for any indirect, incidental, special, or consequential damages arising from your donation or use of our services.</p>
                      </section>

                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>Modifications</h3>
                        <p>We reserve the right to modify these terms at any time. Continued use of our donation services constitutes acceptance of any changes.</p>
                      </section>
                    </div>

                    {/* Bottom Note */}
                    <div 
                      className="px-4 py-3 rounded-lg mt-6"
                      style={{ backgroundColor: '#E6F1FB' }}
                    >
                      <p className="text-xs" style={{ color: '#185FA5' }}>
                        Last updated: April 16, 2026 | Contact us at: support@papayaacademy.org
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'refund' && (
                  <div className="space-y-4">
                    {/* Info Banner */}
                    <div 
                      className="px-4 py-3 rounded-lg"
                      style={{ backgroundColor: '#E6F1FB' }}
                    >
                      <p className="text-sm font-medium" style={{ color: '#185FA5' }}>
                        Our refund policy ensures fair handling of donation requests.
                      </p>
                    </div>

                    <div className="space-y-4 text-slate-700">
                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>General Policy</h3>
                        <p>Donations are generally considered final and non-refundable. However, we understand that errors may occur and will consider refund requests under specific circumstances.</p>
                      </section>

                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>Eligible Refund Requests</h3>
                        <p>Refunds may be considered if:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>A duplicate charge occurred</li>
                          <li>The wrong amount was charged due to a processing error</li>
                          <li>An unauthorized transaction was made</li>
                          <li>The request is made within 30 days of the donation</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>How to Request a Refund</h3>
                        <p>To request a refund, please email us at support@papayaacademy.org with your donation details, transaction ID, and reason for the refund request. We will review your request and respond within 5 business days.</p>
                      </section>

                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>Processing Time</h3>
                        <p>Approved refunds are processed within 7–14 business days. The timing of the refund appearing in your account depends on your payment provider's processing times.</p>
                      </section>
                    </div>

                    {/* Bottom Note */}
                    <div 
                      className="px-4 py-3 rounded-lg mt-6"
                      style={{ backgroundColor: '#E6F1FB' }}
                    >
                      <p className="text-xs" style={{ color: '#185FA5' }}>
                        Last updated: April 16, 2026 | Contact us at: support@papayaacademy.org
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-4">
                    {/* Info Banner */}
                    <div 
                      className="px-4 py-3 rounded-lg"
                      style={{ backgroundColor: '#E6F1FB' }}
                    >
                      <p className="text-sm font-medium" style={{ color: '#185FA5' }}>
                        We are committed to protecting your privacy and personal information.
                      </p>
                    </div>

                    <div className="space-y-4 text-slate-700">
                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>Information We Collect</h3>
                        <p>We collect information you provide directly, including your name, email address, donation amount, and payment information. We also collect technical data such as IP address and browser type for security purposes.</p>
                      </section>

                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>How We Use Your Information</h3>
                        <p>Your information is used to process donations, send donation receipts, communicate with you about our programs, and improve our services. We do not sell your personal information to third parties.</p>
                      </section>

                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>Data Sharing</h3>
                        <p>We only share your information with trusted third-party payment processors to facilitate transactions. We may also share information when required by law or to protect our rights.</p>
                      </section>

                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>Data Retention</h3>
                        <p>We retain your information for as long as necessary to provide our services and comply with legal obligations. Donation records are typically retained for 5 years for tax and accounting purposes.</p>
                      </section>

                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>Your Rights</h3>
                        <p>You have the right to access, correct, or delete your personal information. You may also opt out of marketing communications at any time by contacting us.</p>
                      </section>

                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>Cookies</h3>
                        <p>We use cookies and similar technologies to improve your experience, analyze site usage, and assist in our marketing efforts. You can manage your cookie preferences through your browser settings.</p>
                      </section>

                      <section>
                        <h3 className="font-medium mb-2" style={{ fontSize: '14px', color: '#185FA5' }}>Security</h3>
                        <p>We implement industry-standard security measures including TLS/SSL encryption for all data transmission and comply with PCI-DSS standards for payment processing. Your information is stored securely and accessed only by authorized personnel.</p>
                      </section>
                    </div>

                    {/* Bottom Note */}
                    <div 
                      className="px-4 py-3 rounded-lg mt-6"
                      style={{ backgroundColor: '#E6F1FB' }}
                    >
                      <p className="text-xs" style={{ color: '#185FA5' }}>
                        Last updated: April 16, 2026 | Contact us at: support@papayaacademy.org
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 border-t border-slate-200 px-6 py-4 bg-white">
                <div className="space-y-3">
                  {/* Checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      style={{ accentColor: '#185FA5' }}
                    />
                    <span className="text-sm text-slate-700">
                      I have read and agree to the{' '}
                      <span style={{ color: '#185FA5', fontWeight: 500 }}>Terms & Conditions</span>
                      {', '}
                      <span style={{ color: '#185FA5', fontWeight: 500 }}>Refund Policy</span>
                      {', and '}
                      <span style={{ color: '#185FA5', fontWeight: 500 }}>Privacy Policy</span>
                      .
                    </span>
                  </label>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleAgreeClick}
                      disabled={!agreed}
                      className="flex-1 py-3 px-4 rounded-lg text-white font-medium transition-all"
                      style={{
                        backgroundColor: agreed ? '#185FA5' : '#185FA5',
                        opacity: agreed ? 1 : 0.45,
                        cursor: agreed ? 'pointer' : 'not-allowed'
                      }}
                    >
                      I agree & continue
                    </button>
                    <button
                      onClick={handleDeclineClick}
                      className="py-3 px-4 rounded-lg font-medium border border-slate-300 text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-lg shadow-lg"
            style={{ backgroundColor: '#185FA5' }}
          >
            <p className="text-white font-medium text-sm">Agreement confirmed!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
