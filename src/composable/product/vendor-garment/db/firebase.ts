import {
  getDoc,
  getDocs,
  increment,
  limit,
  QueryConstraint,
  setDoc,
  startAfter,
  updateDoc,
} from "@firebase/firestore";
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  onFirestoreCompletion,
  onFirestoreErr,
  similarConst,
  toVendorUserGarmentCombined,
  VendorGarmentDB,
  vendorProdC,
  VendorProdSimilar,
} from "@/composable";
import { VendorGarment } from "@/composable/product/vendor-garment/model";
import { handleReadSnap, uniqueArr } from "@/util";
import {
  getIoCollection,
  dataFromSnap,
  USER_DB,
  batchInQuery,
  dateToTimeStamp,
  loadDate,
} from "@io-boxies/js-lib";
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
import { ioFire } from "@/plugin/firebase";
import { VendorProdSame, VendorUserGarment } from "../domain";

export const VendorGarmentFB: VendorGarmentDB = {
  incrementStockCnt: async function (cnt: number, vendorProdId: string) {
    await updateDoc(doc(vendorProdC, vendorProdId), {
      stockCnt: increment(cnt),
    });
  },
  batchUpdate: async function (args: VendorGarment[]) {
    // vendorProdsModify;
    const batch = writeBatch(ioFire.store);
    for (let i = 0; i < args.length; i++) {
      const prod = args[i];
      batch.update(doc(vendorProdC, prod.vendorProdId), prod.toJson());
    }
    await batch.commit();
  },
  batchCreate: async function (userId: string, args: VendorGarment[]) {
    for (let i = 0; i < args.length; i++) {
      const prod = args[i];
      const snapshot = await getCountFromServer(
        query(
          vendorProdC,
          where("vendorId", "==", userId),
          where("vendorProdName", "==", prod.vendorProdName),
          where("color", "==", prod.color),
          where("size", "==", prod.size)
        )
      );
      const cnt = snapshot.data().count;
      if (cnt > 0)
        throw new Error(
          `${prod.vendorProdName}, ${prod.color}, ${prod.size} 는 이미 존재하는 상품입니다.`
        );
      else {
        await setDoc(doc(vendorProdC, prod.vendorProdId), prod);
      }
    }
  },
  batchReadListen: function (vendorIds: any[]) {
    const items = ref<VendorGarment[]>([]);
    const wheres =
      vendorIds.length > 0 ? [where("vendorId", "in", vendorIds)] : [];
    const name = "batchReadListen snapshot";
    const unsubscribe = onSnapshot(
      query(vendorProdC, ...wheres, orderBy("createdAt", "desc")),
      (snap) =>
        handleReadSnap<VendorGarment>(snap, items.value, (x) => x.vendorProdId),
      async (err) => {
        await onFirestoreErr(name, err);
        throw err;
      },
      () => onFirestoreCompletion(name)
    );
    return { items, unsubscribe };
  },
  delete: async function (prodId) {
    const query_ = query(
      getIoCollection({ c: "SHOP_PROD" }),
      where("vendorProdId", "==", prodId)
    );
    // https://firebase.google.com/docs/firestore/query-data/aggregation-queries
    const snapshot = await getCountFromServer(query_);
    const cnt = snapshot.data().count;
    if (cnt > 0) throw new Error("소매처와 거래중인 상품입니다.");
    await deleteDoc(doc(vendorProdC, prodId));
  },
  list: async function (d): Promise<VendorGarment[]> {
    const constraints: QueryConstraint[] = [];
    if (d.vendorId) {
      constraints.push(where("vendorId", "==", d.vendorId));
    }
    const snap = await getDocs(query(vendorProdC, ...constraints));
    return dataFromSnap(snap);
  },
  listByIds: async function (vendorProdIds: string[]) {
    const prodSnaps = await batchInQuery<VendorGarment>(
      vendorProdIds,
      vendorProdC,
      "vendorProdId"
    );

    return prodSnaps.flatMap(dataFromSnap<VendorGarment>);
  },
  listByIdsWithUser: async function (vendorProdIds: string[]) {
    const prods = await this.listByIds(vendorProdIds);
    const vendors = await USER_DB.getUserByIds(
      uniqueArr(prods.map((x) => x.vendorId))
    );
    return prods
      .map((prod) => {
        const vendor = vendors.find(
          (vendor) => prod.vendorId === vendor.userInfo.userId
        );
        if (!vendor) return null;
        return Object.assign({}, prod, vendor);
      })
      .filter((x) => x) as VendorUserGarment[];
  },
  listByVendorIds: async function (vendorIds: string[]) {
    const vendors = await USER_DB.getUserByIds([...vendorIds]);
    const prodSnaps = await batchInQuery<VendorGarment>(
      [...vendorIds],
      vendorProdC,
      "vendorId"
    );
    const vendorProds = prodSnaps.flatMap(dataFromSnap<VendorGarment>);
    return vendorProds
      .map((prod) => {
        const vendor = vendors.find(
          (vendor) => prod.vendorId === vendor.userInfo.userId
        );
        if (!vendor) return null;
        return Object.assign({}, prod, vendor);
      })
      .filter((x) => x) as VendorUserGarment[];
  },
  listUserGarmentCombined: async function (d) {
    const startAt =
      dateToTimeStamp(loadDate(d.lastData?.createdAt)) ??
      dateToTimeStamp(new Date());
    const pageSize = d.pageSize ?? 20;
    const snap = await getDocs(
      query(
        vendorProdC,
        orderBy("createdAt", "desc"),
        startAfter(startAt),
        limit(pageSize)
      )
    );
    const targetProds = dataFromSnap(snap);
    const noMore = pageSize > targetProds.length;
    const result = {
      data: await toVendorUserGarmentCombined(targetProds),
      noMore,
    };
    return result;
  },
  getById: async function (vendorProdId) {
    const docSnap = await getDoc(doc(vendorProdC, vendorProdId));
    const data = docSnap.data();
    return data ?? null;
  },
  getByIdWithUser: async function (vendorProdId) {
    const docSnap = await getDoc(doc(vendorProdC, vendorProdId));
    const data = docSnap.data();
    if (!data) return null;
    const vendor = await USER_DB.getUserById(data.vendorId);
    if (!vendor) return null;
    return Object.assign({}, data, vendor);
  },
  updateSimilarProd: async function (
    d: VendorProdSimilar,
    data: { [k: string]: any }
  ) {
    const batch = writeBatch(ioFire.store);
    const prods = await this.getSimilarProds(d);
    console.log("getSimilarProds", prods);
    for (let i = 0; i < prods.length; i++) {
      batch.update(doc(vendorProdC, prods[i].vendorProdId), data);
    }
    batch.commit();
  },
  getSimilarProds: async function (d: VendorProdSimilar) {
    const q = query(vendorProdC, ...similarConst(d.vendorId, d.vendorProdName));
    const snap = await getDocs(q);
    return dataFromSnap(snap);
  },
  existSameProd: async function (d: VendorProdSame): Promise<boolean> {
    const constraints = similarConst(d.vendorId, d.vendorProdName);
    constraints.push(where("color", "==", d.color));
    constraints.push(where("size", "==", d.size));
    const snap = await getDocs(query(vendorProdC, ...constraints));
    return snap.empty === false;
  },
};
