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
import { aoaBySheet } from "@/plugin/xlsx";
import { MessageApiInjection } from "naive-ui/es/message/src/MessageProvider";
import { Ref, watch } from "vue";
import { WorkBook } from "xlsx";

export interface ExcelInputParam {
  file: File;
  msg: MessageApiInjection;
}

export function useMappingOrderExcel(d: {
  mapper: Ref<Mapper | null>;
  uid: Ref<string>;
  fs: Ref<File[]>;
  existIds: Ref<Set<string>>;
  userProd: Ref<ShopUserGarment[]>;
  matchData: Ref<MatchGarment[]>;
  msg: MessageApiInjection;
}) {
  watch(
    () => d.fs.value,
    async () => await mappingFiles()
  );
  async function mappingFiles() {
    console.log("in mapping files", d.mapper.value);
    if (!d.mapper.value) return;
    d.matchData.value = [];
    for (let i = 0; i < d.fs.value.length; i++) {
      const file = d.fs.value[i];
      try {
        const wb = await getExternalSource({
          file,
          msg: d.msg,
        });
        d.matchData.value.push(
          ...mapWBookToOrder(
            wb,
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

export const isExcelInputParam = (p: any): p is ExcelInputParam => "file" in p;
const targetCols: MapKey[] = ["prodName", "size", "color", "orderId"];
type MapData = { [kk in MapKey]: string };

function mapWBookToOrder(
  workbook: WorkBook,
  mapper: Mapper,
  existIds: Set<string>,
  userId: string,
  msg: MessageApiInjection
): MatchGarment[] {
  const prodMapper = mapper.getProdMapper();
  console.log("prodMapper: ", prodMapper);
  const aoaData = aoaBySheet(workbook);
  let existOrdId = false;
  const data: MatchGarment[] = [];
  for (let i = 0; i < Object.keys(aoaData).length; i++) {
    const sheetName = Object.keys(aoaData)[i];
    const excelInfo = {
      startRow: -1,
      colIdx: {} as { [kk in MapKey]: number },
    };
    const aoa = aoaData[sheetName];
    console.log("raw aoa: ", aoa);
    // >>> find row & col index >>>
    for (let z = 0; z < aoa.length; z++) {
      const row = aoa[z];
      const cleanRow = row.map((c) => mapTxt(String(c)));
      if (
        targetCols.every((colName) =>
          mapper.getSyno(colName, false).some((syno) => cleanRow.includes(syno))
        )
      ) {
        excelInfo.startRow = z;
        for (let q = 0; q < targetCols.length; q++) {
          const target = targetCols[q];
          excelInfo.colIdx[target] = cleanRow.findIndex((c) =>
            mapper.getSyno(target, false).includes(c)
          );
        }
        break;
      }
    }
    console.log(`excelInfo: `, excelInfo);
    // <<< find row & col index <<<
    if (
      excelInfo.startRow < 0 ||
      Object.keys(excelInfo.colIdx).length !== targetCols.length
    ) {
      const message = `${sheetName} 시트 컬럼매핑 실패 -> 스킵 `;
      msg.error(message);
      logger.error(userId, message);
      continue;
    }

    const cleanData: MapData[] = [];
    for (let z = excelInfo.startRow + 1; z < aoa.length; z++) {
      const rowArr = aoa[z];
      if (rowArr.length < 1) continue;
      cleanData.push(
        targetCols.reduce((acc, colName) => {
          acc[colName] = mapTxt(rowArr[excelInfo.colIdx[colName]]);
          return acc;
        }, {} as MapData)
      );
    }
    console.info("===> this is cleanData: ", cleanData);

    for (let i = 0; i < cleanData.length; i++) {
      const cd = cleanData[i];
      if (data.some((x) => x.orderId === cd.orderId)) continue;
      else if (existIds.has(cd.orderId)) {
        existOrdId = true;
        logger.warn(userId, `주문번호(${cd.orderId})은이미 처리 되었습니다.  `);
        continue;
      }
      const matchedNameSynoIds = Object.keys(prodMapper).filter(
        (nameSynoId) => {
          const nameSyno = nameSynoId.split(" iobox ")[0].trim();
          // console.log(`try nameSyno(${nameSyno}) = prodName(${cd.prodName})`);
          return cd.prodName === nameSyno;
        }
      );
      // console.log("matched names", matchedNameSynoIds);
      let synoColor, synoSize, matchedNameSynoId;

      for (let i = 0; i < matchedNameSynoIds.length; i++) {
        const matchedId = matchedNameSynoIds[i];
        synoColor = synonymFilter(prodMapper[matchedId].colorMapper, cd.color);
        synoSize = synonymFilter(prodMapper[matchedId].sizeMapper, cd.size);
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
        inputProdName: cd.prodName,
        inputColor: cd.color,
        inputSize: cd.size,
        orderId: cd.orderId,
        orderCnt: 1,
      });
    }
  }
  if (existOrdId) {
    msg.warning("이미 처리된 주문건이 있습니다.");
  }

  return data;
}
