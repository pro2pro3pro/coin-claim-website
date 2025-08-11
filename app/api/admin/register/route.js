import { NextResponse } from "next/server";
export async function POST(req){
  const cookie = req.headers.get("cookie") || "";
  if(!cookie.includes("admin_auth=1")) return NextResponse.json({ error:"unauth" }, { status:401 });
  try{
    const clientId = process.env.DISCORD_CLIENT_ID;
    const guildId = process.env.GUILD_ID;
    const token = process.env.DISCORD_BOT_TOKEN;
    const commands = [
      { name:"getcoin", description:"Lấy link nhận coin", options:[{ name:"service", description:"Chọn dịch vụ", type:3, required:false, choices:[{name:"yeumoney",value:"yeumoney"},{name:"link4m",value:"link4m"},{name:"bbmkts",value:"bbmkts"}]}] },
      { name:"checkcoin", description:"Kiểm tra số coin của bạn" }
    ];
    const r = await fetch(`https://discord.com/api/v10/applications/${clientId}/guilds/${guildId}/commands`, { method:"PUT", headers:{ Authorization:`Bot ${token}`, "Content-Type":"application/json" }, body: JSON.stringify(commands) });
    const j = await r.json();
    return NextResponse.json(j);
  }catch(e){
    return NextResponse.json({ error:"err" }, { status:500 });
  }
}