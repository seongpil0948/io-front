import type {
  UserFields,
  OrderAmount,
  OrderCrt,
  ProdOrder,
  VendorGarmentCrt,
  ShopGarmentCrt,
  IoUserCRT,
} from "@/composable";
import { TableColumnTitle } from "naive-ui/es/data-table/src/interface";
import { VNodeChild } from "vue";
import { Mapper } from "./model";

interface AdditionalMap {
  orderId: string;
}
export type MapperFields = Partial<
  ProdOrder &
    OrderAmount &
    OrderCrt &
    VendorGarmentCrt &
    ShopGarmentCrt &
    IoUserCRT &
    UserFields &
    ProdOrder &
    AdditionalMap & { accountStr: string }
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
  cellRender?: (rowData: any, rowIndex: number) => VNodeChild;
  colRender?: TableColumnTitle;
}

export interface IoColOptInner<T> {
  key: keyof IoColName<T>;
  cellRender?: (rowData: T, rowIndex: number) => VNodeChild;
  colRender?: TableColumnTitle;
}

export type IoColName<T> = { [n in MapKey]: IoColOptInner<T> };
export interface MapperDB {
  getMapper(uid: string): Promise<Mapper | null | undefined>;
}

export type ProdMapper = {
  [nameSynoId: string]: {
    ioProdName: string;
    colorMapper: MappingJson;
    sizeMapper: MappingJson;
  };
};
