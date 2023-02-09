import { onFirestoreErr, onFirestoreCompletion } from "@/composable/common";
import {
  doc,
  DocumentSnapshot,
  getDoc,
  onSnapshot,
  setDoc,
} from "@firebase/firestore";
import { ref } from "vue";
import { PaymentDB, IoPay, PayHistoryCRT } from "..";
import { ioFireStore, getIoCollection, IoCollection } from "@/plugin/firebase";

export const IopayFB: PaymentDB = {
  getIoPayByUserListen: function (uid: string) {
    const userPay = ref<IoPay | null>(null);
    const docRef = getDocRef(uid);
    const name = "getIoPayByUserListen snapshot";
    const unsubscribe = onSnapshot(
      docRef,
      async (docData) => {
        userPay.value = await getPayFromDoc(docData, uid);
      },
      async (err) => {
        await onFirestoreErr(name, err);
        throw err;
      },
      () => onFirestoreCompletion(name)
    );
    return { userPay, unsubscribe };
  },
  getIoPaysListen: function () {
    const usersPay = ref<IoPay[]>([]);
    const name = "getIoPaysListen snapshot";
    const unsubscribe = onSnapshot(
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
      async (err) => {
        await onFirestoreErr(name, err);
        throw err;
      },
      () => onFirestoreCompletion(name)
    );
    return { usersPay, unsubscribe };
  },
  getIoPayByUser: async function (uid: string) {
    const docRef = getDocRef(uid);
    const docData = await getDoc(docRef);
    return await getPayFromDoc(docData, uid);
  },
  addPayHistory: async function (h: PayHistoryCRT) {
    const docRef = doc(
      getIoCollection(ioFireStore, { c: "PAY_HISTORY", uid: h.userId })
    );
    return setDoc(docRef, h);
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

const getPayCollection = () =>
  getIoCollection(ioFireStore, { c: IoCollection.IO_PAY }).withConverter(
    IoPay.fireConverter()
  );
