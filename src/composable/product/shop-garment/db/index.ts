import { Mapper, ShopGarment } from "@/composable";
import { getIoStore } from "@/plugin/firebase";
import { getIoCollection, IoCollection } from "@/util";
import {
  query,
  where,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
  writeBatch,
} from "@firebase/firestore";
import { ref } from "vue";

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
