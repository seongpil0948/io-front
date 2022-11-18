import {
  Mapper,
  onFirestoreCompletion,
  onFirestoreErr,
  ShopGarment,
  ShopGarmentDB,
  ShopUserGarment,
} from "@/composable";
import {
  USER_DB,
  getIoStore,
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
  QuerySnapshot,
  Unsubscribe,
} from "@firebase/firestore";
import { Ref, ref } from "vue";

export const ShopGarmentFB: ShopGarmentDB = {
  shopGarmentExist: async function (
    vendorProdId: string,
    shopUserId: string
  ): Promise<boolean> {
    const q = query(
      getIoCollection({ c: IoCollection.SHOP_PROD }),
      where("shopId", "==", shopUserId),
      where("vendorProdId", "==", vendorProdId)
    );
    const docs = await getDocs(q);
    return !docs.empty;
  },
  useGetShopGarments: function (
    shopId: string,
    condi: (prod: ShopGarment) => boolean
  ): { shopProds: Ref<ShopGarment[]>; unsubscribe: Unsubscribe } {
    const shopProds = ref<ShopGarment[]>([]);
    const name = "useGetShopGarments snapshot";
    const unsubscribe = onSnapshot(
      query(
        getIoCollection({ c: IoCollection.SHOP_PROD }).withConverter(
          ShopGarment.fireConverter()
        ),
        where("shopId", "==", shopId)
      ),
      (snapshot) => {
        shopProds.value = [];
        snapshot.forEach((doc) => {
          const prod = doc.data();
          if (prod && condi(prod)) {
            shopProds.value.push(prod);
          }
        });
      },
      async (err) => await onFirestoreErr(name, err),
      () => onFirestoreCompletion(name)
    );

    return { shopProds, unsubscribe };
  },
  deleteShopGarments: async function (userId: string, prodIds: string[]) {
    const c = getIoCollection({ c: IoCollection.SHOP_PROD });
    if (prodIds.length < 1) return;
    else if (prodIds.length === 1) {
      await deleteDoc(doc(c, prodIds[0]));
    } else {
      const batch = writeBatch(getIoStore());
      for (let i = 0; i < prodIds.length; i++) {
        batch.delete(doc(c, prodIds[i]));
      }
      await batch.commit();
    }
    await Mapper.deleteProdId(userId, prodIds);
  },
  getBatchShopProds: async function (
    shopIds: string[]
  ): Promise<ShopUserGarment[]> {
    const users = await USER_DB.getUserByIds([...shopIds]);
    const c = getIoCollection({ c: IoCollection.SHOP_PROD }).withConverter(
      ShopGarment.fireConverter()
    );
    const snapshots = await batchInQuery<ShopGarment | null>(
      [...shopIds],
      c,
      "shopId"
    );
    const garments = snapshots.flatMap(_prodFromSnap);
    return garments.reduce((acc, curr) => {
      const shop = users.find((u) => curr.shopId === u.userInfo.userId);
      if (!shop) {
        logger.error(
          `garment: ${curr.shopProdId} is not exist user, userid: ${curr.shopId}`
        );
        return acc;
      }
      acc.push(Object.assign({}, shop, curr));
      return acc;
    }, [] as ShopUserGarment[]);
  },
};

function _prodFromSnap(snap: QuerySnapshot<ShopGarment | null>): ShopGarment[] {
  const garments: ShopGarment[] = [];

  snap.docs.forEach((d) => {
    const data = d.data();
    if (data) {
      garments.push(data);
    }
  });
  return garments;
}
