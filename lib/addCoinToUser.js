import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export async function addCoinToUser(discordId, amount) {
  const userRef = doc(db, "users", discordId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      normalCoin: amount,
      vipCoin: 0,
    });
  } else {
    await updateDoc(userRef, {
      normalCoin: (userSnap.data().normalCoin || 0) + amount,
    });
  }
}
