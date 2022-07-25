import { payConverter, IoPay } from "@/composables";
import { IoCollection } from "@/types";
import { doc, onSnapshot, setDoc } from "@firebase/firestore";
import { getIoCollection } from "./common";
import { ref } from "vue";

export function getIoPayByUser(uid: string) {
  const userPay = ref<IoPay | null>(null);
  const docRef = doc(
    getIoCollection({ c: IoCollection.IO_PAY }),
    uid
  ).withConverter(payConverter);
  const unsubscribe = onSnapshot(docRef, (doc) => {
    if (!doc.exists()) {
      const pay = new IoPay({
        userId: uid,
        budget: 100,
        pendingBudget: 10,
        history: [],
      });
      setDoc(docRef, pay);
      userPay.value = pay;
    } else if (doc.data()) {
      userPay.value = doc.data();
    }
  });
  return { userPay, unsubscribe };
}
