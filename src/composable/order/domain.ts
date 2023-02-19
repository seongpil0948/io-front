import { IoShipment, DefrayParam } from "@/composable";
import { QueryConstraint } from "@firebase/firestore";
import { Ref } from "vue";
import {
  ShopUserGarment,
  VendorUserGarment,
  PROD_TYPE,
  VendorGarmentCrt,
  ShopGarmentCrt,
} from "@/composable/product";
import { PAY_METHOD } from "@/composable/payment";
import { PAID_INFO } from "@/composable/common/domain";

export interface PayAmount {
  tax: number; // 주문건 생성시부과하여 지불되야할 금액 amount 에 더해진다
  paidAmount: number; // 지불된 금액
  paid: PAID_INFO; // 지불여부
  pureAmount: number; // 순수 상품 금액 (로그용)
  amount: number; // 주문 요청 금액
  paymentConfirm: boolean;
  paymentMethod?: PAY_METHOD;
  paidAt?: Date;
  discountAmount: number;
  pendingAmount: number;
  isPending: boolean; // 보류 금액으로 채워진 상태인지.
}
export type OrderDateMap = {
  [key in ORDER_STATE]?: Date;
} & { createdAt?: Date; updatedAt?: Date; tossAt?: Date };
export interface IoOrder {
  // only used OrderItem Aggregation
  od: OrderDateMap;
  isDone?: boolean;
  isDirectToShip: boolean; // direct to uncle
  dbId: string;
  shopId: string;

  orderCnts: number;
  activeCnts: number;
  pendingCnts: number;

  orderIds: string[];
  shipmentIds: string[];
  vendorIds: string[];
  itemIds: string[];
  shipManagerId?: string;

  items: OrderItem[] | OrderItemCombined[]; // 주문프로세스 생성단계에서만 사용
  states: ORDER_STATE[];
  cancellations: OrderCancel[];
  prodTypes: PROD_TYPE[];
  paids: PAID_INFO[]; // product paid
  orderTypes: ORDER_TYPE[];
  // 결제완료(completePay)이후 건들면 안댐
  prodAmount: PayAmount;
  shipAmount: PayAmount;
  pickAmount: PayAmount;
}

export interface OrderItem {
  od: OrderDateMap;
  id: string;
  orderIds: string[];
  vendorId: string;
  shopId: string;
  vendorProd: VendorGarmentCrt; // FIXME: to Vendor Product
  shopProd: ShopGarmentCrt;
  orderCnt: number; // 총 주문 개수
  activeCnt: number; // 배송가능 개수 (총 주문 개수 - 미송 개수)
  pendingCnt: number; // 미송 개수
  state: ORDER_STATE;
  beforeState?: ORDER_STATE;
  shipmentId?: string;
  orderDbId?: string;
  orderType: ORDER_TYPE;
  prodType: PROD_TYPE;
  prodAmount: PayAmount;
  cancellation?: OrderCancel;
  shipManagerId?: string; // 엉클 매니저 아이디
}

export interface OrderEffect {
  orderItemId: string;
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
export const DONE_STATES: ORDER_STATE[] = [
  "RETURN_DONE",
  "REFUND_DONE",
  "CHANGE_DONE",
  "ORDER_DONE",
  "CANCEL",
];

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

export interface OrderItemCombined
  extends Omit<OrderItem, "shopProd" | "vendorProd"> {
  shopProd: ShopUserGarment;
  vendorProd: VendorUserGarment;
}

export interface ShipOrder
  extends Omit<IoShipment, "orderDbId">,
    OrderItemCombined {}

export interface ShipOrderByShop {
  shopId: string;
  shopName: string;
  uncleImgs: string[];
  items: ShipOrder[];
}
export interface OrderItemByShop {
  shopId: string;
  shopName: string;
  items: OrderItemCombined[];
}
export interface OrderItemByVendor {
  vendorId: string;
  vendorName: string;
  orderCnt: number;
  pendingCnt: number;
  accountStr?: string;
  phone?: string;
  items: OrderItemCombined[];
}
interface Claim {
  id: string;
  orderItemId: string;
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

export interface OrderDB<T> {
  updateOrder(order: IoOrder, itemId?: string): Promise<void>;
  deleteOrder(order: IoOrder): Promise<void>;
  orderGarment(
    orderDbIds: string[],
    orderItemIds: string[],
    shopId: string
  ): Promise<T[]>;
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
    orderItemIds: string[]
  ): Promise<void>;
  orderReject(orderDbIds: string[], orderItemIds: string[]): Promise<void>;
  completePay(
    orderDbIds: string[],
    orderItemIds: string[],
    shopId: string,
    vendorId: string,
    param: { [itemId: string]: DefrayParam }
  ): Promise<void>;
  orderToReady(orderDbIds: string[], orderItemIds: string[]): Promise<void>;
  reqPickup(
    orderDbIds: string[],
    orderItemIds: string[],
    uncleId: string,
    shopId: string,
    isDirect: boolean
  ): Promise<void>;
  returnReq(orderDbIds: string[], orderItemIds: string[]): Promise<void>;
  returnApprove(orderDbIds: string[], orderItemIds: string[]): Promise<void>;
  returnReject(orderDbIds: string[], orderItemIds: string[]): Promise<void>;
  returnDone(orderDbIds: string[], orderItemIds: string[]): Promise<void>;
  cancelReq(
    shopId: string,
    orderDbId: string,
    orderItemId: string,
    claim: OrderCancel,
    cancelCnt: number
  ): Promise<void>;
  cancelApprove(orderDbIds: string[], orderItemIds: string[]): Promise<void>;
  cancelReject(orderDbIds: string[], orderItemIds: string[]): Promise<void>;
  orderDone(orderDbIds: string[], orderItemIds: string[]): Promise<void>;
}

export interface ShipDB<T> {
  getShipment(uncleId: string, shipId: string): Promise<IoShipment | null>;
  batchUpdate(shipments: Partial<IoShipment>[]): Promise<void>;
  approvePickUp(row: IoOrder): Promise<void>;
  doneShipOrder(order: IoOrder, itemId: string): Promise<void>;
}
