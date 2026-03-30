import { StreamClient } from '@stream-io/node-sdk';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export async function GET() {
  try {
    // Validate that API credentials are configured
    if (!apiKey) {
      console.error('[Stream Token] Missing NEXT_PUBLIC_STREAM_API_KEY');
      return NextResponse.json(
        { error: 'Stream API key is not configured. Contact support.' },
        { status: 500 }
      );
    }

    if (!apiSecret) {
      console.error('[Stream Token] Missing STREAM_SECRET_KEY');
      return NextResponse.json(
        { error: 'Server configuration error. Contact support.' },
        { status: 500 }
      );
    }

    // Authenticate user
    const session = await auth();

    if (!session?.user) {
      console.warn('[Stream Token] Unauthorized access attempt - no session');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to access video meetings' },
        { status: 401 }
      );
    }

    if (!session.user.id) {
      console.error('[Stream Token] Session user missing ID', { email: session.user.email });
      return NextResponse.json(
        { error: 'Unable to identify user. Please try signing in again.' },
        { status: 400 }
      );
    }

    // Create Stream client
    let client: StreamClient;
    try {
      client = new StreamClient(apiKey, apiSecret);
    } catch (error: any) {
      console.error('[Stream Token] Failed to create StreamClient:', error);
      return NextResponse.json(
        { error: 'Failed to initialize Stream service. Please try again.' },
        { status: 500 }
      );
    }

    // Sanitize user ID: remove special characters for Stream compatibility
    const id = (session.user.id || session.user.email || 'guest')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '')
      .substring(0, 255); // Stream user IDs have max length

    if (!id) {
      console.error('[Stream Token] Could not generate valid Stream user ID from session');
      return NextResponse.json(
        { error: 'Unable to generate user credentials. Please try signing in again.' },
        { status: 400 }
      );
    }

    // Handle clock drift: set issued_at 1 minute in the past
    const issued = Math.floor(Date.now() / 1000) - 60;
    const validityInSeconds = 3600; // 1 hour

    // Generate token
    let token: string;
    try {
      token = client.generateUserToken({
        user_id: id,
        validity_in_seconds: validityInSeconds,
        iat: issued,
      });

      if (!token) {
        throw new Error('Token generation returned empty result');
      }
    } catch (error: any) {
      console.error('[Stream Token] Token generation failed:', error);
      return NextResponse.json(
        { error: 'Failed to generate authentication token. Please try again.' },
        { status: 500 }
      );
    }

    console.log('[Stream Token] Token generated successfully for user:', id);

    return NextResponse.json({ token, id });
  } catch (error: any) {
    console.error('[Stream Token] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

