import { BOOL_M, CRUD_DB, CRUD_DB_BATCH, PayMethod, SHIP_STATE } from "..";

export interface OrderEffect {
  prodId: string;
  orderCnt: number;
}
export interface OrderParent {
  dbId: string;
  effect: OrderEffect[];
}

export interface CancelInfo {
  reason: string;
}
export type ORDER_STATE =
  | "BEFORE_ORDER"
  | "BEFORE_APPROVE"
  | "BEFORE_PAYMENT"
  | "BEFORE_SHIP"
  | "SHIPPING"
  | "SHIPPING_COMPLETE"
  | "TAKE_BACK"
  | "TAKE_BACK_DONE"
  | "REFUND"
  | "REFUND_DONE"
  | "CHANGE"
  | "CHANGE_DONE"
  | "ORDER_DONE";

export const ORDER_STATE: { [key in ORDER_STATE]: ORDER_STATE } = Object.freeze(
  {
    BEFORE_ORDER: "BEFORE_ORDER",
    BEFORE_APPROVE: "BEFORE_APPROVE",
    BEFORE_PAYMENT: "BEFORE_PAYMENT",
    BEFORE_SHIP: "BEFORE_SHIP",
    SHIPPING: "SHIPPING",
    SHIPPING_COMPLETE: "SHIPPING_COMPLETE",
    TAKE_BACK: "TAKE_BACK",
    TAKE_BACK_DONE: "TAKE_BACK_DONE",
    REFUND: "REFUND",
    REFUND_DONE: "REFUND_DONE",
    CHANGE: "CHANGE",
    CHANGE_DONE: "CHANGE_DONE",
    ORDER_DONE: "ORDER_DONE",
  }
);

export interface OrderParam {
  inStates?: ORDER_STATE[];
  notStates?: ORDER_STATE[];
}
export interface VendorOrderParam extends OrderParam {
  vendorId: string;
}
export interface ShopOrderParam extends OrderParam {
  shopId: string;
}

export interface OrderAmount {
  shipFeeAmount: number;
  shipFeeDiscountAmount: number;
  tax: number;
  paymentAmount: number; // 지불된 금액
  paid: BOOL_M; // 지불된 금액
  pureAmount: number; // 순수 상품 금액 (로그용)
  orderAmount: number; // 주문 요청 금액
  paymentConfirm: boolean;
  paymentMethod: PayMethod;
}
export interface ProdOrder {
  vendorId: string;
  vendorProdId: string;
  shopId: string;
  shopProdId: string;
  orderCnt: number; // 총 주문 개수
  activeCnt: number; // 배송가능 개수 (총 주문 개수 - 미송 개수)
  pendingCnt: number; // 미송 개수
}
export interface OrderCrt<T> {
  createdAt?: Date;
  updatedAt?: Date;
  dbId: string;
  orderId: string;
  parent?: OrderParent;
  actualAmount: OrderAmount;
  initialAmount: OrderAmount;
  shipping_status: SHIP_STATE;
  items: ProdOrder[];
  orderDate: Date;
  subOrderIds: string[]; // db ids
  canceled: boolean;
  cancelDate?: string;
  cancelReqDate?: string;
  cancellation?: CancelInfo[];
  exchangeDate?: string;
  exchangeReqDate?: string;

  reqExchange(arg: any): Promise<void>; // 교환 요청
  doneExchange(arg: any): Promise<void>; // 교환 요청
  reqCancel(arg: any): Promise<void>; // 취소 요청
  doneCancel(arg: any): Promise<void>; // 취소 요청
  reqOrder(arg: any): Promise<void>; // 주문 요청
  doneOrder(arg: any): Promise<void>; // 주문 요청
  dividePartial(arg: any): Promise<void>; // 서브 주문 생성
  sameOrder(p: T): boolean;
}
export interface OrderDB extends CRUD_DB, CRUD_DB_BATCH {}
