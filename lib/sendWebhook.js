export async function sendWebhook({ username, coin, service, ip }) {
  const webhookURL = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookURL) return console.error("Thiếu webhook URL");

  const content = `🎉 **${username}** vừa nhận được **${coin} Coin** từ dịch vụ **${service}**.\n🌐 IP: \`${ip}\``;

  try {
    await fetch(webhookURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
      }),
    });
  } catch (error) {
    console.error("Gửi webhook thất bại:", error);
  }
}
