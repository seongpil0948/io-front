type IoCollection =
  | "USER"
  | "VENDOR_PROD"
  | "SHOP_PROD"
  | "MAPPER"
  | "SHOP_REQ_ORDER"
  | "SHOP_REQ_ORDER_PROD";

const IoCollection: { [key in IoCollection]: IoCollection } = Object.freeze({
  USER: "USER",
  MAPPER: "MAPPER",
  VENDOR_PROD: "VENDOR_PROD",
  SHOP_PROD: "SHOP_PROD",
  SHOP_REQ_ORDER: "SHOP_REQ_ORDER",
  SHOP_REQ_ORDER_PROD: "SHOP_REQ_ORDER_PROD",
});
export { IoCollection };
