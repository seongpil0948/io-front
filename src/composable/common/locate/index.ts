export * from "./area";

export type LocateType = "매장" | "창고" | "기타";
export const LocateType: { [key: string]: LocateType } = {
  SHOP: "매장",
  STORAGE: "창고",
  ETC: "기타",
};
export interface LocateCRT {
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
  county?: string;
  town?: string;
  locateType: LocateType;
}
export class Locate implements LocateCRT {
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
  county?: string;
  town?: string;
  locateType: LocateType;
  constructor(p: LocateCRT) {
    if (
      !(
        (p.postalCode && p.detailLocate) ||
        (p.latitude && p.longitude) ||
        p.city ||
        p.county ||
        p.town
      )
    ) {
      console.error(p);
      throw Error("위도,경도 혹은 우편코드,상세주소가 있어야 합니다.");
    }
    this.alias = p.alias;
    this.latitude = p.latitude;
    this.longitude = p.longitude;
    this.detailLocate = p.detailLocate;
    this.firstName = p.firstName;
    this.lastName = p.lastName;
    this.phone = p.phone;
    this.postalCode = p.postalCode;
    this.country = p.country;
    this.city = p.city;
    this.county = p.county;
    this.town = p.town;
    this.locateType = p.locateType;
  }
}

export function locateStr(l: LocateCRT) {
  return `도시: ${l.city}, 우편번호: ${l.postalCode}, 상세주소: ${
    l.detailLocate
  }, 받는분: ${l.firstName! + l.lastName}, 핸드폰번호: ${l.phone}`;
}
