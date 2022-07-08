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
  unPaidAmount?: number;
  amountPaid: number;
  orderState: ORDER_STATE;
  waitApprove: boolean;
  dbId: string;
}
export interface ShopReqOrderJoined extends ShopReqOrderCRT, ShopUserProd {}
export interface ShopOrderCombined extends ShopReqOrderJoined {
  cnt: number;
  orderStates: ORDER_STATE[];
  amounts: number[];
  pendingCnts: number[];
  unPaidAmounts: number[];
}
