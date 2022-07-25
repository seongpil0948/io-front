import { GARMENT_SIZE, ShopGarmentCrt } from "@/module";
import { CommonField } from "@/module/common";
import { dateToTimeStamp } from "@/util";
import { DocumentSnapshot, DocumentData } from "@firebase/firestore";

export class ShopGarment extends CommonField implements ShopGarmentCrt {
  size: GARMENT_SIZE;
  color: string;
  vendorId: string;
  vendorProdId: string;
  shopProdId: string;
  shopId: string;
  prodPrice: number;
  prodName: string;
  titleImgs: string[];
  bodyImgs: string[];
  info: string;
  description: string;

  constructor(d: ShopGarmentCrt) {
    super(d.createdAt, d.updatedAt);
    this.size = d.size;
    this.color = d.color;
    this.vendorId = d.vendorId;
    this.vendorProdId = d.vendorProdId;
    this.shopProdId = d.shopProdId;
    this.shopId = d.shopId;
    this.prodPrice = d.prodPrice;
    this.prodName = d.prodName;
    this.titleImgs = d.titleImgs;
    this.bodyImgs = d.bodyImgs;
    this.info = d.info;
    this.description = d.description;
  }
  static fromJson(data: { [x: string]: any }): ShopGarment | null {
    if (data && data.vendorProdId) {
      return new ShopGarment({
        size: data.size,
        color: data.color,
        vendorId: data.vendorId,
        vendorProdId: data.vendorProdId,
        shopProdId: data.shopProdId,
        shopId: data.shopId,
        prodPrice: data.prodPrice,
        prodName: data.prodName,
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
      toFirestore: (u: ShopGarment) => {
        const j = u.toJson();
        j.createdAt = dateToTimeStamp(u.createdAt);
        j.updatedAt = dateToTimeStamp(u.updatedAt);
        return j;
      },
      fromFirestore: (
        snapshot: DocumentSnapshot<DocumentData>,
        options: any
      ): ShopGarment | null => {
        const data = snapshot.data(options);
        return data ? ShopGarment.fromJson(data) : null;
      },
    };
  }
}
