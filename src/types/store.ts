type IoCollection =
  | "USER"
  | "IO_PAY"
  | "VENDOR_PROD"
  | "SHOP_PROD"
  | "MAPPER"
  | "SHOP_REQ_ORDER"
  | "SHOP_REQ_ORDER_NUMBER"
  | "USER_LOG";

const IoCollection: { [key in IoCollection]: IoCollection } = Object.freeze({
  USER: "USER",
  IO_PAY: "IO_PAY",
  MAPPER: "MAPPER",
  VENDOR_PROD: "VENDOR_PROD",
  SHOP_PROD: "SHOP_PROD",
  SHOP_REQ_ORDER: "SHOP_REQ_ORDER",
  SHOP_REQ_ORDER_NUMBER: "SHOP_REQ_ORDER_NUMBER",
  USER_LOG: "USER_LOG",
});
export { IoCollection };
