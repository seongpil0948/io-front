import {
  GarmentOrder,
  ShopUserGarment,
  VendorUserGarment,
  ProdOrderCombined,
} from "@/composable";

export function extractGarmentOrd(
  orders: GarmentOrder[],
  shopGarments: ShopUserGarment[],
  vendorGarments: VendorUserGarment[]
) {
  const garmentOrders: ProdOrderCombined[] = [];
  orders.forEach((order) => {
    for (let i = 0; i < order.items.length; i++) {
      const sId = order.items[i].shopProdId;
      const shopGarment = shopGarments.find((j) => j.shopProdId === sId);
      if (!shopGarment) {
        console.warn(`not matched order(${order.dbId}) shop garment(${sId})`);
        continue;
      }
      const vId = order.items[i].vendorProdId;
      const vendorGarment = vendorGarments.find((k) => k.vendorProdId === vId);
      if (!vendorGarment) {
        console.warn(`not matched order(${order.dbId}) vendor garment(${vId})`);
        continue;
      }
      const item: ProdOrderCombined = Object.assign({}, order.items[i], {
        shopGarment,
        vendorGarment,
      });
      // 2. set pending cnt
      item.pendingCnt = GarmentOrder.getPendingCnt(
        vendorGarment.stockCnt,
        item.orderCnt,
        vendorGarment.allowPending
      );
      // 3. set active cnt
      item.activeCnt = GarmentOrder.getActiveCnt(
        item.orderCnt,
        item.pendingCnt
      );
      garmentOrders.push(item);
    }
  });
  return garmentOrders;
}
