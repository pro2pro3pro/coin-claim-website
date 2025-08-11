import { getDb } from "../../../../lib/db.js";
import { NextResponse } from "next/server";
export async function POST(req){
  const cookie = req.headers.get("cookie") || "";
  if(!cookie.includes("admin_auth=1")) return NextResponse.json({ error:"unauth" }, { status:401 });
  const db = await getDb();
  const now = new Date().toISOString();
  await db.run("UPDATE users SET normalCoin = 0, lastReset = ?", [now]);
  await db.run("INSERT INTO admin_logs(action,actor,target,amount,createdAt) VALUES (?,?,?,?,?)", ["reset_all","admin","all",0,new Date().toISOString()]);
  return NextResponse.json({ ok:true });
}