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
        // FIXME: 운영계에선 이거 실제론 회원가입할때 0원초기화, 이후 무조건 있어야함 여기서 다루면 안됌
        setDoc(docRef, pay);
        userPay.value = pay;
      } else if (doc.data()) {
        userPay.value = doc.data();
      }
    });
    return userPay;
  },
  getIoPayByUser: async function (uid: string) {
    const docRef = doc(
      getIoCollection({ c: IoCollection.IO_PAY }),
      uid
    ).withConverter(IoPay.fireConverter());
    const docData = await getDoc(docRef);
    return ioPayFromDoc(docData);
  },
};
function ioPayFromDoc(doc: DocumentSnapshot<IoPay | null>) {
  if (!doc.exists()) {
    // const pay = new IoPay({
    //   userId: uid,
    //   budget: 100,
    //   pendingBudget: 10,
    //   history: [],
    // });
    // setDoc(docRef, pay);
    // userPay = pay;
    throw new Error("유저 결제 정보가 존재하지 않습니다.");
  }
  return doc.data() as IoPay;
}
