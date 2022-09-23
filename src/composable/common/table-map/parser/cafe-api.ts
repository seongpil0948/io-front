import {
  CafeOrder,
  GarmentOrderCondi,
  Mapper,
  synonymFilter,
} from "@/composable";

type TryStr = string | undefined | null;
type TryNum = number | undefined | null;
// const garmentTargetCols = ["prodName", "size", "color", "orderId"];
export function mapCafeOrder(
  order: CafeOrder,
  mapper: Mapper,
  existIds: Set<string>
): GarmentOrderCondi[] {
  const result: GarmentOrderCondi[] = [];
  const orderId = order.order_id;
  const prodMapper = mapper.getProdMapper();
  if (Object.keys(prodMapper).length === 0)
    throw new Error("주문취합을 위해 상품매핑정보를 등록 해주십시오");
  const colorColSyno = mapper.getSyno("color", false);
  const sizeColSyno = mapper.getSyno("size", false);

  for (let i = 0; i < order.items.length; i++) {
    const item = order.items[i];
    const prodName: TryStr = item.product_name ?? item.product_name_default;
    const orderCnt: TryNum = item.quantity;
    if (!prodName) throw new Error("카페24 상품명 파싱실패");
    else if (!orderCnt) throw new Error("카페24 주문 개수 파싱실패");

    // >>> parse options >>>
    const optVal = {
      color: null,
      size: null,
    };
    for (let j = 0; j < item.options.length; j++) {
      const opt = item.options[j];
      if (colorColSyno.includes(opt.option_name)) {
        optVal.color = opt.option_value.option_text;
      } else if (sizeColSyno.includes(opt.option_name)) {
        optVal.size = opt.option_value.option_text;
      }
    }
    if (!optVal.color)
      throw new Error(
        `상품: ${prodName} 컬럼매핑 실패: 카페24 옵션목록 ${item.option_value} 에서 컬러옵션를 찾을 수 없습니다.매핑 컬러목록: ${colorColSyno}`
      );
    if (!optVal.size)
      throw new Error(
        `상품: ${prodName} 컬럼매핑 실패: 카페24 옵션목록 ${item.option_value} 에서 사이즈를 찾을 수 없습니다. 매핑 사이즈목록: ${sizeColSyno}`
      );

    const matchedNameSynoIds = Object.keys(prodMapper).filter((nameSynoId) => {
      const nameSyno = nameSynoId.split(" iobox ")[0].trim();
      return prodName && prodName === nameSyno;
    });
    if (matchedNameSynoIds.length < 1) {
      throw new Error(`상품명 매핑실패: ${prodName}`);
    } else if (existIds.has(orderId)) {
      return [];
    }
    // <<< parse options <<<
    let synoColor = undefined;
    let synoSize = undefined;
    let matchedNameSynoId = undefined;
    for (let i = 0; i < matchedNameSynoIds.length; i++) {
      const matchedId = matchedNameSynoIds[i];
      synoColor = synonymFilter(
        prodMapper[matchedId].colorMapper,
        optVal.color
      );
      synoSize = synonymFilter(prodMapper[matchedId].sizeMapper, optVal.size);
      if (synoSize && synoColor) {
        matchedNameSynoId = matchedId;
        break;
      }
    }
    if (!synoColor || !synoSize) {
      const message = `${prodName} 상품의 옵션 매핑에 실패 하였습니다.`;
      // if (!synoColor) {
      //   msg += ` 컬러 매핑실패정보,${color} `;
      // }
      // if (!synoSize) {
      //   msg += ` 사이즈 매핑실패정보: ${ord[sizeField]} `;
      // }
      throw new Error(message);
    }

    result.push({
      prodName: prodMapper[matchedNameSynoId!].ioProdName,
      size: prodMapper[matchedNameSynoId!].sizeMapper[synoSize],
      color: prodMapper[matchedNameSynoId!].colorMapper[synoColor],
      orderId,
      orderCnt,
    });
  }
  return result;
}
