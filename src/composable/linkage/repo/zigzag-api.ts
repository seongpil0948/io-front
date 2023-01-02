import _axios from "@/plugin/axios";
import { AnyOrder } from "@/composable";

export interface ZigzagOrderParam {
  startDate: string;
  endDate: string;
  tokenId: string;
  userId: string;
}

export const isZigzagOrderParam = (p: any): p is ZigzagOrderParam =>
  !("mallId" in p) &&
  "startDate" in p &&
  "endDate" in p &&
  "tokenId" in p &&
  "userId" in p;

export async function getZigzagOrders(p: ZigzagOrderParam) {
  const formData = new FormData();
  formData.set("userId", p.userId);
  formData.set("startDate", p.startDate);
  formData.set("endDate", p.endDate);
  formData.set("tokenDbId", p.tokenId);
  const res = await _axios.post(`/linkage/getZigZagOrders`, formData);
  // console.log("getZigzagOrders: ", res);
  if (res.status === 200 && res.data && Array.isArray(res.data.itemList)) {
    return res.data.itemList as AnyOrder[];
  } else {
    return [] as AnyOrder[];
  }
}
