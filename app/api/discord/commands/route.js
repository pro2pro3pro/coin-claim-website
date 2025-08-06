export async function POST(req) {
  const body = await req.json();

  const userId = body?.member?.user?.id;
  const command = body?.data?.name;

  if (command === "getcoin") {
    const service = body.data.options[0]?.value; // link4m, yeumoney, bbmkts
    const subid = generateSubid(); // bạn tạo random tại đây

    // Save vào shortlinks.json
    // Rút gọn link tương ứng (gọi API của link4m, yeumoney,...)

    // Gửi link qua DM
    await fetch(`https://discord.com/api/v10/users/@me/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient_id: userId,
        content: `🔗 Đây là link nhận coin của bạn: https://coin-claim-website.vercel.app/${subid}`,
      }),
    });

    return new Response("ok");
  }

  return new Response("Unknown command", { status: 400 });
}
