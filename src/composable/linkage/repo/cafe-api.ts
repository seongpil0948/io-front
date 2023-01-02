import _axios from "@/plugin/axios";
import { AnyOrder } from "@/composable";

export interface CafeOrderParam {
  startDate: string;
  endDate: string;
  tokenId: string;
  userId: string;
  mallId: string;
}

export const isCafeOrderParam = (p: any): p is CafeOrderParam =>
  "startDate" in p &&
  "endDate" in p &&
  "tokenId" in p &&
  "userId" in p &&
  "mallId" in p;

export async function getCafeOrders(p: CafeOrderParam) {
  const formData = new FormData();
  formData.set("mallId", p.mallId);
  formData.set("userId", p.userId);
  formData.set("startDate", p.startDate);
  formData.set("endDate", p.endDate);
  formData.set("tokenId", p.tokenId);
  const res = await _axios.post(`/linkage/getCafeOrders`, formData);
  if (
    res.status === 200 &&
    res.data &&
    res.data.orders &&
    Array.isArray(res.data.orders.orders)
  ) {
    return res.data.orders.orders as AnyOrder[];
  } else {
    return [] as AnyOrder[];
  }
}
