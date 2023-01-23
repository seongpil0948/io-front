import {
  Mapper,
  AnyOrder,
  synonymFilter,
  TryNum,
  TryStr,
  MatchGarment,
  ShopUserGarment,
  mapTxt,
} from "@/composable";

export function matchCafeOrder(
  cafeOrds: AnyOrder[],
  existOrderIds: Set<string>,
  userProd: ShopUserGarment[]
) {
  const result: MatchGarment[] = [];
  for (let i = 0; i < cafeOrds.length; i++) {
    const order = cafeOrds[i];
    const orderId = order.order_id;
    if (existOrderIds.has(orderId)) continue;
    else if (order.canceled === "T") continue;
    else if (order.paid !== "T") continue;
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const inputProdName: TryStr =
        item.product_name ?? item.product_name_default;
      const orderCnt: TryNum = item.quantity;
      const prodId: TryStr = item.product_code;
      const shopProd = userProd.find(
        (x) => x.cafeProdId && x.cafeProdId === prodId
      );
      const missing = shopProd === null || shopProd === undefined;
      result.push({
        service: "CAFE",
        matchType: "id",
        orderCnt: orderCnt ?? 1,
        id: missing ? undefined : shopProd!.shopProdId,
        inputId: prodId!,
        color: missing ? undefined : shopProd!.color,
        size: missing ? undefined : shopProd!.size,
        prodName: missing ? undefined : shopProd!.prodName,
        inputProdName: inputProdName!,
        inputColor: item.option_value,
        inputSize: item.option_value,
        orderId,
      });
    }
  }
  return result;
}

export function mapCafeOrder(
  cafeOrders: AnyOrder[],
  mapper: Mapper,
  existOrdIds: Set<string>
) {
  const matches: MatchGarment[] = [];

  for (let i = 0; i < cafeOrders.length; i++) {
    const order = cafeOrders[i];

    if (order.canceled === "T") return [];
    else if (order.paid !== "T") return [];
    const result: MatchGarment[] = [];
    const orderId = order.order_id;
    const prodMapper = mapper.getProdMapper();
    // const colorColSyno = mapper.getSyno("color", false);
    // const sizeColSyno = mapper.getSyno("size", false);
    // let inputProdName: TryStr, inputSize, inputColor;
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const inputProdName = mapTxt(
        item.product_name ?? item.product_name_default
      );
      const orderCnt: TryNum = item.quantity;
      if (inputProdName.length < 1) throw new Error("카페24 상품명 파싱실패");
      else if (!orderCnt) throw new Error("카페24 주문 개수 파싱실패");

      // NOTE: use for column mapping
      // for (let j = 0; j < item.options.length; j++) {
      //   const opt = item.options[j];
      //   if (colorColSyno.includes(opt.option_name)) {
      //     inputColor = opt.option_value.option_text;
      //   } else if (sizeColSyno.includes(opt.option_name)) {
      //     inputSize = opt.option_value.option_text;
      //   }
      // }
      // if (!inputColor)
      //   throw new MapColNotFound({
      //     colName: "컬러",
      //     inputValue: item.option_value,
      //     inputProdName: inputProdName,
      //     synonyms: colorColSyno,
      //   });
      // if (!inputSize)
      //   throw new MapColNotFound({
      //     colName: "사이즈",
      //     inputValue: item.option_value,
      //     inputProdName: inputProdName,
      //     synonyms: sizeColSyno,
      //   });

      const matchedNameSynoIds = Object.keys(prodMapper).filter(
        (nameSynoId) => {
          const nameSyno = nameSynoId.split(" iobox ")[0].trim();
          return inputProdName && inputProdName === nameSyno;
        }
      );

      let synoColor, synoSize, matchedNameSynoId: string | undefined;
      if (existOrdIds.has(orderId)) continue;

      for (let i = 0; i < matchedNameSynoIds.length; i++) {
        const matchedId = matchedNameSynoIds[i];
        synoColor = synonymFilter(
          prodMapper[matchedId].colorMapper,
          mapTxt(item.option_value)
        );
        synoSize = synonymFilter(
          prodMapper[matchedId].sizeMapper,
          mapTxt(item.option_value)
        );
        if (synoSize && synoColor) {
          matchedNameSynoId = matchedId;
          break;
        }
      }
      const prodName = matchedNameSynoId
        ? prodMapper[matchedNameSynoId!].ioProdName
        : undefined;
      const size =
        matchedNameSynoId && synoSize
          ? prodMapper[matchedNameSynoId!].sizeMapper[synoSize]
          : undefined;
      const color =
        matchedNameSynoId && synoColor
          ? prodMapper[matchedNameSynoId!].colorMapper[synoColor]
          : undefined;
      const shopProdId =
        matchedNameSynoId && prodName && size && color
          ? matchedNameSynoId.split(" iobox ")[1].trim()
          : undefined;
      result.push({
        service: "CAFE",
        matchType: "map",
        orderCnt: orderCnt ?? 1,
        id: shopProdId,
        inputId: "", // id by service
        color,
        size,
        prodName,
        inputProdName: inputProdName,
        inputColor: item.option_value,
        inputSize: item.option_value,
        orderId,
      });
    }

    matches.push(...result);
  }
  return matches;
}
