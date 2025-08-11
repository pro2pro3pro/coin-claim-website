"use client"
import { useState } from "react";

export default function Page(){
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  async function login(){
    setErr("");
    const r = await fetch("/api/admin/login", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ password: pw })});
    if(r.ok) window.location.href = "/admin/dashboard";
    else setErr("Mật khẩu sai hoặc lỗi server");
  }
  return (
    <main style={{padding:24,maxWidth:720,margin:"0 auto"}}>
      <div style={{background:"linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",padding:20,borderRadius:12}}>
        <h2>Đăng nhập Admin</h2>
        <input value={pw} onChange={e=>setPw(e.target.value)} placeholder="Nhập mật khẩu admin" style={{padding:10,width:"100%",marginTop:8,borderRadius:8}} />
        <div style={{marginTop:12}}>
          <button onClick={login} style={{padding:"10px 14px",background:"#0ea5e9",borderRadius:8,color:"#021029",fontWeight:700}}>Đăng nhập</button>
        </div>
        {err && <div style={{color:"#ffb4b4",marginTop:8}}>{err}</div>}
      </div>
    </main>
  )
}