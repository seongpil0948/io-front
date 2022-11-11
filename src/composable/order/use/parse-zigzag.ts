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
const validStatus = ["NEW_ORDER"];
export function matchZigzagOrder(
  ords: AnyOrder[],
  existOrderIds: Set<string>,
  alias: string,
  userProd: ShopUserGarment[]
) {
  const result: MatchGarment[] = [];
  for (let i = 0; i < ords.length; i++) {
    const ord = ords[i];
    const orderId = ord.order.order_number;
    if (existOrderIds.has(orderId)) continue;
    else if (!validStatus.includes(ord.status)) continue;
    const item = ord.product_info;
    const inputProdName: TryStr = item.name;
    const orderCnt: TryNum = ord.quantity;
    const prodId: TryStr =
      alias + "--" + ord.product_id + "--" + ord.product_item_code;
    const garment = userProd.find(
      (x) => x.zigzagProdId && x.zigzagProdId === prodId
    );
    const missing = garment === null || garment === undefined;
    result.push({
      service: "ZIGZAG",
      orderCnt: orderCnt ?? 1,
      id: missing ? undefined : garment!.shopProdId,
      inputId: prodId!,
      color: missing ? undefined : garment!.color,
      size: missing ? undefined : garment!.size,
      prodName: missing ? undefined : garment!.prodName,
      inputProdName: inputProdName!,
      optionValue: item.options,
      orderId,
    });
  }
  return result;
}
