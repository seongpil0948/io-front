import { IoOrder, OrderItem } from "../domain";

export const getPureAmount = (orderCnt: number, prodPrice: number) =>
  orderCnt * prodPrice;

export const getPendingCnt = (
  stockCnt: number,
  orderCnt: number,
  allowPending: boolean
) => (allowPending ? (stockCnt - orderCnt > 0 ? 0 : orderCnt - stockCnt) : 0);

export function getActiveCnt(orderCnt: number, pendingCnt: number) {
  if (orderCnt < 0 || pendingCnt < 0)
    throw new Error("cnt must bigger than zero ");
  else if (orderCnt - pendingCnt < 0) throw new Error("invalid cnt");
  return orderCnt - pendingCnt;
}

export const getOrderAmount = (a: {
  pureAmount: number;
  shipFeeAmount: number;
  shipFeeDiscountAmount: number;
  pickFeeAmount: number;
  pickFeeDiscountAmount: number;
  tax: number;
}) =>
  a.pureAmount +
  (a.shipFeeAmount - a.shipFeeDiscountAmount) +
  (a.pickFeeAmount - a.pickFeeDiscountAmount) +
  a.tax;

export function getOrderItems(d: {
  order: IoOrder;
  itemId?: string;
  shopProdId?: string;
  vendorProdId?: string;
}) {
  const orders: OrderItem[] = [];
  for (let i = 0; i < d.order.items.length; i++) {
    const item = d.order.items[i] as OrderItem;
    if (d.itemId && d.itemId === item.id) {
      orders.push(item);
      return orders;
    } else if (d.shopProdId && item.shopProd.shopProdId === d.shopProdId) {
      orders.push(item);
    } else if (
      d.vendorProdId &&
      item.vendorProd.vendorProdId === d.vendorProdId
    ) {
      orders.push(item);
    }
  }
  return orders;
}

export function isShipping(item: OrderItem) {
  return [
    "SHIPPING",
    "SHIPPING_PENDING",
    "SHIPPING_WAIT",
    "SHIPPING_COMPLETE",
  ].includes(item.state);
}
