import {
  dateToTimeStamp,
  getIoCollection,
  insertById,
  loadDate,
} from "@/plugins/firebase";
import {
  IoCollection,
  type PROD_SIZE,
  type ShopProdCRT,
  type ShopProdQField,
  type VendorProdCRT,
} from "@/types";
import type { DocumentData, DocumentSnapshot } from "firebase/firestore";
import { CommonField } from "./common";
class ShopProd extends CommonField implements ShopProdCRT {
  shopProdId: string;
  shopId: string;
  vendorId: string;
  vendorProdId: string;
  prodPrice: number;
  prodName: string;
  size: PROD_SIZE;
  color: string;
  constructor(p: ShopProdCRT) {
    super(p.createdAt ?? new Date(), p.updatedAt ?? new Date());
    this.shopProdId = p.shopProdId;
    this.shopId = p.shopId;
    this.vendorId = p.vendorId;
    this.vendorProdId = p.vendorProdId;
    this.prodPrice = p.prodPrice;
    this.prodName = p.prodName;
    this.size = p.size;
    this.color = p.color;
  }

  async update() {
    await insertById<ShopProd>(
      this,
      getIoCollection({ c: IoCollection.SHOP_PROD }),
      this.shopProdId,
      true,
      shopProdConverter
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJson(data: { [x: string]: any }): ShopProd | null {
    return data && data.shopProdId
      ? new ShopProd({
          createdAt: loadDate(data.createdAt ?? null),
          updatedAt: loadDate(data.updatedAt ?? null),
          shopProdId: data.shopProdId,
          shopId: data.shopId,
          vendorId: data.vendorId,
          vendorProdId: data.vendorProdId,
          prodPrice: data.prodPrice,
          prodName: data.prodName,
          size: data.size,
          color: data.color,
        })
      : null;
  }
  isSameWithVendor(p: VendorProdCRT) {
    return (
      this.vendorProdId === p.vendorProdId &&
      this.color === p.color &&
      this.size === p.size
    );
  }
}

function isSameProd(prod: ShopProdCRT, q: ShopProdQField) {
  return (
    prod.prodName === q.prodName &&
    prod.color === q.color &&
    prod.size === q.size
  );
}
const shopProdConverter = {
  toFirestore: (u: ShopProd) => {
    const j = u.toJson();
    j.createdAt = dateToTimeStamp(u.createdAt);
    j.updatedAt = dateToTimeStamp(u.updatedAt);
    return j;
  },
  fromFirestore: (
    snapshot: DocumentSnapshot<DocumentData>,
    options: any
  ): ShopProd | null => {
    const data = snapshot.data(options);
    return data ? ShopProd.fromJson(data) : null;
  },
};

export { ShopProd, shopProdConverter, isSameProd };
