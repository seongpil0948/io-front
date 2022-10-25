export * from "./area";
export * from "./pickup";
import {
  FirestoreDataConverter,
  DocumentSnapshot,
  DocumentData,
} from "@firebase/firestore";
import { v4 as uuidv4 } from "uuid";
export type LocateType = "SHOP" | "STORAGE" | "ETC";
export const LocateType: { [key in LocateType]: string } = Object.freeze({
  SHOP: "사무실",
  STORAGE: "매장",
  ETC: "기타",
});
export interface LocateCRT {
  code?: string;
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
  code: string;
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

  get toStr() {
    return Locate.toStr(this);
  }
  static toStr(l: LocateCRT) {
    let str = " ";
    if (l.city) str += l.city + " ";
    if (l.county) str += l.county + " ";
    if (l.town) str += l.town + " ";
    if (l.alias) str += l.alias + " ";
    return str;
  }
  constructor(p: LocateCRT) {
    if (
      !(
        (p.postalCode && p.detailLocate) ||
        (p.latitude && p.longitude) ||
        (p.code && (p.city || p.county || p.town))
      )
    ) {
      console.error(p);
      throw Error(
        "위도,경도 혹은 우편코드,상세주소가 있어야 합니다. \n city county town 을 사용시 간이주소와 매핑 가능한 code 를 함께 입력 해주십시오."
      );
    }
    this.code = p.code ?? uuidv4();
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

  static fromJson(d: { [x: string]: any }): Locate {
    return new Locate({
      code: d.code,
      alias: d.alias,
      latitude: d.latitude,
      longitude: d.longitude,
      detailLocate: d.detailLocate,
      firstName: d.firstName,
      lastName: d.lastName,
      phone: d.phone,
      postalCode: d.postalCode,
      country: d.country,
      city: d.city,
      county: d.county,
      town: d.town,
      locateType: d.locateType,
    });
  }

  static fireConverter(): FirestoreDataConverter<Locate | null> {
    return {
      toFirestore: (l: Locate) => {
        return JSON.parse(JSON.stringify(l));
      },
      fromFirestore: (
        snapshot: DocumentSnapshot<DocumentData>,
        options: any
      ): Locate | null => {
        const data = snapshot.data(options);
        return data !== undefined ? Locate.fromJson(data) : null;
      },
    };
  }
}

export function locateStr(l: LocateCRT) {
  return `도시: ${l.city}, 우편번호: ${l.postalCode}, 상세주소: ${
    l.detailLocate
  }, 받는분: ${l.firstName! + l.lastName}, 핸드폰번호: ${l.phone}`;
}
