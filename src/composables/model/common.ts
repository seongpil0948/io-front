import type { LocateCRT, LocateType } from "@/types";
import { ValidationError } from "..";

class CommonField {
  createdAt?: Date;
  updatedAt?: Date;
  constructor(createdAt: Date | undefined, updatedAt: Date | undefined) {
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }
  toJson(): { [x: string]: unknown } {
    const c = this.createdAt?.toJSON();
    const u = this.updatedAt?.toJSON();
    const j = JSON.parse(JSON.stringify(this));
    j.createdAt = c;
    j.updatedAt = u;
    return j;
  }
}
class Locate implements LocateCRT {
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
  constructor(p: LocateCRT) {
    if (!((p.postalCode && p.detailLocate) || (p.latitude && p.longitude))) {
      throw new ValidationError(
        "위도,경도 혹은 우편코드,상세주소가 있어야 합니다."
      );
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
    this.loateType = p.loateType;
  }
}

export function locateStr(l: LocateCRT) {
  return `도시: ${l.city}, 우편번호: ${l.postalCode}, 상세주소: ${
    l.detailLocate
  }, 받는분: ${l.firstName! + l.lastName}, 핸드폰번호: ${l.phone}`;
}

export { Locate, CommonField };
