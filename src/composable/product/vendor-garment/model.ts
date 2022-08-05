// import { logger } from "@/plugin/logger";
import { CommonField } from "@/composable/common";
import {
  dateToTimeStamp,
  getIoCollection,
  insertById,
  IoCollection,
} from "@/util";
import { DocumentSnapshot, DocumentData } from "@firebase/firestore";
import type { GENDER, PART, GARMENT_SIZE } from "../domain";
import { VendorGarmentCrt } from "./domain";

export class VendorGarment extends CommonField implements VendorGarmentCrt {
  gender: GENDER;
  part: PART;
  ctgr: string;
  color: string;
  allowPending: boolean;
  size: GARMENT_SIZE;
  fabric: string;
  vendorId: string;
  vendorProdId: string;
  vendorPrice: number;
  stockCnt: number;
  vendorProdName: string;
  titleImgs: string[];
  bodyImgs: string[];
  info: string;
  description: string;

  async update() {
    await insertById<VendorGarment>(
      this,
      getIoCollection({ c: IoCollection.VENDOR_PROD }),
      this.vendorProdId,
      true,
      VendorGarment.fireConverter()
    );
  }

  constructor(d: Omit<VendorGarmentCrt, "combineId">) {
    super(d.createdAt, d.updatedAt);
    this.gender = d.gender;
    this.part = d.part;
    this.ctgr = d.ctgr;
    this.color = d.color;
    this.allowPending = d.allowPending;
    this.size = d.size;
    this.fabric = d.fabric;
    this.vendorId = d.vendorId;
    this.vendorProdId = d.vendorProdId;
    this.vendorPrice = d.vendorPrice;
    this.stockCnt = d.stockCnt;
    this.vendorProdName = d.vendorProdName;
    this.titleImgs = d.titleImgs;
    this.bodyImgs = d.bodyImgs;
    this.info = d.info;
    this.description = d.description;
  }
  get combineId(): string {
    return this.vendorId + this.vendorProdName;
  }
  static fromJson(data: { [x: string]: any }): VendorGarment | null {
    if (data && data.vendorProdId) {
      return new VendorGarment({
        gender: data.gender,
        part: data.part,
        ctgr: data.ctgr,
        color: data.color,
        allowPending: data.allowPending,
        size: data.size,
        fabric: data.fabric,
        vendorId: data.vendorId,
        vendorProdId: data.vendorProdId,
        vendorPrice: data.vendorPrice,
        stockCnt: data.stockCnt,
        vendorProdName: data.vendorProdName,
        titleImgs: data.titleImgs,
        bodyImgs: data.bodyImgs,
        info: data.info,
        description: data.description,
      });
    } else {
      //   logger.error(null, "vendor product from json return null, data: ", data);
      return null;
    }
  }
  static fireConverter() {
    return {
      toFirestore: (u: VendorGarment) =>
        u instanceof CommonField
          ? u.toJson()
          : VendorGarment.fromJson(u)!.toJson(),
      fromFirestore: (
        snapshot: DocumentSnapshot<DocumentData>,
        options: any
      ): VendorGarment | null => {
        const data = snapshot.data(options);
        return data ? VendorGarment.fromJson(data) : null;
      },
    };
  }
}
