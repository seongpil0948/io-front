import {
  dateToTimeStamp,
  getIoCollection,
  insertById,
  loadDate,
} from "@/plugins/firebase";
import {
  type PART,
  type PROD_SIZE,
  type VendorProdCRT,
  type GENDOR,
  IoCollection,
} from "@/types";
import type { DocumentData, DocumentSnapshot } from "firebase/firestore";
import { CommonField } from ".";

export const sameVendorUnit = (a: VendorProdCRT, b: VendorProdCRT) =>
  a.vendorProdId === b.vendorProdId && a.color === b.color && a.size === b.size;

export class VendorProd extends CommonField implements VendorProdCRT {
  vendorProdId: string;
  vendorId: string;
  vendorProdName: string;
  gendor: GENDOR;
  part: PART;
  ctgr: string;
  color: string;
  vendorPrice: number;
  stockCnt: number;
  allowPending: boolean;
  titleImgs: string[];
  bodyImgs: string[];
  detailImgs: string[];
  size: PROD_SIZE;

  static getCombineId(p: VendorProdCRT) {
    return p.vendorId + p.vendorProdName;
  }
  get combineId() {
    return this.vendorId + this.vendorProdName;
  }

  async update() {
    await insertById<VendorProd>(
      this,
      getIoCollection({ c: IoCollection.VENDOR_PROD }),
      this.vendorProdId,
      true,
      vendorProdConverter
    );
  }

  constructor(p: VendorProdCRT) {
    super(p.createdAt ?? new Date(), p.updatedAt ?? new Date());
    this.vendorProdId = p.vendorProdId;
    this.vendorId = p.vendorId;
    this.vendorProdName = p.vendorProdName;
    this.gendor = p.gendor;
    this.part = p.part;
    this.ctgr = p.ctgr;
    this.color = p.color;
    this.vendorPrice = p.vendorPrice;
    this.stockCnt = p.stockCnt;
    this.titleImgs = p.titleImgs;
    this.bodyImgs = p.bodyImgs;
    this.detailImgs = p.detailImgs;
    this.size = p.size;
    this.allowPending = p.allowPending;
  }
  static fromJson(data: { [x: string]: any }): VendorProd | null {
    return data && data.vendorProdId
      ? new VendorProd({
          createdAt: loadDate(data.createdAt ?? null),
          updatedAt: loadDate(data.updatedAt ?? null),
          vendorProdId: data.vendorProdId,
          vendorId: data.vendorId,
          vendorProdName: data.vendorProdName,
          gendor: data.gendor,
          part: data.part,
          ctgr: data.ctgr,
          color: data.color,
          vendorPrice: data.vendorPrice,
          stockCnt: data.stockCnt,
          allowPending: data.allowPending ?? false,
          titleImgs: data.titleImgs,
          bodyImgs: data.bodyImgs,
          detailImgs: data.detailImgs,
          size: data.size,
        })
      : null;
  }
}
export const vendorProdConverter = {
  toFirestore: (p: VendorProd) => {
    const j = p.toJson();
    j.createdAt = dateToTimeStamp(p.createdAt);
    j.updatedAt = dateToTimeStamp(p.updatedAt);
    return j;
  },
  fromFirestore: (
    snapshot: DocumentSnapshot<DocumentData>
  ): VendorProd | null => {
    const data = snapshot.data();
    if (!data || !data.vendorProdId) return null;
    return VendorProd.fromJson(data);
  },
};
