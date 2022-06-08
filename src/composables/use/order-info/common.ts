import { ORDER_STATE } from "@/types";

export const getPendingCnt = (stockCnt: number, orderCnt: number) =>
  stockCnt - orderCnt > 0 ? 0 : orderCnt - stockCnt;

export const getOrderCnt = (
  stockCnt: number,
  orderCnt: number,
  pendingCnt: number
) => {
  const cnt = orderCnt - pendingCnt;
  if (stockCnt < cnt) {
    return stockCnt;
  }
  return cnt;
};

export function orderStateKo(state: ORDER_STATE): string {
  switch (state) {
    case ORDER_STATE.BEFORE_ORDER:
      return "주문전";
    case ORDER_STATE.BEFORE_APPROVE:
      return "도매처승인중";
    case ORDER_STATE.BEFORE_PAYMENT:
      return "결제전";
    case ORDER_STATE.BEFORE_SHIP:
      return "배송전";
    case ORDER_STATE.SHIPPING:
      return "배송중";
    default:
      throw `ORDER_STATE Enum memeber ${state} is not exist`;
  }
}
