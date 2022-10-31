export type IoCollection =
  | "USER"
  | "IO_PAY"
  | "VENDOR_PROD"
  | "SHOP_PROD"
  | "MAPPER"
  | "ORDER_PROD"
  | "ORDER_PROD_NUMBER"
  | "USER_LOG"
  | "TOKENS"
  | "SHIPMENT"
  | "PICKUP_LOCATES"
  | "CS_POST";

export const IoCollection: { [key in IoCollection]: IoCollection } =
  Object.freeze({
    USER: "USER",
    IO_PAY: "IO_PAY",
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
  });

export interface getCollectParam {
  c: IoCollection;
  uid?: string;
  shopProdId?: string;
  vendorProdId?: string;
  orderId?: string;
}
