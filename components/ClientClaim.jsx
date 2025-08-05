"use client";
import { useEffect, useState } from "react";

export default function ClientClaim({ subid }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!subid || subid.length < 5) {
      setError("SubID không hợp lệ.");
    }
  }, [subid]);

  const handleClaim = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subid }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        // Mở quảng cáo khi nhận thành công
        window.open("https://your-ad-url.com", "_blank");
      } else {
        setError(data.error || "Đã có lỗi xảy ra.");
      }
    } catch (e) {
      setError("Không thể kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      {!error && !success && (
        <button
          onClick={handleClaim}
          disabled={loading}
          className="bg-yellow-500 text-black px-6 py-3 rounded-md font-bold hover:bg-yellow-600 transition"
        >
          {loading ? "Đang xử lý..." : "Nhận Coin"}
        </button>
      )}
    </>
  );
}
