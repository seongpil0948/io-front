import { IoCollection, ShopOrderParam, VendorOrderParam } from "@/types";
import { ShopReqOrder, shopReqOrderConverter } from "@/composables";
import {
  getIoCollectionGroup,
  iostore,
  getIoCollection,
} from "@/plugins/firebase";
import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { ref } from "vue";

export function getVendorGroupOrderInfo(p: VendorOrderParam) {
  const constraints = [where("vendorId", "==", p.vendorId)];
  if (p.inStates && p.inStates.length > 0) {
    constraints.push(where("orderState", "in", p.inStates));
  }
  if (p.notStates && p.notStates.length > 0) {
    constraints.push(where("orderState", "not-in", p.notStates));
  }

  const orders = ref<ShopReqOrder[]>([]);
  const orderQ = query(
    getIoCollectionGroup(IoCollection.SHOP_REQ_ORDER).withConverter(
      shopReqOrderConverter
    ),
    ...constraints
  );
  const subscribe = onSnapshot(orderQ, (snapshot) => {
    orders.value = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data) {
        orders.value.push(data);
      }
    });
  });

  return { subscribe, orders };
}

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

export async function getOrderById(shopId: string, shopProdId: string) {
  const shopReqRef = getIoCollection({
    c: IoCollection.SHOP_REQ_ORDER,
    uid: shopId,
  });
  const docRef = doc(shopReqRef, shopProdId).withConverter(
    shopReqOrderConverter
  );
  const d = await getDoc(docRef);
  const data = d.data();
  return data ? ShopReqOrder.fromJson(data) : null;
}
