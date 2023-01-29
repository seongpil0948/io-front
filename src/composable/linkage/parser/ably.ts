import {
  AblyOrderItem,
  AblyOrderResp,
  API_SERVICE_EX,
  MatchGarment,
  ParseResultInfo,
  ShopUserGarment,
} from "@/composable";
import _axios from "@/plugin/axios";

export interface AblyInputParam {
  userId: string;
  startDate: string; // 2022-12-28
  endDate: string;
  page: number;
  email: string;
}
export const isAblyInputParam = (p: any): p is AblyInputParam =>
  "email" in p && "page" in p;

export async function getAblyOrders(
  p: AblyInputParam
): Promise<AblyOrderItem[]> {
  const formData = new FormData();
  formData.set("userId", p.userId);
  formData.set("startDate", p.startDate);
  formData.set("endDate", p.endDate);
  formData.set("page", String(p.page));
  formData.set("email", p.email);
  const saveRes = await _axios.post(`/linkage/getAblyOrders`, formData);

  console.log("saveRes: ", saveRes);
  return (saveRes.data as AblyOrderResp) &&
    Array.isArray(saveRes.data.order_items)
    ? saveRes.data.order_items
    : [];
}
const targetStatus = ["상품 준비중", "결제 완료", "배송지연"];
export function matchAblyOrder(
  ablyOrds: AblyOrderItem[],
  existOrderIds: Set<string>,
  userProd: ShopUserGarment[]
) {
  const result: MatchGarment[] = [];
  const service: API_SERVICE_EX = "ABLY";
  const cnt: ParseResultInfo = {
    service,
    orderCnt: ablyOrds.length,
    exist: 0,
    invalid: 0,
  };
  for (let i = 0; i < ablyOrds.length; i++) {
    const item = ablyOrds[i];
    const orderId = String(item.order_sno);
    if (existOrderIds.has(orderId)) {
      cnt.exist += 1;
      continue;
    } else if (!targetStatus.includes(item.status)) {
      cnt.invalid += 1;
      continue;
    }
    const inputProdName = item.goods_name;
    const orderCnt = item.ea;
    const prodId = String(item.goods_sno);
    const shopProd = userProd.find(
      (x) => x.ablyProdId && x.ablyProdId === prodId
    );
    console.info("item passed", item);
    const missing = shopProd === null || shopProd === undefined;
    result.push({
      service,
      matchType: "id",
      orderCnt: orderCnt ?? 1,
      id: missing ? undefined : shopProd!.shopProdId,
      inputId: prodId!,
      color: missing ? undefined : shopProd!.color,
      size: missing ? undefined : shopProd!.size,
      prodName: missing ? undefined : shopProd!.prodName,
      inputProdName: inputProdName!,
      inputColor: item.option_info,
      inputSize: item.option_info,
      orderId,
    });
  }
  return { result, cnt };
}
