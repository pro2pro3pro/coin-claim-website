export default function Page(){
  return (
    <main style={{padding:24,maxWidth:960,margin:"0 auto",color:"#e6f4ff"}}>
      <header style={{display:"flex",alignItems:"center",gap:14}}>
        <img src="/logo.svg" alt="logo" style={{width:64,height:64}}/>
        <div>
          <h1 style={{margin:0}}>coin-claim-website</h1>
          <p style={{margin:0,color:"#9fb3c8"}}>Nhận coin miễn phí - dùng lệnh <code>/getcoin</code> trên Discord để lấy link, click link để nhận coin tự động.</p>
        </div>
      </header>
      <section style={{marginTop:24,background:"linear-gradient(180deg, rgba(14,165,233,0.04), rgba(6,182,212,0.02))",padding:16,borderRadius:12}}>
        <h3 style={{marginTop:0}}>Hướng dẫn nhanh</h3>
        <ol>
          <li>Set các biến môi trường trên Vercel theo <code>.env.example</code>.</li>
          <li>Deploy project lên Vercel.</li>
          <li>Vào <code>/admin</code> và đăng nhập bằng ADMIN_SECRET, bấm "Đăng ký lệnh".</li>
        </ol>
      </section>
    </main>
  )
}