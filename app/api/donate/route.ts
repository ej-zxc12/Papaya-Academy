import { NextRequest, NextResponse } from 'next/server';
import { Xendit } from 'xendit-node';

const xendit = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY! });

// Default fallback rate if API fails
const DEFAULT_EUR_TO_PHP_RATE = 62;

// Fetch real-time EUR to PHP exchange rate
async function getExchangeRate(): Promise<number> {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/EUR');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const phpRate = data.rates?.PHP;
    if (!phpRate || typeof phpRate !== 'number') {
      throw new Error('Invalid rate data from API');
    }
    console.log('[ExchangeRate] Fetched EUR to PHP rate:', phpRate);
    return phpRate;
  } catch (error: any) {
    console.warn('[ExchangeRate] Failed to fetch rate, using fallback:', error.message);
    return DEFAULT_EUR_TO_PHP_RATE;
  }
}

export async function POST(request: NextRequest) {
  let invoiceData: any = null;
  
  try {
    const { amount, currency, email, name } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!currency || !['PHP', 'USD', 'EUR'].includes(currency)) {
      return NextResponse.json({ error: 'Currency must be PHP, USD, or EUR' }, { status: 400 });
    }

    const { Invoice } = xendit;
    
    // Input sanitization
    const sanitizedName = name ? name.trim().slice(0, 100) : '';
    const sanitizedEmail = email ? email.trim().toLowerCase().slice(0, 100) : '';
    
    // Fetch real-time EUR to PHP rate (only needed for EUR donations)
    let eurToPhpRate = DEFAULT_EUR_TO_PHP_RATE;
    if (currency === 'EUR') {
      eurToPhpRate = await getExchangeRate();
    }
    
    // Process currencies
    let finalAmount = amount;
    let finalCurrency = currency;
    let description = sanitizedName ? `Donation from ${sanitizedName}` : 'Anonymous Donation';
    
    if (currency === 'EUR') {
      // EUR: Convert to PHP for processing but keep EUR display
      finalAmount = Math.round(amount * eurToPhpRate);
      finalCurrency = 'PHP';
      description = sanitizedName 
        ? `Donation from ${sanitizedName} (€${amount} → ₱${finalAmount})` 
        : `Donation (€${amount} → ₱${finalAmount})`;
    }
    // USD: Process directly in USD (no conversion)
    // PHP: Process directly in PHP (no conversion)
    
    invoiceData = {
      amount: finalAmount,
      externalId: `papaya-${Date.now()}`,
      currency: finalCurrency,
      description,
      successRedirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/donate/success`,
      failureRedirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/donate`,
    };

    // Configure payment methods based on currency
    if (currency === 'PHP') {
      // Local: Show all Philippine e-wallets, banks, and partner payment options
      invoiceData.paymentMethods = [
        'GCASH',           // GCash e-wallet
        'PAYMAYA',         // Maya (formerly PayMaya)
        'GRABPAY',         // GrabPay
        'SHOPEEPAY',       // ShopeePay
        'BPI',             // BPI Online/Mobile
        'BDO',             // BDO Online
        'MTB',             // Metrobank
        'RCBC',            // RCBC
        'UBP',             // UnionBank
        'CHINABANK',       // China Bank
        'LAND BANK',       // Land Bank
        'PNB',             // PNB
        'SECURITYBANK',    // Security Bank
        'AUB',             // Asia United Bank
        '7ELEVEN',         // 7-Eleven CLiQQ
        'CEBUANA',         // Cebuana Lhuillier
        'MLHUILLIER',      // M Lhuillier
        'ECPAY',           // ECPay partners
        'GCASH_MINIAPP',   // GCash Mini App
        'BILLEASE',        // BillEase
        'CREDIT_CARD'      // Credit/Debit Card
      ];
    } else if (currency === 'USD') {
      // USD: Process directly in USD (Credit Card only)
      invoiceData.paymentMethods = ['CREDIT_CARD'];
    } else if (currency === 'EUR') {
      // EUR: Convert to PHP, show Credit Card with conversion details
      invoiceData.paymentMethods = ['CREDIT_CARD'];
      // Add metadata to show original EUR amount and rate used for transparency
      invoiceData.metadata = {
        originalCurrency: 'EUR',
        originalAmount: amount.toString(),
        convertedAmount: finalAmount.toString(),
        conversionRate: eurToPhpRate.toString(),
        conversionNote: `€${amount} → ₱${finalAmount} (EUR to PHP at rate ${eurToPhpRate})`
      };
    }

    if (sanitizedEmail && sanitizedEmail.includes('@')) {
      invoiceData.payerEmail = sanitizedEmail;
    }

    console.log('[Xendit] Creating invoice with data:', JSON.stringify(invoiceData, null, 2));
    
    const response = await Invoice.createInvoice({ data: invoiceData });
    console.log('[Xendit] Invoice created:', response);
    
    return NextResponse.json({ invoiceUrl: response.invoiceUrl });
    
  } catch (error: any) {
    console.error('[Xendit] Error:', error?.message || error);
    
    // Return safe error message (don't expose internal details to client)
    return NextResponse.json(
      { 
        error: 'Payment processing failed. Please try again or contact support.'
      },
      { status: 500 }
    );
  }
}
