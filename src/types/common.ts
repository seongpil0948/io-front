interface LocateCRT {
  latitude: number | null; // 위도
  longitude: number | null; // 경도
  detailLocate: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  phone: string | null;
  postalCode: string | null;
  country: string;
  city: string | null;
}

type IoJson = { [key: string]: string[] };
type MappingJson = { [mappedVal: string]: string };
type ValueOf<T> = T[keyof T];

export type { IoJson, ValueOf, MappingJson, LocateCRT };
