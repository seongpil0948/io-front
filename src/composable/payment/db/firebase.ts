import { getIoCollection, IoCollection } from "@/util";
import { doc, onSnapshot, setDoc } from "@firebase/firestore";
import { ref } from "vue";
import { PaymentDB, IoPay } from "..";

export const IopayFB: PaymentDB = {
  getIoPayByUser: function (uid: string) {
    const userPay = ref<IoPay | null>(null);
    const docRef = doc(
      getIoCollection({ c: IoCollection.IO_PAY }),
      uid
    ).withConverter(IoPay.fireConverter());
    onSnapshot(docRef, (doc) => {
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
    return userPay;
  },
};
