import { getDb } from "../../../../lib/db.js";
import { NextResponse } from "next/server";

export async function POST(req){
  const cookie = req.headers.get("cookie") || "";
  if(!cookie.includes("admin_auth=1")) return NextResponse.json({ error:"unauth" }, { status:401 });
  const { discordId, amount } = await req.json();
  if(!discordId) return NextResponse.json({ error:"missing" }, { status:400 });
  const db = await getDb();
  const user = await db.get("SELECT * FROM users WHERE discordId = ?", [discordId]);
  if(!user){
    await db.run("INSERT INTO users(discordId,normalCoin,vipCoin,lastReset) VALUES (?,?,?,?)", [discordId, amount, 0, new Date().toISOString()]);
  } else {
    await db.run("UPDATE users SET normalCoin = normalCoin + ? WHERE discordId = ?", [amount, discordId]);
  }
  await db.run("INSERT INTO admin_logs(action,actor,target,amount,createdAt) VALUES (?,?,?,?,?)", ["adjust","admin",discordId,amount,new Date().toISOString()]);
  return NextResponse.json({ ok:true });
}