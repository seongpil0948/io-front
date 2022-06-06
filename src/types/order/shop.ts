import type { ShopUserProd } from "@/types";
import type { ORDER_STATE } from "./state";

export interface ShopReqOrderCRT {
  createdAt?: Date;
  updatedAt?: Date;
  orderId: string;
  vendorId: string;
  vendorProdId: string;
  shopId: string;
  shopProdId: string;
  orderCnt: number;
  activeCnt: number;
  pendingCnt: number;
  amount: number;
  amountPaid: number;
  orderState: ORDER_STATE;
  waitApprove: boolean;
}
export type ShopReqOrderJoined = ShopReqOrderCRT & Partial<ShopUserProd>;
