export type IoCollection =
  | "USER"
  | "IO_PAY"
  | "PAY_HISTORY"
  | "REQUEST_ENCASH"
  | "VENDOR_PROD"
  | "SHOP_PROD"
  | "MAPPER"
  | "ORDER_PROD"
  | "ORDER_PROD_NUMBER"
  | "USER_LOG"
  | "TOKENS"
  | "SHIPMENT"
  | "PICKUP_LOCATES"
  | "CS_POST"
  | "TEST"
  | "VIRTUAL_VENDOR_PROD"
  | "VIRTUAL_ORDER_PROD"
  | "VIRTUAL_USER";

export const IoCollection: { [key in IoCollection]: IoCollection } =
  Object.freeze({
    USER: "USER",
    IO_PAY: "IO_PAY",
    PAY_HISTORY: "PAY_HISTORY",
    MAPPER: "MAPPER",
    VENDOR_PROD: "VENDOR_PROD",
    SHOP_PROD: "SHOP_PROD",
    ORDER_PROD: "ORDER_PROD",
    ORDER_PROD_NUMBER: "ORDER_PROD_NUMBER",
    USER_LOG: "USER_LOG",
    TOKENS: "TOKENS",
    SHIPMENT: "SHIPMENT",
    PICKUP_LOCATES: "PICKUP_LOCATES",
    CS_POST: "CS_POST",
    TEST: "TEST",
    VIRTUAL_VENDOR_PROD: "VIRTUAL_VENDOR_PROD",
    VIRTUAL_ORDER_PROD: "VIRTUAL_ORDER_PROD",
    VIRTUAL_USER: "VIRTUAL_USER",
    REQUEST_ENCASH: "REQUEST_ENCASH",
  });

export interface getCollectParam {
  c: IoCollection;
  uid?: string;
  shopProdId?: string;
  vendorProdId?: string;
  orderId?: string;
}
