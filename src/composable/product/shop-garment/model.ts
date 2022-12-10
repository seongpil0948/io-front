import {
  PRODUCT_SIZE,
  ShopGarmentCrt,
  GarmentOrderCondi,
  PROD_TYPE,
} from "@/composable";
import { CommonField } from "@/composable/common";
import { OutputData } from "@editorjs/editorjs/types/data-formats";
import { DocumentSnapshot, DocumentData } from "@firebase/firestore";
import { insertById, getIoCollection, IoCollection } from "@io-boxies/js-lib";

export function sameGarment(p: ShopGarmentCrt, g: GarmentOrderCondi) {
  return p.prodName === g.prodName && p.color === g.color && p.size === g.size;
}
export class ShopGarment extends CommonField implements ShopGarmentCrt {
  size: PRODUCT_SIZE;
  color: string;
  vendorId: string;
  vendorProdId: string;
  shopProdId: string;
  shopId: string;
  prodPrice: number;
  prodName: string;
  info: string | OutputData;
  description: string;
  cafeProdId?: string;
  zigzagProdId?: string;
  TBD: { [k: string]: any };
  prodType: PROD_TYPE;

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
    this.info = d.info;
    this.description = d.description;
    this.cafeProdId = d.cafeProdId;
    this.zigzagProdId = d.zigzagProdId;
    this.TBD = d.TBD;
    this.prodType = d.prodType;
  }
  static fromJson(data: { [x: string]: any }): ShopGarment | null {
    if (data && data.vendorProdId) {
      return new ShopGarment({
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        size: data.size,
        color: data.color,
        vendorId: data.vendorId,
        vendorProdId: data.vendorProdId,
        shopProdId: data.shopProdId,
        shopId: data.shopId,
        prodPrice: data.prodPrice,
        prodName: data.prodName,
        info: data.info,
        description: data.description,
        cafeProdId: data.cafeProdId,
        zigzagProdId: data.zigzagProdId,
        TBD: data.TBD,
        prodType: data.prodType ?? "GARMENT",
      });
    } else {
      //   logger.error(null, "vendor product from json return null, data: ", data);
      return null;
    }
  }
  static fireConverter() {
    return {
      toFirestore: (u: ShopGarment) => {
        u.updatedAt = new Date();
        return u instanceof CommonField
          ? u.toJson()
          : ShopGarment.fromJson(u)!.toJson();
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
