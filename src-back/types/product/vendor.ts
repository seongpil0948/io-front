import type { IoUser, ShopReqOrder } from "@/composables";
import type { PART } from ".";
import type { IoUserCRT } from "../user";
import type { GENDOR } from "./part";
import type { PROD_SIZE } from "./size";
interface VendorProdCRT {
  createdAt?: Date;
  updatedAt?: Date;
  vendorProdId: string;
  vendorId: string;
  vendorProdName: string;
  gendor: GENDOR;
  part: PART;
  ctgr: string;
  color: string;
  vendorPrice: number;
  stockCnt: number;
  allowPending: boolean; // to change convert to false, have to pending Cnt = 0
  titleImgs: string[];
  bodyImgs: string[];
  size: PROD_SIZE;
  fabric: string; // 혼용률 / 제조국
  info: string; // 상세정보
  description: string;
}

type StockCntObj = {
  [size in PROD_SIZE]: {
    [color: string]: { stockCnt: number; prodId: string };
  };
};
interface VendorProdCombined
  extends Omit<VendorProdCRT, "color" | "size" | "stockCnt" | "vendorProdId"> {
  colors: string[];
  sizes: PROD_SIZE[];
  allStockCnt: number;
  stockCnt: StockCntObj;
}
interface VendorUserProd extends IoUserCRT, VendorProdCRT {}
interface VendorUserProdCombined extends IoUserCRT, VendorProdCombined {}
interface VendorOrderProd extends VendorProdCRT, ShopReqOrder {}
interface VendorUserOrderProd extends VendorProdCRT, ShopReqOrder {
  shopUser?: IoUser;
}

export type {
  VendorProdCRT,
  VendorProdCombined,
  VendorUserProd,
  VendorUserProdCombined,
  StockCntObj,
  VendorOrderProd,
  VendorUserOrderProd,
};
