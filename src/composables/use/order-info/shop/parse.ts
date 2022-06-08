import {
  useShopUserProds,
  Mapper,
  ShopReqOrder,
  isSameProd,
  synonymMatch,
  uniqueArr,
} from "@/composables";
import { ShopProdQField, MapKey } from "@/types";
import { readExcel, DataFrame } from "danfojs";
import { useMessage } from "naive-ui";
import { Ref, ref, watchEffect } from "vue";

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
