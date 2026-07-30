import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const data = JSON.parse(rawBody);

    const secretKey = process.env.GOOGLE_SHEET_SECRET;
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

    if (!secretKey || !webhookUrl) {
      console.error("Missing Google Sheets environment variables");
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Generate a UNIX timestamp (nonce) in seconds
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Create HMAC SHA-256 signature of (rawBody + timestamp)
    const payloadToSign = rawBody + timestamp;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(payloadToSign)
      .digest('hex');

    // Send the signed request to the Google Apps Script Webhook
    const response = await fetch(`${webhookUrl}?timestamp=${timestamp}&signature=${signature}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: rawBody,
    });

    const rawResponse = await response.text();
    let result;
    try {
      result = JSON.parse(rawResponse);
    } catch (e) {
      console.error("Failed to parse Google Script response. Raw response:", rawResponse);
      return NextResponse.json(
        { error: 'Invalid response from Google Sheets', details: rawResponse },
        { status: 500 }
      );
    }

    if (result.status === 'error') {
      console.error("Google Sheets Webhook Error:", result.message);
      return NextResponse.json(
        { error: 'Failed to sync with spreadsheet' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
