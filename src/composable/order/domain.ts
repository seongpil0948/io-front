import { IoUserCRT, ShopGarmentCrt } from "@/composable";
import { BOOL_M, CRUD_DB, CRUD_DB_BATCH, PayMethod, SHIP_STATE } from "..";

export interface OrderEffect {
  prodOrderId: string;
  orderCnt: number;
  pendingCnt: number;
}
export interface OrderParent {
  dbId: string;
  effect: OrderEffect[];
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
  | "CANCEL"
  | "CANCEL_DONE"
  | "ORDER_DONE";

export const ORDER_STATE: { [key in ORDER_STATE]: string } = Object.freeze({
  BEFORE_ORDER: "주문전",
  BEFORE_APPROVE: "승인전",
  BEFORE_PAYMENT: "결제전",
  BEFORE_SHIP: "배송전",
  SHIPPING: "배송중",
  SHIPPING_COMPLETE: "배송완료",
  TAKE_BACK: "반품중",
  TAKE_BACK_DONE: "반품완료",
  REFUND: "환불중",
  REFUND_DONE: "환불완료",
  CHANGE: "교환중",
  CHANGE_DONE: "교환완료",
  CANCEL: "취소중",
  CANCEL_DONE: "취소완료",
  ORDER_DONE: "거래종료",
});
export type REASON_TYPE =
  | "CHANGE_MIND"
  | "DELIVERY_DELAY"
  | "DELIVERY_ERROR"
  | "DELIVERY_AREA"
  | "CUSTOM_CLEARANCE"
  | "BAD_PACKAGING"
  | "PRODUCT_DISSATISFIED"
  | "PRODUCT_INFO"
  | "PRODUCT_DEFECTION"
  | "SERVICE_DISSATISFIED"
  | "SOLD_OUT"
  | "ETC";

export const REASON_TYPE: { [key in REASON_TYPE]: string } = Object.freeze({
  CHANGE_MIND: "고객변심",
  DELIVERY_DELAY: "배송지연",
  DELIVERY_ERROR: "배송오류",
  DELIVERY_AREA: "배송불가지역",
  CUSTOM_CLEARANCE: "수출/통관 불가",
  BAD_PACKAGING: "포장불량",
  PRODUCT_DISSATISFIED: "상품 불만족",
  PRODUCT_INFO: "상품정보상이",
  PRODUCT_DEFECTION: "상품불량",
  SERVICE_DISSATISFIED: "서비스불만족",
  SOLD_OUT: "품절",
  ETC: "기타",
});

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
  paidAmount: number; // 지불된 금액
  paid: BOOL_M; // 지불된 금액
  pureAmount: number; // 순수 상품 금액 (로그용)
  orderAmount: number; // 주문 요청 금액
  paymentConfirm: boolean;
  paymentMethod: PayMethod;
}
export interface ProdOrder {
  id: string;
  vendorId: string;
  vendorProdId: string;
  shopId: string;
  shopProdId: string;
  orderCnt: number; // 총 주문 개수
  activeCnt: number; // 배송가능 개수 (총 주문 개수 - 미송 개수)
  pendingCnt: number; // 미송 개수
}

interface Claim {
  id: string;
  reqDate: string;
  state: ORDER_STATE;
  reason: string;
  type: REASON_TYPE;
  done: boolean;
}

export interface OrderExchange extends Claim {
  exchangedDate: string;
}
export interface OrderCancel extends Claim {
  canceledDate: string;
}

export interface OrderCrt<T> {
  createdAt?: Date;
  updatedAt?: Date;
  orderDate?: Date;
  doneDate?: Date;
  dbId: string;
  orderId: string;
  parent?: OrderParent;
  state: ORDER_STATE;
  actualAmount: OrderAmount;
  initialAmount: OrderAmount;
  shipping_status: SHIP_STATE;
  items: ProdOrder[];
  subOrderIds: string[]; // db ids
  cancellations: OrderCancel[];
  get cancelDone(): boolean;
  get cancelInProcessing(): boolean;

  reqCancel(arg: OrderCancel): Promise<void>; // 취소 요청
  doneCancel(arg: any): Promise<void>; // 취소 요청
  reqOrder(arg: any): Promise<void>; // 주문 요청
  doneOrder(arg: any): Promise<void>; // 주문 요청
  dividePartial(
    prodOrderId: string,
    orderCnt: number,
    pendingCnt: number,
    update: boolean
  ): Promise<void>; // 서브 주문 생성
  sameOrder(p: T): boolean;
}
export interface OrderDB<O>
  extends CRUD_DB<OrderCrt<O>>,
    CRUD_DB_BATCH<OrderCrt<O>> {
  orderGarment(row: any): Promise<void>;
}
