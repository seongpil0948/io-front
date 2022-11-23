import { BOOL_M } from "@/composable/common";
import { uuidv4 } from "@firebase/util";
import { uniqueArr } from "@io-boxies/js-lib";
import cloneDeep from "lodash.clonedeep";
import { refreshOrder } from ".";
import { ORDER_GARMENT_DB } from "../db";
import { IoOrder, OrderItemCombined, ORDER_STATE } from "../domain";
import {
  getPendingCnt,
  getActiveCnt,
  getPureAmount,
  getOrderAmount,
  getOrderItems,
} from "./getter";
import { isValidOrderItem, isValidOrder } from "./validate";

export function setOrderCnt(
  order: IoOrder,
  prodOrderId: string,
  orderCnt: number,
  add = true,
  paid = BOOL_M.F
) {
  // 0. find prod order
  const targetIdx = order.items.findIndex((x) => x.id === prodOrderId);
  if (targetIdx < 0) throw new Error("orderItem not belong to order");
  const item: OrderItemCombined = (order.items as OrderItemCombined[])[
    targetIdx
  ];

  if (add) {
    orderCnt += item.orderCnt;
  }
  const v = item.vendorProd;
  // 1. set Order Cnt
  item.orderCnt = orderCnt;
  // 2. set pending cnt
  item.pendingCnt = getPendingCnt(v.stockCnt, orderCnt, v.allowPending);
  // 3. set active cnt
  item.activeCnt = getActiveCnt(orderCnt, item.pendingCnt);
  // 4. set prod order amount
  const pureAmount = getPureAmount(orderCnt, v.vendorPrice);
  item.amount.paid = paid;
  item.amount.pureAmount = pureAmount;
  item.amount.orderAmount = getOrderAmount(item.amount);
  try {
    isValidOrderItem(item);
  } catch (e) {
    throw new Error(
      `Invalid Prod Order: ${item.id} orderIds: ${order.dbId}, error: ${e}`
    );
  }
  refreshOrder(order);
  isValidOrder(order);
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
  if (!item) throw new Error("prodOrderId not exist");
  else if (d.orderCnt < 0 || d.orderCnt > item.orderCnt) {
    throw new Error("invalid Cnt");
  }
  const id = uuidv4();
  const newOrd = cloneDeep(item);
  newOrd.id = id;
  (d.order.items as OrderItemCombined[]).push(newOrd);
  setOrderCnt(d.order, id, d.orderCnt, false, item.amount.paid);
  const newOrder: OrderItemCombined = (
    d.order.items as OrderItemCombined[]
  ).find((x) => x.id === id)!;
  setOrderCnt(
    d.order,
    item.id,
    item.orderCnt - newOrder.orderCnt,
    false,
    item.amount.paid
  );

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
