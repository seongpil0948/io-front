import {
  IoCollection,
  ORDER_STATE,
  ShopOrderParam,
  VendorOrderParam,
} from "@/types";
import { ShopReqOrder, shopReqOrderConverter } from "@/composables";
import {
  getIoCollectionGroup,
  iostore,
  getIoCollection,
  getIoStore,
} from "@/plugins/firebase";
import {
  collectionGroup,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
  writeBatch,
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
  await setDoc(doc(ioc, orderId.toString()), { done });
}

function getBatchSrc() {
  const db = getIoStore();
  const batch = writeBatch(db);
  const shopReqRef = (shopId: string) =>
    getIoCollection({
      c: IoCollection.SHOP_REQ_ORDER,
      uid: shopId,
    }).withConverter(shopReqOrderConverter);
  const orderNumberRef = (shopId: string) =>
    getIoCollection({
      c: IoCollection.SHOP_REQ_ORDER_NUMBER,
      uid: shopId,
    });
  return { batch, shopReqRef, orderNumberRef };
}

export async function writeOrderBatch(shopId: string, orders: ShopReqOrder[]) {
  const { batch, shopReqRef, orderNumberRef: ioc } = getBatchSrc();

  const ods: typeof orders = [];
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    batch.set(doc(ioc(shopId), order.orderId.toString()), { done: false });
    const exist = ods.find((x) => x.sameOrder(order));
    if (exist) {
      exist.orderCnt += order.orderCnt;
      exist.amount += order.amount;
    } else {
      ods.push(order);
    }
  }

  ods.forEach((o) => {
    batch.set(doc(shopReqRef(shopId), o.dbId), o);
  });
  await batch.commit();
}

interface updateParam {
  orderDbIdByShops: { [shopId: string]: string[] };
  orderState?: ORDER_STATE;
}
export async function updateOrderBatch(p: updateParam) {
  if (!p.orderState) return;
  const { batch, shopReqRef } = getBatchSrc();
  for (let i = 0; i < Object.keys(p.orderDbIdByShops).length; i++) {
    const shopId = Object.keys(p.orderDbIdByShops)[i];
    const reqRef = shopReqRef(shopId);
    for (let j = 0; j < p.orderDbIdByShops[shopId].length; j++) {
      const ordId = p.orderDbIdByShops[shopId][j];
      batch.update(doc(reqRef, ordId.toString()), {
        orderState: p.orderState,
      });
    }
  }

  await batch.commit();
}
