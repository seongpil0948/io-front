import {
  MatchGarment,
  Mapper,
  catchExcelError,
  getExternalSource,
  MapKey,
  synonymFilter,
  ShopUserGarment,
  mapTxt,
} from "@/composable";
import { logger } from "@/plugin/logger";
import { uniqueArr } from "@/util";
import { readExcel, type DataFrame, Series } from "danfojs";
import { MessageApiInjection } from "naive-ui/es/message/src/MessageProvider";
import { Ref, watch } from "vue";

export function useMappingOrderExcel(d: {
  mapper: Ref<Mapper | null>;
  uid: Ref<string>;
  fs: Ref<File[]>;
  existIds: Ref<Set<string>>;
  sheetIdx: Ref<number>;
  startRow: Ref<number>;
  userProd: Ref<ShopUserGarment[]>;
  matchData: Ref<MatchGarment[]>;
  msg: MessageApiInjection;
}) {
  watch(
    () => d.fs.value,
    async () => await mappingFiles()
  );
  async function mappingFiles() {
    if (!d.mapper.value) return;
    d.matchData.value = [];
    for (let i = 0; i < d.fs.value.length; i++) {
      const file = d.fs.value[i];
      try {
        const df = await getExternalSource({
          file,
          sheet: d.sheetIdx.value,
          startRow: d.startRow.value,
        });
        d.matchData.value.push(
          ...mapDfToOrder(
            df,
            d.mapper.value,
            d.existIds.value,
            d.uid.value,
            d.msg
          )
        );
      } catch (err) {
        catchExcelError({
          err,
          msg: d.msg,
          uid: d.uid.value,
          prefix: `파일: ${file.name} 에 대한 처리에 실패 하였습니다.`,
        });
        throw err;
      }
    }
  }
  return { mappingFiles };
}

export const isExcelInputParam = (p: any): p is ExcelInputParam =>
  "file" in p && "startRow" in p;

export interface ExcelInputParam {
  file: File;
  sheet: number;
  startRow: number;
}

export async function loadDfExcel(p: ExcelInputParam) {
  const inputDf = (await readExcel(p.file, {
    sheet: p.sheet,
  })) as DataFrame;
  if (!inputDf) throw new Error("has no result of readExcel");
  if (p.startRow > 0) {
    // console.log("readExcel: ", inputDf);
    const newDf = inputDf.iloc({
      rows: [`${p.startRow}:`],
    });
    newDf.$setColumnNames(
      inputDf.iloc({
        rows: [`${p.startRow - 1}:${p.startRow}`],
      }).values[0] as string[]
    );
    return newDf;
  } else {
    return inputDf;
  }
}

export function mapDfToOrder(
  inputDf: DataFrame,
  mapper: Mapper,
  existIds: Set<string>,
  userId: string,
  msg: MessageApiInjection
): MatchGarment[] {
  inputDf = inputDf.applyMap((x: any) =>
    typeof x === "string" ? mapTxt(x) : x
  );
  const garmentTargetCols = ["prodName", "size", "color", "orderId"];
  function getColMapper(df: DataFrame, ioColNames: MapKey[], mapper: Mapper) {
    return ioColNames.reduce((curr, colName) => {
      const synonyms = mapper.getSyno(colName, false);
      const col = df.columns.find((inputCol) =>
        synonyms.includes(mapTxt(inputCol))
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
  const idx = getColIdx(targetDf, colMapper);
  const data: MatchGarment[] = [];

  let existOrdId = false;
  targetDf.apply(
    (row: Series) => {
      if (!row[idx.orderIdIdx]) throw new Error("주문번호 컬럼 매핑 실패.");
      const orderId = String(row[idx.orderIdIdx]);
      if (data.some((x) => x.orderId === orderId)) return row;
      if (!row[idx.sizeIdx]) throw new Error("사이즈 컬럼 매핑 실패.");
      const inputSize = String(row[idx.sizeIdx]);
      if (!row[idx.colorIdx]) throw new Error("사이즈 컬럼 매핑 실패.");
      const inputColor = String(row[idx.colorIdx]);
      if (!row[idx.prodNameIdx]) throw new Error("상품명 컬럼 매핑 실패.");
      const inputProdName = String(row[idx.prodNameIdx]);

      const matchedNameSynoIds = Object.keys(prodMapper).filter(
        (nameSynoId) => {
          const nameSyno = nameSynoId.split(" iobox ")[0].trim();
          return inputProdName === nameSyno;
        }
      );
      let synoColor, synoSize, matchedNameSynoId;
      if (existIds.has(orderId)) {
        existOrdId = true;
        logger.warn(
          userId,
          `주문번호(${orderId})은 이미 처리 완료된 주문번호 입니다.  `
        );
        return row; // continue
      }

      for (let i = 0; i < matchedNameSynoIds.length; i++) {
        const matchedId = matchedNameSynoIds[i];
        synoColor = synonymFilter(
          prodMapper[matchedId].colorMapper,
          inputColor
        );
        synoSize = synonymFilter(prodMapper[matchedId].sizeMapper, inputSize);
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
      data.push({
        service: "EXCEL",
        matchType: "map",
        id: shopProdId,
        prodName,
        size,
        color,
        inputProdName: inputProdName,
        inputColor,
        inputSize,
        orderId,
        orderCnt: 1,
      });
      return row;
    },
    { axis: 1 }
  );
  if (existOrdId) {
    msg.warning("이미 처리된 주문건이 있습니다.");
  }

  return data;
}
