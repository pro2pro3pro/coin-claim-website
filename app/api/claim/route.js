import { NextResponse } from "next/server";

// Tạm lưu state trong RAM để test. Khi live thì thay bằng Redis/DB.
const claims = new Map();

export async function POST(req) {
  const { subid } = await req.json();
  if (!subid || subid.length < 5) {
    return NextResponse.json({ error: "SubID không hợp lệ." }, { status: 400 });
  }

  // Lấy domain từ subid
  const domain = getDomainFromSubid(subid);

  // Xác định số lượt cho từng domain
  let maxClaims = 0;
  if (domain === "yeumoney.com") maxClaims = 2;
  else if (domain === "link4m.com" || domain === "bbmkts.com") maxClaims = 1;
  else
    return NextResponse.json(
      { error: "SubID không thuộc link hợp lệ." },
      { status: 400 }
    );

  // Xác định ngày hiện tại (theo UTC, hoặc đổi sang múi giờ bạn muốn)
  const today = new Date().toISOString().split("T")[0];

  // Tạo key lưu theo subid + ngày
  const key = `${subid}_${today}`;

  const currentClaims = claims.get(key) || 0;

  if (currentClaims >= maxClaims) {
    return NextResponse.json(
      { error: `Bạn đã hết lượt claim cho link ${domain} hôm nay.` },
      { status: 400 }
    );
  }

  // Lưu +1 lượt
  claims.set(key, currentClaims + 1);

  // Gửi webhook về Discord (nếu muốn) — bỏ comment để xài
  /*
  fetch("https://discord.com/api/webhooks/WEBHOOK_ID", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `🪙 Người dùng đã nhận coin thành công với subid: ${subid}`,
    }),
  }).catch(console.error);
  */

  return NextResponse.json({
    message: `Nhận coin thành công cho link ${domain}. (${currentClaims + 1}/${maxClaims})`,
  });
}

// Hàm tách domain từ subid
function getDomainFromSubid(subid) {
  try {
    const url = new URL(subid.startsWith("http") ? subid : "https://" + subid);
    return url.hostname.replace("www.", "");
  } catch {
    return "";
  }
}
