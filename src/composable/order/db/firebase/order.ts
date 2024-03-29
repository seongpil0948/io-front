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
  writeBatch,
  deleteDoc,
  increment,
  setDoc,
} from "@firebase/firestore";
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
  VENDOR_GARMENT_DB,
  IoUser,
  deleteItem,
  newOrdFromItem,
  checkOrderShipLocate,
  getPickId,
  newPayAmount,
  newPayHistory,
  USER_DB,
  PayAmount,
  userFireConverter,
  addExistItems,
} from "@/composable";
import { IO_COSTS } from "@/constants";
import {
  ioFireStore,
  getIoCollection,
  getIoCollectionGroup,
  IoCollection,
} from "@/plugin/firebase";
import { insertById } from "@io-boxies/js-lib";

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
      getIoCollectionGroup(ioFireStore, IoCollection.ORDER_PROD).withConverter(
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
  updateOrder: async function (order, itemId) {
    if (itemId) {
      const item = order.items.find((x) => x.id === itemId);
      if (item) item.od.updatedAt = new Date();
    }
    return insertById<IoOrder>(
      order,
      getIoCollection(ioFireStore, {
        c: IoCollection.ORDER_PROD,
        uid: order.shopId,
      }),
      order.dbId,
      true,
      orderFireConverter
    );
  },
  /**
   * 요청한 주문 아이템들을 모아 한개의 주문건을 생성.
   * 픽업료 산정: 픽업건물[도매처ID] = [OrderItem]
   * targetState 에 속한 주문건들이 이미 존재할 경우
   *  지역별 배송 금액은 0원, 건물별픽업금액은  도매처 ID를 삭제후 계산한다.
   * @beta
   */
  reqPickup: async function (
    orderDbIds: string[],
    orderItemIds: string[],
    uncleId: string,
    shopId: string,
    isDirect: boolean
  ) {
    const { getUserDocRef, getOrdRef, getPayDocRef, getPayHistDocRef } =
      getSrc();
    const orders = await OrderGarmentFB.batchRead(orderDbIds);
    const afterState: ORDER_STATE = "BEFORE_APPROVE_PICKUP";
    if (orders.length < 1) throw new Error("주문건이 없습니다.");
    await runTransaction(ioFireStore, async (t) => {
      // >>> combine items >>>
      const targetItems: OrderItem[] = [];
      for (let i = 0; i < orders.length; i++) {
        const o = orders[i];
        for (let j = 0; j < o.items.length; j++) {
          const item = o.items[j];
          if (shopId !== item.shopId || !orderItemIds.includes(item.id))
            continue;
          targetItems.push(deleteItem({ order: o, itemId: item.id }));
        }
      }
      const cOrder = newOrdFromItem(targetItems); // combined order
      cOrder.isDirectToShip = isDirect;
      console.log("new combined order ", cOrder);
      // <<< combine items <<<

      // get users data
      const getU = async (uid: string) =>
        (await t.get(getUserDocRef(uid))).data() ?? null;
      const shop = await getU(shopId);
      if (!shop) throw new Error("쇼핑몰 계정이 존재하지 않습니다.");
      const shopPay = await IO_PAY_DB.getIoPayByUser(shopId);
      const uncle = await getU(uncleId);
      if (!uncle) throw new Error("엉클 관리자 계정이 존재하지 않습니다.");
      const vendorIds = uniqueArr(cOrder.items.map((x) => x.vendorId));
      const vs = await Promise.all(
        vendorIds.map((vid) => USER_DB.getUserById(ioFireStore, vid, true))
      );
      const vendors = vs.filter((y) => y !== null) as IoUser[];

      const pickPriceCnt: PriceCnt = {};
      let shipPrice = 0;
      let shipPendingPrice =
        (uncle as IoUser).uncleInfo?.shipPendingAmount ?? 0;
      if (shipPendingPrice < 0)
        throw new Error(
          `배송 보류금액(${shipPendingPrice})을 -1원 이상으로 설정 해주세요.`
        );
      for (let i = 0; i < cOrder.items.length; i++) {
        const item = cOrder.items[i];
        const vendor = vendors.find((v) => v.userInfo.userId === item.vendorId);
        if (!vendor) throw new Error("도매 유저가 존재하지 않습니다.");
        const { pickLocateUncle, shipLocateUncle } = checkOrderShipLocate(
          item,
          shop as IoUser,
          vendor,
          uncle as IoUser
        );
        const shipId = shipLocateUncle.locate.code;
        if (!shipId) throw new Error("ship locate id not exist");
        console.log("initial pickPriceCnt: ", pickPriceCnt);
        console.log("shipPrice: ", shipPrice);
        const pickId = getPickId(pickLocateUncle.locate);
        _setCnt(pickPriceCnt, pickId, item, pickLocateUncle.amount);
        shipPrice = shipLocateUncle.amount;
        // _setCnt(shipPriceCnt, shipId, item, shipLocateUncle.amount);

        item.shipManagerId = uncleId;
        setState(cOrder, item.id, afterState);
      }
      const goDefray = (amount: PayAmount) => {
        const { newAmount } = defrayAmount(amount, {}, true);
        return newAmount;
      };
      const targetState: ORDER_STATE[] = [afterState, "BEFORE_ASSIGN_PICKUP"];
      const existOrders: IoOrder[] = await getOrders([
        where("shopId", "==", shopId),
        where("shipManagerId", "==", uncleId),
        where("states", "array-contains-any", targetState),
      ]);
      if (existOrders.length > 0) {
        // 동일 픽업 건물 있을 경우: 픽업료 미부과
        shipPrice = 0;
        shipPendingPrice = 0;
        for (let k = 0; k < existOrders.length; k++) {
          const exist = existOrders[k];
          for (let z = 0; z < exist.items.length; z++) {
            const existItem = exist.items[z];
            if (targetState.includes(existItem.state)) {
              for (let b = 0; b < Object.values(pickPriceCnt).length; b++) {
                const pickObj = Object.values(pickPriceCnt)[b];
                if (pickObj.byVendor[existItem.vendorId]) {
                  delete pickObj.byVendor[existItem.vendorId];
                  break;
                }
              }
            }
          }
        }
      }
      console.log("after pickPriceCnt: ", pickPriceCnt);
      console.log("after shipPrice: ", shipPrice);
      // initial as pickPrice
      let pickupPrice = Object.entries(pickPriceCnt).reduce((acc, curr) => {
        const priceByBuild: number = curr[1].price;
        const vendorIds: string[] = Object.keys(curr[1].byVendor);
        return acc + priceByBuild * vendorIds.length;
      }, 0);
      if (cOrder.isDirectToShip) {
        pickupPrice += cOrder.prodAmount.amount;
        cOrder.items.forEach(
          (item) => (item.prodAmount = goDefray(item.prodAmount))
        );
      }
      pickupPrice += shipPrice;
      console.log("pick amount; ", pickupPrice);
      console.log("before defray cOrder: ", JSON.parse(JSON.stringify(cOrder)));
      cOrder.pickAmount = newPayAmount({ pureAmount: pickupPrice });
      cOrder.pickAmount = goDefray(cOrder.pickAmount);
      let totalPrice = cOrder.pickAmount.pendingAmount;
      cOrder.shipAmount = newPayAmount({ pureAmount: shipPendingPrice });
      cOrder.shipAmount = goDefray(cOrder.shipAmount);
      totalPrice += cOrder.shipAmount.amount;
      console.log("totalPrice: ", totalPrice);
      console.log("after defray cOrder: ", JSON.parse(JSON.stringify(cOrder)));
      if (!uncle.uncleInfo) throw new Error("엉클정보가 없습니다.");
      else if (shopPay.budget < totalPrice)
        throw new Error(
          `유저캐쉬(${shopPay.budget})가 필요캐쉬(${totalPrice}) 보다 작습니다.`
        );
      shopPay.budget -= totalPrice;
      shopPay.pendingBudget += totalPrice;
      const h = newPayHistory({
        amount: -totalPrice,
        pendingAmount: totalPrice,
        userId: shopPay.userId,
        state: "REQUEST_PICKUP",
      });
      t.set(getPayHistDocRef(h.userId), h);

      t.update(getPayDocRef(shopPay.userId), {
        budget: shopPay.budget,
        pendingBudget: shopPay.pendingBudget,
        updateAt: new Date(),
      });

      cOrder.shipManagerId = uncleId;
      refreshOrder(cOrder);
      t.set(doc(getOrdRef(shopId), cOrder.dbId), cOrder);

      // >>> furbish combined items >>>
      for (let z = 0; z < orders.length; z++) {
        const o = orders[z];
        refreshOrder(o);
        const docRef = doc(getOrdRef(shopId), o.dbId);
        if (o.items.length < 1) t.delete(docRef);
        else t.set(docRef, o);
      }
      console.log("after orders combine", orders);
      // <<< furbish combined items <<<
      return cOrder;
    });
    return mergeSameOrders(afterState, shopId);
  },
  rejectPickup: async function (orderDbIds: string[]) {
    const { getOrdRef, getPayDocRef, getPayHistDocRef } = getSrc();
    const orders = await OrderGarmentFB.batchRead([...new Set(orderDbIds)]);
    await runTransaction(ioFireStore, async (t) => {
      const totalPrice: { [uid: string]: number } = {};
      for (let i = 0; i < orders.length; i++) {
        const ord = orders[i];
        console.log("before reject order: ", JSON.parse(JSON.stringify(ord)));
        if (!totalPrice[ord.shopId]) {
          totalPrice[ord.shopId] = 0;
        }
        totalPrice[ord.shopId] += ord.pickAmount.amount + ord.shipAmount.amount;
        ord.shipAmount = newPayAmount({});
        ord.pickAmount = newPayAmount({});
        ord.items.forEach((item) => {
          if (!item.beforeState)
            throw new Error(
              `order(${ord.dbId}), item(${item.id}) 이전 주문상태가 없어 거절할 수 없습니다.`
            );
          delete ord.shipManagerId;
          item.prodAmount = newPayAmount({
            pureAmount: item.prodAmount.pureAmount,
            amount: item.prodAmount.amount,
          });
          setState(ord, item.id, item.beforeState);
        });
        refreshOrder(ord);
        const docRef = doc(getOrdRef(ord.shopId), ord.dbId);
        console.log("after reject order: ", ord);
        t.set(docRef, ord);
      }
      for (let j = 0; j < Object.keys(totalPrice).length; j++) {
        const shopId = Object.keys(totalPrice)[j];
        const shopPay = await IO_PAY_DB.getIoPayByUser(shopId);
        console.log(
          `before reject pay(${shopId}), total price: ${totalPrice[shopId]}`,
          JSON.parse(JSON.stringify(shopPay))
        );
        const { newPay, history } = shopPay.updateIoPay(
          "REJECT_PICKUP",
          totalPrice[shopId],
          -totalPrice[shopId]
        );
        console.log("after reject pay: ", newPay, history);
        t.set(getPayHistDocRef(history.userId), history);
        t.update(getPayDocRef(newPay.userId), {
          budget: newPay.budget,
          pendingBudget: newPay.pendingBudget,
          updateAt: newPay.updatedAt ?? new Date(),
        });
      }
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
        console.log("before amount", po.prodAmount);
        const { newAmount, creditAmount } = defrayAmount(
          po.prodAmount,
          param[po.id]!
        );
        po.prodAmount = newAmount;
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
    await stateModify({
      orderDbIds,
      orderItemIds,
      afterState: "BEFORE_PICKUP_REQ",
      beforeState: ["BEFORE_READY"],
      onItem: async function (po) {
        // po.orderCnt
        const vendorProd = await VENDOR_GARMENT_DB.getById(
          po.vendorProd.vendorProdId
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

    let vendorId: string | null = null;
    await runTransaction(ioFireStore, async (transaction) => {
      const { getOrdRef, getPayDocRef, getPayHistDocRef } = getSrc();
      // 2. update order state, reduce shop coin
      for (let i = 0; i < orders.length; i++) {
        const o = orders[i];
        for (let j = 0; j < o.items.length; j++) {
          const item = o.items[j];
          if (!vendorId && item.vendorId) vendorId = item.vendorId;
          if (
            orderItemIds.includes(item.id) &&
            (item.state === "BEFORE_APPROVE" || item.state === "BEFORE_PAYMENT")
          ) {
            setState(o, item.id, "BEFORE_ORDER");
            transaction.set(doc(getOrdRef(o.shopId), o.dbId), o);
            processedShops[o.shopId] += 1;
          }
        }
      }

      const entries = Object.entries(processedShops);
      for (let k = 0; k < entries.length; k++) {
        const [shopId, cnt] = entries[k];
        const shopPay = await IO_PAY_DB.getIoPayByUser(shopId);
        const cost = IO_COSTS.REQ_ORDER * cnt;
        const h = newPayHistory({
          createdAt: new Date(),
          userId: vendorId ?? "",
          amount: cost,
          pendingAmount: -cost,
          state: "ORDER_REJECT",
        });
        transaction.set(getPayHistDocRef(h.userId), h);
        transaction.update(getPayDocRef(shopId), {
          pendingBudget: shopPay.pendingBudget - cost,
          budget: shopPay.budget + cost,
          updatedAt: new Date(),
        });
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
    await runTransaction(ioFireStore, async (transaction) => {
      const { getOrdRef, getPayDocRef, getPayHistDocRef } = getSrc();
      // 1. vendor pay
      const vendorPay = await IO_PAY_DB.getIoPayByUser(vendorId);
      const vReduceCoin = shopIds.length * IO_COSTS.APPROVE_ORDER;
      if (vendorPay.budget < vReduceCoin) {
        throw new Error("유저 금액이 부족합니다.");
      }
      vendorPay.budget -= vReduceCoin;
      transaction.update(getPayDocRef(vendorId), {
        budget: vendorPay.budget,
        updatedAt: new Date(),
      });
      const h = newPayHistory({
        createdAt: new Date(),
        userId: vendorId,
        amount: -vReduceCoin,
        pendingAmount: 0,
        state: "ORDER_APPROVE",
      });
      transaction.set(getPayHistDocRef(h.userId), h);
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
            transaction.set(doc(getOrdRef(o.shopId), o.dbId), o);
            processedShops[o.shopId] += 1;
          }
        }
      }

      const entries = Object.entries(processedShops);
      for (let k = 0; k < entries.length; k++) {
        const [shopId, cnt] = entries[k];
        const shopPay = await IO_PAY_DB.getIoPayByUser(shopId);
        const cost = IO_COSTS.APPROVE_ORDER * cnt;
        if (shopPay.pendingBudget < cost)
          throw new Error(
            `shop(${shopId}) not enough pendingBudget(${cost}) for request order`
          );
        transaction.update(getPayDocRef(shopId), {
          pendingBudget: shopPay.pendingBudget - cost,
          updatedAt: new Date(),
        });
        const sh = newPayHistory({
          createdAt: new Date(),
          userId: vendorId,
          amount: 0,
          pendingAmount: -cost,
          state: "ORDER_APPROVE",
        });
        transaction.set(getPayHistDocRef(sh.userId), sh);
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
    const { getOrdRef, orderFireConverter, getPayDocRef, getPayHistDocRef } =
      getSrc();
    const constraints = [where("dbId", "in", orderDbIds)];
    const orders = await getOrders(constraints);
    const userPay = await IO_PAY_DB.getIoPayByUser(shopId);
    const reduceCoin = IO_COSTS.REQ_ORDER * orderItemIds.length;
    if (userPay.budget < reduceCoin) throw new Error("보유 금액이 부족합니다.");

    const result = runTransaction(ioFireStore, async (transaction) => {
      const newOrds: IoOrder[] = [];
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        isValidOrder(order);
        const ordRef = getOrdRef(order.shopId);
        const ordDocRef = doc(ordRef, order.dbId).withConverter(
          orderFireConverter
        );
        const ordDoc = await transaction.get(ordDocRef);
        if (!ordDoc.exists()) throw new Error("order doc does not exist!");
        const ord = ordDoc.data()!;
        if (ord.items.length < 1) continue;
        for (let j = 0; j < ord.items.length; j++) {
          const item = ord.items[j];
          if (item.vendorProd.visible && item.vendorProd.visible !== "GLOBAL") {
            throw new Error("가상 상품은 주문 할 수 없습니다.");
          } else if (!orderItemIds.includes(item.id)) continue;
          const vendorRef = await transaction.get(
            doc(
              getIoCollection(ioFireStore, {
                c: IoCollection.USER,
              }).withConverter(userFireConverter),
              item.vendorId
            )
          );
          const vendor = vendorRef.data();
          const prod = await VENDOR_GARMENT_DB.getById(
            item.vendorProd.vendorProdId
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
        transaction.set(doc(getOrdRef(newOrd.shopId), newOrd.dbId), newOrd);
      }
      transaction.update(getPayDocRef(userPay.userId), {
        pendingBudget: userPay.pendingBudget + reduceCoin,
        budget: userPay.budget - reduceCoin,
        updatedAt: new Date(),
      });
      const uh = newPayHistory({
        createdAt: new Date(),
        userId: userPay.userId,
        amount: -reduceCoin,
        pendingAmount: +reduceCoin,
        state: "ORDER_GARMENT",
      });
      transaction.set(getPayHistDocRef(uh.userId), uh);
      return newOrds;
    });
    await mergeSameOrders("BEFORE_APPROVE", shopId);
    return result;
  },
  batchCreate: async function (uid: string, orders: IoOrder[]) {
    return await runTransaction(ioFireStore, async (transaction) => {
      const { getOrdRef, getOrderNumberRef } = getSrc();
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
                setOrderCnt({
                  order: exist,
                  orderItemId: existItem.id,
                  orderCnt: item.orderCnt,
                  add: true,
                });
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
            transaction.set(doc(ordRef, exist.dbId), exist);
          }
        }
        if (order.items.length > 0) {
          transaction.set<IoOrder | null>(doc(ordRef, order.dbId), order);
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
  /***
   TODO 주문건삭제시 shipment, , orderNumber, shipDoneImages(Storage) 도 지워져야함
   */
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
      getIoCollectionGroup(ioFireStore, IoCollection.ORDER_PROD).withConverter(
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
      async (err) => {
        await onFirestoreErr(name, err);
        throw err;
      },
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
      getIoCollectionGroup(ioFireStore, IoCollection.ORDER_PROD).withConverter(
        orderFireConverter
      ),
      // FIXME: where("isDone", "!=", false),
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
      async (err) => {
        await onFirestoreErr(name, err);
        throw err;
      },
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
      getIoCollectionGroup(ioFireStore, IoCollection.ORDER_PROD).withConverter(
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
      async (err) => {
        await onFirestoreErr(name, err);
        throw err;
      },
      () => onFirestoreCompletion(name)
    );

    return { unsubscribe };
  },
  getExistOrderIds: async function (shopId: string) {
    const ioc = getIoCollection(ioFireStore, {
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
    const { getOrdRef } = getSrc();
    const data: { [shopId: string]: ORDER_STATE } = {};
    await runTransaction(ioFireStore, async (transaction) => {
      const orders = await OrderGarmentFB.batchRead(orderDbIds);
      for (let i = 0; i < orders.length; i++) {
        const o = orders[i];
        for (let j = 0; j < o.items.length; j++) {
          const item = o.items[j];
          if (orderItemIds.includes(item.id)) {
            const state = item.beforeState ?? "BEFORE_PICKUP";
            setState(o, item.id, state);
            transaction.set(doc(getOrdRef(o.shopId), o.dbId), o);
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

    const { getOrdRef } = getSrc();
    const order = await OrderGarmentFB.readById(shopId, orderDbId);
    if (!order) throw new Error("주문 데이터 정보가 없습니다.");
    const item = validate(
      (order.items as OrderItem[]).find((x) => x.id === orderItemId)
    );

    const processing = async (i: OrderItem, c: OrderCancel) => {
      const paid = i.prodAmount.paid;
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
      await setDoc(doc(getOrdRef(order.shopId), order.dbId), order);
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
  orderDone: async function (
    orderDbIds: string[],
    orderItemIds: string[]
  ): Promise<void> {
    await stateModify({
      orderDbIds,
      orderItemIds,
      afterState: "ORDER_DONE",
    });
  },
};

export function getSrc() {
  const batch = writeBatch(ioFireStore);
  const getOrdRef = (shopId: string) =>
    getIoCollection(ioFireStore, {
      c: IoCollection.ORDER_PROD,
      uid: shopId,
    }).withConverter(orderFireConverter);
  const getOrderNumberRef = (shopId: string) =>
    getIoCollection(ioFireStore, {
      c: IoCollection.ORDER_PROD_NUMBER,
      uid: shopId,
    });
  const getUserDocRef = (uid: string) =>
    doc(getIoCollection(ioFireStore, { c: "USER" }), uid).withConverter(
      userFireConverter
    );
  const getPayDocRef = (uid: string) =>
    doc(getIoCollection(ioFireStore, { c: "IO_PAY" }), uid);
  const getPayHistDocRef = (uid: string) =>
    doc(getIoCollection(ioFireStore, { c: "PAY_HISTORY", uid }));
  return {
    batch,
    getOrdRef,
    getOrderNumberRef,
    orderFireConverter,
    getUserDocRef,
    getPayDocRef,
    getPayHistDocRef,
  };
}

async function stateModify(d: {
  orderDbIds: string[];
  orderItemIds: string[];
  afterState: ORDER_STATE;
  beforeState?: ORDER_STATE[];
  onItem?: (o: OrderItem) => Promise<OrderItem>;
}) {
  const orders = await OrderGarmentFB.batchRead(d.orderDbIds);

  const { getOrdRef } = getSrc();
  const shopIds: string[] = [];
  await runTransaction(ioFireStore, async (transaction) => {
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
        // if (
        //   item.vendorProd.visible &&
        //   item.vendorProd.visible !== "GLOBAL" &&
        //   !d.okVirtual
        // ) {
        //   throw new Error("가상 상품은 주문 할 수 없습니다.");
        // }
        setState(o, item.id, d.afterState);
      }
      refreshOrder(o);
      transaction.set(doc(getOrdRef(o.shopId), o.dbId), o);
    }
  });
  await Promise.all(shopIds.map((x) => mergeSameOrders(d.afterState, x)));
}

export async function mergeSameOrders(state: ORDER_STATE, shopId: string) {
  return await runTransaction(ioFireStore, async (transaction) => {
    const { getOrdRef } = getSrc();
    const ordRef = getOrdRef(shopId);
    const orders: IoOrder[] = await getOrders([
      where("shopId", "==", shopId),
      where("states", "array-contains", state),
    ]);
    addExistItems(
      orders.filter((ord) => ord.states.length === 1),
      async (o) => {
        transaction.set(doc(ordRef, o.dbId), o);
      },
      async (o) => {
        transaction.delete(doc(ordRef, o.dbId));
      },
      (a) => a.state === state
    );
  });
}

// export async function mergeSameOrders(state: ORDER_STATE, shopId: string) {
//   return await runTransaction(ioFireStore, async (transaction) => {
//     const { getOrdRef } = getSrc();
//     const ordRef = getOrdRef(shopId);
//     const orders: IoOrder[] = await getOrders([
//       where("shopId", "==", shopId),
//       where("states", "array-contains", state),
//     ]);
//     for (let i = 0; i < orders.length; i++) {
//       const order = orders[i];
//       const vendorIds = order.vendorIds;
//       const tarOrds = orders.filter((x) =>
//         x.vendorIds.some((y) => vendorIds.includes(y))
//       );
//       for (let j = 0; j < order.items.length; j++) {
//         const item = order.items[j];
//         let exist: typeof order | null = null;
//         for (let k = 0; k < tarOrds.length; k++) {
//           const o = tarOrds[k];
//           if (order.dbId === o.dbId) continue;
//           for (let z = 0; z < o.items.length; z++) {
//             const existItem = o.items[z];
//             if (existItem.state !== state) continue;
//             else if (
//               item.state === existItem.state &&
//               item.shopProd.shopProdId === existItem.shopProd.shopProdId &&
//               item.orderType === existItem.orderType
//             ) {
//               exist = o;
//               setOrderCnt({
//                 order: exist,
//                 orderItemId: existItem.id,
//                 orderCnt: item.orderCnt,
//                 add: true,
//                 refresh: false
//               });
//               order.items.splice(j, 1);
//               order.itemIds.splice(
//                 order.itemIds.findIndex((oid) => oid === item.id),
//                 1
//               );
//               if (order.items.length < 1) {
//                 exist.orderIds = uniqueArr([
//                   ...order.orderIds,
//                   ...exist.orderIds,
//                 ]);
//                 exist.itemIds = uniqueArr([...order.itemIds, ...exist.itemIds]);
//                 transaction.delete(doc(ordRef, order.dbId));
//               } else {
//                 transaction.set(doc(ordRef, order.dbId), order);
//               }
//               if (exist) {
//                 transaction.set(doc(ordRef, exist.dbId), exist);
//               }
//               break;
//             }
//           }
//         }
//       }
//     }
//   });
// }

type PriceCnt = {
  [pickId: string]: {
    price: number;
    byVendor: { [vid: string]: OrderItem[] };
  };
};

function _setCnt(obj: PriceCnt, id: string, item: OrderItem, amount: number) {
  if (!obj[id]) {
    obj[id] = {
      price: amount,
      byVendor: {},
    };
    obj[id].byVendor[item.vendorId] = [item];
  } else if (!obj[id].byVendor[item.vendorId]) {
    obj[id].byVendor[item.vendorId] = [item];
  } else if (obj[id] && obj[id].byVendor[item.vendorId]) {
    obj[id].byVendor[item.vendorId].push(item);
  }
}
