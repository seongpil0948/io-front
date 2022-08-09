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
import { logger } from "@/plugin/logger";
import { ref } from "vue";
import { IO_PAY_DB } from "@/composable";
import { IO_COSTS } from "@/constants";

export const OrderGarmentFB: OrderDB<GarmentOrder> = {
  orderApprove: async function (
    vendorId: string,
    orderIds: string[],
    prodOrderIds: string[]
  ) {
    const orders: GarmentOrder[] = [];
    const constraints = [where("orderIds", "array-contains-any", orderIds)];
    const docs = await getDocs(
      query(
        getIoCollectionGroup(IoCollection.ORDER_PROD).withConverter(
          GarmentOrder.fireConverter()
        ),
        ...constraints
      )
    );
    docs.forEach((doc) => {
      const data = doc.data();
      if (data) {
        orders.push(data);
      }
    });
    const shopIds = orders.map((x) => x.shopId);
    const processedShops = new Set<string>();
    await runTransaction(iostore, async (transaction) => {
      const { getOrdRef, converterGarment } = getSrc();
      // 1. vendor pay
      const vendorPay = await IO_PAY_DB.getIoPayByUser(vendorId);
      const vReduceCoin = shopIds.length * IO_COSTS.REQ_ORDER;
      if (vendorPay.availBudget < vReduceCoin) {
        throw new Error("vendorPay.availBudget < vReduceCoin");
      }
      vendorPay.budget -= vReduceCoin;
      transaction.update(
        doc(getIoCollection({ c: IoCollection.IO_PAY }), vendorId),
        {
          budget: vendorPay.budget,
        }
      );
      // 2. update order state, reduce shop coin
      for (let i = 0; i < orders.length; i++) {
        const o = orders[i];
        for (let j = 0; j < o.items.length; j++) {
          const item = o.items[j];
          if (
            prodOrderIds.includes(item.id) &&
            item.state === "BEFORE_APPROVE"
          ) {
            o.setState(item.id, "BEFORE_PAYMENT");
            transaction.update(
              doc(getOrdRef(o.shopId), o.dbId),
              converterGarment.toFirestore(o)
            );
            processedShops.add(o.shopId);
          }
        }
      }
      processedShops.forEach(async (shopId) => {
        const shopPay = await IO_PAY_DB.getIoPayByUser(shopId);
        if (shopPay.availBudget < IO_COSTS.REQ_ORDER) {
          throw new Error("shopPay.availBudget < IO_COSTS.REQ_ORDER");
        }
        transaction.update(
          doc(getIoCollection({ c: IoCollection.IO_PAY }), shopId),
          {
            budget: shopPay.budget - IO_COSTS.REQ_ORDER,
          }
        );
      });
    });
  },
  orderGarment: async function (row: GarmentOrder, expectedReduceCoin: number) {
    const vendorStore = useVendorsStore();
    console.log("in orderGarment: row:", row);
    // userPay  pending amount 업데이트 해놓아야함
    try {
      const { getOrdRef, converterGarment } = getSrc();
      const userPay = await IO_PAY_DB.getIoPayByUser(row.shopId);
      if (userPay.availBudget < expectedReduceCoin)
        throw new Error("보유 코인이 부족합니다.");
      else if (!row.isValid) throw new Error("invalid order.");
      const ordRef = getOrdRef(row.shopId);
      const ordDocRef = doc(ordRef, row.dbId).withConverter(converterGarment);

      const newOrder = await runTransaction(iostore, async (transaction) => {
        const ordDoc = await transaction.get(ordDocRef);
        if (!ordDoc.exists()) throw new Error("order doc does not exist!");

        const ord = ordDoc.data()!;
        if (ord.items.length < 1)
          throw new Error("request order items not exist");

        ord.items.forEach(async (item) => {
          const vendor = vendorStore.vendorById[item.vendorId];
          const prod = vendorStore.vendorGarments.find(
            (g) => g.vendorProdId === item.vendorProdId
          );
          if (!prod)
            throw new Error(
              `vendor garment does not exist!: ${item.vendorProdId}`
            );
          else if (!vendor)
            throw new Error(`vendor user does not exist!: ${item.vendorId}`);
          // if ((vendor.operInfo as VendorOperInfo).autoOrderApprove) {
          //   item.state = "BEFORE_PAYMENT";
          // } else {
          ord.setState(item.id, "BEFORE_APPROVE");
          // }
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
        where("states", "array-contains", "BEFORE_ORDER")
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
          let exist: typeof order | null = null;
          for (let k = 0; k < existOrders.length; k++) {
            const o = existOrders[k];
            if (exist) break;
            for (let z = 0; z < o.items.length; z++) {
              const existItem = o.items[z];
              if (existItem.state !== "BEFORE_ORDER") continue;
              else if (item.vendorProdId === existItem.vendorProdId) {
                exist = o;
                exist.setOrderCnt(existItem.id, item.orderCnt, true);
                order.items.splice(j, 1);
                if (order.items.length < 1) {
                  exist.orderIds.push(...order.orderIds);
                  for (let x = 0; x < order.itemIds.length; x++) {
                    const itemId = order.itemIds[x];
                    if (!exist.itemIds.includes(itemId)) {
                      exist.itemIds.push(itemId);
                    }
                  }
                }

                break;
              }
            }
          }
          if (exist) {
            transaction.update(
              doc(ordRef, exist.dbId),
              converterGarment.toFirestore(exist)
            );
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
        order.orderIds.forEach((oid) =>
          transaction.set(doc(ordNumRef, oid), { done: false })
        );
      }

      // transaction.set(doc(ordNumRef, orderId.toString()), { done: false })
      // return ord;
    });
  },
  batchUpdate: async function (p: {
    orderDbIdByShops: { [shopId: string]: string[] };
    orderState?: ORDER_STATE;
  }) {
    throw new Error("batchUpdate is not implemented");

    if (!p.orderState) return;
    const { batch, getOrdRef } = getSrc();
    for (let i = 0; i < Object.keys(p.orderDbIdByShops).length; i++) {
      const shopId = Object.keys(p.orderDbIdByShops)[i];
      const reqRef = getOrdRef(shopId);
      for (let j = 0; j < p.orderDbIdByShops[shopId].length; j++) {
        const dbId = p.orderDbIdByShops[shopId][j];
        // batch.update(doc(reqRef, dbId), {
        //   state: p.orderState,
        // });
      }
    }

    await batch.commit();
  },
  batchDelete: async function (ords: GarmentOrder[]) {
    const { batch, getOrdRef, getOrderNumberRef } = getSrc();
    for (let i = 0; i < ords.length; i++) {
      const ord = ords[i];
      ord.orderIds.forEach((orderId) =>
        batch.delete(doc(getOrderNumberRef(ord.shopId), orderId.toString()))
      );
      batch.delete(doc(getOrdRef(ord.shopId), ord.dbId));
    }
    await batch.commit();
  },
  shopReadListen: function (p: { inStates?: ORDER_STATE[]; shopId: string }) {
    const orders = ref<GarmentOrder[]>([]);
    const constraints = [where("shopId", "==", p.shopId)];

    if (p.inStates && p.inStates.length > 0) {
      constraints.push(where("states", "array-contains-any", p.inStates));
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
    vendorId: string;
  }) {
    const orders = ref<GarmentOrder[]>([]);
    const orderQ = query(
      getIoCollectionGroup(IoCollection.ORDER_PROD).withConverter(
        GarmentOrder.fireConverter()
      ),
      where("vendorIds", "array-contains", p.vendorId)
    );
    const unsubscribe = onSnapshot(orderQ, (snapshot) => {
      orders.value = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log("p.inStates:", p.inStates);
        console.log("data.states:", data.states);
        if (p.inStates) {
          if (data && data.states.some((x) => p.inStates!.includes(x))) {
            orders.value.push(data);
          }
        } else {
          if (data) {
            orders.value.push(data);
          }
        }
      });
    });

    return { orders, unsubscribe };
  },
  getExistOrderIds: async function (shopId: string) {
    console.log("shopId in getExistOrderIds", shopId);
    const ioc = getIoCollection({
      c: IoCollection.ORDER_PROD_NUMBER,
      uid: shopId,
    });
    const orderIds: Set<string> = new Set();
    const snapShot = await getDocs(ioc);
    snapShot.forEach((doc) => orderIds.add(doc.id));
    console.log("shopId in getExistOrderIds", shopId);
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
