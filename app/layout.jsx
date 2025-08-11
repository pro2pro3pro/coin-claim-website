export const metadata = {
  title: 'Coin Claim Website',
  description: 'Nhận coin miễn phí qua Discord bot',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#f0f2f5' }}>
        {children}
      </body>
    </html>
  );
}
