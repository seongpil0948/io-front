import { Unsubscribe } from "@firebase/firestore";
import { API_SERVICE_EX, IoUser } from "@/composable";
import { Ref } from "vue";
import { ProductCrt, PRODUCT_SIZE } from "../domain";
import { ShopGarment } from "./model";

export interface ShopProdCrt extends ProductCrt {
  vendorId: string;
  vendorProdId: string;
  shopProdId: string;
  shopId: string;
  prodPrice: number;
  prodName: string;
}

export interface ShopGarmentCrt extends ShopProdCrt {
  size: PRODUCT_SIZE;
  color: string;
  cafeProdId?: string;
  zigzagProdId?: string;
  ablyProdId?: string;
}

export type StockCntObj = {
  [size in PRODUCT_SIZE]: {
    [color: string]: { stockCnt: number; prodId: string };
  };
};

export interface ShopGarmentDB {
  getShopGarments(d: {
    shopId?: string;
    vendorId?: string;
  }): Promise<ShopGarment[]>;
  shopGarmentExist(vendorProdId: string, shopUserId: string): Promise<boolean>;
  idExist(id: string): Promise<boolean>;
  useGetShopGarments(
    shopId: string,
    condi: (prod: ShopGarment) => boolean
  ): { shopProds: Ref<ShopGarment[]>; unsubscribe: Unsubscribe };
  deleteShopGarments(userId: string, prodIds: string[]): Promise<void>;
  getBatchShopProds(shopIds: string[]): Promise<ShopUserGarment[]>;
  listByIds(shopProdIds: string[]): Promise<ShopGarment[]>;
  getById(shopProdId: string): Promise<ShopGarment | null>;
}

export interface ShopUserGarment extends IoUser, ShopGarmentCrt {}

export interface MatchGarment {
  service: API_SERVICE_EX;
  matchType: "id" | "map";
  orderCnt: number;
  id?: string;
  inputId?: string;
  color?: string;
  size?: string;
  prodName?: string;
  inputProdName?: string;
  inputColor?: string;
  inputSize?: string;
  orderId: string;
}
