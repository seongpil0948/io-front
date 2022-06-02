import { IoCollection } from "@/types";
import { getIoCollection } from "@/plugins/firebase";
import {
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { ShopProd, shopProdConverter } from "@/composables";
import { ref } from "vue";

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

export async function deleteShopProds(prodIds: string[]) {
  const c = getIoCollection({ c: IoCollection.SHOP_PROD });
  return Promise.all(prodIds.map((prodId) => deleteDoc(doc(c, prodId))));
}
