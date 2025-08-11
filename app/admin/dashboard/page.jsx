"use client"
import { useEffect, useState } from "react";

export default function Page(){
  const [data,setData] = useState({users:[], iplogs:[], shortlinks:[]});
  useEffect(()=>{ fetch("/api/admin/stats").then(r=>r.json()).then(setData).catch(()=>{}); },[]);
  async function adjust(id, delta){
    const amt = parseInt(prompt("Nhập số coin (dương cộng, âm trừ):", "150"));
    if(isNaN(amt)) return alert("Số không hợp lệ");
    const res = await fetch("/api/admin/adjust", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ discordId:id, amount: amt })});
    if(res.ok) alert("Đã thay đổi"); else alert("Lỗi");
    const d = await (await fetch("/api/admin/stats")).json(); setData(d);
  }
  return (
    <main style={{padding:24}}>
      <h2>Admin Dashboard</h2>
      <section style={{marginTop:12}}>
        <h3>Users</h3>
        <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr><th>ID</th><th>Normal</th><th>Vip</th><th>Hành động</th></tr></thead><tbody>
          {data.users.map(u=> <tr key={u.discordId}><td>{u.discordId}</td><td>{u.normalCoin}</td><td>{u.vipCoin}</td><td><button onClick={()=>adjust(u.discordId,150)}>Chỉnh coin</button></td></tr>)}
        </tbody></table>
      </section>
      <section style={{marginTop:12}}>
        <h3>Shortlinks (mới)</h3>
        <ul>{data.shortlinks.map(s=> <li key={s.subid}>{s.subid} • {s.service} • {s.discordId} • {s.completed? "done":"pending"}</li>)}</ul>
      </section>
      <section style={{marginTop:12}}>
        <h3>IP Logs</h3>
        <ul style={{maxHeight:200,overflow:"auto"}}>{data.iplogs.map(i=> <li key={i.id}>{i.createdAt} • {i.ip} • {i.service} • {i.subid} • {i.discordId}</li>)}</ul>
      </section>
      <div style={{marginTop:12}}>
        <button onClick={async ()=>{ if(!confirm("Reset tất cả normal coin?")) return; await fetch("/api/admin/reset", { method:"POST" }); alert("Đã reset"); const d=await (await fetch("/api/admin/stats")).json(); setData(d); }}>Reset normal coin</button>
        <button style={{marginLeft:8}} onClick={async ()=>{ const r = await fetch("/api/admin/register", { method:"POST" }); const j = await r.json(); alert(JSON.stringify(j)); }}>Đăng ký lệnh</button>
      </div>
    </main>
  )
}