"use client"
import { useEffect, useState } from "react";

export default function Page({ params, searchParams }){
  const subid = params.subid;
  const status = searchParams?.status || "ok";
  const [info, setInfo] = useState(null);

  useEffect(()=>{
    fetch(`/api/internal/claim-info?subid=${subid}`).then(r=>r.json()).then(setInfo).catch(()=>{});
  },[subid]);

  return (
    <main style={{fontFamily:"Inter, Arial, sans-serif",padding:24,maxWidth:920,margin:"0 auto"}}>
      <div style={{background:"linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",padding:20,borderRadius:12}}>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          <img src="/logo.svg" style={{width:64,height:64}} alt="logo"/>
          <div>
            <h1 style={{margin:0}}>Claim {subid}</h1>
            <div style={{color:"#9fb3c8"}}>Người yêu cầu: <strong>{info?.discordId || "—"}</strong> • Service: <strong>{info?.service || "—"}</strong></div>
          </div>
        </div>

        <div style={{marginTop:18,display:"flex",gap:18,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:220}}>
            <div style={{fontSize:40,fontWeight:800,color:"#0ea5e9"}}>{(info?.normalCoin||0) + (info?.vipCoin||0)}</div>
            <div style={{opacity:0.8}}>🔵Bạn còn (tổng)</div>
            <div style={{marginTop:12}}>{ status === "success" ? <span style={{color:"#0ea5e9",fontWeight:800}}>Bạn đã nhận 150 coin! 🎉</span> : null }</div>
          </div>
          <div style={{flex:1,minWidth:220}}>
            <div style={{padding:12,background:"rgba(255,255,255,0.01)",borderRadius:10}}>
              <div style={{fontWeight:700}}>Hành động</div>
              <div style={{marginTop:10}}><a href="/" style={{display:"inline-block",padding:"8px 12px",borderRadius:8,background:"#0ea5e9",color:"#021029",fontWeight:700,textDecoration:"none"}}>Quay về trang chủ</a></div>
            </div>
          </div>
        </div>

        <div style={{marginTop:16}}>
          <div style={{color:"#9fb3c8"}}>🔴Lưu ý: Normal coin reset vào thứ 2 hàng tuần.</div>
        </div>
      </div>
    </main>
  )
}