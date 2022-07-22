import { IoCollection } from "@/types";
import {
  CollectionReference,
  doc,
  getDocs,
  query,
  QuerySnapshot,
  setDoc,
  Timestamp,
  where,
  collection,
  type FirestoreDataConverter,
  collectionGroup,
  getDoc,
} from "firebase/firestore";
import { iostore } from ".";
interface getCollectParam {
  c: IoCollection;
  uid?: string;
  shopProdId?: string;
  vendorProdId?: string;
  orderId?: string;
}
export function getIoCollection(p: getCollectParam): CollectionReference {
  let str: string;
  switch (p.c) {
    case IoCollection.USER:
      str = "user";
      break;
    case IoCollection.MAPPER:
      str = `mapper`;
      break;
    case IoCollection.VENDOR_PROD:
      str = "vendorProduct";
      break;
    case IoCollection.SHOP_PROD:
      str = "shopProduct";
      break;
    case IoCollection.IO_PAY:
      str = "ioPay";
      break;
    case IoCollection.SHOP_REQ_ORDER:
      str = `user/${p.uid}/shopReqOrder`; // /${p.shopProdId}
      break;
    case IoCollection.SHOP_REQ_ORDER_NUMBER:
      str = `user/${p.uid}/orderNumber`; // orderId
      break;
    case IoCollection.USER_LOG:
      str = `user/${p.uid}/logs`; // orderId
      break;
    case IoCollection.TOKENS:
      str = `user/${p.uid}/tokens`; // orderId
      break;
    default:
      throw Error(`IoCollection Enum Member ${p.c.toString()} is not Exist`);
  }
  return collection(iostore, str);
}
export function getIoCollectionGroup(c: IoCollection) {
  let str: string;
  switch (c) {
    case IoCollection.SHOP_REQ_ORDER:
      str = `shopReqOrder`;
      break;
    default:
      throw Error(`IoCollection Enum Member ${c.toString()} is not Exist`);
  }
  return collectionGroup(iostore, str);
}

export function dateToTimeStamp(d: Date | undefined): Timestamp {
  if (!d) {
    d = new Date();
  } else if (!(d instanceof Date)) {
    d = new Date(d);
  }
  return Timestamp.fromDate(d);
}
export function loadDate(d: Date | { [x: string]: number } | string): Date {
  if (!d) return new Date();
  else if (d instanceof Date) return d;
  else if (typeof d === "string") return new Date(d);
  else if (d.seconds) return new Date(d.seconds * 1000);
  else throw Error("Fail to load Date");
}
export async function insertById<T>(
  data: T,
  c: CollectionReference,
  id: string,
  update: boolean,
  converter: FirestoreDataConverter<T | null>
) {
  const document = doc(c, id).withConverter(converter);
  if (!update) {
    const d = await getDoc(document);
    if (!d.exists()) {
      await setDoc(document, data, {
        merge: false,
      });
    }
  }
  await setDoc(document, data, {
    merge: update,
  });
}

export async function batchInQuery<T>(
  ids: string[] | number[],
  c: CollectionReference<any>,
  field: string
) {
  if (!ids || !ids.length) return [];

  const batches: Promise<QuerySnapshot<T>>[] = [];
  while (ids.length) {
    const batch = ids.splice(0, 10); // batch size 10
    // add the batch request to to a queue
    batches.push(getDocs(query(c, where(field, "in", [...batch]))));
  }
  return Promise.all(batches);
}
