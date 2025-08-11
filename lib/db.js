import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(),"data","db.sqlite");

export async function getDb(){
  const dir = path.dirname(DB_PATH);
  if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (discordId TEXT PRIMARY KEY, normalCoin INTEGER DEFAULT 0, vipCoin INTEGER DEFAULT 0, lastReset TEXT);
    CREATE TABLE IF NOT EXISTS shortlinks (subid TEXT PRIMARY KEY, service TEXT, discordId TEXT, shortenedUrl TEXT, createdAt TEXT, completed INTEGER DEFAULT 0);
    CREATE TABLE IF NOT EXISTS iplogs (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT, service TEXT, subid TEXT, discordId TEXT, createdAt TEXT);
    CREATE TABLE IF NOT EXISTS admin_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, actor TEXT, target TEXT, amount INTEGER, createdAt TEXT);
  `);
  return db;
}