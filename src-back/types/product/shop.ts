import type { IoUserCRT, VendorProdCRT } from "..";
import type { PROD_SIZE } from "./size";

interface ShopProdCRT {
  createdAt?: Date;
  updatedAt?: Date;
  vendorId: string;
  vendorProdId: string;
  shopProdId: string;
  shopId: string;
  prodPrice: number;
  prodName: string;
  size: PROD_SIZE;
  color: string;
}
interface ShopProdQField {
  prodName: string;
  size: string;
  color: string;
  orderId: string;
}

interface ShopUserProd extends IoUserCRT, ShopProdCRT, VendorProdCRT {
  userName?: string;
}

export type { ShopProdCRT, ShopUserProd, ShopProdQField };
