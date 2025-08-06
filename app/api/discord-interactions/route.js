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
    process.env.DISCORD_PUBLIC_KEY=82d8d2a2cc0a52ba843a7daee05c79a3cc1396df7da1ced5d0b2e7bb06b63848
  );

  if (!isValid) return NextResponse.json('Invalid request', { status: 401 });

  const interaction = JSON.parse(rawBody);

  if (interaction.type === 1) {
    // Đây là xác minh ban đầu của Discord (PING)
    return NextResponse.json({ type: 1 });
  }

  // Nếu slash command được gọi, trả lời lại ở đây
  return NextResponse.json({ type: 4, data: { content: 'Hello từ bot!' } });
}
