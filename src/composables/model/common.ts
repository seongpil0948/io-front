import type { LocateCRT } from "@/types";
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
  latitude: number | null; // 위도
  longitude: number | null; // 경도
  detailLocate: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  phone: string | null;
  postalCode: string | null;
  country = "한국";
  city: string | null;
  constructor(
    latitude: number | null,
    longitude: number | null,
    detailLocate: string | null,
    firstName: string | null,
    middleName: string | null,
    lastName: string | null,
    phone: string | null,
    postalCode: string | null,
    country = "한국",
    city: string | null
  ) {
    if (!((postalCode && detailLocate) || (latitude && longitude))) {
      throw new ValidationError(
        "위도,경도 혹은 우편코드,상세주소가 있어야 합니다."
      );
    }
    this.latitude = latitude;
    this.longitude = longitude;
    this.detailLocate = detailLocate;
    this.firstName = firstName;
    this.middleName = middleName;
    this.lastName = lastName;
    this.phone = phone;
    this.postalCode = postalCode;
    this.country = country;
    this.city = city;
  }
}

export { Locate, CommonField };
