import { Ref } from "vue";
import { IoPay } from "./model";
export type PAY_METHOD = "CASH" | "DEPOSIT";
export const PAY_METHOD: { [key in PAY_METHOD]: PAY_METHOD } = Object.freeze({
  CASH: "CASH",
  DEPOSIT: "DEPOSIT",
});

export type IO_BANKS =
  | "NH" // 농협
  | "SHINHAN" // 신한
  | "HANA" // 하나
  | "CITY" // 한국씨티
  | "SC_JAIL" // 제일
  | "KB_STAR" // 국민
  | "KAKAO" // 카뱅
  | "IBK" // 기업
  | "KDB" // KDB 산업
  | "WOORI" // 우리
  | "BNK" // 경남
  | "KJ" // 광주
  | "DGB" // 대구
  | "Deutsche" // 도이치
  | "BANK_OF_AMERICA" // 뱅크오브아메리카
  | "BUSAN" // 부산
  | "SANRIM" // 산림조합중앙회
  | "MG" // 새마을금고
  | "SUHYUP" // 수협
  | "SINHYUP" // 신협중앙회
  | "WOOCHE" // 우체국
  | "JB_BANK" // 전북
  | "JEJU" // 제주
  | "CCB" // 중국건설
  | "ICBC" // 중국공상
  | "CHINA" // 중국
  | "BNP" // BNP파리바
  | "HSBC" // HSBC
  | "JP" // 모간체이스
  | "K_BANK" // 케이뱅크
  | "TOSS"; // 토스뱅크

export const IO_BANKS: { [key in IO_BANKS]: IO_BANKS } = Object.freeze({
  NH: "NH",
  SHINHAN: "SHINHAN",
  HANA: "HANA",
  CITY: "CITY",
  SC_JAIL: "SC_JAIL",
  KB_STAR: "KB_STAR",
  KAKAO: "KAKAO",
  IBK: "IBK",
  KDB: "KDB",
  WOORI: "WOORI",
  BNK: "BNK",
  KJ: "KJ",
  DGB: "DGB",
  Deutsche: "Deutsche",
  BANK_OF_AMERICA: "BANK_OF_AMERICA",
  BUSAN: "BUSAN",
  SANRIM: "SANRIM",
  MG: "MG",
  SUHYUP: "SUHYUP",
  SINHYUP: "SINHYUP",
  WOOCHE: "WOOCHE",
  JB_BANK: "JB_BANK",
  JEJU: "JEJU",
  CCB: "CCB",
  ICBC: "ICBC",
  CHINA: "CHINA",
  BNP: "BNP",
  HSBC: "HSBC",
  JP: "JP",
  K_BANK: "K_BANK",
  TOSS: "TOSS",
});

export interface PaymentDB {
  getIoPayByUser(uid: string): Promise<IoPay>;
  getIoPayByUserListen(uid: string): {
    userPay: Ref<IoPay | null>;
    unsubscribe: () => void;
  };
  getIoPaysListen(): { usersPay: Ref<IoPay[]>; unsubscribe: () => void };
}

export interface IoPayCRT {
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  budget: number;
  pendingBudget: number;
  history: PayHistoryCRT[];
}
export type PAY_HIST_STATE =
  | "CHARGE"
  | "WITH_DRAW"
  | "USE"
  | "ADMIN_MODIFY"
  | "APPROVE_PICKUP"
  | "ORDER_GARMENT"
  | "ORDER_APPROVE"
  | "ORDER_REJECT";

export const PAY_HIST_STATE: { [key in PAY_HIST_STATE]: string } = {
  CHARGE: "충전",
  WITH_DRAW: "인출",
  USE: "사용",
  ADMIN_MODIFY: "관리자수정",
  ORDER_GARMENT: "도매처주문",
  ORDER_APPROVE: "도매처주문승인",
  ORDER_REJECT: "도매처주문거절",
  APPROVE_PICKUP: "픽업승인",
};

export interface PayHistoryCRT {
  createdAt?: Date;
  userId: string;
  amount: number; // 변동 보류 금액량
  pendingAmount: number; // 변동 보류 금액량
  state: PAY_HIST_STATE;
  tbd: { [k: string]: any };
}
