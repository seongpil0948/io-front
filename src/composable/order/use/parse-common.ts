import { Ref } from "vue";
import {
  GarmentOrder,
  GarmentOrderCondi,
  MatchGarment,
  ORDER_GARMENT_DB,
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

export async function saveMatch(
  matchData: MatchGarment[],
  userProd: ShopUserGarment[],
  vendorUserGarments: VendorUserGarment[],
  userId: string,
  existOrderIds: Ref<Set<string>>
) {
  const orders: GarmentOrder[] = [];
  for (let i = 0; i < matchData.length; i++) {
    const data = matchData[i];
    if (!data.id) continue;
    const g = userProd.find((x) => x.shopProdId === data.id);
    if (!g) throw new Error("소매처 상품이 없습니다.");
    const vendorProd = vendorUserGarments.find(
      (x) => x.vendorProdId === g?.vendorProdId
    );
    if (!vendorProd) throw new Error("도매처 상품이 없습니다.");
    orders.push(
      GarmentOrder.fromProd(g, [data.orderId], data.orderCnt, vendorProd)
    );
  }
  await ORDER_GARMENT_DB.batchCreate(userId, orders);
  orders?.forEach((ord) => {
    ord.orderIds.forEach((id) => existOrderIds.value.add(id));
  });
}
