import { Ref } from "vue";
import {
  IoOrder,
  GarmentOrderCondi,
  MatchGarment,
  ORDER_GARMENT_DB,
  sameGarment,
  ShopUserGarment,
  VendorUserGarment,
  newOrdFromItem,
  newOrdItem,
  VENDOR_GARMENT_DB,
  VendorGarment,
} from "@/composable";

export function ioOrderFromCondi(
  conditions: GarmentOrderCondi[],
  vendorProds: VendorGarment[],
  userGarments: ShopUserGarment[]
) {
  const infos: {
    [k: string]: {
      prod: ShopUserGarment;
      vendorProd: VendorGarment;
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
      const vendorProd = vendorProds.find(
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
    const item = newOrdItem({
      vendorProd: info.vendorProd,
      shopProd: info.prod,
      orderIds: info.orderIds,
      orderCnt: info.orderCnt,
      shipFeeAmount: 0,
      shipFeeDiscountAmount: 0,
      pickFeeAmount: 0,
      pickFeeDiscountAmount: 0,
      tax: 0,
      paidAmount: 0,
      paid: "NO",
      paymentConfirm: false,
    });
    const order = newOrdFromItem([item]);
    acc.push(order);
    return acc;
  }, [] as IoOrder[]);
}

export async function saveMatch(
  matchData: MatchGarment[],
  userProd: ShopUserGarment[],
  userId: string,
  existOrderIds: Ref<Set<string>>
) {
  const orders: IoOrder[] = [];
  const ids = userProd.map((x) => x.vendorProdId);
  const vendorProds = await VENDOR_GARMENT_DB.listByIds(ids);

  for (let i = 0; i < matchData.length; i++) {
    const data = matchData[i];
    if (!data.id) continue;
    const g = userProd.find((x) => x.shopProdId === data.id);
    if (!g) throw new Error("소매처 상품이 없습니다.");
    const vendorProd = vendorProds.find(
      (x) => x.vendorProdId === g?.vendorProdId
    );
    if (!vendorProd) throw new Error("도매처 상품이 없습니다.");

    const item = newOrdItem({
      vendorProd,
      shopProd: g,
      orderIds: [data.orderId],
      orderCnt: data.orderCnt,
      shipFeeAmount: 0,
      shipFeeDiscountAmount: 0,
      pickFeeAmount: 0,
      pickFeeDiscountAmount: 0,
      tax: 0,
      paidAmount: 0,
      paid: "NO",
      paymentConfirm: false,
    });
    const order = newOrdFromItem([item]);

    orders.push(order);
  }
  await ORDER_GARMENT_DB.batchCreate(userId, orders);
  orders?.forEach((ord) => {
    ord.orderIds.forEach((id) => existOrderIds.value.add(id));
  });
}
