// app/api/discord/route.js
import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions';

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

export async function POST(req) {
  const signature = req.headers.get('x-signature-ed25519');
  const timestamp = req.headers.get('x-signature-timestamp');
  const body = await req.text();

  const isValidRequest = verifyKey(body, signature, timestamp, DISCORD_PUBLIC_KEY);
  if (!isValidRequest) return new Response('Invalid request signature', { status: 401 });

  const interaction = JSON.parse(body);

  if (interaction.type === InteractionType.PING) {
    return Response.json({ type: InteractionResponseType.PONG });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const { name } = interaction.data;

    if (name === 'getcoin') {
      // Reply hiển thị menu chọn dịch vụ rút gọn
      return Response.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Chọn 1 dịch vụ để lấy link nhận coin:',
          components: [
            {
              type: 1, // Action Row
              components: [
                {
                  type: 3, // Select Menu
                  custom_id: 'select_service',
                  options: [
                    { label: 'YeuMoney', value: 'yeumoney' },
                    { label: 'Link4m', value: 'link4m' },
                    { label: 'Bbmkts', value: 'bbmkts' }
                  ]
                }
              ]
            }
          ]
        }
      });
    }
  }

  return new Response('Not handled', { status: 400 });
}
