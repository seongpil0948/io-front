import type {
  UserFields,
  OrderAmount,
  OrderCrt,
  ProdOrder,
  VendorGarmentCrt,
  ShopGarmentCrt,
} from "@/composable";
import { TableColumnTitle } from "naive-ui/es/data-table/src/interface";
import { VNodeChild } from "vue";
import { Mapper } from "./model";

export type MapperFields = Partial<
  UserFields &
    ProdOrder &
    OrderAmount &
    OrderCrt<any> &
    VendorGarmentCrt &
    ShopGarmentCrt
>;

export type MapKey = keyof MapperFields;
export type MappingJson = { [mappedVal: string]: string };
export type MapCols = {
  [key in MapKey]: { [prodId: string]: MappingJson };
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
  imgField?: boolean;
}

export interface IoColOptInner<T> {
  key: keyof IoColName<T>;
  cellRender?: (rowData: T, rowIndex: number) => VNodeChild;
  colRendor?: TableColumnTitle;
}

export type IoColName<T> = { [n in keyof MapperFields]: IoColOptInner<T> };
export interface MapperDB {
  getMapper(uid: string): Promise<Mapper | null | undefined>;
}
