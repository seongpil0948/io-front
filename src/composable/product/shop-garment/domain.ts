import { IoUserCRT } from "@/composable";
import { CRUD_DB } from "@/composable/common";
import { Ref } from "vue";
import { ProductCrt, GARMENT_SIZE } from "../domain";
import { ShopGarment } from "./model";

export interface ShopGarmentQField {
  prodName: string;
  size: string;
  color: string;
  orderId: string;
}

export interface ShopProdCrt extends ProductCrt {
  vendorId: string;
  vendorProdId: string;
  shopProdId: string;
  shopId: string;
  prodPrice: number;
  prodName: string;
}

export interface ShopGarmentCrt extends ShopProdCrt {
  size: GARMENT_SIZE;
  color: string;
}

export type StockCntObj = {
  [size in GARMENT_SIZE]: {
    [color: string]: { stockCnt: number; prodId: string };
  };
};

export interface ShopGarmentDB extends CRUD_DB<ShopGarment> {
  shopGarmentExist(vendorProdId: string, shopUserId: string): Promise<boolean>;
  useGetGarmentProds(
    shopId: string,
    condi: (prod: ShopGarment) => boolean
  ): Ref<ShopGarment[]>;
}

export interface ShopUserGarment extends IoUserCRT, ShopGarmentCrt {}
