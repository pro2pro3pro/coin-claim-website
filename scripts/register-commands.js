const fetch = require("node-fetch");
require("dotenv").config();
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const commands = [
  { name:"getcoin", description:"Lấy link nhận coin", options:[{ name:"service", description:"Chọn dịch vụ", type:3, required:false, choices:[{name:"yeumoney",value:"yeumoney"},{name:"link4m",value:"link4m"},{name:"bbmkts",value:"bbmkts"}]}] },
  { name:"checkcoin", description:"Kiểm tra số coin của bạn" }
];
(async()=>{
  const r = await fetch(`https://discord.com/api/v10/applications/${CLIENT_ID}/guilds/${GUILD_ID}/commands`, {
    method:"PUT", headers:{ Authorization:`Bot ${TOKEN}`, "Content-Type":"application/json" }, body: JSON.stringify(commands)
  });
  console.log(await r.json());
})();