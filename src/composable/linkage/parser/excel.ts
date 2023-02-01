import {
  MatchGarment,
  Mapper,
  catchExcelError,
  getExternalSource,
  MapKey,
  synonymFilter,
  ShopUserGarment,
  mapTxt,
  ProdMapper,
} from "@/composable";
import { logger } from "@/plugin/logger";
import { aoaBySheet } from "@/plugin/xlsx";
import { MessageApiInjection } from "naive-ui/es/message/src/MessageProvider";
import { Ref, shallowRef, watch } from "vue";
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
  function fillMatchData() {
    // cleanData to match data;
    console.log("mapper in fillMatchData", d.mapper.value);
    if (!d.mapper.value) return;
    const prodMapper = d.mapper.value.getProdMapper();
    const { data, existOrdId } = mapWBookData(
      d.uid.value,
      prodMapper,
      d.existIds.value
    );
    d.matchData.value = data;
    if (existOrdId) {
      d.msg.warning("이미 처리된 주문건이 있습니다.");
    }
  }
  watch(
    () => d.fs.value,
    async () => await mappingFiles()
  );
  async function mappingFiles() {
    console.log("mapper in mapping files", d.mapper.value);
    if (!d.mapper.value) return;
    const cd: MapData[] = [];
    for (let i = 0; i < d.fs.value.length; i++) {
      const file = d.fs.value[i];
      try {
        const wb = await getExternalSource({
          file,
          msg: d.msg,
        });
        cd.push(...parseWBook(wb, d.mapper.value, d.uid.value, d.msg));
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
    console.log("Fill clean data: ", cd);
    cleanData.value = cd;
    fillMatchData();
  }
  return { fillMatchData };
}

export const isExcelInputParam = (p: any): p is ExcelInputParam => "file" in p;
const targetCols: MapKey[] = ["prodName", "size", "color", "orderId"];
type MapData = { [kk in MapKey]: string };

const cleanData = shallowRef<MapData[]>([]);
function mapWBookData(
  userId: string,
  prodMapper: ProdMapper,
  existIds: Set<string>
) {
  let existOrdId = false;
  const data: MatchGarment[] = [];
  for (let i = 0; i < cleanData.value.length; i++) {
    const cd = cleanData.value[i];
    if (data.some((x) => x.orderId === cd.orderId)) continue;
    else if (existIds.has(cd.orderId)) {
      existOrdId = true;
      logger.warn(userId, `주문번호(${cd.orderId})은이미 처리 되었습니다.  `);
      continue;
    }
    const matchedNameSynoIds = Object.keys(prodMapper).filter((nameSynoId) => {
      const nameSyno = nameSynoId.split(" iobox ")[0].trim();
      // console.log(`try nameSyno(${nameSyno}) = prodName(${cd.prodName})`);
      return cd.prodName === nameSyno;
    });
    // console.log("matched names", matchedNameSynoIds);
    let synoColor, synoSize, matchedNameSynoId;

    for (let i = 0; i < matchedNameSynoIds.length; i++) {
      const matchedId = matchedNameSynoIds[i];
      synoColor = synonymFilter(prodMapper[matchedId].colorMapper, cd.color);
      synoSize = synonymFilter(prodMapper[matchedId].sizeMapper, cd.size);
      if (synoSize && synoColor) {
        console.log("===> matched row: ", matchedId, cd);
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
    // const exist = data.find((d) => d.id === shopProdId)
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
  return { data, existOrdId };
}
function parseWBook(
  workbook: WorkBook,
  mapper: Mapper,
  userId: string,
  msg: MessageApiInjection
): MapData[] {
  // fill clean data
  const prodMapper = mapper.getProdMapper();
  console.log("prodMapper: ", prodMapper);
  const aoaData = aoaBySheet(workbook);
  const cd: MapData[] = [];
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
        targetCols.every((colName) => {
          return mapper
            .getSyno(colName, false)
            .some((syno) => cleanRow.includes(syno));
        })
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

    for (let z = excelInfo.startRow + 1; z < aoa.length; z++) {
      const rowArr = aoa[z];
      if (rowArr.length < 1) continue;
      cd.push(
        targetCols.reduce((acc, colName) => {
          acc[colName] = mapTxt(rowArr[excelInfo.colIdx[colName]]);
          return acc;
        }, {} as MapData)
      );
    }
  }
  return cd;
}
