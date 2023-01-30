import {
  IoOrder,
  ShopUserGarment,
  VendorUserGarment,
  OrderItemCombined,
  getPendingCnt,
  getActiveCnt,
} from "@/composable";

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
      const shopProd =
        ordShopProd.visible && ordShopProd.visible === "ME"
          ? (ordShopProd as ShopUserGarment)
          : shopProds.find((j) => j.shopProdId === sId);
      if (!shopProd) {
        // console.warn(`not matched order(${order.dbId}) shop garment(${sId})`);
        continue;
      }
      const vId = order.items[i].vendorProd.vendorProdId;
      const vendorProd = vendorProds.find((k) => k.vendorProdId === vId);
      if (!vendorProd) {
        // console.warn(`not matched order(${order.dbId}) vendor garment(${vId})`);
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
