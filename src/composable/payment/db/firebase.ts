import { getIoCollection, IoCollection } from "@/util";
import {
  doc,
  DocumentSnapshot,
  getDoc,
  onSnapshot,
  setDoc,
} from "@firebase/firestore";
import { ref } from "vue";
import { PaymentDB, IoPay } from "..";

export const IopayFB: PaymentDB = {
  getIoPayByUserListen: function (uid: string) {
    const userPay = ref<IoPay | null>(null);
    const docRef = getDocRef(uid);
    onSnapshot(docRef, async (docData) => {
      userPay.value = await getPayFromDoc(docData, uid);
    });
    return userPay;
  },
  getIoPayByUser: async function (uid: string) {
    const docRef = getDocRef(uid);
    const docData = await getDoc(docRef);
    return await getPayFromDoc(docData, uid);
  },
};

function getDocRef(uid: string) {
  return doc(getIoCollection({ c: IoCollection.IO_PAY }), uid).withConverter(
    IoPay.fireConverter()
  );
}

async function getPayFromDoc(d: DocumentSnapshot<IoPay | null>, uid: string) {
  if (!d.exists() || !d.data()) {
    const docRef = getDocRef(uid);
    const pay = new IoPay({
      userId: uid,
      budget: 0,
      pendingBudget: 0,
      history: [],
    });
    await setDoc(docRef, pay);
    return pay;
  }
  return d.data()!;
}
