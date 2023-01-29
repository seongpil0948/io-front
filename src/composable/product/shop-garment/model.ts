import {
  PRODUCT_SIZE,
  ShopGarmentCrt,
  MatchGarment,
  PROD_TYPE,
} from "@/composable";
import { CommonField, VISIBILITY } from "@/composable/common";
import { OutputData } from "@editorjs/editorjs/types/data-formats";
import { DocumentSnapshot, DocumentData } from "@firebase/firestore";
import { insertById, getIoCollection, IoCollection } from "@io-boxies/js-lib";
import { ioFireStore } from "@/plugin/firebase";
import { v5 } from "uuid";
import { v5Namespace } from "@/util";
export function sameGarment(p: ShopGarmentCrt, g: MatchGarment) {
  return p.prodName === g.prodName && p.color === g.color && p.size === g.size;
}
const separator = "____";
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
  ablyProdId?: string;
  TBD: { [k: string]: any };
  prodType: PROD_TYPE;
  visible: VISIBILITY;

  async update() {
    await insertById<ShopGarment>(
      this,
      getIoCollection(ioFireStore, { c: IoCollection.SHOP_PROD }),
      this.shopProdId,
      true,
      ShopGarment.fireConverter()
    );
  }
  get uid() {
    return ShopGarment.uid({
      vendorProdId: this.vendorProdId,
    });
  }
  static uid(p: { vendorProdId: string }) {
    return v5(p.vendorProdId, v5Namespace());
  }
  // 타유저와 겹칠 수 있음
  static innerId(p: ProdInnerIdSrc) {
    const clean = (s: string) => s.replace(/\s/g, "").toLowerCase();
    return (
      clean(p.vendorId) +
      separator +
      clean(p.prodName) +
      separator +
      clean(p.color) +
      separator +
      clean(p.size)
    );
  }
  static untieInnerId(id: string): ProdInnerIdSrc {
    const [vendorId, prodName, color, size] = id.split(separator);
    if (!prodName || !color || !size || !vendorId)
      throw new Error("wrong untieInnerId");
    return { vendorId, prodName, color, size };
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
    this.ablyProdId = d.ablyProdId;
    this.TBD = d.TBD;
    this.prodType = d.prodType;
    this.visible = d.visible;
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
        ablyProdId: data.ablyProdId,
        TBD: data.TBD,
        prodType: data.prodType ?? "GARMENT",
        visible: data.visible ?? "GLOBAL",
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

export interface ProdInnerIdSrc {
  vendorId: string;
  prodName: string;
  size: string;
  color: string;
}
