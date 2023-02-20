import { PAID_INFO } from "@/composable/common";
import { uuidv4 } from "@firebase/util";
import { uniqueArr } from "@io-boxies/js-lib";
import cloneDeep from "lodash.clonedeep";
import {
  getAmount,
  getPureAmount,
  mergeAmount,
  refreshAmount,
  refreshOrder,
} from ".";
import { ORDER_GARMENT_DB } from "../db";
import { IoOrder, OrderItem, OrderItemCombined, ORDER_STATE } from "../domain";
import { getPendingCnt, getActiveCnt, getOrderItems } from "./getter";
import { isValidOrderItem, isValidOrder } from "./validate";

export function setOrderCnt(d: {
  order: IoOrder;
  orderItemId: string;
  orderCnt: number;
  add?: boolean;
  paid?: PAID_INFO;
  orderId?: string;
}) {
  // add = true,
  //   paid = PAID_INFO.NO,
  // 0. find prod order
  const targetIdx = d.order.items.findIndex((x) => x.id === d.orderItemId);
  if (targetIdx < 0) throw new Error("orderItem not belong to order");
  const item: OrderItemCombined = (d.order.items as OrderItemCombined[])[
    targetIdx
  ];
  const v = item.vendorProd;
  setItemCnt(item, d.orderCnt, v.stockCnt, v.allowPending, d.add, d.paid);
  if (d.orderId) item.orderIds.push(d.orderId);
  refreshOrder(d.order);
  isValidOrder(d.order);
}
export function setItemCnt(
  item: OrderItem,
  orderCnt: number,
  stockCnt: number,
  allowPending: boolean,
  add = true,
  paid = PAID_INFO.NO
) {
  if (add) {
    orderCnt += item.orderCnt;
  }
  item.orderCnt = orderCnt;
  // 2. set pending cnt
  item.pendingCnt = getPendingCnt(stockCnt, orderCnt, allowPending);
  // 3. set active cnt
  item.activeCnt = getActiveCnt(orderCnt, item.pendingCnt);
  // 4. set prod order amount
  const pureAmount = getPureAmount(orderCnt, item.vendorProd.vendorPrice);
  item.prodAmount.paid = paid;
  item.prodAmount.pureAmount = pureAmount;
  item.prodAmount.amount = getAmount(item.prodAmount);
  try {
    isValidOrderItem(item);
  } catch (e) {
    throw new Error(
      `Invalid Prod Order: ${item.id} orderDbId: ${item.orderDbId}, error: ${e}`
    );
  }
}

export function setState(order: IoOrder, itemId: string, state: ORDER_STATE) {
  const ts = getOrderItems({ order, itemId });
  if (ts && ts.length > 0) {
    const currDate = new Date();
    ts[0].beforeState = ts[0].state;
    ts[0].state = state;
    ts[0].od[state] = currDate;
    order.states = uniqueArr(order.items.map((x) => x.state));
    order.od[state] = currDate;
  } else {
    throw new Error(`order item id ${itemId} not exist`);
  }
}

export async function dividePartial(d: {
  order: IoOrder;
  itemId: string;
  orderCnt: number;
  update: boolean;
}) {
  const item = (d.order.items as OrderItemCombined[]).find(
    (x) => x.id === d.itemId
  );
  if (!item) throw new Error("orderItemId not exist");
  else if (d.orderCnt < 0 || d.orderCnt > item.orderCnt) {
    throw new Error("invalid Cnt");
  }
  const id = uuidv4();
  const newOrd = cloneDeep(item);
  newOrd.id = id;
  (d.order.items as OrderItemCombined[]).push(newOrd);
  setOrderCnt({
    order: d.order,
    orderItemId: id,
    orderCnt: d.orderCnt,
    add: false,
    paid: item.prodAmount.paid,
  });
  const newOrder: OrderItemCombined = (
    d.order.items as OrderItemCombined[]
  ).find((x) => x.id === id)!;
  setOrderCnt({
    order: d.order,
    orderItemId: item.id,
    orderCnt: item.orderCnt - newOrder.orderCnt,
    add: false,
    paid: item.prodAmount.paid,
  });

  if (item.orderCnt < 1) {
    d.order.items.splice(
      d.order.items.findIndex((x) => x.id === item.id),
      1
    );
    d.order.itemIds.splice(
      d.order.itemIds.findIndex((x) => x === item.id),
      1
    );
  }

  d.order.itemIds.push(newOrder.id);
  refreshOrder(d.order);
  if (d.update) {
    await ORDER_GARMENT_DB.updateOrder(d.order);
  }
  return newOrder.id;
}

export function deleteItem(d: { order: IoOrder; itemId: string }) {
  const idx = d.order.items.findIndex((x) => x.id === d.itemId);
  if (idx === -1)
    throw new Error(`order(${d.order.dbId}) not has item(${d.itemId})`);
  const deletedItem = cloneDeep(d.order.items[idx]);
  d.order.items.splice(idx, 1);
  return deletedItem;
  // if (d.order.items.length > 0) {
  //   refreshOrder(d.order);
  //   await ORDER_GARMENT_DB.updateOrder(d.order);
  // } else {
  //   await ORDER_GARMENT_DB.deleteOrder(d.order);
  // }
}

export function addExistItem(o: IoOrder, itemId: string, item: OrderItem) {
  setOrderCnt({
    order: o,
    orderItemId: itemId,
    orderCnt: item.orderCnt,
    add: true,
  });
  const it = o.items.find((x) => x.id === itemId)!;
  it.prodAmount = mergeAmount(it.prodAmount, item.prodAmount);
  return o;
}

export function addExistItems(
  orders: IoOrder[],
  onSet: (order: IoOrder) => Promise<void>,
  onDelete: (order: IoOrder) => Promise<void>,
  isTargetItem: (a: OrderItem) => boolean
) {
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
        if (order.dbId === o.dbId || order.shipManagerId !== o.shipManagerId)
          continue;
        for (let z = 0; z < o.items.length; z++) {
          const existItem = o.items[z];
          if (!isTargetItem(existItem)) continue;
          else if (
            item.vendorProd.vendorProdId === item.vendorProd.vendorProdId &&
            item.shopProd.shopProdId === existItem.shopProd.shopProdId &&
            item.orderType === existItem.orderType &&
            existItem.state == item.state
          ) {
            exist = addExistItem(o, existItem.id, item);
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
              mergeAmount(exist.pickAmount, order.pickAmount);
              mergeAmount(exist.shipAmount, order.shipAmount);
              onDelete(order);
            } else {
              refreshOrder(order);
              onSet(order);
            }
            if (exist) {
              refreshOrder(exist);
              onSet(exist);
            }
            break;
          }
        }
      }
    }
  }
}
