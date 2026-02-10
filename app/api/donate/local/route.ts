import { NextResponse } from 'next/server';
import { Xendit } from 'xendit-node';

const xendit = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY! });

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();
    
    const { Invoice } = xendit;
    const response = await Invoice.createInvoice({
      data: {
        amount: amount,
        externalId: `papaya-local-${Date.now()}`,
        currency: 'PHP',
        description: 'Donation to Papaya Academy',
        successRedirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you`,
        failureRedirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/donate`,
      }
    });

    return NextResponse.json({ checkoutUrl: response.invoiceUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}