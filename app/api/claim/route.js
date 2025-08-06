import fs from "fs";
import path from "path";

// ... các đoạn xử lý IP, giới hạn, gửi webhook... (bạn đã làm xong rồi)

const shortlinkPath = path.join(process.cwd(), "data", "shortlinks.json");
const shortlinkData = JSON.parse(fs.readFileSync(shortlinkPath, "utf-8"));
const userInfo = shortlinkData[subid];

if (userInfo && userInfo.userId) {
  const discordUserId = userInfo.userId;

  try {
    await fetch(`https://discord.com/api/v10/users/@me/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient_id: discordUserId,
        content: "🎉 Chúc mừng bạn đã nhận được coin!",
      }),
    });
  } catch (error) {
    console.error("Gửi DM thất bại:", error);
  }
}
