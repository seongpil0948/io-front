import type { ShopUserProd } from "@/types";
import type { PROD_SIZE } from "../product";
import type { ORDER_STATE } from "./state";

export interface ShopReqOrderCRT {
  createdAt?: Date;
  updatedAt?: Date;
  orderId: string;
  vendorId: string;
  vendorProdId: string;
  shopId: string;
  shopProdId: string;
  color: string;
  size: PROD_SIZE;
  orderCount: number;
  amount: number;
  stockCnt: number;
  orderState: ORDER_STATE;
  preOrderCount: number;
}
export type ShopReqOrderJoined = ShopReqOrderCRT & Partial<ShopUserProd>;
