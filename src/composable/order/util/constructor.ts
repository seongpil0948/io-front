import {
  PAY_METHOD,
  getAmount,
  getPureAmount,
  newPayAmount,
  mergeAmount,
  refreshAmount,
} from "@/composable";
import { PAID_INFO } from "@/composable/common";
import { VendorGarmentCrt, ShopGarmentCrt } from "@/composable/product";
import {
  QueryDocumentSnapshot,
  Timestamp,
  WithFieldValue,
} from "@firebase/firestore";
import { uuidv4 } from "@firebase/util";
import { dateToTimeStamp, loadDate, uniqueArr } from "@io-boxies/js-lib";
import {
  ORDER_STATE,
  ORDER_TYPE,
  OrderItem,
  OrderItemCombined,
  IoOrder,
  DONE_STATES,
  OrderDateMap,
} from "../domain";
import { isValidOrder } from "./validate";

export const orderFireConverter = {
  toFirestore: (data: WithFieldValue<IoOrder>) => {
    data = JSON.parse(JSON.stringify(data));
    data.od = orderDateToJson(data.od as OrderDateMap);
    const items = [...(data.items as OrderItem[])];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.od = orderDateToJson(item.od);
    }
    data.items = items;
    return data;
  },
  fromFirestore: (snap: QueryDocumentSnapshot<IoOrder>) => {
    const data = snap.data();
    if (!data) throw new Error("no data");
    data.od = orderDateFromJson(data.od);
    const items = [...(data.items as OrderItem[])];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.od = orderDateFromJson(item.od);
    }
    return data;
  },
};
const orderDateToJson = (od: OrderDateMap) => {
  const dateKeys = Object.keys(od);
  const j = {} as { [k: string]: Timestamp };
  dateKeys.forEach((k) => {
    if (od[k as keyof OrderDateMap]) {
      j[k] = dateToTimeStamp(od[k as keyof OrderDateMap]);
    }
  });
  return j;
};
const orderDateFromJson = (od?: OrderDateMap) => {
  if (!od) {
    od = defaultOrderDate();
  }
  (Object.keys(od) as (keyof OrderDateMap)[]).forEach((k) => {
    od![k] = loadDate(od![k]);
  });
  return od;
};
const defaultOrderDate = () => {
  const currDate = new Date();
  return {
    createdAt: currDate,
    updatedAt: currDate,
  };
};
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
    od: defaultOrderDate(),
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
    prodAmount: newPayAmount({
      pureAmount,
      amount: getAmount(Object.assign(d, { pureAmount })),
      ...d,
    }),
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
  o.prodAmount = newPayAmount({});
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
    if (!o.paids.includes(item.prodAmount.paid))
      o.paids.push(item.prodAmount.paid);

    if (item.cancellation) o.cancellations.push(item.cancellation);

    if (item.shipmentId && !o.shipmentIds.includes(item.shipmentId))
      o.shipmentIds.push(item.shipmentId);
    o.itemIds.push(item.id);
    o.orderCnts += item.orderCnt;
    o.activeCnts += item.activeCnt;
    o.pendingCnts += item.pendingCnt;
    refreshAmount(item.prodAmount);
    o.prodAmount = mergeAmount(o.prodAmount, item.prodAmount);
  }
  o.isDone = o.states.every((state) => DONE_STATES.includes(state));
  refreshAmount(o.pickAmount);
  refreshAmount(o.prodAmount);
  refreshAmount(o.shipAmount);
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
  if (!origin.prodAmount) origin.prodAmount = newPayAmount({});
  origin.prodAmount = mergeAmount(origin.prodAmount!, y.prodAmount);
}

function emptyOrder(shopId: string): IoOrder {
  const amount = newPayAmount({});
  return {
    od: defaultOrderDate(),
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
    prodAmount: amount,
    shipAmount: amount,
    pickAmount: amount,
    isDirectToShip: false,
  };
}
