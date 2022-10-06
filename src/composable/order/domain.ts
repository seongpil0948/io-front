import { QueryConstraint } from "@firebase/firestore";
import { Ref } from "vue";
import {
  BOOL_M,
  GarmentOrder,
  Locate,
  PayMethod,
  SHIP_METHOD,
  ShopUserGarment,
  VendorUserGarment,
} from "..";

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
  | "BEFORE_READY" // 결제완료후 출고리스트 전 = 미송
  | "BEFORE_PICKUP_REQ" // 출고가능 물품들의 픽업 요청전
  | "BEFORE_APPROVE_PICKUP" // 픽업 승인전
  | "BEFORE_ASSIGN_PICKUP" // 픽업 담당자 배정전
  | "BEFORE_PICKUP" // 담당자 배정 후 픽업전
  | "ONGOING_PICKUP" // 도매처 배송중
  | "PICKUP_COMPLETE" // 픽업완료
  | "BEFORE_SHIP"
  | "SHIPPING"
  | "SHIPPING_PENDING"
  | "SHIPPING_WAIT"
  | "SHIPPING_COMPLETE"
  | "RETURN_REQ"
  | "RETURN_APPROVED"
  | "RETURN_DONE"
  | "REFUND"
  | "REFUND_DONE"
  | "CHANGE"
  | "CHANGE_DONE"
  | "CANCEL" // 취소 요청?
  | "ORDER_DONE";
export const ORDER_STATE: { [key in ORDER_STATE]: string } = Object.freeze({
  BEFORE_ORDER: "주문전",
  BEFORE_APPROVE: "승인전",
  BEFORE_PAYMENT: "결제전",
  BEFORE_READY: "출고전",
  BEFORE_PICKUP_REQ: "픽업요청전",
  BEFORE_APPROVE_PICKUP: "픽업승인전",
  BEFORE_ASSIGN_PICKUP: "담당자배정전",
  BEFORE_PICKUP: "픽업전",
  ONGOING_PICKUP: "도매처 배송중",
  PICKUP_COMPLETE: "픽업완료",
  BEFORE_SHIP: "배송전",
  SHIPPING: "배송중",
  SHIPPING_PENDING: "배송대기",
  SHIPPING_WAIT: "배송보류",
  SHIPPING_COMPLETE: "배송완료",
  RETURN_REQ: "반품요청중",
  RETURN_APPROVED: "반품승인",
  RETURN_DONE: "반품완료",
  REFUND: "환불중",
  REFUND_DONE: "환불완료",
  CHANGE: "교환중",
  CHANGE_DONE: "교환완료",
  CANCEL: "취소중",
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
  CHANGE_MIND: "CHANGE_MIND",
  DELIVERY_DELAY: "DELIVERY_DELAY",
  DELIVERY_ERROR: "DELIVERY_ERROR",
  DELIVERY_AREA: "DELIVERY_AREA",
  CUSTOM_CLEARANCE: "수출/통관 CUSTOM_CLEARANCE",
  BAD_PACKAGING: "BAD_PACKAGING",
  PRODUCT_DISSATISFIED: "상품 PRODUCT_DISSATISFIED",
  PRODUCT_INFO: "PRODUCT_INFO",
  PRODUCT_DEFECTION: "PRODUCT_DEFECTION",
  SERVICE_DISSATISFIED: "SERVICE_DISSATISFIED",
  SOLD_OUT: "SOLD_OUT",
  ETC: "ETC",
});
export type ORDER_TYPE = "STANDARD" | "RETURN";

export const ORDER_TYPE: { [key in ORDER_TYPE]: string } = Object.freeze({
  STANDARD: "STANDARD",
  RETURN: "RETURN",
});

export interface OrderParam {
  inStates?: ORDER_STATE[];
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
  pickFeeAmount: number;
  pickFeeDiscountAmount: number;
  tax: number;
  paidAmount: number; // 지불된 금액
  paid: BOOL_M; // 지불여부
  pureAmount: number; // 순수 상품 금액 (로그용)
  orderAmount: number; // 주문 요청 금액
  paymentConfirm: boolean;
  paymentMethod?: PayMethod;
  paidDate?: Date;
}
export interface ProdOrder {
  id: string;
  vendorId: string;
  vendorProdId: string;
  shopProdId: string;
  orderCnt: number; // 총 주문 개수
  activeCnt: number; // 배송가능 개수 (총 주문 개수 - 미송 개수)
  pendingCnt: number; // 미송 개수
  actualAmount: OrderAmount;
  initialAmount: OrderAmount;
  state: ORDER_STATE;
  shipmentId?: string;
  shopId: string;
  orderDbId: string;
  history: ProdOrder[];
  orderType: ORDER_TYPE;
}

interface Claim {
  id: string;
  prodOrderId: string;
  reqDate: Date;
  state: ORDER_STATE; // 요청시 주문상태
  reason: string; // 클레임 상세 이유
  type: REASON_TYPE; // 클레임 이유 분류
  done: boolean; // 처리 완료여부
  approved: boolean; // 승인 여부
}

export interface OrderExchange extends Claim {
  exchangedDate?: Date; // 교환 완료일
}
export interface OrderCancel extends Claim {
  canceledDate?: Date; // 취소 완료일
}
export interface ProdOrderCombined extends ProdOrder {
  shopGarment: ShopUserGarment;
  vendorGarment: VendorUserGarment;
}
export interface OrderCrt {
  createdAt?: Date;
  updatedAt?: Date;
  orderDate?: Date;
  doneDate?: Date;
  dbId: string;
  shopId: string;
  vendorIds: string[];
  orderIds: string[];
  itemIds: string[];
  parent?: OrderParent;
  states: ORDER_STATE[];
  actualAmount: OrderAmount;
  initialAmount: OrderAmount;
  items: ProdOrder[] | ProdOrderCombined[];
  subOrderIds: string[]; // db ids
  cancellations: OrderCancel[];
  shipManagerId?: string; // 엉클 매니저 아이디
}
export interface ShipOrder extends ShipmentCrt, ProdOrderCombined {}
export interface ShipOrderByShop {
  shopId: string;
  shopName: string;
  uncleImgs: string[];
  items: ShipOrder[];
}
export interface ProdOrderByShop {
  shopId: string;
  shopName: string;
  items: ProdOrderCombined[];
}
export interface ProdOrderByVendor {
  vendorId: string;
  vendorName: string;
  orderCnt: number;
  pendingCnt: number;
  accountStr?: string;
  phone?: string;
  items: ProdOrderCombined[];
}
// export interface OrderFlat extends OrderCrt, ProdOrderCombined, OrderAmount {}

export interface ShipmentCrt {
  createdAt?: Date;
  updatedAt?: Date;
  shippingId: string; // shipment db id
  orderDbId: string; // order db id
  prodOrderId: string; // prod order db id
  trackingNo?: string; //송장번호
  uncleId?: string; // 엉클근로자 아이디, 토스시 변경가능
  shipMethod: SHIP_METHOD;
  additionalInfo: string;
  paid: boolean;
  weightUnit?: string;
  weight?: number;
  sizeUnit?: string;
  size?: number;
  amountBySize?: number;
  amountByWeight?: number;
  shipFeeBasic: number; // 지역별 기본 배송료
  pickupFeeBasic: number; // 지역별 기본 픽업료
  returnAddress: Locate; // 출발지
  startAddress: Locate; // 도매
  receiveAddress: Locate; // 소매
  wishedDeliveryTime: Date;
  managerId: string; // 엉클관리자 아이디
}

export interface OrderDB<T> {
  orderGarment(orders: GarmentOrder[], shopId: string): Promise<T[]>;
  batchCreate(uid: string, orders: T[]): Promise<void>;
  batchUpdate(arg: {
    orderDbIdByShops: { [shopId: string]: string[] };
    orderState?: ORDER_STATE;
  }): Promise<void>;
  batchDelete(ords: T[]): Promise<void>;
  batchRead(
    orderDbIds: string[],
    constraints?: QueryConstraint[]
  ): Promise<T[]>;
  readById(shopId: string, orderDbId: string): Promise<T | undefined>;
  shopReadListen(p: {
    inStates?: ORDER_STATE[];
    shopId: string;
    orders: Ref<T[]>;
  }): {
    unsubscribe: () => void;
  };
  vendorReadListen(p: {
    inStates?: ORDER_STATE[];
    vendorId: string;
    orders: Ref<T[]>;
  }): {
    unsubscribe: () => void;
  };
  uncleReadListen(p: {
    inStates?: ORDER_STATE[];
    uncleId: string;
    orders: Ref<T[]>;
  }): {
    unsubscribe: () => void;
  };
  getExistOrderIds(shopId: string): Promise<Set<string>>;
  orderApprove(
    vendorId: string,
    orderDbIds: string[],
    prodOrderIds: string[]
  ): Promise<void>;
  orderReject(orderDbIds: string[], prodOrderIds: string[]): Promise<void>;
  completePay(orderDbIds: string[], prodOrderIds: string[]): Promise<void>;
  orderToReady(orderDbIds: string[], prodOrderIds: string[]): Promise<void>;
  reqPickup(
    orderDbIds: string[],
    prodOrderIds: string[],
    uncleId: string
  ): Promise<void>;
  returnReq(orderDbIds: string[], prodOrderIds: string[]): Promise<void>;
  returnApprove(orderDbIds: string[], prodOrderIds: string[]): Promise<void>;
  returnReject(orderDbIds: string[], prodOrderIds: string[]): Promise<void>;
  returnDone(orderDbIds: string[], prodOrderIds: string[]): Promise<void>;
  cancelReq(
    shopId: string,
    orderDbId: string,
    prodOrderId: string,
    claim: OrderCancel,
    cancelCnt: number
  ): Promise<void>;
  cancelApprove(orderDbIds: string[], prodOrderIds: string[]): Promise<void>;
  cancelReject(orderDbIds: string[], prodOrderIds: string[]): Promise<void>;
}

export interface ShipDB<T> {
  approvePickUp(
    row: GarmentOrder,
    expectedReduceCoin: number
  ): Promise<T | Error>;
}
