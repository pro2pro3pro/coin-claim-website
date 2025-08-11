import { getDb } from "../../../../lib/db.js";
import { NextResponse } from "next/server";

export async function GET(req){
  const cookie = req.headers.get("cookie") || "";
  if(!cookie.includes("admin_auth=1")) return NextResponse.json({ error:"unauth" }, { status:401 });
  const db = await getDb();
  const users = await db.all("SELECT * FROM users");
  const shortlinks = await db.all("SELECT * FROM shortlinks ORDER BY createdAt DESC LIMIT 100");
  const iplogs = await db.all("SELECT * FROM iplogs ORDER BY id DESC LIMIT 200");
  return NextResponse.json({ users, shortlinks, iplogs });
}