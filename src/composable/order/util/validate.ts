import { IoOrder, OrderItem, OrderItemCombined, OrderAmount } from "../domain";
import { getOrderAmount } from "./getter";

export function isValidOrder(o: IoOrder): void {
  if (o.pendingCnts + o.activeCnts !== o.orderCnts) {
    throw new Error("invalid count");
  } else if (!isValidAmount(o.amount)) {
    throw new Error("invalid amount");
  }
  o.items.forEach((item) => isValidOrderItem(item));
}
export function isValidOrderItem(o: OrderItem | OrderItemCombined): void {
  if (o.pendingCnt + o.activeCnt !== o.orderCnt) {
    throw new Error("invalid count");
  } else if (!isValidAmount(o.amount)) {
    throw new Error("invalid amount");
  } else if (o.pendingCnt > 0 && o.vendorProd && !o.vendorProd.allowPending) {
    throw new Error("invalid allowPending");
  } else if (!o.orderDbId)
    throw new Error(`order item(${o.id}) orderDbId is null`);
}

export function isValidAmount(a: OrderAmount) {
  let isValid = true;
  if (a.orderAmount < 0 || a.orderAmount < a.pureAmount) {
    isValid = false;
  } else if (a.orderAmount !== getOrderAmount(a)) {
    isValid = false;
  }

  return isValid;
}
