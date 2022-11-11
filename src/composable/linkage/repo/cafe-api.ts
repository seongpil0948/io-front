import _axios from "@/plugin/axios";
import { AnyOrder } from ".";
export async function getCafeOrders(
  startDate: string,
  endDate: string,
  tokenId: string,
  userId: string,
  mallId: string
) {
  const formData = new FormData();
  formData.set("mallId", mallId);
  formData.set("userId", userId);
  formData.set("startDate", startDate);
  formData.set("endDate", endDate);
  formData.set("tokenId", tokenId);
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
