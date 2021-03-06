type ORDER_STATE =
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

const ORDER_STATE: { [key in ORDER_STATE]: ORDER_STATE } = Object.freeze({
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
});

interface OrderParam {
  inStates?: ORDER_STATE[];
  notStates?: ORDER_STATE[];
}
interface VendorOrderParam extends OrderParam {
  vendorId: string;
}
interface ShopOrderParam extends OrderParam {
  shopId: string;
}

export { ORDER_STATE, VendorOrderParam, ShopOrderParam };
