import { Client, GatewayIntentBits, Routes, Partials, REST, SlashCommandBuilder } from 'discord.js';
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages],
  partials: [Partials.Channel],
});

client.on('ready', () => {
  console.log(`✅ Bot đã online với tên: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName, options, user, channel } = interaction;

  if (commandName === 'getcoin') {
    const service = options.getString('service');
    const subid = uuidv4().slice(0, 10); // tạo subid
    const claimLink = `https://coin-claim-website.vercel.app/${subid}`; // link web

    // Gửi tin nhắn công khai
    await interaction.reply({
      content: '✅ Tôi đã gửi link nhận coin qua tin nhắn riêng nhé! Vui lòng check DMs của bạn nhé',
      ephemeral: false
    });

    // Gửi DM
    try {
      await user.send(`💰 Đây là link nhận coin dành cho bạn (${service}):\n👉 ${claimLink}`);
    } catch (err) {
      console.error('Không gửi được DM:', err);
    }

    // TODO: Lưu subid vào database kèm user ID, loại dịch vụ
    // Tạm thời có thể dùng JSON file hoặc MongoDB sau
  }
});

client.login(process.env.BOT_TOKEN);
