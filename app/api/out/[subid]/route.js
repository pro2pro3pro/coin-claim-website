import { getDb } from "../../../../lib/db.js";
import { NextResponse } from "next/server";

export async function GET(req, { params }){
  const subid = params.subid;
  const u = new URL(req.url);
  const discordId = u.searchParams.get("d") || null;
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const db = await getDb();
  const rec = await db.get("SELECT * FROM shortlinks WHERE subid = ?", [subid]);
  if(!rec) return NextResponse.json({ error:"not found" }, { status:404 });

  await db.run("INSERT INTO iplogs(ip,service,subid,discordId,createdAt) VALUES (?,?,?,?,?)", [ip, rec.service, subid, discordId, new Date().toISOString()]);

  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const logs = await db.all("SELECT * FROM iplogs WHERE ip = ? AND service = ? AND createdAt >= ?", [ip, rec.service, todayStart.toISOString()]);
  const limits = { yeumoney:2, link4m:1, bbmkts:1 };

  if(logs.length > (limits[rec.service] - 1)){
    return NextResponse.redirect(`${process.env.BASE_URL}/claim/${subid}?status=limit`);
  }

  const usedByOther = await db.get("SELECT * FROM iplogs WHERE ip = ? AND subid = ? AND discordId IS NOT NULL AND discordId != ?", [ip, subid, discordId]);
  if(usedByOther){
    return NextResponse.redirect(`${process.env.BASE_URL}/claim/${subid}?status=ip_used_by_other`);
  }

  await db.run("UPDATE shortlinks SET completed = 1 WHERE subid = ?", [subid]);
  const owner = rec.discordId;
  const user = await db.get("SELECT * FROM users WHERE discordId = ?", [owner]);
  if(!user){
    await db.run("INSERT INTO users(discordId,normalCoin,vipCoin,lastReset) VALUES (?,?,?,?)", [owner,150,0,new Date().toISOString()]);
  } else {
    await db.run("UPDATE users SET normalCoin = normalCoin + ? WHERE discordId = ?", [150, owner]);
  }

  if(process.env.DISCORD_WEBHOOK_URL){
    try{ await fetch(process.env.DISCORD_WEBHOOK_URL, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ content: `Chúc mừng <@${owner}> đã nhận 150 coin từ ${rec.service}` }) }); }catch(e){}
  }

  return NextResponse.redirect(`${process.env.BASE_URL}/claim/${subid}?status=success`);
}