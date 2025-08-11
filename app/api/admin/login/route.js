import { NextResponse } from "next/server";
export async function POST(req){
  const { password } = await req.json();
  const secret = process.env.ADMIN_SECRET || "";
  if(!password || password !== secret) return NextResponse.json({ ok:false }, { status:401 });
  // set cookie (simple)
  const res = NextResponse.json({ ok:true });
  res.cookies.set("admin_auth","1",{ httpOnly:true, path:"/" });
  return res;
}