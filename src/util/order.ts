import { dataFromSnap, uniqueArr } from "@/util";
import {
  IoOrder,
  ShopUserGarment,
  OrderItemCombined,
  VendorGarment,
  IoUser,
  VendorUserGarment,
  getPendingCnt,
  getActiveCnt,
} from "@/composable";

import {
  batchInQuery,
  getIoCollectionGroup,
  ioFireStore,
} from "@/plugin/firebase";
export function extractGarmentOrd(
  orders: IoOrder[],
  shopProds: ShopUserGarment[],
  vendorProds: VendorUserGarment[]
) {
  const ioOrders: OrderItemCombined[] = [];
  orders.forEach((order) => {
    for (let i = 0; i < order.items.length; i++) {
      const ordShopProd = order.items[i].shopProd;
      const sId = ordShopProd.shopProdId;
      const shopProd = shopProds.find((j) => j.shopProdId === sId);
      if (!shopProd) {
        console.warn(`not matched order(${order.dbId}) shop garment(${sId})`);
        continue;
      } else if (!shopProd.userInfo) {
        console.warn("not shop user garment", shopProd);
        continue;
      }
      const vId = order.items[i].vendorProd.vendorProdId;
      const vendorProd = vendorProds.find((k) => k.vendorProdId === vId);
      if (!vendorProd) {
        console.warn(`not matched order(${order.dbId}) vendor garment(${vId})`);
        continue;
      } else if (!vendorProd.userInfo) {
        console.warn("not vendor user garment", vendorProd);
        continue;
      }
      const item: OrderItemCombined = Object.assign({}, order.items[i], {
        shopProd: shopProd,
        vendorProd: vendorProd,
      });
      // 2. set pending cnt
      item.pendingCnt = getPendingCnt(
        vendorProd.stockCnt,
        item.orderCnt,
        vendorProd.allowPending
      );
      // 3. set active cnt
      item.activeCnt = getActiveCnt(item.orderCnt, item.pendingCnt);
      ioOrders.push(item);
    }
  });
  return ioOrders;
}

export async function getVirVendorProdsByVendors(vendorIds: string[]) {
  const virVendorGarmentSnap = await batchInQuery<VendorGarment>(
    vendorIds,
    getIoCollectionGroup(ioFireStore, "VIRTUAL_VENDOR_PROD"),
    "vendorId"
  );
  const virVendorGarments = virVendorGarmentSnap.flatMap(
    dataFromSnap<VendorGarment>
  );
  const virVendorSnap = await batchInQuery<IoUser>(
    uniqueArr(virVendorGarments.map((x) => x.vendorId)),
    getIoCollectionGroup(ioFireStore, "VIRTUAL_USER"),
    "userInfo.userId"
  );
  const virVendors = virVendorSnap.flatMap(dataFromSnap<IoUser>);
  const virVendorUserGarment: VendorUserGarment[] = [];
  for (let i = 0; i < virVendorGarments.length; i++) {
    const vvg = virVendorGarments[i];
    const vu = virVendors.find((x) => x.userInfo.userId === vvg.vendorId);
    if (vu) {
      virVendorUserGarment.push(Object.assign({}, vvg, vu));
    }
  }
  return virVendorUserGarment;
}
