import { IoCollection, ORDER_STATE } from "@/types";
import { type ShopReqOrder, shopReqOrderConverter } from "@/composables";
import {
  getIoCollectionGroup,
  iostore,
  getIoCollection,
} from "@/plugins/firebase";
import {
  collectionGroup,
  doc,
  getDocs,
  onSnapshot,
  query,
  QueryConstraint,
  setDoc,
  where,
} from "firebase/firestore";
import type { Ref } from "vue";

export async function getVendorGroupOrderInfo(
  vendorId: string,
  states: ORDER_STATE[]
) {
  const orders: ShopReqOrder[] = [];
  const orderQ = query(
    getIoCollectionGroup(IoCollection.SHOP_REQ_ORDER).withConverter(
      shopReqOrderConverter
    ),
    where("vendorId", "==", vendorId),
    where("orderState", "in", states)
  );
  const querySnapshot = await getDocs(orderQ);
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data) {
      orders.push(data);
    }
  });
  return orders;
}

export function getShopOrderInfo(
  orders: Ref<ShopReqOrder[]>,
  shopId: string,
  orderStates: ORDER_STATE[]
) {
  const constraints: QueryConstraint[] = [];
  orderStates.forEach((state) => {
    constraints.push(where("orderState", "==", state));
  });
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
  return { unsubscribe };
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

export async function setOrderId(
  userId: string,
  orderId: string,
  done = false
): Promise<void> {
  const ioc = getIoCollection({
    c: IoCollection.SHOP_REQ_ORDER_NUMBER,
    uid: userId,
  });
  await setDoc(doc(ioc, orderId), { done });
}
