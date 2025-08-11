export default function HomePage() {
  return (
    <main style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh'
    }}>
      <img src="/logo.png" alt="Coin Logo" style={{ width: '120px', marginBottom: '20px' }} />
      <h1>Coin Claim Website</h1>
      <p>Kết nối Discord để bắt đầu nhận coin.</p>
    </main>
  );
}
