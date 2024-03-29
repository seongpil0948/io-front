// TODO: Require Refactoring
import { ioFireStore } from "@/plugin/firebase";
import { fireConverter } from "@/util/firebase";
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  collection,
  where,
} from "@firebase/firestore";
import { IoOrder } from "../order";

export interface IoPartner {
  shopId: string;
  vendorId: string;
  credit: number;
  orders: IoOrder[];
}

export async function savePartner(data: IoPartner) {
  const ref = getPartnerDoc(data);
  await setDoc(ref, data, { merge: true });
}
export async function loadPartner(d: {
  shopId: string;
  vendorId: string;
}): Promise<IoPartner> {
  const ref = getPartnerDoc(d);
  const docSnap = await getDoc(ref);
  if (docSnap.exists()) {
    // Convert to City object
    const data = docSnap.data();
    return data;
  } else {
    const data: IoPartner = Object.assign({ credit: 0, orders: [] }, d);
    await setDoc(ref, data);
    return data;
  }
}
export async function loadPartnerVendors(shopId: string): Promise<IoPartner[]> {
  const docSnap = await getDocs(
    query(getPartnerCollection(), where("shopId", "==", shopId))
  );
  return docSnap.docs.map((x) => x.data());
}

const getDocId = (d: { shopId: string; vendorId: string }) =>
  d.shopId.concat(d.vendorId).split("").sort().join("");

const partnerConverter = fireConverter<IoPartner>();
const partnerPath = "partner";

export const getPartnerDoc = (d: { shopId: string; vendorId: string }) =>
  doc(getPartnerCollection(), getDocId(d)).withConverter(partnerConverter);

const getPartnerCollection = () =>
  collection(ioFireStore, partnerPath).withConverter(partnerConverter);
