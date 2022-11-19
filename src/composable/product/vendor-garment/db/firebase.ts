/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  onFirestoreCompletion,
  onFirestoreErr,
  VendorGarment,
  VendorGarmentDB,
} from "@/composable";
import { handleReadSnap } from "@/util";
import { getIoStore, getIoCollection, IoCollection } from "@io-boxies/js-lib";
import {
  writeBatch,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
  deleteDoc,
  getCountFromServer,
} from "@firebase/firestore";
import { ref } from "vue";

export const VendorGarmentFB: VendorGarmentDB = {
  batchUpdate: async function (args: VendorGarment[]) {
    // vendorProdsModify
    const c = getIoCollection({ c: IoCollection.VENDOR_PROD }).withConverter(
      VendorGarment.fireConverter()
    );
    const batch = writeBatch(getIoStore());
    for (let i = 0; i < args.length; i++) {
      const prod = args[i];
      batch.update(doc(c, prod.vendorProdId), prod.toJson());
    }
    await batch.commit();
  },
  batchCreate: async function (args: VendorGarment[]) {
    // vendorProdsModify
    const c = getIoCollection({ c: IoCollection.VENDOR_PROD }).withConverter(
      VendorGarment.fireConverter()
    );
    const batch = writeBatch(getIoStore());
    for (let i = 0; i < args.length; i++) {
      const prod = args[i];
      batch.set(doc(c, prod.vendorProdId), prod);
    }
    await batch.commit();
  },
  batchReadListen: function (vendorIds: any[]) {
    const items = ref<VendorGarment[]>([]);
    const c = getIoCollection({ c: IoCollection.VENDOR_PROD }).withConverter(
      VendorGarment.fireConverter()
    );
    const wheres =
      vendorIds.length > 0 ? [where("vendorId", "in", vendorIds)] : [];
    const name = "batchReadListen snapshot";
    const unsubscribe = onSnapshot(
      query(c, ...wheres, orderBy("createdAt", "desc")),
      (snap) =>
        handleReadSnap<VendorGarment>(snap, items.value, (x) => x.vendorProdId),
      async (err) => await onFirestoreErr(name, err),
      () => onFirestoreCompletion(name)
    );
    return { items, unsubscribe };
  },
  delete: async function (prodId) {
    const c = getIoCollection({ c: IoCollection.VENDOR_PROD }).withConverter(
      VendorGarment.fireConverter()
    );
    const query_ = query(
      getIoCollection({ c: "SHOP_PROD" }),
      where("vendorProdId", "==", prodId)
    );
    // https://firebase.google.com/docs/firestore/query-data/aggregation-queries
    const snapshot = await getCountFromServer(query_);
    const cnt = snapshot.data().count;
    if (cnt > 0) throw new Error("소매처와 거래중인 상품입니다.");
    await deleteDoc(doc(c, prodId));
  },
};
