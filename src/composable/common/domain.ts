export type PAID_INFO = "OVERCOME" | "CREDIT" | "EXACT" | "NO";
export const PAID_INFO: { [key in PAID_INFO]: PAID_INFO } = Object.freeze({
  OVERCOME: "OVERCOME",
  CREDIT: "CREDIT",
  EXACT: "EXACT",
  NO: "NO",
});

export type TryStr = string | undefined | null;
export type TryNum = number | undefined | null;

export type VISIBILITY = "NO" | "ME" | "GLOBAL";
export const VISIBILITY: { [key in VISIBILITY]: VISIBILITY } = Object.freeze({
  NO: "NO",
  ME: "ME",
  GLOBAL: "GLOBAL",
});
