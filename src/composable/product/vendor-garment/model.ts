// import { logger } from "@/plugin/logger";
import { CommonField } from "@/composable/common";
import { OutputData } from "@editorjs/editorjs/types/data-formats";
import { DocumentSnapshot, DocumentData } from "@firebase/firestore";
import { insertById, getIoCollection, IoCollection } from "@io-boxies/js-lib";
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
  vendorProdPkgId: string;
  vendorPrice: number;
  stockCnt: number;
  vendorProdName: string;
  titleImgs: string[];
  bodyImgs: string[];
  info: string | OutputData;
  description: string; // 상품요약
  TBD: { [k: string]: any };

  async update() {
    this.updatedAt = new Date();
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
    this.vendorProdPkgId = d.vendorProdPkgId ?? "";
    this.vendorPrice = d.vendorPrice;
    this.stockCnt = d.stockCnt;
    this.vendorProdName = d.vendorProdName;
    this.titleImgs = loadImgs(d.titleImgs);
    this.bodyImgs = loadImgs(d.bodyImgs);
    this.info = d.info;
    this.description = d.description;
    this.TBD = d.TBD ?? {};
  }
  get combineId() {
    return VendorGarment.combineId(this);
  }
  static combineId(c: VendorGarmentCrt): string {
    return getVendorProdCombineId(c.vendorId, c.vendorProdName);
  }
  toJson(): { [x: string]: Partial<unknown> } {
    const j = super.toJson();
    j.titleImgs = saveImgs(j.titleImgs);
    j.bodyImgs = saveImgs(j.bodyImgs);
    return j;
  }
  static fromJson(data: { [x: string]: any }): VendorGarment | null {
    if (data && data.vendorProdId) {
      return new VendorGarment({
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        gender: data.gender,
        part: data.part,
        ctgr: data.ctgr,
        color: data.color,
        allowPending: data.allowPending,
        size: data.size,
        fabric: data.fabric,
        vendorId: data.vendorId,
        vendorProdId: data.vendorProdId,
        vendorProdPkgId: data.vendorProdPkgId ?? "",
        vendorPrice: data.vendorPrice,
        stockCnt: data.stockCnt,
        vendorProdName: data.vendorProdName,
        titleImgs: loadImgs(data.titleImgs),
        bodyImgs: loadImgs(data.bodyImgs),
        info: data.info,
        description: data.description,
        TBD: data.TBD ?? {},
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
const defaultImgs = ["/img/no_image.png"];
function loadImgs(imgs: any) {
  if (!Array.isArray(imgs) || imgs.length < 1) {
    return defaultImgs;
  } else {
    return imgs;
  }
}

function saveImgs(imgs: any) {
  if (!Array.isArray(imgs) || imgs.length < 1) {
    return [];
  } else {
    return imgs.filter((x) => !defaultImgs.includes(x));
  }
}

export const getVendorProdCombineId = (
  vendorId: string,
  vendorProdName: string
) => vendorId + vendorProdName?.replaceAll(" ", "");
