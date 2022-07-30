import {
  GARMENT_SIZE,
  ShopGarmentCrt,
  VendorGarmentCrt,
  ShopGarmentQField,
} from "@/composable";
import { CommonField } from "@/composable/common";
import {
  dateToTimeStamp,
  getIoCollection,
  insertById,
  IoCollection,
} from "@/util";
import { DocumentSnapshot, DocumentData } from "@firebase/firestore";

export function sameGarment(p: ShopGarmentCrt, g: ShopGarmentQField) {
  return p.prodName === g.prodName && p.color === g.color && p.size === g.size;
}
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

  isSameWithVendor(p: VendorGarmentCrt) {
    return (
      this.vendorProdId === p.vendorProdId &&
      this.color === p.color &&
      this.size === p.size
    );
  }

  async update() {
    await insertById<ShopGarment>(
      this,
      getIoCollection({ c: IoCollection.SHOP_PROD }),
      this.shopProdId,
      true,
      ShopGarment.fireConverter()
    );
  }

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
