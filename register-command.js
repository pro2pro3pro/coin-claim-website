import { SlashCommandBuilder, REST, Routes } from 'discord.js';
import 'dotenv/config';

const commands = [
  new SlashCommandBuilder()
    .setName('getcoin')
    .setDescription('Nhận link rút gọn để kiếm coin')
    .addStringOption(option =>
      option.setName('service')
        .setDescription('Chọn dịch vụ rút gọn')
        .setRequired(true)
        .addChoices(
          { name: 'yeumoney', value: 'yeumoney' },
          { name: 'link4m', value: 'link4m' },
          { name: 'bbmkts', value: 'bbmkts' },
        )),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('Đang đăng ký lệnh slash...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );
    console.log('✅ Đăng ký slash command thành công!');
  } catch (error) {
    console.error('Lỗi khi đăng ký lệnh:', error);
  }
})();
