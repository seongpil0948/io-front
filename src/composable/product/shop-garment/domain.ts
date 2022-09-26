import { Unsubscribe } from "@firebase/firestore";
import { IoUserCRT, API_SERVICE_EX } from "@/composable";
import { Ref } from "vue";
import { ProductCrt, GARMENT_SIZE } from "../domain";
import { ShopGarment } from "./model";

export interface GarmentOrderCondi {
  prodName: string;
  size: string;
  color: string;
  orderId: string;
  orderCnt?: number;
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
  cafeProdId?: string;
}

export type StockCntObj = {
  [size in GARMENT_SIZE]: {
    [color: string]: { stockCnt: number; prodId: string };
  };
};

export interface ShopGarmentDB {
  shopGarmentExist(vendorProdId: string, shopUserId: string): Promise<boolean>;
  useGetShopGarments(
    shopId: string,
    condi: (prod: ShopGarment) => boolean
  ): { shopProds: Ref<ShopGarment[]>; unsubscribe: Unsubscribe };
  deleteShopGarments(userId: string, prodIds: string[]): Promise<void>;
  getBatchShopProds(shopIds: string[]): Promise<ShopUserGarment[]>;
}

export interface ShopUserGarment extends IoUserCRT, ShopGarmentCrt {}

export interface MatchGarment {
  service: API_SERVICE_EX;
  orderCnt: number;
  id?: string;
  inputId: string;
  color?: string;
  size?: string;
  prodName?: string;
  inputProdName?: string;
  optionValue?: string;
  orderId: string;
}
