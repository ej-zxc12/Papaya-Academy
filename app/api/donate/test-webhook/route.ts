import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { db } from '@/lib/firebase-admin';
import { isValidEmail, sendDonationThankYouEmail } from '@/lib/mailer';

// Manual test endpoint to simulate webhook for local development
// Only works in development mode
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    const { donationId, status = 'PAID', paidAmount, paidCurrency = 'PHP' } = await request.json();

    if (!donationId) {
      return NextResponse.json({ error: 'Missing donationId' }, { status: 400 });
    }

    const donationRef = db.collection('donations').doc(donationId);
    const snap = await donationRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    const data = snap.data() as any;
    const donorEmail = String(data?.donorEmail ?? '');
    const donorEmailValid = Boolean(data?.donorEmailValid) && isValidEmail(donorEmail);
    const emailSentAt = data?.emailSentAt ?? null;

    const finalPaidAmount = paidAmount ?? data?.payableAmount ?? 100;
    const finalCurrency = paidCurrency ?? data?.payableCurrency ?? 'PHP';

    // Update donation as paid
    await donationRef.update({
      status: 'paid',
      paidAmount: finalPaidAmount,
      paidCurrency: finalCurrency,
      'xendit.status': status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send email if valid and not already sent
    if (donorEmailValid && !emailSentAt) {
      try {
        await sendDonationThankYouEmail({
          to: donorEmail,
          amount: finalPaidAmount,
          currency: finalCurrency,
        });

        await donationRef.update({
          emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
          success: true,
          message: 'Donation marked as paid and email sent',
          donationId,
          emailSentTo: donorEmail,
          amount: finalPaidAmount,
          currency: finalCurrency,
        });
      } catch (err: any) {
        console.error('[test-webhook] Email send failed:', err?.message || err);
        return NextResponse.json({
          success: false,
          message: 'Donation marked as paid but email failed',
          error: err?.message,
          donationId,
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: donorEmailValid ? 'Donation marked as paid (email already sent)' : 'Donation marked as paid (email invalid or missing)',
      donationId,
      emailSent: false,
      reason: donorEmailValid ? 'already_sent' : 'invalid_email',
    });
  } catch (error: any) {
    console.error('[test-webhook] Error:', error?.message || error);
    return NextResponse.json({ error: 'Test webhook failed' }, { status: 500 });
  }
}
