import { StreamClient } from '@stream-io/node-sdk';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!apiKey) throw new Error('No NEXT_PUBLIC_STREAM_API_KEY');
  if (!apiSecret) throw new Error('No STREAM_SECRET_KEY');

  const client = new StreamClient(apiKey, apiSecret);

  // Use a string without special chars for Stream ID
  const id = session.user.id?.replace(/[^a-zA-Z0-9_-]/g, '') || 'guest';

  // Valid for 1 hour
  const token = client.generateUserToken({ user_id: id, validity_in_seconds: 3600 });

  return NextResponse.json({ token, id });
}
