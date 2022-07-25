type LocateType = "매장" | "창고" | "기타";
const LocateType: { [key: string]: LocateType } = {
  SHOP: "매장",
  STORAGE: "창고",
  ETC: "기타",
};
interface LocateCRT {
  alias: string;
  latitude?: number; // 위도
  longitude?: number; // 경도
  detailLocate?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  postalCode?: string;
  country: string;
  city?: string;
  loateType: LocateType;
}

type IoJson = { [key: string]: string[] };
type MappingJson = { [mappedVal: string]: string };
type ValueOf<T> = T[keyof T];

export {
  type IoJson,
  type ValueOf,
  type MappingJson,
  type LocateCRT,
  LocateType,
};
