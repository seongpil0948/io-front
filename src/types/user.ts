import type { LocateCRT } from "./common";
import { IoAccount } from "@/composables";

type USER_ROLE = "SHOP" | "VENDOR" | "UNCLE" | "ADMIN" | "ANONYMOUSE";
const USER_ROLE: { [key in USER_ROLE]: USER_ROLE } = Object.freeze({
  SHOP: "SHOP",
  VENDOR: "VENDOR",
  UNCLE: "UNCLE",
  ADMIN: "ADMIN",
  ANONYMOUSE: "ANONYMOUSE",
});

type USER_PROVIDER = "EMAIL" | "KAKAO";
const USER_PROVIDER: { [key in string]: USER_PROVIDER } = Object.freeze({
  EMAIL: "EMAIL",
  KAKAO: "KAKAO",
});
type SHIP_METHOD = "UNCLE" | "SHIP";
const SHIP_METHOD: { [key in SHIP_METHOD]: string } = Object.freeze({
  UNCLE: "엉클",
  SHIP: "택배",
});
type SALE_MANAGE = "HAND_WRITE" | "ONLINE";
const SALE_MANAGE: { [key in SALE_MANAGE]: string } = Object.freeze({
  HAND_WRITE: "수기",
  ONLINE: "포스&온라인",
});
interface ShopOperInfo {
  saleAverage: string; // (10~300 / 300~1000 / 1000 ~5000 / 5000 ~ 10,000 / 10,000 ~ )
  purchaseMethod: SHIP_METHOD[keyof SHIP_METHOD]; // 현재 동대문 사입방식
}
interface VendorOperInfo {
  autoOrderApprove: boolean; // 모든주문 자동승인
  saleManageType: string; // 현재 장기 종류 (수기, 포스&온라인)
  taxDeadlineDay: number; // 세금계산서 마감일
  expectNumProdMonthly: string;
}
interface IoUserInfo {
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  providerId: USER_PROVIDER | Extract<keyof USER_PROVIDER, string>;
  userName: string;
  displayName?: string;
  email?: string;
  emailVerified: boolean;
  profileImg?: string;
  role: USER_ROLE;
  fcmTokens: string[];
  passed: boolean; // 관리자(주네)에게 허가받은 사용자 인지
}
interface CompanyInfo {
  companyName: string; // 상호명
  companyNo: string; // 사업자등록번호
  companyCertificate: string[]; // 사업자 등록증 사진
  locations: LocateCRT[];
  emailTax: string; // 세금 계산서 이메일 주소
  companyPhone: string; // 사업장 연락처
  currentAccount?: IoAccount; // 입출금 계좌
  shopLink?: string;
  ceoName: string;
  ceoPhone: string;
  managerName: string;
  managerPhone: string;
}
export interface AccountInfo {
  account: string;
  name: string;
  bankName: string;
}
interface IoUserCRT {
  userInfo: IoUserInfo;
  copanyInfo?: CompanyInfo;
  operInfo?: ShopOperInfo | VendorOperInfo;
  account?: AccountInfo;
}

export {
  type IoUserCRT,
  type IoUserInfo,
  type CompanyInfo,
  type ShopOperInfo,
  type VendorOperInfo,
  SHIP_METHOD,
  USER_ROLE,
  USER_PROVIDER,
  SALE_MANAGE,
};
