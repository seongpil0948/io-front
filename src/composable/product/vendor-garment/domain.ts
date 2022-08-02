import {
  IoUserCRT,
  IoUser,
  OrderCrt,
  GARMENT_SIZE,
  GENDER,
  PART,
  StockCntObj,
  VendorProdCrt,
  VendorGarment,
} from "@/composable";
import { Ref } from "vue";

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
export interface VendorOrderGarment extends VendorGarmentCrt, OrderCrt {}
export interface VendorUserOrderGarment extends VendorGarmentCrt, OrderCrt {
  shopUser?: IoUser;
}
export interface VendorGarmentDB {
  batchReadListen(args: any[]): {
    items: Ref<VendorGarment[]>;
    unsubscribe: () => void;
  };
  batchUpdate(args: VendorGarment[]): Promise<void>;
}
