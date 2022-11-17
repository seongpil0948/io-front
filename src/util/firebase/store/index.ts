import { iostore } from "@io-boxies/js-lib";
import {
  CollectionReference,
  collection,
  collectionGroup,
  FirestoreDataConverter,
  doc,
  getDoc,
  setDoc,
  QuerySnapshot,
  getDocs,
  query,
  where,
} from "@firebase/firestore";
import { getCollectParam, IoCollection } from "./domain";
export * from "./domain";

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
    case IoCollection.PICKUP_LOCATES:
      str = "pickupLocates";
      break;
    case IoCollection.ORDER_PROD:
      str = `user/${p.uid}/orderProd`; // /${p.shopProdId}
      break;
    case IoCollection.ORDER_PROD_NUMBER:
      str = `user/${p.uid}/orderNumber`; // orderId
      break;
    case IoCollection.SHIPMENT:
      str = `user/${p.uid}/shipment`; // orderId
      break;
    case IoCollection.USER_LOG:
      str = `user/${p.uid}/logs`; // orderId
      break;
    case IoCollection.TOKENS:
      str = `user/${p.uid}/tokens`; // orderId
      break;
    case IoCollection.CS_POST:
      str = `csPost`;
      break;
    default:
      throw Error(`IoCollection Enum Member ${p.c.toString()} is not Exist`);
  }
  return collection(iostore, str);
}
export function getIoCollectionGroup(c: IoCollection) {
  let str: string;
  switch (c) {
    case IoCollection.ORDER_PROD:
      str = `orderProd`;
      break;
    default:
      throw Error(`IoCollection Enum Member ${c.toString()} is not Exist`);
  }
  return collectionGroup(iostore, str);
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
    // caution will removed of ids elements
    const batch = ids.splice(0, 10); // batch size 10
    // add the batch request to to a queue
    batches.push(getDocs(query(c, where(field, "in", [...batch]))));
  }
  return Promise.all(batches);
}

export function dataFromSnap<T>(snap: QuerySnapshot<T | null>): T[] {
  const result: T[] = [];

  snap.docs.forEach((d) => {
    const data = d.data();
    if (data) {
      result.push(data);
    }
  });
  return result;
}
