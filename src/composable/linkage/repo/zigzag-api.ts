import _axios from "@/plugin/axios";
import { AnyOrder } from ".";

export async function getZigzagOrders(
  startDate: string,
  endDate: string,
  tokenId: string,
  userId: string
) {
  const formData = new FormData();
  formData.set("userId", userId);
  formData.set("startDate", startDate);
  formData.set("endDate", endDate);
  formData.set("tokenDbId", tokenId);
  const res = await _axios.post(`/linkage/getZigZagOrders`, formData);
  // console.log("getZigzagOrders: ", res);
  if (res.status === 200 && res.data && Array.isArray(res.data.itemList)) {
    return res.data.itemList as AnyOrder[];
  } else {
    return [] as AnyOrder[];
  }
}
