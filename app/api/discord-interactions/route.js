import { NextResponse } from 'next/server';
import { verifyKey } from 'discord-interactions';

export async function POST(req) {
  const signature = req.headers.get('x-signature-ed25519');
  const timestamp = req.headers.get('x-signature-timestamp');
  const rawBody = await req.text();

  const isValid = verifyKey(
    rawBody,
    signature,
    timestamp,
    process.env.DISCORD_PUBLIC_KEY
  );

  if (!isValid) return NextResponse.json('Invalid request', { status: 401 });

  const interaction = JSON.parse(rawBody);

  if (interaction.type === 1) {
    // Discord xác thực (PING)
    return NextResponse.json({ type: 1 });
  }

  // Xử lý slash command ở đây

  return NextResponse.json({ type: 4, data: { content: 'Hello từ bot!' } });
}
