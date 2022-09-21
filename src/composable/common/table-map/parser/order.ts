import {
  GarmentOrder,
  GarmentOrderCondi,
  sameGarment,
  ShopUserGarment,
  VendorUserGarment,
} from "@/composable";

export function garmentOrderFromCondi(
  conditions: GarmentOrderCondi[],
  vendorGarments: VendorUserGarment[],
  userGarments: ShopUserGarment[]
) {
  const infos: {
    [k: string]: {
      prod: ShopUserGarment;
      vendorProd: VendorUserGarment;
      orderIds: string[];
      orderCnt: number;
    };
  } = {};
  for (let j = 0; j < conditions.length; j++) {
    const d = conditions[j];
    const prod = userGarments.find((x) => sameGarment(x, d))!;
    const orderCnt = d.orderCnt ?? 1;
    if (!prod) continue;
    else if (!infos[prod.shopProdId]) {
      const vendorProd = vendorGarments.find(
        (g) =>
          g.vendorProdId === prod.vendorProdId && g.vendorId === prod.vendorId
      );
      if (vendorProd) {
        infos[prod.shopProdId] = {
          prod,
          vendorProd,
          orderIds: [d.orderId],
          orderCnt: orderCnt,
        };
      }
    } else {
      infos[prod.shopProdId].orderCnt += orderCnt;
      infos[prod.shopProdId].orderIds.push(d.orderId);
    }
  }
  return Object.values(infos).reduce((acc, info) => {
    const order = GarmentOrder.fromProd(
      info.prod,
      info.orderIds,
      info.orderCnt,
      info.vendorProd
    );
    acc.push(order);
    return acc;
  }, [] as GarmentOrder[]);
}
