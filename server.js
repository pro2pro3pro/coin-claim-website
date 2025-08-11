// full server.js (Express) - Paste as-is
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const { v4: uuidv4 } = require("uuid");
const requestIp = require("request-ip");
const { verifyKey } = require("discord-interactions");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
app.use((req, res, next) => {
  if (req.path === "/api/discord") {
    let data = [];
    req.on("data", chunk => data.push(chunk));
    req.on("end", () => {
      req.rawBody = Buffer.concat(data);
      try { req.textBody = req.rawBody.toString("utf8"); } catch(e){ req.textBody = ""; }
      next();
    });
  } else next();
});
app.use(bodyParser.json());
app.use(requestIp.mw());

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "db.sqlite");
const db = new sqlite3.Database(DB_PATH);
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (discordId TEXT PRIMARY KEY, normalCoin INTEGER DEFAULT 0, vipCoin INTEGER DEFAULT 0, lastReset TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS shortlinks (subid TEXT PRIMARY KEY, service TEXT, discordId TEXT, shortenedUrl TEXT, createdAt TEXT, completed INTEGER DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS iplogs (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT, service TEXT, subid TEXT, discordId TEXT, createdAt TEXT)`);
});

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || "";
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";
const GUILD_ID = process.env.GUILD_ID || "";
const BASE_URL = process.env.BASE_URL || "https://coin-claim-website.vercel.app";
const API_LINK4M = process.env.API_LINK4M || "https://link4m.co/st?api=6546120e63db5f22fe3895af&url=";
const API_YEUMONEY = process.env.API_YEUMONEY || "https://yeumoney.com/QL_api.php?token=0dce414c23a83be658f673f1ca2a8f4cf9f4b0159a77982f7b24159485ba4d8c&format=json&url=";
const API_BBMKTS = process.env.API_BBMKTS || "https://bbmkts.com/ql?token=9603c4d2b8ddcfaad8f592e9&longurl=";

function runAsync(sql, params=[]) {
  return new Promise((res, rej) => {
    db.run(sql, params, function(err){ if(err) rej(err); else res(this); });
  });
}
function getAsync(sql, params=[]){ return new Promise((res, rej)=> db.get(sql, params, (e,r)=> e?rej(e):res(r)) ); }
function allAsync(sql, params=[]){ return new Promise((res, rej)=> db.all(sql, params, (e,r)=> e?rej(e):res(r)) ); }

async function shortenWithAPI(service, targetUrl){
  try{
    let api = API_LINK4M;
    if(service === "yeumoney") api = API_YEUMONEY;
    if(service === "bbmkts") api = API_BBMKTS;
    const url = api + encodeURIComponent(targetUrl);
    const r = await fetch(url);
    const j = await r.json();
    if(j && j.status === "success"){
      return j.shortenedUrl || j.bbmktsUrl || j.shortened_url || null;
    }
    if(typeof j === "string" && j.startsWith("http")) return j;
    return null;
  }catch(e){
    console.error("shorten error", e);
    return null;
  }
}

app.post("/api/discord", async (req, res) => {
  try {
    const signature = req.get("x-signature-ed25519");
    const timestamp = req.get("x-signature-timestamp");
    const bodyText = req.textBody || "";
    if(!signature || !timestamp) return res.status(401).send("missing signature");
    try {
      if(!verifyKey(bodyText, signature, timestamp, DISCORD_PUBLIC_KEY)){
        return res.status(401).send("invalid signature");
      }
    } catch(e){
      console.error("verifyKey err", e);
      return res.status(401).send("invalid signature");
    }

    const body = JSON.parse(bodyText);
    if(body.type === 1) return res.json({ type: 1 });

    if(body.type === 2){
      const name = body.data.name;
      const discordId = body.member?.user?.id || body.user?.id;
      if(name === "getcoin"){
        const service = (body.data.options && body.data.options[0] && body.data.options[0].value) || "yeumoney";
        const subid = uuidv4().slice(0,8);
        const target = `${BASE_URL}/out/${subid}?d=${discordId}`;
        const short = await shortenWithAPI(service, target) || target;
        await runAsync('INSERT OR REPLACE INTO shortlinks(subid,service,discordId,shortenedUrl,createdAt,completed) VALUES (?,?,?,?,?,?)', [subid,service,discordId,short,new Date().toISOString(),0]);
        const channelId = body.channel_id;
        if(channelId && DISCORD_BOT_TOKEN){
          try{
            await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
              method:"POST",
              headers:{ Authorization:`Bot ${DISCORD_BOT_TOKEN}`, "Content-Type":"application/json" },
              body: JSON.stringify({ content: `Đã gửi link nhận coin qua DM, <@${discordId}> kiểm tra tin nhắn riêng nhé.` })
            });
          }catch(e){ console.error("post public err", e); }
        }
        if(DISCORD_BOT_TOKEN){
          try{
            const dm = await fetch("https://discord.com/api/v10/users/@me/channels", { method:"POST", headers:{ Authorization:`Bot ${DISCORD_BOT_TOKEN}`, "Content-Type":"application/json" }, body: JSON.stringify({ recipient_id: discordId })});
            const dmJ = await dm.json();
            if(dmJ.id){
              await fetch(`https://discord.com/api/v10/channels/${dmJ.id}/messages`, { method:"POST", headers:{ Authorization:`Bot ${DISCORD_BOT_TOKEN}`, "Content-Type":"application/json" }, body: JSON.stringify({ content: `Link nhận coin (${service}): ${short}` })});
            }
          }catch(e){ console.error("dm err", e); }
        }
        return res.json({ type:4, data:{ content:"Đã gửi link về DM!" } });
      }

      if(name === "checkcoin"){
        const discordId = body.member?.user?.id || body.user?.id;
        const user = await getAsync('SELECT * FROM users WHERE discordId = ?', [discordId]);
        const normal = user ? user.normalCoin : 0;
        const vip = user ? user.vipCoin : 0;
        const total = normal + vip;
        const content = `📜 Thông tin coin người dùng\\n🔵Bạn còn: ${total} coin\\n🟢Normal coin: ${normal} coin\\n🟡Vip coin: ${vip} coin\\n🔴Lưu ý: Normal coin sẽ reset vào thứ 2 hằng tuần\\n🟣Tổng tuần: ${normal} coin\\n🟣Tổng tháng: ${normal} coin`;
        return res.json({ type:4, data:{ content } });
      }
    }
    return res.status(400).send("not handled");
  } catch (e) {
    console.error(e);
    return res.status(500).send("err");
  }
});

// out endpoint
app.get("/out/:subid", async (req, res) => {
  try{
    const subid = req.params.subid;
    const discordId = req.query.d || null;
    const ip = req.clientIp || req.headers["x-forwarded-for"] || req.ip || "unknown";
    const rec = await getAsync('SELECT * FROM shortlinks WHERE subid = ?', [subid]);
    if(!rec) return res.status(404).send("Not found");
    await runAsync('INSERT INTO iplogs(ip,service,subid,discordId,createdAt) VALUES (?,?,?,?,?)', [ip, rec.service, subid, discordId, new Date().toISOString()]);
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const logs = await allAsync('SELECT * FROM iplogs WHERE ip = ? AND service = ? AND createdAt >= ?', [ip, rec.service, todayStart.toISOString()]);
    const limits = { yeumoney:2, link4m:1, bbmkts:1 };
    if(logs.length > (limits[rec.service] - 1)){
      return res.redirect(`${BASE_URL}/claim/${subid}?status=limit`);
    }
    const usedByOther = await getAsync('SELECT * FROM iplogs WHERE ip = ? AND subid = ? AND discordId IS NOT NULL AND discordId != ?', [ip, subid, discordId]);
    if(usedByOther){
      return res.redirect(`${BASE_URL}/claim/${subid}?status=ip_used_by_other`);
    }
    await runAsync('UPDATE shortlinks SET completed = 1 WHERE subid = ?', [subid]);
    const owner = rec.discordId;
    const user = await getAsync('SELECT * FROM users WHERE discordId = ?', [owner]);
    if(!user){
      await runAsync('INSERT INTO users(discordId,normalCoin,vipCoin,lastReset) VALUES (?,?,?,?)', [owner,150,0,new Date().toISOString()]);
    } else {
      await runAsync('UPDATE users SET normalCoin = normalCoin + ? WHERE discordId = ?', [150, owner]);
    }
    if(DISCORD_WEBHOOK_URL){
      try{
        await fetch(DISCORD_WEBHOOK_URL, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ content: `Chúc mừng <@${owner}> đã nhận 150 coin từ ${rec.service}` })});
      }catch(e){ console.error("webhook err", e); }
    }
    return res.redirect(`${BASE_URL}/claim/${subid}?status=success`);
  }catch(e){
    console.error(e);
    return res.status(500).send("error");
  }
});

// claim page - simple HTML with neon UI (kept concise here)
app.get("/claim/:subid", async (req, res) => {
  try{
    const subid = req.params.subid;
    const status = req.query.status || "ok";
    const rec = await getAsync('SELECT * FROM shortlinks WHERE subid = ?', [subid]);
    if(!rec) return res.status(404).send("Không tìm thấy claim.");
    const user = await getAsync('SELECT * FROM users WHERE discordId = ?', [rec.discordId]);
    const normal = user ? user.normalCoin : 0;
    const vip = user ? user.vipCoin : 0;
    const html = `
<!doctype html>
<html><head><meta charset="utf-8"><title>Claim ${subid}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>:root{--bg:#020617;--neon:#0ea5e9;--accent:#06b6d4;--text:#e6f4ff}body{margin:0;background:linear-gradient(180deg,#010113,#021029);color:var(--text);font-family:Inter,Arial;} .wrap{max-width:900px;margin:40px auto;padding:20px}.card{background:rgba(255,255,255,0.02);padding:24px;border-radius:12px}.logo{width:64px;height:64px;border-radius:12px;background:linear-gradient(180deg,var(--neon),var(--accent));display:flex;align-items:center;justify-content:center;font-weight:800}.big{font-size:44px;color:var(--neon)}</style>
</head><body><div class="wrap"><div class="card"><div style="display:flex;gap:12px;align-items:center"><div class="logo">CC</div><div><h1>Claim ${subid}</h1><div style="opacity:0.8">Người yêu cầu: <strong>${rec.discordId}</strong> • Service: <strong>${rec.service}</strong></div></div></div><div style="margin-top:18px"><div class="big">${normal + vip}</div><div style="opacity:0.8">🔵Bạn còn</div><p style="margin-top:12px">${status === 'success' ? '<strong style="color:var(--neon)">Bạn đã nhận 150 coin! 🎉</strong>' : ''}</p></div></div></div></body></html>`;
    res.setHeader("Content-Type","text/html; charset=utf-8");
    return res.send(html);
  }catch(e){
    console.error(e);
    return res.status(500).send("Lỗi server");
  }
});

app.get("/api/cron/reset", async (req, res) => {
  try{
    const now = new Date().toISOString();
    await runAsync('UPDATE users SET normalCoin = 0, lastReset = ?', [now]);
    return res.json({ ok:true, message: "Normal coins reset" });
  }catch(e){ console.error(e); return res.status(500).json({ error: "err" }); }
});

app.get("/health",(req,res)=>res.json({ok:true}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Server running", PORT));