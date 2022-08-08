import {
  ShopGarmentQField,
  useShopUserGarments,
  Mapper,
  MapKey,
  GarmentOrder,
  sameGarment,
  ShopUserGarment,
  VendorUserGarment,
  synonymFilter,
} from "@/composable";
import { logger } from "@/plugin/logger";
import { useVendorsStore } from "@/store";
import { makeMsgOpt, uniqueArr } from "@/util";
import { readExcel, DataFrame, Series } from "danfojs";
import { useMessage } from "naive-ui";
import { Ref, ref, watchEffect, watch } from "vue";

export function useParseGarmentOrder(
  mapper: Ref<Mapper | null>,
  userId: string,
  fs: Ref<File[]>,
  existIds: Ref<Set<string>>,
  onParse: (orders: GarmentOrder[]) => void,
  sheetIdx: Ref<number>,
  startRow: Ref<number>
) {
  const conditions = ref<ShopGarmentQField[]>([]);
  const vendorStore = useVendorsStore();
  const { userProd } = useShopUserGarments(userId, conditions);
  const msg = useMessage();

  watch(
    () => fs.value,
    async (files) => {
      if (!mapper.value) return;
      conditions.value = [];
      for (let i = 0; i < files.length; i++) {
        const inputDf = (await readExcel(files[i], {
          sheet: sheetIdx.value,
        })) as DataFrame;
        if (!inputDf) {
          const message = `파일: ${files[i].name}에 대한 처리에 실패 하였습니다.`;
          msg.error(message, makeMsgOpt());
          logger.error(userId, message);
          continue;
        }
        if (startRow.value > 0) {
          // console.log("readExcel: ", inputDf);
          const newDf = inputDf.iloc({ rows: [`${startRow.value}:`] });
          newDf.$setColumnNames(
            inputDf.iloc({ rows: [`${startRow.value - 1}:${startRow.value}`] })
              .values[0] as string[]
          );
          conditions.value.push(
            ...parseDf(newDf, mapper.value, existIds.value)
          );
        } else {
          conditions.value.push(
            ...parseDf(inputDf, mapper.value, existIds.value)
          );
        }
        files = [];
      }
      const infos: {
        [k: string]: {
          prod: ShopUserGarment;
          vendorProd: VendorUserGarment;
          orderIds: string[];
          orderCnt: number;
        };
      } = {};
      for (let j = 0; j < conditions.value.length; j++) {
        const d = conditions.value[j];
        const prod = userProd.value.find((x) => sameGarment(x, d))!;
        if (!prod) continue;
        else if (!infos[prod.shopProdId]) {
          const vendorProd = vendorStore.vendorUserGarments.find(
            (g) =>
              g.vendorProdId === prod.vendorProdId &&
              g.vendorId === prod.vendorId
          );
          if (vendorProd) {
            infos[prod.shopProdId] = {
              prod,
              vendorProd,
              orderIds: [d.orderId],
              orderCnt: 1,
            };
          }
        } else {
          infos[prod.shopProdId].orderCnt += 1;
          infos[prod.shopProdId].orderIds.push(d.orderId);
        }
      }
      onParse(
        Object.values(infos).reduce((acc, info) => {
          const order = GarmentOrder.fromProd(
            info.prod,
            info.orderIds,
            info.orderCnt,
            info.vendorProd
          );
          acc.push(order);
          return acc;
        }, [] as GarmentOrder[])
      );
    }
  );

  function parseDf(
    inputDf: DataFrame,
    mapper: Mapper,
    existIds: Set<string>
  ): ShopGarmentQField[] {
    inputDf = inputDf.applyMap((x: any) =>
      typeof x === "string" ? x.toLowerCase().trim() : x
    );
    console.log("input df: ", inputDf);

    const targetCols = ["prodName", "size", "color", "orderId"];
    const colMapper = getColMapper(inputDf, targetCols as MapKey[], mapper);
    const targetDf = inputDf.loc({
      columns: uniqueArr(Object.values(colMapper)),
    });
    // console.log("targetDf: ", targetDf);
    console.log("colMapper: ", colMapper);
    console.log("Object.values(colMapper): ", Object.values(colMapper));
    const prodMapper = mapper.getProdMapper();
    if (Object.keys(prodMapper).length === 0) {
      const message = "주문취합을 위해 상품매핑정보를 등록 해주십시오";
      msg.error(message, makeMsgOpt());
      logger.error(userId, message);
      return [];
    }
    const idx = getColIdx(targetDf, colMapper);
    const data: ShopGarmentQField[] = [];
    const reporter: { [k: string]: string } = {};

    targetDf.apply(
      (row: Series) => {
        const orderId = row[idx.orderIdIdx].toString();
        const matchedNameSynoIds = Object.keys(prodMapper).filter(
          (nameSynoId) => {
            const nameSyno = nameSynoId.split(" iobox ")[0].trim();
            return (
              row[idx.prodNameIdx] && row[idx.prodNameIdx].includes(nameSyno)
            );
          }
        );
        if (matchedNameSynoIds.length < 1) {
          reporter[orderId] = `상품명 매핑실패: ${row[idx.prodNameIdx]} `;
          return row; // continue
        } else if (existIds.has(orderId)) {
          return row;
        }

        let synoColor = undefined;
        let synoSize = undefined;
        let matchedNameSynoId = undefined;
        for (let i = 0; i < matchedNameSynoIds.length; i++) {
          const matchedId = matchedNameSynoIds[i];
          synoColor = synonymFilter(
            prodMapper[matchedId].colorMapper,
            row[idx.colorIdx]
          );
          synoSize = synonymFilter(
            prodMapper[matchedId].sizeMapper,
            row[idx.sizeIdx]
          );
          if (synoSize && synoColor) {
            matchedNameSynoId = matchedId;
            break;
          }
        }
        if (!synoColor || !synoSize) {
          logger.debug(null, "prodMapper: ", prodMapper);
          logger.debug(null, "matchedNameSynoId: ", matchedNameSynoId);
          logger.debug(null, "synoColor: ", synoColor);
          logger.debug(null, "synoSize: ", synoSize);
          let msg = `${row[idx.prodNameIdx]} 상품의 매핑에 실패 하였습니다.`;
          if (!synoColor) {
            msg += ` 컬러 매핑실패정보,${row[idx.colorIdx]} `;
          }
          if (!synoSize) {
            msg += ` 사이즈 매핑실패정보: ${row[idx.sizeIdx]} `;
          }
          reporter[orderId] = msg;
          return row;
        }
        delete reporter[orderId];
        data.push({
          prodName: prodMapper[matchedNameSynoId!].ioProdName,
          size: prodMapper[matchedNameSynoId!].sizeMapper[synoSize],
          color: prodMapper[matchedNameSynoId!].colorMapper[synoColor],
          orderId,
        });
        return row;
      },
      { axis: 1 }
    );
    const errors = Object.values(reporter);
    errors.forEach((err) => {
      msg.error(err, makeMsgOpt({ duration: 20000 }));
      logger.error(userId, err);
    });
    logger.debug(null, "reporter: ", reporter);
    logger.debug(null, "input DF", inputDf.shape, inputDf);
    logger.debug(null, "target DF", targetDf.shape, targetDf);
    logger.debug(null, "prod Mapper", prodMapper);
    logger.debug(null, "Parse Result: ", data);

    return errors.length > 0 ? [] : data;
  }

  function getColMapper(df: DataFrame, ioColNames: MapKey[], mapper: Mapper) {
    // console.log("df.columns: ", df.columns);
    return ioColNames.reduce((curr, colName) => {
      const synonyms = mapper.getSyno(colName, false);
      const col = df.columns.find((inputCol) =>
        synonyms.includes(inputCol.toLowerCase())
      );
      if (!col) {
        const message = `컬럼매핑 실패: 실패 엑셀파일에서 ${colName} 컬럼을 찾을 수 없습니다. \n ${synonyms}`;
        msg.error(message);
        logger.error(userId, message);
        console.error(colName, synonyms);
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
