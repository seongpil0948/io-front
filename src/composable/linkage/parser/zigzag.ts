import {
  AnyOrder,
  MatchGarment,
  ShopUserGarment,
  TryNum,
  TryStr,
} from "@/composable";
// TODO
// 1. 토큰에 alias 와 accessKey Field를 추가한다.
// 2. 유저 하위 컬렉션(secret)으로 accessKey를 docId 인 secretKey를 저장하는 문서를 만든다
// 3. secretKey는 client side 에서 가져오지 못하며
const validStatus = ["NEW_ORDER", "AWAITING_SHIPMENT", "IN_TRANSIT"];
export function matchZigzagOrder(
  ords: AnyOrder[],
  existOrderIds: Set<string>,
  userProd: ShopUserGarment[]
) {
  const result: MatchGarment[] = [];
  const cnt = { orderCnt: ords.length, exist: 0, invalid: 0 };
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
      service: "ZIGZAG",
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