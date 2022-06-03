import {
  getShopOrderInfo,
  getVendorGroupOrderInfo,
  getExistOrderIds,
} from "@/plugins/firebase";
import type {
  MapKey,
  ORDER_STATE,
  ShopProdQField,
  ShopReqOrderJoined,
} from "@/types";
import { DataFrame, readExcel } from "danfojs";
import { useMessage } from "naive-ui";
import { onBeforeMount, ref, watchEffect, type Ref } from "vue";
import { isSameProd, Mapper, ShopReqOrder, synonymMatch, uniqueArr } from "..";
import { useShopUserProds } from "./product";

export function useVendorOrderInfo(
  vendorId: string,
  states: ORDER_STATE[],
  orderInfo: Ref<ShopReqOrder[]>
) {
  onBeforeMount(async () => {
    orderInfo.value = await getVendorGroupOrderInfo(vendorId, states);
  });
}

export function useReadOrderInfo(shopId: string, orderStates: ORDER_STATE[]) {
  const orderJoined = ref<ShopReqOrderJoined[]>([]);
  const orderInfo = ref<ShopReqOrder[]>([]);
  const { userProd } = useShopUserProds(shopId, null);
  const { unsubscribe } = getShopOrderInfo(orderInfo, shopId, orderStates);
  const existOrderIds = ref<Set<string>>(new Set());

  watchEffect(async () => {
    orderJoined.value = [];
    orderInfo.value.forEach((order) => {
      const exist = orderJoined.value.find(
        (j) => j.shopProdId === order.shopProdId
      );
      if (exist) {
        exist.orderCnt += order.orderCnt;
        exist.amount += exist.prodPrice ?? 0;
      } else {
        const prod = userProd.value.find(
          (p) => order.shopProdId === p.shopProdId
        );
        if (prod) {
          orderJoined.value.push(Object.assign(prod, order));
        }
      }
    });
    existOrderIds.value = await getExistOrderIds(shopId);
  });
  return { unsubscribe, orderInfo, orderJoined, existOrderIds };
}

export function useParseOrderInfo(
  mapper: Ref<Mapper | null>,
  userId: string,
  fs: Ref<File[]>,
  existIds: Ref<Set<string>>,
  onParse: (orders: ShopReqOrder[]) => void
) {
  const conditions = ref<ShopProdQField[]>([]);

  const { userProd } = useShopUserProds(userId, conditions);
  const msg = useMessage();

  watchEffect(async () => {
    if (!mapper.value) return;
    conditions.value = [];
    for (let i = 0; i < fs.value.length; i++) {
      const inputDf = (await readExcel(fs.value[i])) as DataFrame;
      if (!inputDf) {
        msg.error(`파일: ${fs.value[i].name}에 대한 처리에 실패 하였습니다.`);
        continue;
      }
      conditions.value.push(...parseDf(inputDf, mapper.value));
    }
    const orderInfo: ShopReqOrder[] = [];
    for (let j = 0; j < conditions.value.length; j++) {
      const d = conditions.value[j];
      const prod = userProd.value.find((x) => isSameProd(x, d))!;
      if (!prod || existIds.value.has(d.orderId)) continue;
      const order = ShopReqOrder.fromProd(prod, d.orderId);
      orderInfo.push(order);
    }
    onParse(orderInfo);
  });

  function parseDf(inputDf: DataFrame, mapper: Mapper): ShopProdQField[] {
    inputDf = inputDf.applyMap((x: any) =>
      typeof x === "string" ? x.toLowerCase() : x
    );
    const targetCols = ["prodName", "size", "color", "orderId"];
    const colMapper = getColMapper(inputDf, targetCols as MapKey[], mapper);
    const targetDf = inputDf.loc({
      columns: uniqueArr(Object.values(colMapper)),
    });
    const prodMapper = mapper.getProdMapper();
    const idx = getColIdx(targetDf, colMapper);
    const data: ShopProdQField[] = [];
    targetDf.apply(
      (row: any) => {
        for (let i = 0; i < Object.keys(prodMapper).length; i++) {
          const nameSynoId = Object.keys(prodMapper)[i];
          const [nameSyno] = nameSynoId.split(" iobox ");
          if (!row[idx.prodNameIdx].includes(nameSyno)) continue;
          const synoColor = synonymMatch(
            prodMapper[nameSynoId].colorMapper,
            row[idx.colorIdx]
          );
          const synoSize = synonymMatch(
            prodMapper[nameSynoId].sizeMapper,
            row[idx.sizeIdx]
          );

          if (synoColor && synoSize) {
            data.push({
              prodName: prodMapper[nameSynoId].ioProdName,
              size: prodMapper[nameSynoId].sizeMapper[synoSize],
              color: prodMapper[nameSynoId].colorMapper[synoColor],
              orderId: row[idx.orderIdIdx],
            });
          }
        }
        return row;
      },
      { axis: 1 }
    );
    console.log("Parse Result: ", data);
    return data;
  }

  function getColMapper(df: DataFrame, ioColNames: MapKey[], mapper: Mapper) {
    return ioColNames.reduce((curr, colName) => {
      const synonyms = mapper.getSyno(colName);
      const col = df.columns.find((inputCol) => synonyms.includes(inputCol));
      if (!col) {
        const content = `컬럼 매핑: 실패 엑셀파일에서 ${colName} 컬럼을 찾을 수 없습니다. \n ${synonyms}`;
        // return msg.error(content);
        console.log(content);
      } else {
        curr[colName] = col;
      }

      return curr;
    }, {} as { [key in MapKey]: string });
  }
  function getColIdx(df: DataFrame, colMapper: { [key in MapKey]: string }) {
    const prodNameIdx = df.columns.findIndex(
      (c) => c === colMapper["prodName"]
    );
    const colorIdx = df.columns.findIndex((c) => c === colMapper["color"]);
    const sizeIdx = df.columns.findIndex((c) => c === colMapper["size"]);
    const orderIdIdx = df.columns.findIndex((c) => c === colMapper["orderId"]);
    console.log(
      `Indexies: ${prodNameIdx}  ${colorIdx} ${sizeIdx} ${orderIdIdx}`
    );
    return { prodNameIdx, colorIdx, sizeIdx, orderIdIdx };
  }

  return { conditions, userProd };
}
