import { Ref } from "vue";

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

export interface CRUD_DB<T> {
  create(arg: T): Promise<T>;
  update(dbId: string): Promise<void>;
  delete(dbId: string): Promise<void>;
  read(dbId: string): Promise<T>;
}
export interface CRUD_DB_BATCH<T> {
  batchCreate(args: T[]): Promise<T[]>;
  batchUpdate(args: T[]): Promise<void>;
  batchDelete(ids: string[]): Promise<void>;
  batchRead(args: any[]): Promise<T[]>;
  batchReadListen(args: any[]): { items: Ref<T[]>; unsubscribe: () => void };
}
