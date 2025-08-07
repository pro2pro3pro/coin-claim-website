export async function sendWebhook({ username, coin, service, ip }) {
  const webhookURL = process.env.https://discord.com/api/webhooks/1402514857861058672/Hn3bxF2jcaUM8TjGfo7_WwpX4_B0EQpM3m1XdbXv1IAZ2Sp7lrLryonwReWCfeVXCJPP;

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
