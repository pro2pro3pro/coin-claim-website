import { getDb } from '../../../lib/db.js';

export async function GET(req){
  const url = new URL(req.url);
  const subid = url.searchParams.get('subid');
  if(!subid) return new Response(JSON.stringify({error:'missing subid'}), { status:400 });
  const db = await getDb();
  const rec = await db.get('SELECT * FROM shortlinks WHERE subid = ?', [subid]);
  if(!rec) return new Response(JSON.stringify({error:'not found'}), { status:404 });
  const user = await db.get('SELECT * FROM users WHERE discordId = ?', [rec.discordId]);
  return new Response(JSON.stringify({ discordId: rec.discordId, service: rec.service, normalCoin: user?.normalCoin||0, vipCoin: user?.vipCoin||0 }), { status:200, headers:{ 'Content-Type':'application/json' } });
}
