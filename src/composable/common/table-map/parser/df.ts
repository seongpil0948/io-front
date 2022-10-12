import { logger } from "@/plugin/logger";
import { uniqueArr, makeMsgOpt } from "@/util";
import { DataFrame, Series } from "danfojs";
import { MessageApiInjection } from "naive-ui/es/message/src/MessageProvider";
import { MapKey, Mapper, synonymFilter } from "..";
import { GarmentOrderCondi } from "../../..";

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
      const orderId = row[idx.orderIdIdx].toString();
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
        } 상품의 옵션 매핑에 실패 하였습니다.`;
        if (!synoColor) {
          message += ` 컬러 매핑실패정보,${row[idx.colorIdx]} `;
        }
        if (!synoSize) {
          message += ` 사이즈 매핑실패정보: ${row[idx.sizeIdx]} `;
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
