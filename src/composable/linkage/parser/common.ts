import { Ref } from "vue";
import {
  IoOrder,
  MatchGarment,
  ORDER_GARMENT_DB,
  sameGarment,
  ShopUserGarment,
  newOrdFromItem,
  newOrdItem,
  VendorGarment,
  refreshOrder,
  setOrderCnt,
} from "@/composable";
import { logger } from "@/plugin/logger";

export function ioOrderFromCondi(
  matchData: MatchGarment[],
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
  for (let j = 0; j < matchData.length; j++) {
    const d = matchData[j];
    const prod = userGarments.find((x) => sameGarment(x, d))!;
    const orderCnt = d.orderCnt ?? 1;
    if (!prod) {
      logger.error(
        null,
        "[ioOrderFromCondi] 소매 상품이 존재하지 않습니다.",
        d
      );
      continue;
    } else if (!infos[prod.shopProdId]) {
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
      } else {
        logger.error(
          null,
          "[ioOrderFromCondi] 도매 상품이 존재하지 않습니다.",
          d
        );
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
  existOrderIds: Ref<Set<string>>,
  vendorProds: VendorGarment[] = []
) {
  const orders: IoOrder[] = [];

  let cnt = 0;
  for (let i = 0; i < matchData.length; i++) {
    const data = matchData[i];
    if (!data.id) continue;
    let cont = false;
    for (let j = 0; j < orders.length; j++) {
      const ord = orders[j];
      for (let z = 0; z < ord.items.length; z++) {
        const it = ord.items[z];
        if (
          it.shopProd.shopProdId === data.id &&
          !it.orderIds.includes(data.orderId)
        ) {
          cont = true;
          setOrderCnt({
            order: ord,
            orderItemId: it.id,
            orderCnt: data.orderCnt,
            orderId: data.orderId,
          });
        }
      }
    }
    if (cont) continue;

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
    cnt++;
  }
  orders.forEach((o) => refreshOrder(o));
  await ORDER_GARMENT_DB.batchCreate(userId, orders);
  orders?.forEach((ord) => {
    ord.orderIds.forEach((id) => existOrderIds.value.add(id));
  });
  return cnt;
}
