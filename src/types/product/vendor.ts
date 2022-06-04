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
  allowPending: boolean;
  titleImgs: string[];
  bodyImgs: string[];
  detailImgs: string[];
  size: PROD_SIZE;
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
export type {
  VendorProdCRT,
  VendorProdCombined,
  VendorUserProd,
  VendorUserProdCombined,
  StockCntObj,
};
