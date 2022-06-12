import { makeMsgOpt } from "./../../../opt/msg";
import {
  useShopUserProds,
  Mapper,
  ShopReqOrder,
  isSameProd,
  synonymMatch,
  uniqueArr,
} from "@/composables";
import { ShopProdQField, MapKey } from "@/types";
import { readExcel, DataFrame, Series } from "danfojs";
import { useMessage } from "naive-ui";
import { h, Ref, ref, watchEffect } from "vue";

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
      conditions.value.push(...parseDf(inputDf, mapper.value, existIds.value));
    }
    const orderInfo: ShopReqOrder[] = [];
    for (let j = 0; j < conditions.value.length; j++) {
      const d = conditions.value[j];
      const prod = userProd.value.find((x) => isSameProd(x, d))!;
      if (!prod) continue;
      const order = ShopReqOrder.fromProd(prod, d.orderId);
      orderInfo.push(order);
    }
    onParse(orderInfo);
  });

  function parseDf(
    inputDf: DataFrame,
    mapper: Mapper,
    existIds: Set<string>
  ): ShopProdQField[] {
    inputDf = inputDf.applyMap((x: any) =>
      typeof x === "string" ? x.toLowerCase() : x
    );
    const targetCols = ["prodName", "size", "color", "orderId"];
    const colMapper = getColMapper(inputDf, targetCols as MapKey[], mapper);
    const targetDf = inputDf.loc({
      columns: uniqueArr(Object.values(colMapper)),
    });
    const prodMapper = mapper.getProdMapper();
    if (Object.keys(prodMapper).length === 0) {
      msg.error("주문취합을 위해 상품매핑정보를 등록 해주십시오", makeMsgOpt());
      return [];
    }
    const idx = getColIdx(targetDf, colMapper);
    const data: ShopProdQField[] = [];
    const reporter: { [k: string]: string } = {};
    targetDf.apply(
      (row: Series) => {
        const orderId = row[idx.orderIdIdx];
        const matchedNameSynoId = Object.keys(prodMapper).find((nameSynoId) => {
          const nameSyno = nameSynoId.split(" iobox ")[0].trim();
          return (
            row[idx.prodNameIdx] && row[idx.prodNameIdx].includes(nameSyno)
          );
        });
        if (!matchedNameSynoId) {
          reporter[orderId] = `상품명 매핑실패: ${row[idx.prodNameIdx]} `;
          return row; // continue
        } else if (existIds.has(orderId)) {
          reporter[orderId] = `이미 저장된 주문번호: ${orderId},  ${
            row[idx.prodNameIdx]
          }`;
          return row;
        }
        const synoColor = synonymMatch(
          prodMapper[matchedNameSynoId].colorMapper,
          row[idx.colorIdx]
        );
        if (!synoColor) {
          console.log(
            row[idx.prodNameIdx],
            matchedNameSynoId,
            prodMapper[matchedNameSynoId].colorMapper
          );
          reporter[orderId] = `컬러 매핑실패: ${row[idx.prodNameIdx]},${
            row[idx.colorIdx]
          }`;
          return row;
        }
        const synoSize = synonymMatch(
          prodMapper[matchedNameSynoId].sizeMapper,
          row[idx.sizeIdx]
        );
        if (!synoSize) {
          reporter[orderId] = `사이즈 매핑실패: ${row[idx.prodNameIdx]},${
            row[idx.colorIdx]
          }`;
          return row;
        }
        delete reporter[orderId];
        data.push({
          prodName: prodMapper[matchedNameSynoId].ioProdName,
          size: prodMapper[matchedNameSynoId].sizeMapper[synoSize],
          color: prodMapper[matchedNameSynoId].colorMapper[synoColor],
          orderId,
        });
        return row;
      },
      { axis: 1 }
    );
    Object.values(reporter).forEach((err) =>
      msg.error(err, makeMsgOpt({ duration: 20000 }))
    );
    console.log("reporter: ", reporter);
    console.log("input DF", inputDf.shape, inputDf);
    console.log("target DF", targetDf.shape, targetDf);
    console.log("prod Mapper", prodMapper);
    console.log("Parse Result: ", data);
    return data;
  }

  function getColMapper(df: DataFrame, ioColNames: MapKey[], mapper: Mapper) {
    return ioColNames.reduce((curr, colName) => {
      const synonyms = mapper.getSyno(colName);
      const col = df.columns.find((inputCol) => synonyms.includes(inputCol));
      if (!col) {
        msg.error(
          `컬럼매핑 실패: 실패 엑셀파일에서 ${colName} 컬럼을 찾을 수 없습니다. \n ${synonyms}`
        );
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
    return { prodNameIdx, colorIdx, sizeIdx, orderIdIdx };
  }

  return { conditions, userProd };
}
