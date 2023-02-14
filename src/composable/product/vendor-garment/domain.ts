import {
  PRODUCT_SIZE,
  IoOrder,
  GENDER,
  PART,
  StockCntObj,
  VendorProdCrt,
  VendorGarment,
  PayAmount,
  OrderItem,
  PaginateParam,
  IoUser,
} from "@/composable";
import { Ref } from "vue";

export interface VendorGarmentCrt extends VendorProdCrt {
  gender: GENDER;
  part: PART;
  ctgr: string;
  color: string;
  allowPending: boolean;
  size: PRODUCT_SIZE;
  fabric: string;
}

export interface VendorGarmentCombined
  extends Omit<
    VendorGarmentCrt,
    "color" | "size" | "stockCnt" | "vendorProdId"
  > {
  colors: string[];
  sizes: PRODUCT_SIZE[];
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
    Partial<PayAmount>,
    Omit<Partial<OrderItem>, "prodType" | "vendorId"> {
  shopUser?: IoUser;
}
export interface VendorProdSimilar {
  vendorId: string;
  vendorProdName: string;
}
export interface VendorProdSame extends VendorProdSimilar {
  color: string;
  size: string;
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
  list(d: { vendorId?: string }): Promise<VendorGarment[]>;
  listByIds(vendorProdIds: string[]): Promise<VendorGarment[]>;
  listByIdsWithUser(vendorProdIds: string[]): Promise<VendorUserGarment[]>;
  listByVendorIds(vendorIds: string[]): Promise<VendorUserGarment[]>;
  listUserGarmentCombined(
    d: PaginateParam<VendorUserGarmentCombined>
  ): Promise<{
    data: VendorUserGarmentCombined[];
    noMore: boolean;
  }>;
  getById(vendorProdId: string): Promise<VendorGarment | null>;
  getByIdWithUser(vendorProdId: string): Promise<VendorUserGarment | null>;
  getSimilarProds(d: VendorProdSimilar): Promise<VendorGarment[]>;
  updateSimilarProd(
    d: VendorProdSimilar,
    data: { [k: string]: any }
  ): Promise<void>;
  existSameProd(d: VendorProdSame): Promise<boolean>;
}
