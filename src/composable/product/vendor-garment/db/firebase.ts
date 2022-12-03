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
  PaginateParam,
  StockCntObj,
  VendorGarmentDB,
  VendorProdSimilar,
} from "@/composable";
import { VendorGarment } from "@/composable/product/vendor-garment/model";
import { handleReadSnap, uniqueArr } from "@/util";
import {
  IoFireApp,
  getIoCollection,
  IoCollection,
  dataFromSnap,
  USER_DB,
  batchInQuery,
  dateToJson,
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
import {
  VendorProdSame,
  VendorUserGarment,
  VendorUserGarmentCombined,
} from "../domain";
import { subDays } from "date-fns";

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
  listByVendorIds: async function (vendorIds: string[]) {
    const vendors = await USER_DB.getUserByIds(vendorIds);
    const prodSnaps = await batchInQuery<VendorGarment>(
      vendorIds,
      vendorProdC,
      "vendorId"
    );
    return prodSnaps
      .flatMap(dataFromSnap<VendorGarment>)
      .map((prod) => {
        const vendor = vendors.find(
          (vendor) => prod.vendorId === vendor.userInfo.userId
        );
        if (!vendor) return null;
        return Object.assign({}, prod, vendor);
      })
      .filter((x) => x) as VendorUserGarment[];
  },
  listUserGarmentCombined: async function (
    d
  ): Promise<VendorUserGarmentCombined[]> {
    const startAt =
      d.lastData?.createdAt ?? dateToJson(subDays(new Date(), 30));
    console.log("startAt: ", startAt, typeof startAt);
    const snap = await getDocs(
      query(
        vendorProdC,
        orderBy("createdAt", "asc"),
        startAfter(startAt),
        limit(d.pageSize ?? 20)
      )
    );
    const targetProds = dataFromSnap(snap);
    const vendors = await USER_DB.getUserByIds(
      uniqueArr(targetProds.map((x) => x.vendorId))
    );
    const pkgIds = targetProds.map((y) => y.vendorProdPkgId);
    const pkgSnaps = await batchInQuery<VendorGarment>(
      pkgIds,
      vendorProdC,
      "vendorProdPkgId"
    );
    const vendorProds = pkgSnaps.flatMap(dataFromSnap<VendorGarment>);
    const obj = vendorProds.reduce<{
      [userAndProdName: string]: VendorUserGarmentCombined;
    }>((acc, curr) => {
      const user = vendors.find((x) => x.userInfo.userId === curr.vendorId);
      if (!user) return acc;
      const userProd = Object.assign({}, curr, user);
      const similarId = VendorGarment.similarId(userProd);
      if (!acc[similarId]) {
        acc[similarId] = Object.assign({}, userProd, {
          allStockCnt: 0,
          colors: [],
          sizes: [],
          stockCnt: {} as StockCntObj,
        }) as VendorUserGarmentCombined;
      }
      if (!acc[similarId].stockCnt[userProd.size]) {
        acc[similarId].stockCnt[userProd.size] = {};
      }
      acc[similarId].stockCnt[userProd.size][userProd.color] = {
        stockCnt: userProd.stockCnt,
        prodId: userProd.vendorProdId,
      };
      if (!acc[similarId].sizes.includes(userProd.size)) {
        acc[similarId].sizes.push(userProd.size);
      }
      if (!acc[similarId].colors.includes(userProd.color)) {
        acc[similarId].colors.push(userProd.color);
      }
      acc[similarId].allStockCnt += userProd.stockCnt;
      return acc;
    }, {});
    console.info("new data: ", Object.values(obj));
    return Object.values(obj);
  },
  getByVendorProdId: async function (vendorProdId) {
    const docSnap = await getDoc(doc(vendorProdC, vendorProdId));
    const data = docSnap.data();
    return data ?? null;
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

const vendorProdC = getIoCollection({
  c: IoCollection.VENDOR_PROD,
}).withConverter(VendorGarment.fireConverter());

const similarConst = (vendorId: string, vendorProdName: string) =>
  [
    where("vendorId", "==", vendorId),
    where("vendorProdName", "==", vendorProdName),
  ] as QueryConstraint[];
