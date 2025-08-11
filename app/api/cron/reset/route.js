import { getDb } from "../../../../lib/db.js";

export async function GET(){
  const db = await getDb();
  const now = new Date().toISOString();
  await db.run("UPDATE users SET normalCoin = 0, lastReset = ?", [now]);
  return new Response(JSON.stringify({ ok:true }), { status:200, headers:{ "Content-Type":"application/json" }});
}