import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
const CLIENT_ID = '1402106654379610173'; // Thay bằng ID bot
const GUILD_ID = '1402134798687801475'; // Thay bằng ID server

const commands = [
  new SlashCommandBuilder()
    .setName('getcoin')
    .setDescription('Lấy link rút gọn để nhận coin')
    .toJSON()
];

(async () => {
  try {
    console.log('Đang đăng ký slash command...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('Slash command đã đăng ký thành công!');
  } catch (error) {
    console.error('Lỗi khi đăng ký command:', error);
  }
})();
