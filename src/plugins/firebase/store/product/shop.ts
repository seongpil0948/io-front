import { IoCollection } from "@/types";
import { getIoCollection } from "@/plugins/firebase";
import {
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { Mapper, ShopProd, shopProdConverter } from "@/composables";
import { ref } from "vue";
import { getIoStore } from "..";

export async function shopProdExist(
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

export function useGetShopProds(
  shopId: string,
  condi: (prod: ShopProd) => boolean
) {
  const shopProds = ref<ShopProd[]>([]);
  const unsubscribe = onSnapshot(
    query(
      getIoCollection({ c: IoCollection.SHOP_PROD }).withConverter(
        shopProdConverter
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

export async function deleteShopProds(userId: string, prodIds: string[]) {
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
