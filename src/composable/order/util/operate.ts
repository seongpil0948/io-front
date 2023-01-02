import { PAY_METHOD } from "@/composable";
import { PAID_INFO } from "@/composable/common";
import { uuidv4 } from "@firebase/util";
import { uniqueArr } from "@io-boxies/js-lib";
import cloneDeep from "lodash.clonedeep";
import { refreshOrder } from ".";
import { ORDER_GARMENT_DB } from "../db";
import {
  IoOrder,
  OrderAmount,
  OrderItem,
  OrderItemCombined,
  ORDER_STATE,
} from "../domain";
import {
  getPendingCnt,
  getActiveCnt,
  getPureAmount,
  getOrderAmount,
  getOrderItems,
} from "./getter";
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
  item.amount.paid = paid;
  item.amount.pureAmount = pureAmount;
  item.amount.orderAmount = getOrderAmount(item.amount);
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
    ts[0].beforeState = ts[0].state;
    ts[0].state = state;
    order.states = uniqueArr(order.items.map((x) => x.state));
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
    paid: item.amount.paid,
  });
  const newOrder: OrderItemCombined = (
    d.order.items as OrderItemCombined[]
  ).find((x) => x.id === id)!;
  setOrderCnt({
    order: d.order,
    orderItemId: item.id,
    orderCnt: item.orderCnt - newOrder.orderCnt,
    add: false,
    paid: item.amount.paid,
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
  if (d.update) {
    await ORDER_GARMENT_DB.updateOrder(d.order);
  }
  return newOrder.id;
}

export async function deleteItem(d: { order: IoOrder; itemId: string }) {
  const idx = d.order.items.findIndex((x) => x.id === d.itemId);
  if (idx === -1)
    throw new Error(`order(${d.order.dbId}) not has item(${d.itemId})`);
  d.order.items.splice(idx, 1);
  if (d.order.items.length > 0) {
    refreshOrder(d.order);
    await ORDER_GARMENT_DB.updateOrder(d.order);
  } else {
    await ORDER_GARMENT_DB.deleteOrder(d.order);
  }
}

export interface DefrayParam {
  paidAmount: number;
  tax: number;
  payMethod: PAY_METHOD;
}
export function defrayAmount(target: OrderAmount, d: DefrayParam) {
  const t = cloneDeep(target);
  t.tax = d.tax;
  t.orderAmount = getOrderAmount(t);
  t.paidAt = new Date();
  t.paidAmount = d.paidAmount;
  t.paymentConfirm = true;
  t.paymentMethod = d.payMethod;
  const creditAmount = t.orderAmount - t.paidAmount;
  if (t.orderAmount === t.paidAmount) {
    t.paid = "EXACT";
  } else if (t.orderAmount > t.paidAmount) {
    t.paid = "CREDIT";
  } else if (t.orderAmount < t.paidAmount) {
    t.paid = "OVERCOME";
  }
  return { newAmount: t, creditAmount };
}
