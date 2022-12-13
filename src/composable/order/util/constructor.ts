import { PAY_METHOD } from "@/composable";
import { PAID_INFO } from "@/composable/common";
import { VendorGarmentCrt, ShopGarmentCrt } from "@/composable/product";
import { fireConverter } from "@/util/firebase";
import { uuidv4 } from "@firebase/util";
import { uniqueArr } from "@io-boxies/js-lib";
import {
  ORDER_STATE,
  ORDER_TYPE,
  OrderItem,
  OrderItemCombined,
  IoOrder,
  OrderAmount,
  DONE_STATES,
} from "../domain";
import { getPureAmount, getOrderAmount } from "./getter";
import { isValidOrder } from "./validate";

export const orderFireConverter = fireConverter<IoOrder>();

export function newOrdItem(d: {
  vendorProd: VendorGarmentCrt;
  shopProd: ShopGarmentCrt;
  orderIds: string[];
  orderCnt: number;
  state?: ORDER_STATE;
  orderType?: ORDER_TYPE;
  orderDbId?: string;
  shipFeeAmount: number;
  shipFeeDiscountAmount: number;
  pickFeeAmount: number;
  pickFeeDiscountAmount: number;
  tax: number;
  paidAmount: number; // 지불된 금액
  paid: PAID_INFO; // 지불여부
  paymentConfirm: boolean;
  paymentMethod?: PAY_METHOD;
  paidAt?: Date;
}): OrderItem {
  const pureAmount = getPureAmount(d.orderCnt, d.vendorProd.vendorPrice);
  return {
    id: uuidv4(),
    vendorId: d.vendorProd.vendorId,
    shopId: d.shopProd.shopId,
    vendorProd: d.vendorProd,
    orderIds: d.orderIds,
    shopProd: d.shopProd,
    orderCnt: d.orderCnt,
    activeCnt: d.orderCnt,
    pendingCnt: 0,
    state: d.state ?? "BEFORE_ORDER",
    orderDbId: d.orderDbId,
    orderType: d.orderType ?? "STANDARD",
    prodType: d.vendorProd.prodType,
    amount: {
      pureAmount,
      orderAmount: getOrderAmount(Object.assign(d, { pureAmount })),
      ...d,
    },
  };
}

export function newOrdFromItem(
  items: OrderItem[] | OrderItemCombined[]
): IoOrder {
  const order = emptyOrder(items[0].shopId);
  order.items = items;
  refreshOrder(order);
  return order;
}

export function refreshOrder(o: IoOrder) {
  o.itemIds = [];
  o.orderIds = [];
  o.vendorIds = [];
  o.states = [];
  o.cancellations = [];
  o.orderTypes = [];
  o.orderCnts = 0;
  o.activeCnts = 0;
  o.pendingCnts = 0;
  for (let i = 0; i < o.items.length; i++) {
    const item = o.items[i];
    item.orderDbId = o.dbId;
    if (item.shopId !== o.shopId)
      throw new Error("order item shopId !== order.shopId");
    o.shipManagerId = item.shipManagerId;
    o.orderIds = uniqueArr([...o.orderIds, ...item.orderIds]);
    if (!o.vendorIds.includes(item.vendorId)) o.vendorIds.push(item.vendorId);
    if (!o.states.includes(item.state)) o.states.push(item.state);
    if (!o.orderTypes.includes(item.orderType))
      o.orderTypes.push(item.orderType);
    if (!o.prodTypes.includes(item.prodType)) o.prodTypes.push(item.prodType);
    if (!o.paids.includes(item.amount.paid)) o.paids.push(item.amount.paid);

    if (item.cancellation) o.cancellations.push(item.cancellation);

    if (item.shipmentId && !o.shipmentIds.includes(item.shipmentId))
      o.shipmentIds.push(item.shipmentId);
    o.itemIds.push(item.id);

    o.orderCnts += item.orderCnt;
    o.activeCnts += item.activeCnt;
    o.pendingCnts += item.pendingCnt;
    mergeOrderAmount(o.amount, item.amount);
  }
  o.isDone = o.states.every((state) => DONE_STATES.includes(state));
  isValidOrder(o);
}
export function mergeOrderItem(origin: Partial<OrderItem>, y: OrderItem) {
  origin.orderCnt = origin.orderCnt ? origin.orderCnt + y.orderCnt : y.orderCnt;
  origin.activeCnt = origin.activeCnt
    ? origin.activeCnt + y.activeCnt
    : y.activeCnt;
  origin.pendingCnt = origin.pendingCnt
    ? origin.pendingCnt + y.pendingCnt
    : y.pendingCnt;
  if (!origin.amount) origin.amount = emptyAmount();
  mergeOrderAmount(origin.amount, y.amount);
}
export function mergeOrderAmount(origin: OrderAmount, y: OrderAmount) {
  origin.shipFeeAmount += y.shipFeeAmount;
  origin.shipFeeDiscountAmount += y.shipFeeDiscountAmount;
  origin.pickFeeAmount += y.pickFeeAmount;
  origin.pickFeeDiscountAmount += y.pickFeeDiscountAmount;
  origin.tax += y.tax;
  origin.paidAmount += y.paidAmount;
  origin.paid = y.paid;
  origin.pureAmount += y.pureAmount;
  origin.orderAmount += y.orderAmount;
}

export function emptyAmount(): OrderAmount {
  return {
    shipFeeAmount: 0,
    shipFeeDiscountAmount: 0,
    pickFeeAmount: 0,
    pickFeeDiscountAmount: 0,
    tax: 0,
    paidAmount: 0,
    paid: PAID_INFO.NO,
    pureAmount: 0,
    orderAmount: 0,
    paymentConfirm: false,
  };
}
function emptyOrder(shopId: string): IoOrder {
  const currDate = new Date();
  return {
    createdAt: currDate,
    updatedAt: currDate,
    shopId,
    dbId: uuidv4(),
    orderIds: [],
    shipmentIds: [],
    vendorIds: [],
    itemIds: [],
    items: [],
    states: [],
    isDone: false,
    cancellations: [],
    prodTypes: [],
    orderTypes: [],
    paids: [],
    orderCnts: 0,
    activeCnts: 0,
    pendingCnts: 0,
    amount: emptyAmount(),
  };
}
