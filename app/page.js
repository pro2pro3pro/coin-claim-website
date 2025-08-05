export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-white bg-black">
      <h1 className="text-4xl font-bold mb-4">👋 Chào mừng đến trang nhận Coin!</h1>
      <p className="text-lg text-gray-400 text-center max-w-xl">
        Để nhận coin, hãy sử dụng link mà bot Discord đã gửi cho bạn: <code>/claim/[subid]</code>.
      </p>
    </main>
  );
}
