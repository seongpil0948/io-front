import {
  GarmentOrderCondi,
  useShopUserProds,
  Mapper,
  IoOrder,
  ioOrderFromCondi,
  MapKey,
  synonymFilter,
  catchExcelError,
  VendorGarment,
  VENDOR_GARMENT_DB,
} from "@/composable";
import { logger } from "@/plugin/logger";
import { makeMsgOpt, uniqueArr } from "@/util";
import { readExcel, DataFrame, Series } from "danfojs";
import { useMessage } from "naive-ui";
import { MessageApiInjection } from "naive-ui/es/message/src/MessageProvider";
import { Ref, ref, shallowRef, watch, watchEffect } from "vue";

export function useMappingOrderExcel(
  mapper: Ref<Mapper | null>,
  userId: string,
  fs: Ref<File[]>,
  existIds: Ref<Set<string>>,
  onParse: (orders: IoOrder[]) => void,
  sheetIdx: Ref<number>,
  startRow: Ref<number>
) {
  const conditions = ref<GarmentOrderCondi[]>([]);
  const { userProd } = useShopUserProds({
    shopId: userId,
    shopCondi: conditions,
  });
  const msg = useMessage();

  const vendorProds = shallowRef<VendorGarment[]>([]);
  watchEffect(async () => {
    const ids = userProd.value.map((x) => x.vendorProdId);
    vendorProds.value = await VENDOR_GARMENT_DB.listByIds(ids);
  });
  watch(
    () => fs.value,
    async (files) => {
      if (!mapper.value) return;
      conditions.value = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const errMsg = `파일: ${file.name}에 대한 처리에 실패 하였습니다.`;
        try {
          const inputDf = (await readExcel(file, {
            sheet: sheetIdx.value,
          })) as DataFrame;
          if (!inputDf) {
            msg.error(errMsg, makeMsgOpt());
            logger.error(userId, errMsg);
            continue;
          }
          if (startRow.value > 0) {
            // console.log("readExcel: ", inputDf);
            const newDf = inputDf.iloc({
              rows: [`${startRow.value}:`],
            });
            newDf.$setColumnNames(
              inputDf.iloc({
                rows: [`${startRow.value - 1}:${startRow.value}`],
              }).values[0] as string[]
            );
            conditions.value.push(
              ...mapDfToOrder(newDf, mapper.value, existIds.value, userId, msg)
            );
          } else {
            conditions.value.push(
              ...mapDfToOrder(
                inputDf,
                mapper.value,
                existIds.value,
                userId,
                msg
              )
            );
          }
        } catch (err) {
          catchExcelError({ err });
        }
      }
      files = [];
      const ords = ioOrderFromCondi(
        conditions.value,
        vendorProds.value,
        userProd.value
      );

      onParse(ords);
    }
  );

  return { conditions, userProd };
}

export function mapDfToOrder(
  inputDf: DataFrame,
  mapper: Mapper,
  existIds: Set<string>,
  userId: string,
  msg: MessageApiInjection
): GarmentOrderCondi[] {
  inputDf = inputDf.applyMap((x: any) =>
    typeof x === "string" ? x.toLowerCase().trim() : x
  );
  const garmentTargetCols = ["prodName", "size", "color", "orderId"];
  function getColMapper(df: DataFrame, ioColNames: MapKey[], mapper: Mapper) {
    return ioColNames.reduce((curr, colName) => {
      const synonyms = mapper.getSyno(colName, false);
      const col = df.columns.find((inputCol) =>
        synonyms.includes(inputCol.toLowerCase())
      );
      if (!col) {
        const message = `컬럼매핑 실패: 실패 엑셀파일에서 ${colName.toString()} 컬럼을 찾을 수 없습니다. \n ${synonyms}`;
        msg.error(message);
        logger.error(userId, message);
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

  const colMapper = getColMapper(
    inputDf,
    garmentTargetCols as MapKey[],
    mapper
  );
  const targetDf = inputDf.loc({
    columns: uniqueArr(Object.values(colMapper)),
  });
  const prodMapper = mapper.getProdMapper();
  if (Object.keys(prodMapper).length === 0) {
    const message = "주문취합을 위해 상품매핑정보를 등록 해주십시오";
    msg.error(message, makeMsgOpt());
    logger.error(userId, message);
    return [];
  }
  const idx = getColIdx(targetDf, colMapper);
  const data: GarmentOrderCondi[] = [];
  const reporter: { [k: string]: string } = {};

  targetDf.apply(
    (row: Series) => {
      const orderId: string | null = row[idx.orderIdIdx]
        ? row[idx.orderIdIdx].toString()
        : null;
      if (orderId === null) {
        reporter[""] = `주문번호 매핑실패`;
        return row; // continue
      }
      const matchedNameSynoIds = Object.keys(prodMapper).filter(
        (nameSynoId) => {
          const nameSyno = nameSynoId.split(" iobox ")[0].trim();
          return row[idx.prodNameIdx] && row[idx.prodNameIdx] === nameSyno;
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
        let message = `${
          row[idx.prodNameIdx]
        } 상품의 옵션 매핑에 실패 하였습니다. `;
        if (!synoColor) {
          message += `  컬러(${row[idx.colorIdx]}) 매핑실패 `;
        }
        if (!synoSize) {
          message += `  사이즈(${row[idx.sizeIdx]}) 매핑실패정보: `;
        }
        reporter[orderId] = message;
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

  return errors.length > 0 ? [] : data;
}
