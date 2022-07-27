export type LocateType = "매장" | "창고" | "기타";
export const LocateType: { [key: string]: LocateType } = {
  SHOP: "매장",
  STORAGE: "창고",
  ETC: "기타",
};
export interface LocateCRT {
  alias: string;
  latitude?: number; // 위도
  longitude?: number; // 경도
  detailLocate?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  postalCode?: string;
  country: string;
  city?: string;
  loateType: LocateType;
}

export type BOOL_M = "T" | "F" | "M";
export const BOOL_M: { [key in BOOL_M]: BOOL_M } = Object.freeze({
  T: "T",
  F: "F",
  M: "M",
});

export type SHIP_STATE =
  | "BEFORE_READY"
  | "BEFORE_SHIP"
  | "ON_GOING"
  | "DONE"
  | "PENDING";

export const SHIP_STATE: { [key in SHIP_STATE]: SHIP_STATE } = Object.freeze({
  BEFORE_READY: "BEFORE_READY",
  BEFORE_SHIP: "BEFORE_SHIP",
  ON_GOING: "ON_GOING",
  DONE: "DONE",
  PENDING: "PENDING",
});

export interface CRUD_DB {
  create(arg: any): Promise<void>;
  update(arg: any): Promise<void>;
  delete(arg: any): Promise<void>;
  read(arg: any): Promise<void>;
}
export interface CRUD_DB_BATCH {
  batchCreate(arg: any): Promise<void>;
  batchUpdate(arg: any): Promise<void>;
  batchDelete(arg: any): Promise<void>;
  batchRead(arg: any): Promise<void>;
}
