// app/layout.jsx
export const metadata = {
  title: 'Coin Claim Website',
  description: 'Nhận coin miễn phí',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        {children}
      </body>
    </html>
  );
}
