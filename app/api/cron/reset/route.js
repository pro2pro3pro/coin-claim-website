import { getDb } from '../../../../lib/db.js';
import { NextResponse } from 'next/server';
export async function GET(){
  const db = await getDb();
  const now = new Date().toISOString();
  await db.run('UPDATE users SET normalCoin = 0, lastReset = ?', [now]);
  return NextResponse.json({ ok:true });
}
