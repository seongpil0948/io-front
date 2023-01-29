import {
  AnyOrder,
  API_SERVICE_EX,
  MatchGarment,
  ParseResultInfo,
  ShopUserGarment,
  TryNum,
  TryStr,
} from "@/composable";

const validStatus = ["NEW_ORDER", "AWAITING_SHIPMENT", "IN_TRANSIT"];
export function matchZigzagOrder(
  ords: AnyOrder[],
  existOrderIds: Set<string>,
  userProd: ShopUserGarment[]
) {
  const result: MatchGarment[] = [];
  const service: API_SERVICE_EX = "ZIGZAG";
  const cnt: ParseResultInfo = {
    service,
    orderCnt: ords.length,
    exist: 0,
    invalid: 0,
  };
  for (let i = 0; i < ords.length; i++) {
    const ord = ords[i];
    const orderId = ord.order.order_number;
    if (existOrderIds.has(orderId)) {
      cnt.exist += 1;
      continue;
    } else if (!validStatus.includes(ord.status)) {
      cnt.invalid += 1;
      continue;
    }
    const item = ord.product_info;
    const inputProdName: TryStr = item.name;
    const orderCnt: TryNum = ord.quantity;
    const prodId: TryStr = ord.product_id + "--" + ord.product_item_code;
    const shopProd = userProd.find(
      (x) => x.zigzagProdId && x.zigzagProdId === prodId
    );
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
      inputColor: item.options,
      inputSize: item.options,
      orderId,
    });
  }
  return { result, cnt };
}
