import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
const DB_PATH = path.join(process.cwd(), 'data', 'db.sqlite');

export async function getDb() {
  await ensureDataDir();
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  await db.exec(
    CREATE TABLE IF NOT EXISTS users (discordId TEXT PRIMARY KEY, normalCoin INTEGER DEFAULT 0, vipCoin INTEGER DEFAULT 0, lastReset TEXT);
    CREATE TABLE IF NOT EXISTS shortlinks (subid TEXT PRIMARY KEY, service TEXT, discordId TEXT, shortenedUrl TEXT, createdAt TEXT, completed INTEGER DEFAULT 0);
    CREATE TABLE IF NOT EXISTS iplogs (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT, service TEXT, subid TEXT, discordId TEXT, createdAt TEXT);
  );
  return db;
}

async function ensureDataDir(){
  const fs = await import('fs');
  const dir = path.join(process.cwd(),'data');
  if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
}
