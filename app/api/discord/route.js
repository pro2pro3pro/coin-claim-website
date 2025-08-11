import { verifyKey } from "discord-interactions";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../../lib/db.js";

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const BASE_URL = process.env.BASE_URL || "https://coin-claim-website.vercel.app";
const API_LINK4M = process.env.API_LINK4M;
const API_YEUMONEY = process.env.API_YEUMONEY;
const API_BBMKTS = process.env.API_BBMKTS;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function shorten(service, target){
  try{
    let api = API_LINK4M;
    if(service === "yeumoney") api = API_YEUMONEY;
    if(service === "bbmkts") api = API_BBMKTS;
    const res = await fetch(api + encodeURIComponent(target));
    const j = await res.json();
    if(j && j.status === "success") return j.shortenedUrl || j.bbmktsUrl || j.shortened_url || null;
    if(typeof j === "string" && j.startsWith("http")) return j;
    return null;
  }catch(e){
    console.error("shorten err", e);
    return null;
  }
}

export async function POST(req){
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = req.headers.get("x-signature-timestamp");
  const raw = await req.text();
  if(!signature || !timestamp) return new Response("missing signature", { status:401 });
  try{
    if(!verifyKey(raw, signature, timestamp, DISCORD_PUBLIC_KEY)) return new Response("invalid signature", { status:401 });
  }catch(e){ return new Response("invalid signature", { status:401 }); }
  const body = JSON.parse(raw);
  if(body.type === 1) return new Response(JSON.stringify({ type:1 }), { status:200, headers:{ "Content-Type":"application/json" } });

  if(body.type === 2){
    const name = body.data.name;
    const discordId = body.member?.user?.id || body.user?.id;
    const db = await getDb();

    if(name === "getcoin"){
      const service = body.data.options?.[0]?.value || "yeumoney";
      const subid = uuidv4().slice(0,8);
      const target = `${BASE_URL}/out/${subid}?d=${discordId}`;
      const short = await shorten(service, target) || target;
      await db.run('INSERT OR REPLACE INTO shortlinks(subid,service,discordId,shortenedUrl,createdAt,completed) VALUES (?,?,?,?,?,?)', [subid,service,discordId,short,new Date().toISOString(),0]);

      // public message
      try{
        await fetch(`https://discord.com/api/v10/channels/${body.channel_id}/messages`, {
          method:"POST", headers:{ Authorization:`Bot ${DISCORD_BOT_TOKEN}`, "Content-Type":"application/json" },
          body: JSON.stringify({ content: `Đã gửi link nhận coin qua DM, <@${discordId}> kiểm tra tin nhắn riêng nhé.` })
        });
      }catch(e){ console.error("public msg err", e); }

      // DM
      try{
        const dm = await fetch("https://discord.com/api/v10/users/@me/channels", { method:"POST", headers:{ Authorization:`Bot ${DISCORD_BOT_TOKEN}`, "Content-Type":"application/json" }, body: JSON.stringify({ recipient_id: discordId })});
        const dmJ = await dm.json();
        if(dmJ.id){
          await fetch(`https://discord.com/api/v10/channels/${dmJ.id}/messages`, { method:"POST", headers:{ Authorization:`Bot ${DISCORD_BOT_TOKEN}`, "Content-Type":"application/json" }, body: JSON.stringify({ content: `Link nhận coin (${service}): ${short}` })});
        }
      }catch(e){ console.error("dm err", e); }

      return new Response(JSON.stringify({ type:4, data:{ content:"Đã gửi link về DM!" } }), { status:200, headers:{ "Content-Type":"application/json" } });
    }

    if(name === "checkcoin"){
      const user = await db.get('SELECT * FROM users WHERE discordId = ?', [discordId]);
      const normal = user?.normalCoin || 0;
      const vip = user?.vipCoin || 0;
      const total = normal + vip;
      const content = `📜 Thông tin coin người dùng\n🔵Bạn còn: ${total} coin\n🟢Normal coin: ${normal} coin\n🟡Vip coin: ${vip} coin\n🔴Lưu ý: Normal coin sẽ reset vào thứ 2 hằng tuần\n🟣Tổng tuần: ${normal} coin\n🟣Tổng tháng: ${normal} coin`;
      return new Response(JSON.stringify({ type:4, data:{ content } }), { status:200, headers:{ "Content-Type":"application/json" } });
    }
  }

  return new Response("not handled", { status:400 });
}