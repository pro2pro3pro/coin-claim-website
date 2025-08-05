export default async function ClaimPage({ params }) {
  const { subid } = params; // lấy subid từ URL

  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-white bg-black">
      <h1 className="text-4xl font-bold mb-4">🎁 Nhận Coin Free</h1>
      <ClientClaim subid={subid} />
    </main>
  );
}

import ClientClaim from "../../../components/ClientClaim";
