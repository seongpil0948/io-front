// import { logger } from "@/plugin/logger";
import { CommonField, VISIBILITY } from "@/composable/common";
import { commonToJson } from "@io-boxies/js-lib";
import { OutputData } from "@editorjs/editorjs/types/data-formats";
import { DocumentSnapshot, DocumentData } from "@firebase/firestore";
import { insertById, getIoCollection, IoCollection } from "@io-boxies/js-lib";
import type { GENDER, PART, PRODUCT_SIZE, PROD_TYPE } from "../domain";
import { VendorGarmentCrt, VendorProdSame, VendorProdSimilar } from "./domain";
import { ioFireStore } from "@/plugin/firebase";

export class VendorGarment extends CommonField implements VendorGarmentCrt {
  gender: GENDER;
  part: PART;
  ctgr: string;
  color: string;
  allowPending: boolean;
  size: PRODUCT_SIZE;
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
  prodType: PROD_TYPE;
  visible: VISIBILITY;
  primeCost: number;

  async update() {
    this.updatedAt = new Date();
    await insertById<VendorGarment>(
      this,
      getIoCollection(ioFireStore, { c: IoCollection.VENDOR_PROD }),
      this.vendorProdId,
      true,
      VendorGarment.fireConverter()
    );
  }

  constructor(d: Omit<VendorGarmentCrt, "similarId">) {
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
    this.prodType = d.prodType;
    this.visible = d.visible;
    this.primeCost = d.primeCost;
  }
  get similarId() {
    return VendorGarment.similarId(this);
  }
  static similarId(c: VendorGarmentCrt): string {
    return getVendorProdSimilarId({
      vendorId: c.vendorId,
      vendorProdName: c.vendorProdName,
    });
  }
  toJson(): { [x: string]: Partial<unknown> } {
    const j = super.toJson();
    j.titleImgs = saveImgs(j.titleImgs);
    j.bodyImgs = saveImgs(j.bodyImgs);
    return commonToJson(j);
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
        prodType: data.prodType ?? "GARMENT",
        visible: data.visible ?? "GLOBAL",
        primeCost: data.primeCost ?? data.vendorPrice ?? -1,
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

export const getVendorProdSimilarId = (d: VendorProdSimilar) =>
  d.vendorId + d.vendorProdName?.replaceAll(" ", "");

export const sameVendorProd = (a: VendorProdSame, b: VendorProdSame) =>
  a.vendorId === b.vendorId &&
  a.vendorProdName === b.vendorProdName &&
  a.color === b.color &&
  a.size === b.size;
