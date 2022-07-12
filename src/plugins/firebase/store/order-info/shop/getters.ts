import { ShopReqOrder, shopReqOrderConverter } from "@/composables";
import { getIoCollection, iostore } from "@/plugins/firebase";
import { IoCollection, ShopOrderParam } from "@/types";
import {
  where,
  query,
  collectionGroup,
  onSnapshot,
  getDocs,
} from "@firebase/firestore";
import { ref } from "vue";

export function getShopOrderInfo(p: ShopOrderParam) {
  const orders = ref<ShopReqOrder[]>([]);
  const constraints = [where("shopId", "==", p.shopId)];

  if (p.inStates && p.inStates.length > 0) {
    constraints.push(where("orderState", "in", p.inStates));
  }
  if (p.notStates && p.notStates.length > 0) {
    constraints.push(where("orderState", "not-in", p.notStates));
  }
  const q = query(
    collectionGroup(iostore, "shopReqOrder").withConverter(
      shopReqOrderConverter
    ),
    ...constraints
  );
  const unsubscribe = onSnapshot(q, (snapshot) => {
    orders.value = [];
    snapshot.forEach((s) => {
      const data = s.data();
      if (data) {
        orders.value.push(data);
      }
    });
  });
  return { unsubscribe, orders };
}

export async function getExistOrderIds(userId: string): Promise<Set<string>> {
  const ioc = getIoCollection({
    c: IoCollection.SHOP_REQ_ORDER_NUMBER,
    uid: userId,
  });
  const orderIds: Set<string> = new Set();
  const snapShot = await getDocs(ioc);
  snapShot.forEach((doc) => orderIds.add(doc.id));
  return orderIds;
}
