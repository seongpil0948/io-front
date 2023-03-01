import { PAID_INFO } from "@/composable/common";
import { uuidv4 } from "@firebase/util";
import { uniqueArr } from "@io-boxies/js-lib";
import cloneDeep from "lodash.clonedeep";
import { getAmount, getPureAmount, refreshOrder } from ".";
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
