export type BOOL_M = "T" | "F" | "M";
export const BOOL_M: { [key in BOOL_M]: BOOL_M } = Object.freeze({
  T: "T",
  F: "F",
  M: "M",
});

export type TryStr = string | undefined | null;
export type TryNum = number | undefined | null;
