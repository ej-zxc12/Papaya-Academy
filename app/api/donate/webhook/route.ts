import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { db } from '@/lib/firebase-admin';
import { isValidEmail, sendDonationThankYouEmail } from '@/lib/mailer';

interface XenditInvoiceWebhookPayload {
  id?: string;
  external_id?: string;
  status?: string;
  amount?: number;
  paid_amount?: number;
  currency?: string;
  paid_at?: string;
}

function isPaidStatus(status: string | undefined) {
  const s = (status ?? '').toUpperCase();
  return s === 'PAID' || s === 'SETTLED';
}

export async function POST(request: NextRequest) {
  try {
    const callbackToken = request.headers.get('x-callback-token');
    const expectedToken = process.env.XENDIT_CALLBACK_TOKEN;

    if (!expectedToken) {
      console.warn('[donate/webhook] Missing XENDIT_CALLBACK_TOKEN env var');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    if (!callbackToken || callbackToken !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await request.json()) as XenditInvoiceWebhookPayload;

    const donationId = payload.external_id;
    if (!donationId) {
      return NextResponse.json({ error: 'Missing external_id' }, { status: 400 });
    }

    const status = payload.status ?? '';
    const paidAmount = typeof payload.paid_amount === 'number' ? payload.paid_amount : payload.amount;
    const paidCurrency = payload.currency ?? null;

    const donationRef = db.collection('donations').doc(donationId);

    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(donationRef);
      if (!snap.exists) {
        tx.set(
          donationRef,
          {
            status: isPaidStatus(status) ? 'paid' : 'unknown',
            paidAmount: typeof paidAmount === 'number' ? paidAmount : null,
            paidCurrency,
            xendit: {
              invoiceId: payload.id ?? null,
              externalId: donationId,
              status,
              paidAt: payload.paid_at ?? null,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        return { shouldEmail: false, donorEmail: '', donorEmailValid: false };
      }

      const data = snap.data() as any;
      const alreadyPaid = (data?.status ?? '').toLowerCase() === 'paid';
      const shouldMarkPaid = isPaidStatus(status) && !alreadyPaid;

      const donorEmail = String(data?.donorEmail ?? '');
      const donorEmailValid = Boolean(data?.donorEmailValid) && isValidEmail(donorEmail);
      const emailSentAt = data?.emailSentAt ?? null;

      if (shouldMarkPaid) {
        tx.update(donationRef, {
          status: 'paid',
          paidAmount: typeof paidAmount === 'number' ? paidAmount : null,
          paidCurrency,
          'xendit.status': status,
          'xendit.invoiceId': payload.id ?? data?.xendit?.invoiceId ?? null,
          'xendit.paidAt': payload.paid_at ?? null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        tx.update(donationRef, {
          'xendit.status': status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      const shouldEmail = Boolean(shouldMarkPaid && donorEmailValid && !emailSentAt);
      return { shouldEmail, donorEmail, donorEmailValid };
    });

    if (result.shouldEmail) {
      try {
        await sendDonationThankYouEmail({
          to: result.donorEmail,
          amount: typeof paidAmount === 'number' ? paidAmount : 0,
          currency: paidCurrency || 'PHP',
        });

        await donationRef.update({
          emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (err: any) {
        console.error('[donate/webhook] Email send failed:', err?.message || err);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[donate/webhook] Error:', error?.message || error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
