import {
  QuerySnapshot,
  QueryDocumentSnapshot,
  WithFieldValue,
  Timestamp,
} from "@firebase/firestore";
import { commonToJson, loadDate } from "@io-boxies/js-lib";

export function handleReadSnap<T>(
  snap: QuerySnapshot<T | null>,
  arr: T[],
  getData: (data: T) => string
) {
  snap.docChanges().forEach((c) => {
    const target = c.doc.data();
    if (target) {
      if (c.type === "added") {
        arr.unshift(target);
      }
      if (c.type === "modified") {
        const idx = arr.findIndex((data) => getData(target) === getData(data));
        console.assert(idx !== -1);
        arr[idx] = target;
      }
      if (c.type === "removed") {
        const idx = arr.findIndex((data) => getData(target) === getData(data));
        console.assert(idx !== -1);
        arr.splice(idx, 1);
      }
    }
  });
  return arr;
}

function commonFromJson(data: { [k: string]: any }) {
  Object.keys(data).forEach((k) => {
    if (data[k] instanceof Timestamp) {
      data[k] = loadDate(data[k]);
    }
  });
  return data;
}

export const fireConverter = <T>() => ({
  toFirestore: (data: WithFieldValue<T>) => commonToJson(data),
  fromFirestore: (snap: QueryDocumentSnapshot) =>
    commonFromJson(snap.data()) as T,
});
