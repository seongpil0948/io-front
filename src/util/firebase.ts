import {
  QuerySnapshot,
  QueryDocumentSnapshot,
  WithFieldValue,
} from "@firebase/firestore";
import { commonToJson, commonFromJson } from "@io-boxies/js-lib";
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

export const fireConverter = <T>() => ({
  toFirestore: (data: WithFieldValue<T>) => commonToJson(data),
  fromFirestore: (snap: QueryDocumentSnapshot) =>
    commonFromJson(snap.data()) as T,
});

export function dataFromSnap<T>(snap: QuerySnapshot<T | null>): T[] {
  const garments: T[] = [];

  snap.docs.forEach((d) => {
    const data = d.data();
    if (data) {
      garments.push(data);
    }
  });
  return garments;
}
