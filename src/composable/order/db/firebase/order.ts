import {
  iostore,
  getIoCollection,
  getIoCollectionGroup,
  IoCollection,
  insertById,
} from "@io-boxies/js-lib";
import { uniqueArr } from "@/util";
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
  deleteDoc,
  increment,
} from "@firebase/firestore";
import { useVendorsStore } from "@/store";
import { Ref } from "vue";
import {
  IoOrder,
  IO_PAY_DB,
  onFirestoreCompletion,
  onFirestoreErr,
  OrderCancel,
  OrderDB,
  ORDER_STATE,
  OrderItem,
  orderFireConverter,
  setOrderCnt,
  setState,
  isValidOrder,
  refreshOrder,
  dividePartial,
  defrayAmount,
  DefrayParam,
  reduceStockCnt,
  getPartnerDoc,
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
  const orders: IoOrder[] = [];
  const docs = await getDocs(
    query(
      getIoCollectionGroup(IoCollection.ORDER_PROD).withConverter(
        orderFireConverter
      ),
      ...constraints
    )
  );
  console.log("order snap from cache " + docs.metadata.fromCache);
  docs.forEach((doc) => {
    const data = doc.data();
    if (data) {
      orders.push(data);
    }
  });
  return orders;
}

export const OrderGarmentFB: OrderDB<IoOrder> = {
  deleteOrder: async function (order) {
    if (order.items.length > 0) throw new Error("order has items not blank");
    const { getOrdRef } = getSrc();
    await deleteDoc(doc(getOrdRef(order.shopId), order.dbId));
  },
  updateOrder: async function (order) {
    return insertById<IoOrder>(
      order,
      getIoCollection({ c: IoCollection.ORDER_PROD, uid: order.shopId }),
      order.dbId,
      true,
      orderFireConverter
    );
  },
  reqPickup: async function (
    orderDbIds: string[],
    orderItemIds: string[],
    uncleId: string
  ) {
    await stateModify({
      orderDbIds,
      orderItemIds,
      afterState: "BEFORE_APPROVE_PICKUP",
      onItem: async function (o) {
        o.shipManagerId = uncleId;
        return o;
      },
    });
  },
  completePay: async function (
    orderDbIds: string[],
    orderItemIds: string[],
    shopId: string,
    vendorId: string,
    param: { [itemId: string]: DefrayParam }
  ) {
    let addedCredit = 0;
    await stateModify({
      orderDbIds,
      orderItemIds,
      afterState: "BEFORE_READY",
      beforeState: ["BEFORE_PAYMENT"],
      onItem: async function (po) {
        console.log("before amount", po.amount);
        const { newAmount, creditAmount } = defrayAmount(
          po.amount,
          param[po.id]!
        );
        po.amount = newAmount;
        addedCredit += creditAmount;
        return po;
      },
    });
    console.info("addedCredit: ", addedCredit);
    await updateDoc(getPartnerDoc({ shopId, vendorId }), {
      credit: increment(addedCredit),
    });
  },
  orderToReady: async function (orderDbIds: string[], orderItemIds: string[]) {
    const vendorStore = useVendorsStore();

    await stateModify({
      orderDbIds,
      orderItemIds,
      afterState: "BEFORE_PICKUP_REQ",
      beforeState: ["BEFORE_READY"],
      onItem: async function (po) {
        // po.orderCnt
        const vendorProd = vendorStore.vendorProds.find(
          (x) => x.vendorProdId === po.vendorProd.vendorProdId
        );
        if (!vendorProd)
          throw new Error(
            `vendor prod ${po.vendorProd.vendorProdId} is not exist`
          );
        else {
          return reduceStockCnt(vendorProd, po);
        }
      },
    });
  },
  orderReject: async function (orderDbIds: string[], orderItemIds: string[]) {
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
            orderItemIds.includes(item.id) &&
            (item.state === "BEFORE_APPROVE" || item.state === "BEFORE_PAYMENT")
          ) {
            setState(o, item.id, "BEFORE_ORDER");
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
      Object.keys(processedShops).map((x) => mergeSameOrders("BEFORE_ORDER", x))
    );
  },
  orderApprove: async function (
    vendorId: string,
    orderDbIds: string[],
    orderItemIds: string[]
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
            orderItemIds.includes(item.id) &&
            item.state === "BEFORE_APPROVE"
          ) {
            setState(o, item.id, "BEFORE_PAYMENT");
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
      Object.keys(processedShops).map((x) =>
        mergeSameOrders("BEFORE_PAYMENT", x)
      )
    );
  },
  orderGarment: async function (
    orderDbIds: string[],
    orderItemIds: string[],
    shopId: string
  ) {
    const vendorStore = useVendorsStore();
    const { getOrdRef, converterGarment } = getSrc();
    const constraints = [where("dbId", "in", orderDbIds)];
    const orders = await getOrders(constraints);
    const userPay = await IO_PAY_DB.getIoPayByUser(shopId);
    const reduceCoin = IO_COSTS.REQ_ORDER * orderItemIds.length;
    if (userPay.budget < reduceCoin) throw new Error("보유 코인이 부족합니다.");

    const result = runTransaction(iostore, async (transaction) => {
      const newOrds: IoOrder[] = [];
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        isValidOrder(order);
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
          if (!orderItemIds.includes(item.id)) continue;
          const vendor = vendorStore.vendorById[item.vendorId];
          const prod = vendorStore.vendorProds.find(
            (g) => g.vendorProdId === item.vendorProd.vendorProdId
          );
          if (!prod)
            throw new Error(
              `vendor vendorProd does not exist!: ${item.vendorProd.vendorProdId}`
            );
          else if (!vendor)
            throw new Error(`vendor user does not exist!: ${item.vendorId}`);
          else if (item.orderCnt > prod.stockCnt && !prod.allowPending) {
            throw new Error(
              `out of stock(${prod.stockCnt}) order(${ord.dbId})(${item.id}) cnt: ${item.orderCnt} }`
            );
          }
          setState(ord, item.id, "BEFORE_APPROVE");
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
    await mergeSameOrders("BEFORE_APPROVE", shopId);
    return result;
  },
  batchCreate: async function (uid: string, orders: IoOrder[]) {
    return await runTransaction(iostore, async (transaction) => {
      const { getOrdRef, getOrderNumberRef, converterGarment } = getSrc();
      const ordRef = getOrdRef(uid);
      const ordNumRef = getOrderNumberRef(uid);
      const ordIds = await this.getExistOrderIds(uid);
      const existOrders: IoOrder[] = await getOrders([
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
              else if (
                item.vendorProd.vendorProdId ===
                existItem.vendorProd.vendorProdId
              ) {
                exist = o;
                // 이로직을 분리하여, 모든 주문건의 상태 변경 프로세스에 대하여 적용가능하도록
                setOrderCnt(exist, existItem.id, item.orderCnt, true);
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
          transaction.set<IoOrder | null>(
            doc(ordRef, order.dbId),
            converterGarment.toFirestore(
              order
            ) as WithFieldValue<IoOrder | null>
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
  batchDelete: async function (ords: IoOrder[]) {
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
    orders: Ref<IoOrder[]>;
  }) {
    const constraints = [where("shopId", "==", p.shopId)];

    if (p.inStates && p.inStates.length > 0) {
      constraints.push(where("states", "array-contains-any", p.inStates));
    }
    const q = query(
      getIoCollectionGroup(IoCollection.ORDER_PROD).withConverter(
        orderFireConverter
      ),
      ...constraints
    );
    const name = "shopReadOrder snapshot";
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        p.orders.value = [];
        console.log("order snap from cache " + snapshot.metadata.fromCache);
        snapshot.forEach((s) => {
          const data = s.data();
          if (data) {
            p.orders.value.push(data);
          }
        });
      },
      async (err) => await onFirestoreErr(name, err),
      () => onFirestoreCompletion(name)
    );
    return { unsubscribe };
  },
  vendorReadListen: function (p: {
    inStates?: ORDER_STATE[];
    vendorId: string;
    orders: Ref<IoOrder[]>;
  }) {
    const orderQ = query(
      getIoCollectionGroup(IoCollection.ORDER_PROD).withConverter(
        orderFireConverter
      ),
      where("vendorIds", "array-contains", p.vendorId)
    );
    const name = "vendorReadListen snapshot";
    const unsubscribe = onSnapshot(
      orderQ,
      (snapshot) => {
        p.orders.value = [];
        console.log(
          "vendor order snap from cache " + snapshot.metadata.fromCache
        );
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
      },
      async (err) => await onFirestoreErr(name, err),
      () => onFirestoreCompletion(name)
    );

    return { unsubscribe };
  },
  uncleReadListen: function (p: {
    inStates?: ORDER_STATE[];
    uncleId: string;
    orders: Ref<IoOrder[]>;
  }) {
    console.log("p.uncleId: ", p.uncleId);
    const orderQ = query(
      getIoCollectionGroup(IoCollection.ORDER_PROD).withConverter(
        orderFireConverter
      ),
      where("shipManagerId", "==", p.uncleId)
    );
    const name = "uncleReadListen snapshot";
    const unsubscribe = onSnapshot(
      orderQ,
      (snapshot) => {
        p.orders.value = [];
        console.log(
          "uncle order snap from cache " + snapshot.metadata.fromCache
        );
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
      },
      async (err) => await onFirestoreErr(name, err),
      () => onFirestoreCompletion(name)
    );

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
  ): Promise<IoOrder[]> {
    const orders: IoOrder[] = [];
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
    orderItemIds: string[]
  ): Promise<void> {
    await stateModify({
      orderDbIds,
      orderItemIds,
      afterState: "RETURN_REQ",
    });
  },
  returnApprove: async function (
    orderDbIds: string[],
    orderItemIds: string[]
  ): Promise<void> {
    await stateModify({
      orderDbIds,
      orderItemIds,
      afterState: "RETURN_APPROVED",
      beforeState: ["RETURN_REQ"],
      onItem: async function (po) {
        po.orderType = "RETURN";
        return po;
      },
    });
  },
  returnReject: async function (
    orderDbIds: string[],
    orderItemIds: string[]
  ): Promise<void> {
    const { getOrdRef, converterGarment } = getSrc();
    const data: { [shopId: string]: ORDER_STATE } = {};
    await runTransaction(iostore, async (transaction) => {
      const orders = await OrderGarmentFB.batchRead(orderDbIds);
      for (let i = 0; i < orders.length; i++) {
        const o = orders[i];
        for (let j = 0; j < o.items.length; j++) {
          const item = o.items[j];
          if (orderItemIds.includes(item.id)) {
            const state = item.beforeState ?? "BEFORE_PICKUP";
            setState(o, item.id, state);
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
      Object.entries(data).map(([shopId, state]) =>
        mergeSameOrders(state, shopId)
      )
    );
  },
  returnDone: async function (): Promise<void> {
    throw new Error("Function not implemented.");
  },
  cancelReq: async function (
    shopId: string,
    orderDbId: string,
    orderItemId: string,
    claim: OrderCancel,
    cancelCnt: number
  ): Promise<void> {
    const validate = (i: OrderItem | undefined) => {
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
    const item = validate(
      (order.items as OrderItem[]).find((x) => x.id === orderItemId)
    );

    const processing = async (i: OrderItem, c: OrderCancel) => {
      const paid = i.amount.paid;
      if (paid === "NO") {
        c.done = true;
        c.canceledDate = new Date();
        i.cancellation = c;
        setState(order, i.id, "ORDER_DONE");
      } else {
        i.cancellation = c;
        setState(order, i.id, "CANCEL");
      }
      refreshOrder(order);
      await updateDoc(
        doc(getOrdRef(order.shopId), order.dbId),
        converterGarment.toFirestore(order)
      );
      mergeSameOrders("CANCEL", "shopId");
    };

    if (item.orderCnt > cancelCnt) {
      const newId = await dividePartial({
        order,
        itemId: item.id,
        orderCnt: cancelCnt,
        update: false,
      });
      const itemDivided = validate(
        (order.items as OrderItem[]).find((x) => x.id === newId)
      );
      claim.orderItemId = newId;
      await processing(itemDivided, claim);
    } else {
      await processing(item, claim);
    }
  },
  cancelApprove: async function (
    orderDbIds: string[],
    orderItemIds: string[]
  ): Promise<void> {
    await stateModify({
      orderDbIds,
      orderItemIds,
      afterState: "ORDER_DONE",
      beforeState: ["CANCEL"],
      onItem: async function (po) {
        if (!po.cancellation)
          throw new Error(`po(${po.id}).cancellation not exist `);

        const claim = po.cancellation;
        if (claim.done || claim.canceledDate) return po;
        claim.done = true;
        claim.approved = true;
        claim.canceledDate = new Date();
        return po;
      },
    });
  },
  cancelReject: async function (
    orderDbIds: string[],
    orderItemIds: string[]
  ): Promise<void> {
    await stateModify({
      orderDbIds,
      orderItemIds,
      afterState: "BEFORE_READY",
      beforeState: ["CANCEL"],
      onItem: async function (po) {
        if (!po.cancellation)
          throw new Error(`po(${po.id}).cancellation not exist `);

        const claim = po.cancellation;
        if (claim.done || claim.canceledDate) return po;
        claim.done = true;
        claim.approved = false;
        return po;
      },
    });
  },
};

export function getSrc() {
  const converterGarment = orderFireConverter;
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

async function stateModify(d: {
  orderDbIds: string[];
  orderItemIds: string[];
  afterState: ORDER_STATE;
  beforeState?: ORDER_STATE[];
  onItem?: (o: OrderItem) => Promise<OrderItem>;
}) {
  const orders = await OrderGarmentFB.batchRead(d.orderDbIds);

  const { getOrdRef, converterGarment } = getSrc();
  const shopIds: string[] = [];
  await runTransaction(iostore, async (transaction) => {
    for (let i = 0; i < orders.length; i++) {
      const o = orders[i];
      if (!shopIds.includes(o.shopId)) shopIds.push(o.shopId);
      for (let j = 0; j < o.items.length; j++) {
        if (!d.beforeState && !d.orderItemIds.includes(o.items[j].id)) continue;
        else if (
          d.beforeState &&
          (!d.beforeState.includes(o.items[j].state) ||
            !d.orderItemIds.includes(o.items[j].id))
        ) {
          continue;
        }

        const item = d.onItem
          ? await d.onItem(o.items[j] as OrderItem)
          : o.items[j];
        setState(o, item.id, d.afterState);
      }
      refreshOrder(o);
      transaction.set(
        doc(getOrdRef(o.shopId), o.dbId),
        converterGarment.toFirestore(o)
      );
    }
  });
  await Promise.all(shopIds.map((x) => mergeSameOrders(d.afterState, x)));
}

async function mergeSameOrders(state: ORDER_STATE, shopId: string) {
  return await runTransaction(iostore, async (transaction) => {
    const { getOrdRef, converterGarment } = getSrc();
    const ordRef = getOrdRef(shopId);
    const orders: IoOrder[] = await getOrders([
      where("shopId", "==", shopId),
      where("states", "array-contains", state),
    ]);
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
            else if (
              item.vendorProd.vendorProdId === item.vendorProd.vendorProdId &&
              item.shopProd.shopProdId === existItem.shopProd.shopProdId &&
              item.orderType === existItem.orderType
            ) {
              exist = o;
              setOrderCnt(exist, existItem.id, item.orderCnt, true);
              order.items.splice(j, 1);
              order.itemIds.splice(
                order.itemIds.findIndex((oid) => oid === item.id),
                1
              );
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
                  orderFireConverter.toFirestore(order)
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
