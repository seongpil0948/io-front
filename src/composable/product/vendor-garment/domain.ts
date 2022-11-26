import {
  GARMENT_SIZE,
  IoOrder,
  GENDER,
  PART,
  StockCntObj,
  VendorProdCrt,
  VendorGarment,
  OrderAmount,
  OrderItem,
} from "@/composable";
import { IoUser } from "@io-boxies/js-lib";
import { Ref } from "vue";

export interface VendorGarmentCrt extends VendorProdCrt {
  gender: GENDER;
  part: PART;
  ctgr: string;
  color: string;
  allowPending: boolean;
  size: GARMENT_SIZE;
  fabric: string;
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
export interface VendorUserGarment extends IoUser, VendorGarmentCrt {}
export interface VendorUserGarmentCombined
  extends IoUser,
    VendorGarmentCombined {}
export interface VendorOrderGarment extends VendorGarmentCrt, IoOrder {}
export interface VendorUserOrderGarment
  extends VendorUserGarment,
    OrderAmount,
    OrderItem {
  shopUser?: IoUser;
}
export interface VendorGarmentDB {
  incrementStockCnt(cnt: number, vendorProdId: string): Promise<void>;
  batchReadListen(args: any[]): {
    items: Ref<VendorGarment[]>;
    unsubscribe: () => void;
  };
  batchUpdate(args: VendorGarment[]): Promise<void>;
  batchCreate(userId: string, args: VendorGarment[]): Promise<void>;
  delete(prodId: string): Promise<void>;
}
