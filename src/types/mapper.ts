import type { ShopReqOrderCRT } from "./order/shop";
/// 엑셀 컬럼의 통일이름
/// statandard mapping source, normalized column name
/// 각 필드들은 각 필드에 대한 매핑 네임들이 존재하고
/// Each field has mapping name for each field also,
/// 테이블에서 매핑된 컬럼을 찾아 각 셀들을 매핑할 수 있는 각 필드당 두개의 매핑 리스트를 만든다
/// Find the mapped column in Table and create two mapping lists for each field to

import type { TableColumnTitle } from "naive-ui/es/data-table/src/interface";
import type { VNodeChild } from "vue";
import type { MappingJson, ShopUserProd } from ".";

/// which each cell can be mapped
export type MapperFields = Partial<ShopUserProd & ShopReqOrderCRT>;
export type MapKey = keyof MapperFields;
export type MapCols = {
  [key in MapKey]: { [vendorProdId: string]: MappingJson };
};
export type KeyMapper = { [key in MapKey]: string[] };

export interface MapperCRT {
  userId: string;
  cols: MapCols;
  colSynonyms: KeyMapper;
}

export interface IoColOpt {
  key: keyof MapperFields;
  rowIdField?: keyof MapperFields;
  titleMapping?: boolean;
  cellMapping?: boolean;
}

export interface IoColOptInner<T> {
  key: keyof IoColName<T>;
  cellRender?: (rowData: T, rowIndex: number) => VNodeChild;
  colRendor?: TableColumnTitle;
}

export type IoColName<T> = { [n in keyof MapperFields]: IoColOptInner<T> };
