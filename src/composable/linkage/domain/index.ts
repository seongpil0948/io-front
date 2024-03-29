import { Unsubscribe } from "@firebase/util";
import { Ref } from "vue";
import { ApiToken } from "..";

export type API_SERVICE_EX = "CAFE" | "ZIGZAG" | "EXCEL" | "ABLY";
export const API_SERVICE_EX: { [key in API_SERVICE_EX]: API_SERVICE_EX } =
  Object.freeze({
    CAFE: "CAFE",
    ZIGZAG: "ZIGZAG",
    EXCEL: "EXCEL",
    ABLY: "ABLY",
  });
export type AnyOrder = { [k: string]: any };

export interface ApiTokenCrt {
  dbId: string;
  clientId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  expireAt?: Date;
  refreshExpireAt?: Date;
  mallId?: string;
  scopes?: string[];
  service: API_SERVICE_EX;
  shopNo?: string;
  userId: string;
  alias: string;
  accessKey?: string;
  secretKey?: string;
}

export interface LinkageDB {
  getTokensByIdListen(uid: string): {
    tokens: Ref<ApiToken[]>;
    unsubscribe: Unsubscribe;
  };
  deleteToken(uid: string, tokenDbId: string): Promise<void>;
  createToken(token: ApiTokenCrt): Promise<void>;
}

export interface ParseResultInfo {
  service: API_SERVICE_EX;
  orderCnt: number;
  exist: number;
  invalid: number;
}

export interface AblyOrderResp {
  order_items: AblyOrderItem[];
  current_page: number;
  default_delivery_sno: number;
  max_page_number: number;
  per_page: number;
  total_count: number;
}

export interface AblyOrderItem {
  goods_sno: number;
  goods_name: string;
  option_info: string;
  status: string;
  order_sno: number;
  sno: number;
  ordered_at: string;
  price: number;
  memo: string;
  buyer_email: string;
  delay_days: number;
  ea: number; // FIXME: Check required num of orders
}
