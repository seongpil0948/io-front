import { PAID_INFO } from "../common";
import { PAY_METHOD } from "../payment";
import { TransType } from "./common";

export const PaidInfoDict: TransType<PAID_INFO> = {
  ko: {
    CREDIT: "외상",
    EXACT: "결제완료",
    NO: "미결제",
    OVERCOME: "초과결제",
  },
  en: {
    CREDIT: "credit",
    EXACT: "extract",
    NO: "no",
    OVERCOME: "overcome",
  },
  cn: {
    CREDIT: "赊账",
    EXACT: "摘录",
    NO: "没有",
    OVERCOME: "超额结算",
  },
};
export const PayMethodDict: TransType<PAY_METHOD> = {
  ko: {
    CASH: "현금결제",
    DEPOSIT: "계좌이체",
  },
  en: {
    CASH: "cash",
    DEPOSIT: "deposit",
  },
  cn: {
    CASH: "现款",
    DEPOSIT: "汇款/寄钱",
  },
};
