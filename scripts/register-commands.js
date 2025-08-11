const fetch = require('node-fetch');

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const commands = [
  {
    name: 'getcoin',
    description: 'Nhận link rút gọn để lấy coin',
    options: [
      {
        name: 'service',
        description: 'Chọn dịch vụ rút gọn link',
        type: 3,
        required: true,
        choices: [
          { name: 'yeumoney', value: 'yeumoney' },
          { name: 'link4m', value: 'link4m' },
          { name: 'bbmkts', value: 'bbmkts' }
        ]
      }
    ]
  },
  {
    name: 'checkcoin',
    description: 'Kiểm tra số dư coin hiện tại'
  }
];

(async () => {
  try {
    console.log('🔄 Đang đăng ký slash command...');

    const response = await fetch(`https://discord.com/api/v10/applications/${DISCORD_CLIENT_ID}/guilds/${GUILD_ID}/commands`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commands)
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi đăng ký lệnh: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Slash command đã đăng ký thành công!');
    console.log('📌 Lệnh đã có trên server: /getcoin và /checkcoin');
  } catch (err) {
    console.error('❌ Có lỗi xảy ra khi đăng ký slash command:', err);
  }
})();
