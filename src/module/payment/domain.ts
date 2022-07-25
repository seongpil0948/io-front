export type PayMethod = "CASH" | "NO_BANKBOOK" | "CARD";
export const PayMethod: { [key in PayMethod]: PayMethod } = Object.freeze({
  CASH: "CASH",
  NO_BANKBOOK: "NO_BANKBOOK",
  CARD: "CARD",
});

export type IO_BANKS =
  | "NH"
  | "SHINHAN"
  | "HANA"
  | "CITY"
  | "SC_JAIL"
  | "KB_STAR";
export const IO_BANKS: { [key in IO_BANKS]: IO_BANKS } = Object.freeze({
  NH: "NH",
  SHINHAN: "SHINHAN",
  HANA: "HANA",
  CITY: "CITY",
  SC_JAIL: "SC_JAIL",
  KB_STAR: "KB_STAR",
});

export interface AccountCRT {
  userId: string;
  accountNumber: string;
  bank: IO_BANKS;
}
