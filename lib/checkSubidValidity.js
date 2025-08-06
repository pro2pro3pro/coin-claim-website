import { db } from "../lib/firebase"; // nếu đang dùng firebase
import { getDocs, collection, doc, getDoc } from "firebase/firestore";

export async function checkSubidValidity(subid) {
  try {
    const docRef = doc(db, "claims", subid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { valid: false, message: "SubID không tồn tại hoặc chưa được tạo bởi bot." };
    }

    const data = docSnap.data();

    if (!data.completed) {
      return { valid: false, message: "Bạn chưa vượt qua link rút gọn." };
    }

    return {
      valid: true,
      type: data.service, // "yeumoney", "link4m", "bbmkts"
      discordId: data.discordId,
    };
  } catch (error) {
    console.error("Lỗi check subid:", error);
    return { valid: false, message: "Lỗi hệ thống khi kiểm tra subid." };
  }
}
