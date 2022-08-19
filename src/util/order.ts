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
      const shopGarment = shopGarments.find(
        (j) => j.shopProdId === order.items[i].shopProdId
      );
      if (!shopGarment) continue;
      const vendorGarment = vendorGarments.find(
        (k) => k.vendorProdId === order.items[i].vendorProdId
      );
      if (!vendorGarment) continue;
      const item: ProdOrderCombined = Object.assign(
        { shopGarment, vendorGarment },
        order.items[i]
      );
      garmentOrders.push(item);
    }
  });
  return garmentOrders;
}
