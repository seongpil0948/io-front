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
