import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const donationId = searchParams.get('donationId');

    if (!donationId) {
      return NextResponse.json({ error: 'Missing donationId' }, { status: 400 });
    }

    const snap = await db.collection('donations').doc(donationId).get();
    if (!snap.exists) {
      return NextResponse.json({ success: false, status: 'not_found' }, { status: 404 });
    }

    const data = snap.data() as any;
    const status = String(data?.status ?? 'unknown');
    const paidAmount = typeof data?.paidAmount === 'number' ? data.paidAmount : null;
    const paidCurrency = typeof data?.paidCurrency === 'string' ? data.paidCurrency : null;

    return NextResponse.json({
      success: status === 'paid',
      status,
      paidAmount,
      paidCurrency,
    });
  } catch (error: any) {
    console.error('[donate/status] Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to get donation status' }, { status: 500 });
  }
}
