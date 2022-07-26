import {
  IoUserCRT,
  IoUser,
  CRUD_DB,
  OrderCrt,
  GARMENT_SIZE,
  GENDER,
  PART,
  StockCntObj,
  VendorProdCrt,
} from "@/module";
import { VendorGarment } from "./model";

export interface VendorGarmentCrt extends VendorProdCrt {
  gender: GENDER;
  part: PART;
  ctgr: string;
  color: string;
  allowPending: boolean;
  size: GARMENT_SIZE;
  fabric: string;
  get combineId(): string;
}

export interface VendorGarmentCombined
  extends Omit<
    VendorGarmentCrt,
    "color" | "size" | "stockCnt" | "vendorProdId"
  > {
  colors: string[];
  sizes: GARMENT_SIZE[];
  allStockCnt: number;
  stockCnt: StockCntObj;
}
export interface VendorUserGarment extends IoUserCRT, VendorGarmentCrt {}
export interface VendorUserGarmentCombined
  extends IoUserCRT,
    VendorGarmentCombined {}
export interface VendorOrderGarment<O> extends VendorGarmentCrt, OrderCrt<O> {}
export interface VendorUserOrderGarment<O>
  extends VendorGarmentCrt,
    OrderCrt<O> {
  shopUser?: IoUser;
}
export interface VendorGarmentDB extends CRUD_DB {
  getVendorGarment(vendorId: string | null): Promise<VendorGarment[]>;
}
