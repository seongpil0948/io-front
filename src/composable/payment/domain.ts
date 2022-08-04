import { Ref } from "vue";
import { IoPay } from "./model";
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

export interface PaymentDB {
  getIoPayByUser(uid: string): Promise<IoPay>;
  getIoPayByUserListen(uid: string): Ref<IoPay | null>;
}

export interface IoPayCRT {
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  budget: number;
  pendingBudget: number;
  history: PayHistoryCRT[];
}
export type PAY_HIST_STATE = "CHARGE" | "WITH_DRAW" | "USE";
export const PAY_HIST_STATE: { [key in PAY_HIST_STATE]: string } = {
  CHARGE: "충전",
  WITH_DRAW: "인출",
  USE: "사용",
};

export interface PayHistoryCRT {
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  amount: number; // 변동 스푼 량
  state: PAY_HIST_STATE;
  tbd: { [k: string]: any };
}
