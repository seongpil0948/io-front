import { QuerySnapshot } from "@firebase/firestore";

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
