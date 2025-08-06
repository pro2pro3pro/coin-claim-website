import { cookies } from "next/headers";
import ClientClaim from "../../../components/ClientClaim";
import { checkSubidValidity, checkIpLimit } from "../../../lib/checkClaim";

export default async function ClaimPage({ params }) {
  const { subid } = params;
  const cookieStore = cookies();
  const ip = cookieStore.get("ip")?.value || "unknown";

  // 👉 Kiểm tra subid có hợp lệ và đã vượt link chưa
  const subidResult = await checkSubidValidity(subid);
  if (!subidResult.valid) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center text-white bg-black">
        <h1 className="text-4xl font-bold mb-4">🎁 Nhận Coin Free</h1>
        <p className="text-red-500 text-lg">{subidResult.message}</p>
      </main>
    );
  }

  // 👉 Kiểm tra IP đã nhận vượt giới hạn chưa
  const ipCheck = await checkIpLimit(subidResult.type, ip, subid);
  if (!ipCheck.valid) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center text-white bg-black">
        <h1 className="text-4xl font-bold mb-4">🎁 Nhận Coin Free</h1>
        <p className="text-red-500 text-lg">{ipCheck.message}</p>
      </main>
    );
  }

  // 👉 Nếu mọi thứ hợp lệ, render nút nhận coin
  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-white bg-black">
      <h1 className="text-4xl font-bold mb-4">🎁 Nhận Coin Free</h1>
      <ClientClaim subid={subid} />
    </main>
  );
}
