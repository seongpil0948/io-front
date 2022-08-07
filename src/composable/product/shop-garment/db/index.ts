import { Mapper, ShopGarment, ShopUserGarment, USER_DB } from "@/composable";
import { getIoStore } from "@/plugin/firebase";
import { logger } from "@/plugin/logger";
import { batchInQuery, getIoCollection, IoCollection } from "@/util";
import {
  query,
  where,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
  writeBatch,
  QuerySnapshot,
} from "@firebase/firestore";
import { ref } from "vue";
// FIXME: 얘네 아직 dependency injection 적용안됌...
// FIXME: 얘네 아직 dependency injection 적용안됌...
// FIXME: 얘네 아직 dependency injection 적용안됌...
// FIXME: 얘네 아직 dependency injection 적용안됌...
// FIXME: 얘네 아직 dependency injection 적용안됌...

export async function shopGarmentExist(
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
}

export function useGetShopGarments(
  shopId: string,
  condi: (prod: ShopGarment) => boolean
) {
  const shopProds = ref<ShopGarment[]>([]);
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
    }
  );

  return { shopProds, unsubscribe };
}

export async function deleteShopGarments(userId: string, prodIds: string[]) {
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
}

export async function getBatchShopProds(shopIds: string[]) {
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
}

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
