import {
  GarmentOrderCondi,
  useShopUserGarments,
  Mapper,
  garmentOrderFromCondi,
  AnyOrder,
  synonymFilter,
  TryNum,
  TryStr,
  ApiToken,
  MatchGarment,
  ShopUserGarment,
} from "@/composable";
import { logger } from "@/plugin/logger";
import { useVendorsStore } from "@/store";
import { makeMsgOpt } from "@/util";
import { useMessage } from "naive-ui";
import { Ref, ref } from "vue";

export function matchCafeOrder(
  cafeOrds: AnyOrder[],
  token: ApiToken,
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
      const prodId: TryStr = token.mallId + item.product_code;
      const shopProd = userProd.find(
        (x) => x.cafeProdId && x.cafeProdId === prodId
      );
      const missing = shopProd === null || shopProd === undefined;
      result.push({
        service: "CAFE",
        orderCnt: orderCnt ?? 1,
        id: missing ? undefined : shopProd!.shopProdId,
        inputId: prodId!,
        color: missing ? undefined : shopProd!.color,
        size: missing ? undefined : shopProd!.size,
        prodName: missing ? undefined : shopProd!.prodName,
        inputProdName: inputProdName!,
        optionValue: item.option_value,
        orderId,
      });
    }
  }
  return result;
}

export function useMappingOrderCafe(
  mapper: Ref<Mapper | null>,
  userId: string,
  existIds: Ref<Set<string>>
) {
  const conditions = ref<GarmentOrderCondi[]>([]);
  const vendorStore = useVendorsStore();
  const { userProd } = useShopUserGarments(userId, conditions);
  const msg = useMessage();

  function parseCafeOrder(cafeOrders: AnyOrder[]) {
    conditions.value = [];
    const reporter = [] as any[];
    if (!mapper.value) return;

    for (let i = 0; i < cafeOrders.length; i++) {
      const cafeOrd = cafeOrders[i];
      try {
        const condi = mapCafeOrder(cafeOrd, mapper.value, existIds.value);
        conditions.value = [...conditions.value, ...condi];
      } catch (err) {
        if (err instanceof Error) {
          reporter.push(err.message);
        } else {
          throw err;
        }
      }
    }
    reporter.forEach((err) => {
      msg.error(err, makeMsgOpt({ duration: 20000 }));
      logger.error(userId, err);
    });

    return garmentOrderFromCondi(
      conditions.value,
      vendorStore.vendorUserGarments,
      userProd.value
    );
  }

  return { parseCafeOrder, conditions };
}

function mapCafeOrder(
  order: AnyOrder,
  mapper: Mapper,
  existIds: Set<string>
): GarmentOrderCondi[] {
  if (order.canceled === "T") return [];
  else if (order.paid !== "T") return [];
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
