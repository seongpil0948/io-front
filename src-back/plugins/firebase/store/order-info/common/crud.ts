import { shopReqOrderConverter, ShopReqOrder } from "@/composables";
import { getIoCollection, getIoStore } from "@/plugins/firebase";
import { IoCollection, ORDER_STATE, ShopReqOrderCRT } from "@/types";
import { writeBatch, doc } from "@firebase/firestore";

export function getBatchSrc() {
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
  console.log("updateOrderBatch: ", p);
  if (!p.orderState) return;
  const { batch, shopReqRef } = getBatchSrc();
  for (let i = 0; i < Object.keys(p.orderDbIdByShops).length; i++) {
    const shopId = Object.keys(p.orderDbIdByShops)[i];
    const reqRef = shopReqRef(shopId);
    for (let j = 0; j < p.orderDbIdByShops[shopId].length; j++) {
      const ordId = p.orderDbIdByShops[shopId][j];
      batch.update(doc(reqRef, ordId), {
        orderState: p.orderState,
      });
    }
  }

  await batch.commit();
}

export async function deleteOrders(ords: ShopReqOrderCRT[]) {
  const { batch, shopReqRef, orderNumberRef } = getBatchSrc();
  for (let i = 0; i < ords.length; i++) {
    const ord = ords[i];
    batch.delete(doc(shopReqRef(ord.shopId), ord.dbId));
    batch.delete(doc(orderNumberRef(ord.shopId), ord.orderId.toString()));
  }
  await batch.commit();
}
