// file: utils/checkIpLimit.js
import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getTodayDate } from "./timeUtil"; // helper tự viết, return yyyy-mm-dd

export async function checkIpLimit(service, ip, subid) {
  try {
    const today = getTodayDate();

    const q = query(
      collection(db, "claims"),
      where("ip", "==", ip),
      where("service", "==", service),
      where("date", "==", today)
    );

    const snapshot = await getDocs(q);

    const documents = snapshot.docs;

    // Kiểm tra IP này đã dùng subid này chưa
    const usedSameSubid = documents.some(doc => doc.data().subid === subid);

    if (usedSameSubid) {
      return { valid: false, message: "SubID này đã được dùng bởi IP của bạn." };
    }

    // Đếm tổng số lần đã nhận từ service này hôm nay
    const limits = {
      yeumoney: 2,
      link4m: 1,
      bbmkts: 1,
    };

    if (documents.length >= limits[service]) {
      return { valid: false, message: `IP của bạn đã nhận đủ lượt từ ${service} hôm nay.` };
    }

    return { valid: true };
  } catch (err) {
    console.error("Lỗi check IP:", err);
    return { valid: false, message: "Lỗi khi kiểm tra IP." };
  }
}
