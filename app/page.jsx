export default function Home(){
  return (
    <main style={{fontFamily:'Inter, Arial, sans-serif', padding:24, maxWidth:900, margin:'0 auto'}}>
      <header style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:56,height:56,background:'#0ea5e9',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700}}>CC</div>
        <h1 style={{margin:0}}>Coin Claim Website</h1>
      </header>
      <p style={{color:'#334155'}}>Website chạy bằng Vercel Serverless. Dùng <strong>/getcoin</strong> trong Discord để nhận link, click link và nhận coin tự động.</p>
      <section style={{marginTop:20, padding:16, borderRadius:8, background:'#eef2ff'}}>
        <h3 style={{marginTop:0}}>Hướng dẫn nhanh</h3>
        <ol>
          <li>Set environment variables trên Vercel từ <code>.env.example</code>.</li>
          <li>Deploy, sau đó chạy script đăng ký lệnh hoặc gọi endpoint register.</li>
          <li>Trên Discord gõ <code>/getcoin</code>, bot sẽ gửi DM link rút gọn.</li>
        </ol>
      </section>
    </main>
  )
}
