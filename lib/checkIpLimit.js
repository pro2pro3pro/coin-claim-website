import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getTodayDate } from "./timeUtil"; // helper tự viết

export async function checkIpLimit(service, ip, subid) {
  try {
    const today = getTodayDate();

    // Query IP đã dùng hôm nay với dịch vụ này
    const q = query(
      collection(db, "claims"),
      where("ip", "==", ip),
      where("service", "==", service),
      where("date", "==", today)
    );
    const snapshot = await getDocs(q);

    // Đếm lượt dùng IP với dịch vụ này hôm nay
    const count = snapshot.size;

    // Logic hạn chế theo từng dịch vụ
    const limits = {
      yeumoney: 2,
      link4m: 1,
      bbmkts: 1,
    };

    // Check trùng subid (không cho dùng lại)
    let usedSameSubid = false;
    snapshot.forEach((doc) => {
      if (doc.id === subid) usedSameSubid = true;
    });

    if (usedSameSubid) {
      return { valid: false, message: "SubID này đã được dùng bởi IP của bạn." };
    }

    if (count >= limits[service]) {
      return { valid: false, message: `IP của bạn đã nhận đủ lượt từ ${service} hôm nay.` };
    }

    return { valid: true };
  } catch (err) {
    console.error("Lỗi check IP:", err);
    return { valid: false, message: "Lỗi khi kiểm tra IP." };
  }
}
