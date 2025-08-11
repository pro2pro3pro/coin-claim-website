export const metadata = {
  title: "coin-claim-website",
  description: "Nhận coin miễn phí"
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head />
      <body style={{ margin:0, fontFamily:"Inter, Arial, sans-serif", background:"#010217" }}>
        {children}
      </body>
    </html>
  );
}