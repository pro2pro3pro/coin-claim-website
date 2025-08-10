
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
const requestIp = require('request-ip');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(requestIp.mw());

const DBFILE = path.join(__dirname,'data','db.sqlite3');
if (!fs.existsSync(path.join(__dirname,'data'))) fs.mkdirSync(path.join(__dirname,'data'),{recursive:true});
const db = new sqlite3.Database(DBFILE);

db.serialize(()=>{
  db.run(`CREATE TABLE IF NOT EXISTS users (discordId TEXT PRIMARY KEY, normalCoin INTEGER DEFAULT 0, vipCoin INTEGER DEFAULT 0, lastReset TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS shortlinks (subid TEXT PRIMARY KEY, service TEXT, discordId TEXT, shortenedUrl TEXT, createdAt TEXT, completed INTEGER DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS iplogs (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT, service TEXT, subid TEXT, discordId TEXT, createdAt TEXT)`);
});

const BASE_URL = process.env.BASE_URL || 'https://coin-claim-website.vercel.app';
const API_LINK4M = process.env.API_LINK4M || 'https://link4m.co/api-shorten/v2?api=6546120e63db5f22fe3895af&url=';
const API_YEUMONEY = process.env.API_YEUMONEY || 'https://yeumoney.com/QL_api.php?token=0dce414c23a83be658f673f1ca2a8f4cf9f4b0159a77982f7b24159485ba4d8c&format=json&url=';
const API_BBMKTS = process.env.API_BBMKTS || 'https://bbmkts.com/dapi?token=9603c4d2b8ddcfaad8f592e9&longurl=';
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || '';
const GUILD_ID = process.env.GUILD_ID || '';

// helpers
function runAsync(sql, params=[]){ return new Promise((res,rej)=>{ db.run(sql, params, function(err){ if(err) rej(err); else res(this); }); }); }
function allAsync(sql, params=[]){ return new Promise((res,rej)=>{ db.all(sql, params, (err,rows)=>{ if(err) rej(err); else res(rows); }); }); }
function getAsync(sql, params=[]){ return new Promise((res,rej)=>{ db.get(sql, params, (err,row)=>{ if(err) rej(err); else res(row); }); }); }

async function shortenWithAPI(service, targetUrl){
  try{
    let apiUrl = API_LINK4M;
    if(service==='yeumoney') apiUrl = API_YEUMONEY;
    if(service==='bbmkts') apiUrl = API_BBMKTS;
    const full = apiUrl + encodeURIComponent(targetUrl);
    const r = await fetch(full);
    const j = await r.json();
    if(j.status && j.status==='success'){
      if(j.shortenedUrl) return j.shortenedUrl;
      if(j.bbmktsUrl) return j.bbmktsUrl;
      if(j.shortened_url) return j.shortened_url;
    }
    return null;
  }catch(e){
    console.error('shorten error',e);
    return null;
  }
}

// register commands endpoint (run once manually or via curl)
app.post('/api/register-commands', async (req,res)=>{
  const commands = [
    { name:'getcoin', description:'Lấy link nhận coin' },
    { name:'checkcoin', description:'Kiểm tra số coin của bạn' }
  ];
  try{
    const r = await fetch(`https://discord.com/api/v10/applications/${DISCORD_CLIENT_ID}/guilds/${GUILD_ID}/commands`, {
      method:'PUT',
      headers:{ Authorization:`Bot ${DISCORD_BOT_TOKEN}`, 'Content-Type':'application/json' },
      body: JSON.stringify(commands)
    });
    const j = await r.json();
    return res.json(j);
  }catch(e){
    return res.status(500).json({error:String(e)});
  }
});

// discord interactions endpoint (very basic)
app.post('/api/discord', async (req,res)=>{
  try{
    const body = req.body;
    if(body.type===1) return res.json({type:1}); // PING
    if(body.type===2){ // APPLICATION_COMMAND
      const name = body.data.name;
      const discordId = body.member ? (body.member.user.id) : (body.user && body.user.id);
      if(name==='getcoin'){
        const service = body.data.options && body.data.options.length ? body.data.options[0].value : 'yeumoney';
        const subid = uuidv4().slice(0,8);
        const target = `${BASE_URL}/out/${subid}?d=${discordId}`;
        const short = await shortenWithAPI(service, target) || target;
        await runAsync(`INSERT OR REPLACE INTO shortlinks(subid,service,discordId,shortenedUrl,createdAt,completed) VALUES (?,?,?,?,?,?)`, [subid,service,discordId,short,new Date().toISOString(),0]);
        const channelId = body.channel_id;
        // public message
        await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
          method:'POST',
          headers:{ Authorization:`Bot ${DISCORD_BOT_TOKEN}`, 'Content-Type':'application/json' },
          body: JSON.stringify({ content: `Mình đã gửi link nhận coin qua DM, vui lòng check DMs nhé <@${discordId}>` })
        });
        // send DM
        const dm = await fetch(`https://discord.com/api/v10/users/@me/channels`, {
          method:'POST', headers:{ Authorization:`Bot ${DISCORD_BOT_TOKEN}`,'Content-Type':'application/json'}, body: JSON.stringify({ recipient_id: discordId })
        });
        const dmJ = await dm.json();
        if(dmJ.id){
          await fetch(`https://discord.com/api/v10/channels/${dmJ.id}/messages`, {
            method:'POST', headers:{ Authorization:`Bot ${DISCORD_BOT_TOKEN}`, 'Content-Type':'application/json' },
            body: JSON.stringify({ content: `Đây là link nhận coin của bạn (${service}): ${short}` })
          });
        }
        return res.json({ type:4, data:{ content:'Đã gửi link về DM!' } });
      }
      if(name==='checkcoin'){
        const user = await getAsync(`SELECT * FROM users WHERE discordId = ?`, [discordId]);
        const normal = user ? user.normalCoin : 0;
        const vip = user ? user.vipCoin : 0;
        const total = normal + vip;
        const weekTotal = normal; const monthTotal = normal;
        const content = `📜 Thông tin coin người dùng\n🔵Bạn còn: ${total} coin\n🟢Normal coin: ${normal} coin\n🟡Vip coin: ${vip} coin\n🔴Lưu ý: Normal coin sẽ reset vào thứ 2 hằng tuần\n🟣Tổng tuần: ${weekTotal} coin\n🟣Tổng tháng: ${monthTotal} coin`;
        return res.json({ type:4, data:{ content } });
      }
    }
    return res.status(400).json({ error:'not handled' });
  }catch(e){
    console.error(e);
    return res.status(500).json({ error:String(e) });
  }
});

// out redirect endpoint - shortener should redirect user here after they complete ad
app.get('/out/:subid', async (req,res)=>{
  try{
    const subid = req.params.subid;
    const discordId = req.query.d || null;
    const ip = req.clientIp || req.ip;
    const rec = await getAsync(`SELECT * FROM shortlinks WHERE subid = ?`, [subid]);
    if(!rec) return res.status(404).send('Not found');
    // log ip click
    await runAsync(`INSERT INTO iplogs(ip,service,subid,discordId,createdAt) VALUES (?,?,?,?,?)`, [ip, rec.service, subid, discordId, new Date().toISOString()]);
    // now auto-validate claim: check limits
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const logs = await allAsync(`SELECT * FROM iplogs WHERE ip = ? AND service = ? AND createdAt >= ?`, [ip, rec.service, todayStart.toISOString()]);
    const limits = { yeumoney:2, link4m:1, bbmkts:1 };
    if(logs.length > (limits[rec.service] - 1)){
      return res.redirect(`${BASE_URL}/claim/${subid}?status=limit`);
    }
    const usedByOther = await getAsync(`SELECT * FROM iplogs WHERE ip = ? AND subid = ? AND discordId IS NOT NULL AND discordId != ?`, [ip, subid, discordId]);
    if(usedByOther){
      return res.redirect(`${BASE_URL}/claim/${subid}?status=ip_used_by_other`);
    }
    await runAsync(`UPDATE shortlinks SET completed = 1 WHERE subid = ?`, [subid]);
    const u = await getAsync(`SELECT * FROM users WHERE discordId = ?`, [rec.discordId]);
    if(!u){
      await runAsync(`INSERT INTO users(discordId,normalCoin,vipCoin,lastReset) VALUES (?,?,?,?)`, [rec.discordId,150,0,new Date().toISOString()]);
    } else {
      await runAsync(`UPDATE users SET normalCoin = normalCoin + ? WHERE discordId = ?`, [150, rec.discordId]);
    }
    if(DISCORD_WEBHOOK_URL){
      try{
        await fetch(DISCORD_WEBHOOK_URL, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ content: `Chúc mừng <@${rec.discordId}> đã nhận được 150 coin từ ${rec.service}` }) });
      }catch(e){console.error('webhook err',e);}
    }
    return res.redirect(`${BASE_URL}/claim/${subid}?status=success`);
  }catch(e){ console.error(e); return res.status(500).send('error'); }
});

// claim page (simple)
app.get('/claim/:subid', async (req,res)=>{
  const subid = req.params.subid;
  const status = req.query.status || 'ok';
  const rec = await getAsync(`SELECT * FROM shortlinks WHERE subid = ?`, [subid]);
  if(!rec) return res.status(404).send('Not found');
  const user = await getAsync(`SELECT * FROM users WHERE discordId = ?`, [rec.discordId]);
  const normal = user ? user.normalCoin : 0;
  const vip = user ? user.vipCoin : 0;
  res.send(`<h1>Claim ${subid}</h1><p>Service: ${rec.service}</p><p>Status: ${status}</p><p>Normal: ${normal}</p><p>Vip: ${vip}</p>`);
});

// cron reset endpoint (call weekly via Vercel cron or external scheduler)
app.get('/api/cron/reset', async (req,res)=>{
  try{
    const now = new Date();
    await runAsync(`UPDATE users SET normalCoin = 0, lastReset = ?`, [now.toISOString()]);
    return res.json({ ok: true });
  }catch(e){ return res.status(500).json({ error: String(e) }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server running on', PORT));
