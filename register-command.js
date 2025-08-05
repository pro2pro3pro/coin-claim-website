import fetch from 'node-fetch';
import 'dotenv/config';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const commands = [
  {
    name: 'getcoin',
    description: 'Nhận link rút gọn để kiếm coin',
    options: [
      {
        name: 'link',
        description: 'Chọn link',
        type: 3,
        required: true,
        choices: [
          { name: 'link4m', value: 'link4m' },
          { name: 'yeumoney', value: 'yeumoney' },
          { name: 'bbmkts', value: 'bbmkts' }
        ]
      }
    ]
  }
];

fetch(`https://discord.com/api/v10/applications/${CLIENT_ID}/guilds/${GUILD_ID}/commands`, {
  method: 'PUT',
  headers: {
    Authorization: `Bot ${DISCORD_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(commands)
})
  .then(res => res.json())
  .then(console.log);
