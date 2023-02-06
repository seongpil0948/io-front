import {
  Mapper,
  onFirestoreCompletion,
  onFirestoreErr,
  ShopGarmentDB,
  ShopUserGarment,
} from "@/composable";
import {
  USER_DB,
  batchInQuery,
  getIoCollection,
  IoCollection,
} from "@io-boxies/js-lib";
import { logger } from "@/plugin/logger";
import {
  query,
  where,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
  writeBatch,
  Unsubscribe,
  QueryConstraint,
} from "@firebase/firestore";
import { Ref, ref } from "vue";
import { dataFromSnap } from "@/util";
import { getDoc } from "firebase/firestore";
import { ShopGarment } from "@/composable/product/shop-garment/model";
import { ioFireStore } from "@/plugin/firebase";

export const ShopGarmentFB: ShopGarmentDB = {
  getShopGarments: async function (d) {
    const constraints: QueryConstraint[] = [];
    if (d.shopId) {
      constraints.push(where("shopId", "==", d.shopId));
    }
    if (d.vendorId) {
      constraints.push(where("vendorId", "==", d.vendorId));
    }
    const snap = await getDocs(query(shopProdC, ...constraints));
    return dataFromSnap(snap);
  },
  shopGarmentExist: async function (
    vendorProdId: string,
    shopUserId: string
  ): Promise<boolean> {
    // deprecated
    const q = query(
      shopProdC,
      where("shopId", "==", shopUserId),
      where("vendorProdId", "==", vendorProdId)
    );
    const docs = await getDocs(q);
    return !docs.empty;
  },
  idExist: async function (id: string) {
    const q = doc(
      getIoCollection(ioFireStore, {
        c: IoCollection.SHOP_PROD,
      }),
      id
    );
    const docs = await getDoc(q);
    return docs.exists();
  },
  useGetShopGarments: function (
    shopId: string,
    condi: (prod: ShopGarment) => boolean
  ): { shopProds: Ref<ShopGarment[]>; unsubscribe: Unsubscribe } {
    const shopProds = ref<ShopGarment[]>([]);
    const name = "useGetShopGarments snapshot";
    const unsubscribe = onSnapshot(
      query(shopProdC, where("shopId", "==", shopId)),
      (snapshot) => {
        shopProds.value = [];
        snapshot.forEach((doc) => {
          const prod = doc.data();
          if (prod && condi(prod)) {
            shopProds.value.push(prod);
          }
        });
      },
      async (err) => {
        await onFirestoreErr(name, err);
        throw err;
      },
      () => onFirestoreCompletion(name)
    );

    return { shopProds, unsubscribe };
  },
  deleteShopGarments: async function (userId: string, prodIds: string[]) {
    if (prodIds.length < 1) return;
    else if (prodIds.length === 1) {
      await deleteDoc(doc(shopProdC, prodIds[0]));
    } else {
      const batch = writeBatch(ioFireStore);
      for (let i = 0; i < prodIds.length; i++) {
        batch.delete(doc(shopProdC, prodIds[i]));
      }
      await batch.commit();
    }
    await Mapper.deleteProdId(userId, prodIds);
  },
  getBatchShopProds: async function (
    shopIds: string[]
  ): Promise<ShopUserGarment[]> {
    console.log("shopIds in getBatchShopProds: ", shopIds);
    const users = await USER_DB.getUserByIds(ioFireStore, [...shopIds]);
    const snapshots = await batchInQuery<ShopGarment | null>(
      [...shopIds],
      shopProdC,
      "shopId"
    );
    const garments = snapshots.flatMap(dataFromSnap);
    return garments.reduce((acc, curr) => {
      const shop = users.find((u) => curr.shopId === u.userInfo.userId);
      if (!shop) {
        logger.error(
          `garment: ${curr.shopProdId} is not exist user, userid: ${curr.shopId}`
        );
        return acc;
      }
      const g = Object.assign({}, curr, shop);
      if (!g.userInfo) {
        console.error("g: ", g, "is not contain user info");
      } else {
        acc.push(g);
      }
      return acc;
    }, [] as ShopUserGarment[]);
  },
  listByIds: async function (shopProdIds: string[]) {
    const prodSnaps = await batchInQuery<ShopGarment>(
      shopProdIds,
      shopProdC,
      "shopProdId"
    );

    return prodSnaps.flatMap(dataFromSnap<ShopGarment>);
  },
  getById: async function (shopProdId) {
    const docSnap = await getDoc(doc(shopProdC, shopProdId));
    const data = docSnap.data();
    return data ?? null;
  },
};
export const shopProdC = getIoCollection(ioFireStore, {
  c: IoCollection.SHOP_PROD,
}).withConverter(ShopGarment.fireConverter());
// shopProdId;
