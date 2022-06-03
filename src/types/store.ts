type IoCollection =
  | "USER"
  | "VENDOR_PROD"
  | "SHOP_PROD"
  | "MAPPER"
  | "SHOP_REQ_ORDER"
  | "SHOP_REQ_ORDER_NUMBER";

const IoCollection: { [key in IoCollection]: IoCollection } = Object.freeze({
  USER: "USER",
  MAPPER: "MAPPER",
  VENDOR_PROD: "VENDOR_PROD",
  SHOP_PROD: "SHOP_PROD",
  SHOP_REQ_ORDER: "SHOP_REQ_ORDER",
  SHOP_REQ_ORDER_NUMBER: "SHOP_REQ_ORDER_NUMBER",
});
export { IoCollection };
