import { Unsubscribe } from "@firebase/util";
import { Ref } from "vue";
import { ApiToken } from "..";

export type API_SERVICE_EX = "CAFE" | "ZIGZAG";
export const API_SERVICE_EX: { [key in API_SERVICE_EX]: API_SERVICE_EX } =
  Object.freeze({
    CAFE: "CAFE",
    ZIGZAG: "ZIGZAG",
  });

export interface ApiTokenCrt {
  dbId: string;
  clientId: string;
  createdAt?: Date;
  updatedAt?: Date;
  expireAt: Date;
  refreshExpireAt: Date;
  mallId: string;
  scopes: string[];
  service: API_SERVICE_EX;
  serviceId?: string;
  shopNo?: string;
  userId: string;
}

export interface LinkageDB {
  getTokensByIdListen(uid: string): {
    tokens: Ref<ApiToken[]>;
    unsubscribe: Unsubscribe;
  };
}
