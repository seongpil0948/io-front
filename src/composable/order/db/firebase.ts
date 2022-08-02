import { GarmentOrder } from "./../model/order";
import { ORDER_STATE } from "./../domain";
import { iostore } from "@/plugin/firebase";
import { getIoCollection, getIoCollectionGroup, IoCollection } from "@/util";
import {
  doc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  where,
  WithFieldValue,
  writeBatch,
} from "@firebase/firestore";
import { OrderDB } from "../domain";
import { useVendorsStore } from "@/store";
import { VendorOperInfo } from "@/composable/auth";
import { logger } from "@/plugin/logger";
import { ref, Ref } from "vue";

export const OrderGarmentFB: OrderDB<GarmentOrder> = {
  orderGarment: async function (row: GarmentOrder) {
    const vendorStore = useVendorsStore();
    try {
      const { getOrdRef, converterGarment } = getSrc();

      const ordRef = getOrdRef(row.shopId);
      const ordDocRef = doc(ordRef, row.dbId).withConverter(converterGarment);

      const newOrder = await runTransaction(iostore, async (transaction) => {
        const ordDoc = await transaction.get(ordDocRef);
        if (!ordDoc.exists()) throw "order doc does not exist!";
        const ord = ordDoc.data()!;

        row.items.forEach(async (item) => {
          const vendor = vendorStore.vendorById[item.vendorId];
          const prod = vendorStore.vendorGarments.find(
            (g) => g.vendorProdId === item.vendorProdId
          );
          if (!prod)
            throw `vendor garment does not exist!: ${item.vendorProdId}`;
          else if (!vendor)
            throw `vendor user does not exist!: ${item.vendorId}`;

          item.pendingCnt = GarmentOrder.getPendingCnt(
            prod.stockCnt,
            item.orderCnt,
            prod.allowPending
          );
          item.activeCnt = GarmentOrder.getActiveCnt(
            item.orderCnt,
            item.pendingCnt
          );
          if ((vendor.operInfo as VendorOperInfo).autoOrderApprove) {
            ord.state = "BEFORE_PAYMENT";
          } else {
            ord.state = "BEFORE_APPROVE";
          }
        });
        transaction.update(ordDocRef, converterGarment.toFirestore(ord));
        return ord;
      });
      return newOrder;
    } catch (e) {
      logger.error(null, e);
      throw e;
    }
  },
  batchCreate: async function (uid: string, orders: GarmentOrder[]) {
    await runTransaction(iostore, async (transaction) => {
      const { getOrdRef, getOrderNumberRef, converterGarment } = getSrc();
      const ordRef = getOrdRef(uid);
      const ordNumRef = getOrderNumberRef(uid);
      const existOrders: GarmentOrder[] = [];
      const existQ = query(
        ordRef,
        where("shopId", "==", uid),
        where("orderState", "==", ORDER_STATE.BEFORE_ORDER)
      );
      const docs = await getDocs(existQ);
      docs.forEach((doc) => {
        const data = doc.data();
        if (data) {
          existOrders.push(data);
        }
      });

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        for (let j = 0; j < order.items.length; j++) {
          const item = order.items[j];
          for (let k = 0; k < existOrders.length; k++) {
            const exist = existOrders[k];
            let updated = false;
            for (let z = 0; z < exist.items.length; z++) {
              const existItem = exist.items[z];
              if (item.shopProdId === existItem.shopProdId) {
                existItem.orderCnt += item.orderCnt;
                existItem.activeCnt += item.activeCnt;
                existItem.pendingCnt += item.pendingCnt;
                updated = true;
                order.items.splice(j, 1);
              }
            }
            if (updated) {
              transaction.update(
                doc(ordRef, exist.dbId),
                converterGarment.toFirestore(exist)
              );
              transaction.set(doc(ordNumRef, exist.orderId), { done: false });
            }
          }
        }
        if (order.items.length > 0) {
          transaction.set<GarmentOrder | null>(
            doc(ordRef, order.dbId),
            converterGarment.toFirestore(
              order
            ) as WithFieldValue<GarmentOrder | null>
          );
        }
      }

      // transaction.set(doc(ordNumRef, orderId.toString()), { done: false })
      // return ord;
    });
  },
  batchUpdate: async function (p: {
    orderDbIdByShops: { [shopId: string]: string[] };
    orderState?: ORDER_STATE;
  }) {
    console.log("updateOrderBatch: ", p);
    if (!p.orderState) return;
    const { batch, getOrdRef } = getSrc();
    for (let i = 0; i < Object.keys(p.orderDbIdByShops).length; i++) {
      const shopId = Object.keys(p.orderDbIdByShops)[i];
      const reqRef = getOrdRef(shopId);
      for (let j = 0; j < p.orderDbIdByShops[shopId].length; j++) {
        const dbId = p.orderDbIdByShops[shopId][j];
        batch.update(doc(reqRef, dbId), {
          state: p.orderState,
        });
      }
    }

    await batch.commit();
  },
  batchDelete: async function (ords: GarmentOrder[]) {
    const { batch, getOrdRef, getOrderNumberRef } = getSrc();
    for (let i = 0; i < ords.length; i++) {
      const ord = ords[i];
      batch.delete(doc(getOrdRef(ord.shopId), ord.dbId));
      batch.delete(doc(getOrderNumberRef(ord.shopId), ord.orderId.toString()));
    }
    await batch.commit();
  },
  shopReadListen: function (p: {
    inStates?: ORDER_STATE[];
    notStates?: ORDER_STATE[];
    shopId: string;
  }) {
    const orders = ref<GarmentOrder[]>([]);
    const constraints = [where("shopId", "==", p.shopId)];

    if (p.inStates && p.inStates.length > 0) {
      constraints.push(where("state", "in", p.inStates));
    }
    if (p.notStates && p.notStates.length > 0) {
      constraints.push(where("state", "not-in", p.notStates));
    }
    const q = query(
      getIoCollectionGroup(IoCollection.ORDER_PROD).withConverter(
        GarmentOrder.fireConverter()
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
  },
  vendorReadListen: function (p: {
    inStates?: ORDER_STATE[];
    notStates?: ORDER_STATE[];
    vendorId: string;
  }) {
    const constraints = [where("vendorId", "==", p.vendorId)];
    if (p.inStates && p.inStates.length > 0) {
      constraints.push(where("state", "in", p.inStates));
    }
    if (p.notStates && p.notStates.length > 0) {
      constraints.push(where("state", "not-in", p.notStates));
    }

    const orders = ref<GarmentOrder[]>([]);
    const orderQ = query(
      getIoCollectionGroup(IoCollection.ORDER_PROD).withConverter(
        GarmentOrder.fireConverter()
      ),
      ...constraints
    );
    const unsubscribe = onSnapshot(orderQ, (snapshot) => {
      orders.value = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          orders.value.push(data);
        }
      });
    });

    return { orders, unsubscribe };
  },
  getExistOrderIds: async function (shopId: string) {
    const ioc = getIoCollection({
      c: IoCollection.ORDER_PROD_NUMBER,
      uid: shopId,
    });
    const orderIds: Set<string> = new Set();
    const snapShot = await getDocs(ioc);
    snapShot.forEach((doc) => orderIds.add(doc.id));
    return orderIds;
  },
};

export function getSrc() {
  const converterGarment = GarmentOrder.fireConverter();
  const batch = writeBatch(iostore);
  const getOrdRef = (shopId: string) =>
    getIoCollection({
      c: IoCollection.ORDER_PROD,
      uid: shopId,
    }).withConverter(converterGarment);
  const getOrderNumberRef = (shopId: string) =>
    getIoCollection({
      c: IoCollection.ORDER_PROD_NUMBER,
      uid: shopId,
    });
  return { batch, getOrdRef, getOrderNumberRef, converterGarment };
}
