import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: 'Deprecated endpoint. Please sign in via /portal/login.' },
    { status: 410 }
  );
}
