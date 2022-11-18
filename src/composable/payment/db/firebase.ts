import { onFirestoreErr, onFirestoreCompletion } from "@/composable/common";
import {
  doc,
  DocumentSnapshot,
  getDoc,
  onSnapshot,
  setDoc,
} from "@firebase/firestore";
import { getIoCollection, IoCollection } from "@io-boxies/js-lib";
import { ref } from "vue";
import { PaymentDB, IoPay } from "..";

export const IopayFB: PaymentDB = {
  getIoPayByUserListen: function (uid: string) {
    const userPay = ref<IoPay | null>(null);
    const docRef = getDocRef(uid);
    const name = "getIoPayByUserListen snapshot";
    onSnapshot(
      docRef,
      async (docData) => {
        userPay.value = await getPayFromDoc(docData, uid);
      },
      async (err) => await onFirestoreErr(name, err),
      () => onFirestoreCompletion(name)
    );
    return userPay;
  },
  getIoPaysListen: function () {
    const usersPay = ref<IoPay[]>([]);
    const name = "getIoPaysListen snapshot";
    onSnapshot(
      getPayCollection(),
      async (snapshot) => {
        usersPay.value = [];
        snapshot.forEach((s) => {
          const data = s.data();
          if (data) {
            usersPay.value.push(data);
          }
        });
      },
      async (err) => await onFirestoreErr(name, err),
      () => onFirestoreCompletion(name)
    );
    return usersPay;
  },
  getIoPayByUser: async function (uid: string) {
    const docRef = getDocRef(uid);
    const docData = await getDoc(docRef);
    return await getPayFromDoc(docData, uid);
  },
};

function getDocRef(uid: string) {
  return doc(getPayCollection(), uid);
}

async function getPayFromDoc(d: DocumentSnapshot<IoPay | null>, uid: string) {
  if (!d.exists() || !d.data()) {
    const docRef = getDocRef(uid);
    const pay = IoPay.initial(uid);
    await setDoc(docRef, pay);
    return pay;
  }
  return d.data()!;
}

function getPayCollection() {
  return getIoCollection({ c: IoCollection.IO_PAY }).withConverter(
    IoPay.fireConverter()
  );
}
