import { type DataFrame } from "danfojs";
import {
  CafeOrderParam,
  getCafeOrders,
  getZigzagOrders,
  isCafeOrderParam,
  isZigzagOrderParam,
  ZigzagOrderParam,
} from "../repo";
import {
  AnyOrder,
  ExcelInputParam,
  isExcelInputParam,
  loadDfExcel,
} from "@/composable";

// type MapSrc = AnyOrder[] | DataFrame;
// type ProcessMatchData<S extends MapSrc> = (
//   src: S,
//   m: Mapper,
//   existOrdIds: Set<string>,
//   ...args: any[]
// ) => MatchGarment[];

// interface IoOrderParser<S extends MapSrc> {
//   service: API_SERVICE_EX;
//   processMap: ProcessMatchData<S>;
//   processMatch: ProcessMatchData<S>;
//   onMatching: () => Promise<void>;
//   loadSource: typeof getExternalSource;
// }
// export const cafeMatchParser: IoOrderParser<AnyOrder[]> = { service: "CAFE"};
// export const zigMatchParser: IoOrderParser<AnyOrder[]> = { service: "ZIGZAG" };
// export const excelMapProcessor: IoOrderParser<DataFrame> = { service: "EXCEL" };

export function getExternalSource(p: CafeOrderParam): Promise<AnyOrder[]>;
export function getExternalSource(p: ZigzagOrderParam): Promise<AnyOrder[]>;
export function getExternalSource(p: ExcelInputParam): Promise<DataFrame>;
export async function getExternalSource(
  p: CafeOrderParam | ZigzagOrderParam | ExcelInputParam
) {
  if (isZigzagOrderParam(p)) {
    return getZigzagOrders(p);
  } else if (isCafeOrderParam(p)) {
    return getCafeOrders(p);
  } else if (isExcelInputParam(p)) {
    return loadDfExcel(p);
  }
  throw new Error("invalid OrderParam: ", p);
}
