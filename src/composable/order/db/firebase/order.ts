import { iostore } from "@/plugin/firebase";
import {
  getIoCollection,
  getIoCollectionGroup,
  IoCollection,
  uniqueArr,
} from "@/util";
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  QueryConstraint,
  runTransaction,
  where,
  WithFieldValue,
  writeBatch,
} from "@firebase/firestore";
import { useVendorsStore } from "@/store";
import { Ref } from "vue";
import {
  GarmentOrder,
  IO_PAY_DB,
  OrderCancel,
  OrderDB,
  ORDER_STATE,
  ProdOrder,
} from "@/composable";
import { IO_COSTS } from "@/constants";

const cancelTargetState = [
  "BEFORE_ORDER",
  "BEFORE_APPROVE",
  "BEFORE_PAYMENT",
  "BEFORE_READY",
  "BEFORE_PICKUP_REQ",
];
async function getOrders(constraints: QueryConstraint[]) {
  const orders: GarmentOrder[] = [];
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
  return orders;
}

export const OrderGarmentFB: OrderDB<GarmentOrder> = {
  reqPickup: async function (
    orderDbIds: string[],
    prodOrderIds: string[],
    uncleId: string
  ) {
    await stateModify(
      orderDbIds,
      prodOrderIds,
      "BEFORE_APPROVE_PICKUP",
      undefined,
      async function (o) {
        o.shipManagerId = uncleId;
        return o;
      }
    );
  },
  completePay: async function (orderDbIds: string[], prodOrderIds: string[]) {
    await stateModify(
      orderDbIds,
      prodOrderIds,
      "BEFORE_READY",
      ["BEFORE_PAYMENT"],
      undefined,
      async function (po) {
        // TODO: test required
        po.actualAmount.paidDate = new Date();
        po.actualAmount.paidAmount = po.actualAmount.orderAmount;
        po.actualAmount.paid = "T";
        return po;
      },
      true
    );
  },
  orderToReady: async function (orderDbIds: string[], prodOrderIds: string[]) {
    const vendorStore = useVendorsStore();
    await stateModify(
      orderDbIds,
      prodOrderIds,
      "BEFORE_PICKUP_REQ",
      ["BEFORE_READY"],
      undefined,
      async function (po) {
        // po.orderCnt
        const garment = vendorStore.vendorGarments.find(
          (x) => x.vendorProdId === po.vendorProdId
        );
        if (!garment)
          throw new Error(`vendor prod ${po.vendorProdId} is not exist`);
        else if (garment.stockCnt < po.orderCnt)
          throw new Error(
            `재고개수(${garment.stockCnt}) 가 주문개수(${po.orderCnt}) 보다 적습니다.`
          );
        else {
          garment.stockCnt -= po.orderCnt;
          await garment.update();
        }

        return po;
      }
    );
  },
  orderReject: async function (orderDbIds: string[], prodOrderIds: string[]) {
    const constraints = [where("dbId", "in", orderDbIds)];
    const orders = await getOrders(constraints);
    const shopIds = orders.map((x) => x.shopId);
    const processedShops = shopIds.reduce((acc, curr) => {
      acc[curr] = 0;
      return acc;
    }, {} as { [shopId: string]: number });
    await runTransaction(iostore, async (transaction) => {
      const { getOrdRef, converterGarment } = getSrc();
      // 2. update order state, reduce shop coin
      for (let i = 0; i < orders.length; i++) {
        const o = orders[i];
        for (let j = 0; j < o.items.length; j++) {
          const item = o.items[j];
          if (
            prodOrderIds.includes(item.id) &&
            (item.state === "BEFORE_APPROVE" || item.state === "BEFORE_PAYMENT")
          ) {
            o.setState(item.id, "BEFORE_ORDER");
            transaction.update(
              doc(getOrdRef(o.shopId), o.dbId),
              converterGarment.toFirestore(o)
            );
            processedShops[o.shopId] += 1;
          }
        }
      }

      const entries = Object.entries(processedShops);
      for (let k = 0; k < entries.length; k++) {
        const [shopId, cnt] = entries[k];
        const shopPay = await IO_PAY_DB.getIoPayByUser(shopId);
        const cost = IO_COSTS.REQ_ORDER * cnt;
        transaction.update(
          doc(getIoCollection({ c: IoCollection.IO_PAY }), shopId),
          {
            pendingBudget: shopPay.pendingBudget - cost,
            budget: shopPay.budget + cost,
          }
        );
      }
    });
    await Promise.all(
      Object.keys(processedShops).map((x) => mergeOrders("BEFORE_ORDER", x))
    );
  },
  orderApprove: async function (
    vendorId: string,
    orderDbIds: string[],
    prodOrderIds: string[]
  ) {
    const constraints = [where("dbId", "in", orderDbIds)];
    const orders = await getOrders(constraints);
    const shopIds = orders.map((x) => x.shopId);
    const processedShops = shopIds.reduce((acc, curr) => {
      acc[curr] = 0;
      return acc;
    }, {} as { [shopId: string]: number });
    await runTransaction(iostore, async (transaction) => {
      const { getOrdRef, converterGarment } = getSrc();
      // 1. vendor pay
      const vendorPay = await IO_PAY_DB.getIoPayByUser(vendorId);
      const vReduceCoin = shopIds.length * IO_COSTS.APPROVE_ORDER;
      if (vendorPay.budget < vReduceCoin) {
        throw new Error("유저 코인이 부족합니다.");
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
            processedShops[o.shopId] += 1;
          }
        }
      }

      const entries = Object.entries(processedShops);
      for (let k = 0; k < entries.length; k++) {
        const [shopId, cnt] = entries[k];
        const shopPay = await IO_PAY_DB.getIoPayByUser(shopId);
        const cost = IO_COSTS.REQ_ORDER * cnt;
        if (shopPay.pendingBudget < cost)
          throw new Error(
            `shop(${shopId}) not enough pendingBudget(${cost}) for request order`
          );
        transaction.update(
          doc(getIoCollection({ c: IoCollection.IO_PAY }), shopId),
          {
            pendingBudget: shopPay.pendingBudget - cost,
          }
        );
      }
    });
    await Promise.all(
      Object.keys(processedShops).map((x) => mergeOrders("BEFORE_PAYMENT", x))
    );
  },
  orderGarment: async function (
    orderDbIds: string[],
    prodOrderIds: string[],
    shopId: string
  ) {
    const vendorStore = useVendorsStore();
    const { getOrdRef, converterGarment } = getSrc();
    const constraints = [where("dbId", "in", orderDbIds)];
    const orders = await getOrders(constraints);
    const userPay = await IO_PAY_DB.getIoPayByUser(shopId);
    const reduceCoin = IO_COSTS.REQ_ORDER * prodOrderIds.length;
    if (userPay.budget < reduceCoin) throw new Error("보유 코인이 부족합니다.");

    const result = runTransaction(iostore, async (transaction) => {
      const newOrds: GarmentOrder[] = [];
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        if (!order.isValid) throw new Error("invalid order.");
        const ordRef = getOrdRef(order.shopId);
        const ordDocRef = doc(ordRef, order.dbId).withConverter(
          converterGarment
        );
        const ordDoc = await transaction.get(ordDocRef);
        if (!ordDoc.exists()) throw new Error("order doc does not exist!");
        const ord = ordDoc.data()!;
        if (ord.items.length < 1) continue;
        for (let j = 0; j < ord.items.length; j++) {
          const item = ord.items[j];
          if (!prodOrderIds.includes(item.id)) continue;
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
          else if (item.orderCnt > prod.stockCnt && !prod.allowPending) {
            throw new Error(
              `out of stock(${prod.stockCnt}) order(${ord.dbId})(${item.id}) cnt: ${item.orderCnt} }`
            );
          }
          ord.setState(item.id, "BEFORE_APPROVE");
        }
        newOrds.push(ord);
      }

      for (let k = 0; k < newOrds.length; k++) {
        const newOrd = newOrds[k];
        transaction.update(
          doc(getOrdRef(newOrd.shopId), newOrd.dbId),
          converterGarment.toFirestore(newOrd)
        );
      }
      transaction.update(
        doc(getIoCollection({ c: IoCollection.IO_PAY }), userPay.userId),
        {
          pendingBudget: userPay.pendingBudget + reduceCoin,
          budget: userPay.budget - reduceCoin,
        }
      );
      return newOrds;
    });
    await mergeOrders("BEFORE_APPROVE", shopId);
    return result;
  },
  batchCreate: async function (uid: string, orders: GarmentOrder[]) {
    return await runTransaction(iostore, async (transaction) => {
      const { getOrdRef, getOrderNumberRef, converterGarment } = getSrc();
      const ordRef = getOrdRef(uid);
      const ordNumRef = getOrderNumberRef(uid);
      const ordIds = await this.getExistOrderIds(uid);
      const existOrders: GarmentOrder[] = await getOrders([
        where("shopId", "==", uid),
        where("states", "array-contains", "BEFORE_ORDER"),
      ]);
      // <<< 주문요청전 주문들을 가져온다. <<<
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        if (order.orderIds.filter((oid) => ordIds.has(oid)).length > 0) {
          continue; //`이미 사용된 주문번호(${ordIds})가 포함 되어있습니다. `
        }

        for (let j = 0; j < order.items.length; j++) {
          const item = order.items[j];
          let exist: typeof order | null = null;
          for (let k = 0; k < existOrders.length; k++) {
            const o = existOrders[k];
            for (let z = 0; z < o.items.length; z++) {
              const existItem = o.items[z];
              if (existItem.state !== "BEFORE_ORDER") continue;
              else if (item.vendorProdId === existItem.vendorProdId) {
                exist = o;
                // 이로직을 분리하여, 모든 주문건의 상태 변경 프로세스에 대하여 적용가능하도록
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
          existOrders.push(order);
        }
        order.orderIds.forEach((oid) =>
          transaction.set(doc(ordNumRef, oid), { done: false })
        );
      }

      // transaction.set(doc(ordNumRef, orderId.toString()), { done: false })
      // return ord;
    });
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  batchUpdate: async function (p: {
    orderDbIdByShops: { [shopId: string]: string[] };
    orderState?: ORDER_STATE;
  }) {
    throw new Error("batchUpdate is not implemented");
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
  shopReadListen: function (p: {
    inStates?: ORDER_STATE[];
    shopId: string;
    orders: Ref<GarmentOrder[]>;
  }) {
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
      p.orders.value = [];
      snapshot.forEach((s) => {
        const data = s.data();
        if (data) {
          p.orders.value.push(data);
        }
      });
    });
    return { unsubscribe };
  },
  vendorReadListen: function (p: {
    inStates?: ORDER_STATE[];
    vendorId: string;
    orders: Ref<GarmentOrder[]>;
  }) {
    const orderQ = query(
      getIoCollectionGroup(IoCollection.ORDER_PROD).withConverter(
        GarmentOrder.fireConverter()
      ),
      where("vendorIds", "array-contains", p.vendorId)
    );
    const unsubscribe = onSnapshot(orderQ, (snapshot) => {
      p.orders.value = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (p.inStates) {
          if (data && data.states.some((x) => p.inStates!.includes(x))) {
            p.orders.value.push(data);
          }
        } else {
          if (data) {
            p.orders.value.push(data);
          }
        }
      });
    });

    return { unsubscribe };
  },
  uncleReadListen: function (p: {
    inStates?: ORDER_STATE[];
    uncleId: string;
    orders: Ref<GarmentOrder[]>;
  }) {
    const orderQ = query(
      getIoCollectionGroup(IoCollection.ORDER_PROD).withConverter(
        GarmentOrder.fireConverter()
      ),
      where("shipManagerId", "==", p.uncleId)
    );
    const unsubscribe = onSnapshot(orderQ, (snapshot) => {
      p.orders.value = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (p.inStates) {
          if (data && data.states.some((x) => p.inStates!.includes(x))) {
            p.orders.value.push(data);
          }
        } else {
          if (data) {
            p.orders.value.push(data);
          }
        }
      });
    });

    return { unsubscribe };
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
  batchRead: async function (
    orderDbIds: string[],
    constraints?: QueryConstraint[]
  ): Promise<GarmentOrder[]> {
    const orders: GarmentOrder[] = [];
    while (orderDbIds.length) {
      const batchIds = orderDbIds.splice(0, 10); // batch size 10
      orders.push(
        ...(await getOrders([
          where("dbId", "in", batchIds),
          ...(constraints ?? []),
        ]))
      );
    }
    return orders;
  },
  readById: async function (shopId: string, orderDbId: string) {
    const { getOrdRef } = getSrc();
    const snapshot = await getDoc(doc(getOrdRef(shopId), orderDbId));
    return snapshot.data();
  },
  returnReq: async function (
    orderDbIds: string[],
    prodOrderIds: string[]
  ): Promise<void> {
    await stateModify(orderDbIds, prodOrderIds, "RETURN_REQ");
  },
  returnApprove: async function (
    orderDbIds: string[],
    prodOrderIds: string[]
  ): Promise<void> {
    await stateModify(
      orderDbIds,
      prodOrderIds,
      "RETURN_APPROVED",
      ["RETURN_REQ"],
      undefined,
      async function (po) {
        po.orderType = "RETURN";
        return po;
      }
    );
  },
  returnReject: async function (
    orderDbIds: string[],
    prodOrderIds: string[]
  ): Promise<void> {
    const { getOrdRef, converterGarment } = getSrc();
    const data: { [shopId: string]: ORDER_STATE } = {};
    await runTransaction(iostore, async (transaction) => {
      const orders = await OrderGarmentFB.batchRead(orderDbIds);
      for (let i = 0; i < orders.length; i++) {
        const o = orders[i];
        for (let j = 0; j < o.items.length; j++) {
          const item = o.items[j];
          if (prodOrderIds.includes(item.id)) {
            const state = item.beforeState ?? "BEFORE_PICKUP";
            o.setState(item.id, state);
            transaction.update(
              doc(getOrdRef(o.shopId), o.dbId),
              converterGarment.toFirestore(o)
            );
            data[o.shopId] = state;
          }
        }
      }
    });
    await Promise.all(
      Object.entries(data).map(([shopId, state]) => mergeOrders(state, shopId))
    );
  },
  returnDone: async function (): Promise<void> {
    throw new Error("Function not implemented.");
  },
  cancelReq: async function (
    shopId: string,
    orderDbId: string,
    prodOrderId: string,
    claim: OrderCancel,
    cancelCnt: number
  ): Promise<void> {
    const validate = (i: ProdOrder | undefined) => {
      if (!i) throw new Error("주문 상품 데이터 정보가 없습니다.");
      else if (i.orderCnt < cancelCnt)
        throw new Error("취소개수가 주문개수보다 많습니다.");
      else if (!cancelTargetState.includes(i.state))
        throw new Error(
          `취소에 허용되지 않는 주문상태(${ORDER_STATE[i.state]}) 입니다.`
        );
      return i!;
    };
    const { getOrdRef, converterGarment } = getSrc();
    const order = await OrderGarmentFB.readById(shopId, orderDbId);
    if (!order) throw new Error("주문 데이터 정보가 없습니다.");
    const item = validate(order.items.find((x) => x.id === prodOrderId));

    const processing = async (i: ProdOrder, c: OrderCancel) => {
      const paid = i.actualAmount.paid;
      if (paid === "F") {
        c.done = true;
        c.canceledDate = new Date();
        order.cancellations.push(c);
        order.setState(i.id, "ORDER_DONE");
      } else {
        order.cancellations.push(c);
        order.setState(i.id, "CANCEL");
      }
      await updateDoc(
        doc(getOrdRef(order.shopId), order.dbId),
        converterGarment.toFirestore(order)
      );
      mergeOrders("CANCEL", "shopId");
    };

    if (item.orderCnt > cancelCnt) {
      const newId = await order.dividePartial(item.id, cancelCnt, false);
      const itemDivided = validate(order.items.find((x) => x.id === newId));
      claim.prodOrderId = newId;
      await processing(itemDivided, claim);
    } else {
      await processing(item, claim);
    }
  },
  cancelApprove: async function (
    orderDbIds: string[],
    prodOrderIds: string[]
  ): Promise<void> {
    return stateModify(
      orderDbIds,
      prodOrderIds,
      "ORDER_DONE",
      ["CANCEL"],
      async function (order) {
        for (let i = 0; i < order.cancellations.length; i++) {
          const claim = order.cancellations[i];
          if (claim.done || claim.canceledDate) continue;
          claim.done = true;
          claim.approved = true;
          claim.canceledDate = new Date();
        }
        return order;
      }
    );
  },
  cancelReject: async function (
    orderDbIds: string[],
    prodOrderIds: string[]
  ): Promise<void> {
    return stateModify(
      orderDbIds,
      prodOrderIds,
      "BEFORE_READY",
      ["CANCEL"],
      async function (order) {
        for (let i = 0; i < order.cancellations.length; i++) {
          const claim = order.cancellations[i];
          if (claim.done || claim.canceledDate) continue;
          claim.done = true;
          claim.canceledDate = new Date();
        }
        return order;
      }
    );
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

async function stateModify(
  orderDbIds: string[],
  prodOrderIds: string[],
  afterState: ORDER_STATE,
  beforeState?: ORDER_STATE[],
  onOrder?: (o: GarmentOrder) => Promise<GarmentOrder>,
  onProdOrder?: (o: ProdOrder) => Promise<ProdOrder>,
  setTotalAmount = false
) {
  const orders = await OrderGarmentFB.batchRead(orderDbIds);

  const { getOrdRef, converterGarment } = getSrc();
  const shopIds: string[] = [];
  await runTransaction(iostore, async (transaction) => {
    for (let i = 0; i < orders.length; i++) {
      const o = onOrder ? await onOrder(orders[i]) : orders[i];
      if (!shopIds.includes(o.shopId)) shopIds.push(o.shopId);
      for (let j = 0; j < o.items.length; j++) {
        if (
          !beforeState ||
          (prodOrderIds.includes(o.items[j].id) &&
            beforeState.includes(o.items[j].state))
        ) {
          const item = onProdOrder ? await onProdOrder(o.items[j]) : o.items[j];
          o.setState(item.id, afterState);
          if (setTotalAmount) {
            o.setTotalAmount();
          }
          transaction.update(
            doc(getOrdRef(o.shopId), o.dbId),
            converterGarment.toFirestore(o)
          );
        }
      }
    }
  });
  await Promise.all(shopIds.map((x) => mergeOrders(afterState, x)));
}

async function mergeOrders(state: ORDER_STATE, shopId: string) {
  return await runTransaction(iostore, async (transaction) => {
    const { getOrdRef, converterGarment } = getSrc();
    const ordRef = getOrdRef(shopId);
    const orders: GarmentOrder[] = await getOrders([
      where("shopId", "==", shopId),
      where("states", "array-contains", state),
    ]);
    // <<< 주문요청전 주문들을 가져온다. <<<
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const vendorIds = order.vendorIds;
      const tarOrds = orders.filter((x) =>
        x.vendorIds.some((y) => vendorIds.includes(y))
      );
      for (let j = 0; j < order.items.length; j++) {
        const item = order.items[j];
        let exist: typeof order | null = null;
        for (let k = 0; k < tarOrds.length; k++) {
          const o = tarOrds[k];
          if (order.dbId === o.dbId) continue;
          for (let z = 0; z < o.items.length; z++) {
            const existItem = o.items[z];
            if (existItem.state !== state) continue;
            else if (item.vendorProdId === existItem.vendorProdId) {
              exist = o;
              // 이로직을 분리하여, 모든 주문건의 상태 변경 프로세스에 대하여 적용가능하도록
              exist.setOrderCnt(existItem.id, item.orderCnt, true);
              order.items.splice(j, 1);
              if (order.items.length < 1) {
                exist.orderIds = uniqueArr([
                  ...order.orderIds,
                  ...exist.orderIds,
                ]);
                exist.itemIds = uniqueArr([...order.itemIds, ...exist.itemIds]);
                transaction.delete(doc(ordRef, order.dbId));
              } else {
                transaction.update(
                  doc(ordRef, order.dbId),
                  converterGarment.toFirestore(
                    order
                  ) as WithFieldValue<GarmentOrder | null>
                );
              }
              if (exist) {
                transaction.update(
                  doc(ordRef, exist.dbId),
                  converterGarment.toFirestore(exist)
                );
              }
              break;
            }
          }
        }
      }
    }
  });
}
