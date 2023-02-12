import { UserCredential } from "@firebase/auth";
import { Firestore } from "@firebase/firestore";
import { FcmToken } from ".";
import { OutputData } from "@editorjs/editorjs/types/data-formats";
import { IoAccount, Locate } from "@io-boxies/js-lib";
type USER_ROLE =
  | "SHOP"
  | "VENDOR"
  | "UNCLE"
  | "UNCLE_WORKER"
  | "ADMIN"
  | "ANONYMOUSE";
const USER_ROLE: { [key in USER_ROLE]: string } = Object.freeze({
  SHOP: "SHOP",
  VENDOR: "VENDOR",
  UNCLE: "UNCLE",
  ADMIN: "ADMIN",
  ANONYMOUSE: "ANONYMOUSE",
  UNCLE_WORKER: "UNCLE_WORKER",
});

type USER_PROVIDER = "EMAIL" | "KAKAO" | "GOOGLE";
const USER_PROVIDER: { [key in string]: USER_PROVIDER } = Object.freeze({
  EMAIL: "EMAIL",
  KAKAO: "KAKAO",
  GOOGLE: "GOOGLE",
});
type SHIP_METHOD = "UNCLE" | "SHIP" | "NO_SHIP";
const SHIP_METHOD: { [key in SHIP_METHOD]: string } = Object.freeze({
  UNCLE: "사입삼촌",
  SHIP: "당택/택배/퀵",
  NO_SHIP: "직접사입",
});
type SALE_MANAGE = "HAND_WRITE" | "ONLINE";
const SALE_MANAGE: { [key in SALE_MANAGE]: string } = Object.freeze({
  HAND_WRITE: "수기",
  ONLINE: "포스&온라인",
});
export interface ShopOperInfo {
  saleAverage: string; // (10~300 / 300~1000 / 1000 ~5000 / 5000 ~ 10,000 / 10,000 ~ )
  purchaseMethod: SHIP_METHOD[keyof SHIP_METHOD]; // 현재 동대문 사입방식
}
export interface VendorOperInfo {
  autoOrderApprove: boolean; // 모든주문 자동승인
  saleManageType: string; // 현재 장기 종류 (수기, 포스&온라인)
  taxDeadlineDay: number; // 세금계산서 마감일
  expectNumProdMonthly: string;
}

export interface IoUserInfo {
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  providerId: USER_PROVIDER | Extract<keyof USER_PROVIDER, string>;
  userName: string;
  displayName?: string;
  account?: IoAccount; // 입출금 계좌
  email?: string;
  emailVerified: boolean;
  profileImg?: string;
  role: USER_ROLE;
  fcmTokens: FcmToken[];
  passed: boolean; // 관리자(주네)에게 허가받은 사용자 인지
  phone?: string;
  managerId?: string; // 관리자 ID 근로자일경우 not null
  workerIds?: string[]; // 근로자 ID목록 관리자일경우 not null
  uncleId?: string; // 엉클이 아닌 유저의 계약 엉클 아이디
}
export interface CompanyInfo {
  companyName: string; // 상호명
  companyNo: string; // 사업자등록번호
  companyCertificate: string[]; // 사업자 등록증 사진
  locations: Locate[];
  shipLocate?: Locate;
  emailTax: string; // 세금 계산서 이메일 주소
  companyPhone: string; // 사업장 연락처
  shopLink?: string;
  ceoName: string;
  ceoPhone: string;
  managerName: string;
  managerPhone: string;
}
export interface LocateAmount {
  locate: Locate;
  amount: number;
}
export interface UncleInfo {
  pickupLocates: LocateAmount[];
  shipLocates: LocateAmount[];
  amountBySize: { [unit: string]: number };
  amountByWeight: { [unit: string]: number };
  shipPendingAmount: number;
}
export interface ShopInfo {
  uncleUserIds: string[];
}
export type SalaryMethod = "CHANGE_MIND" | "CHANGE_MIND" | "CHANGE_MIND";

export const SalaryMethod: { [key in SalaryMethod]: SalaryMethod } =
  Object.freeze({
    CHANGE_MIND: "CHANGE_MIND",
  });
export type FormOfEmployee = "PART_TIME" | "FULL_TIME";
export const FormOfEmployee: { [key in FormOfEmployee]: FormOfEmployee } =
  Object.freeze({
    PART_TIME: "PART_TIME",
    FULL_TIME: "FULL_TIME",
  });
export interface WorkerInfo {
  areaInCharges: Location[];
  formOfEmp: FormOfEmployee;
  payday: number;
  empContract: string[];
}

export interface IoUser {
  userInfo: IoUserInfo;
  companyInfo?: CompanyInfo;
  operInfo?: ShopOperInfo | VendorOperInfo;
  uncleInfo?: UncleInfo; // uncle manager info
  preferDark?: boolean;
  shopInfo?: ShopInfo;
  workerInfo?: WorkerInfo;
  workState?: string;
  connectState?: string;
  orderMemo?: OutputData;
}
export type UserFields = CompanyInfo &
  IoUserInfo &
  ShopOperInfo &
  VendorOperInfo;
export interface UserDB {
  getUserById(
    store: Firestore,
    uid: string,
    okVirtual?: boolean
  ): Promise<IoUser | null | undefined>;
  getUserByIds(store: Firestore, uids: string[]): Promise<IoUser[]>;
  getUsersByRole(store: Firestore, role: USER_ROLE): Promise<IoUser[]>;
  ioSignUpCredential(
    uc: UserCredential,
    name: string,
    role: USER_ROLE
  ): Promise<IoUser>;
  updateUser(store: Firestore, u: IoUser): Promise<void>;
}

export { SHIP_METHOD, USER_ROLE, USER_PROVIDER, SALE_MANAGE };
