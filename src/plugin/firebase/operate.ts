import {
  CollectionReference,
  QuerySnapshot,
  Query,
  DocumentData,
  getDocs,
  query,
  where,
  FieldPath,
} from "@firebase/firestore";

export async function batchInQuery<T>(
  ids: string[] | number[],
  c: CollectionReference<any> | Query<DocumentData>,
  field: string | FieldPath
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
