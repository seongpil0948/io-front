import { useShopUserProds } from "@/composables";
import { getShopOrderInfo, getExistOrderIds } from "@/plugins/firebase";
import { ORDER_STATE, ShopReqOrderJoined } from "@/types";
import { ref, watchEffect } from "vue";

export function useShopReadOrderInfo(
  shopId: string,
  orderStates: ORDER_STATE[]
) {
  const orderJoined = ref<ShopReqOrderJoined[]>([]);
  const { userProd } = useShopUserProds(shopId, null);
  const { unsubscribe, orders: orderInfo } = getShopOrderInfo({
    shopId,
    inStates: orderStates,
  });
  const existOrderIds = ref<Set<string>>(new Set());

  watchEffect(async () => {
    orderJoined.value = [];
    orderInfo.value.forEach((order) => {
      const exist = orderJoined.value.find(
        (j) => j.shopProdId === order.shopProdId
      );
      if (exist) {
        exist.orderCnt += order.orderCnt;
        exist.amount += exist.prodPrice ?? 0;
      } else {
        const prod = userProd.value.find(
          (p) => order.shopProdId === p.shopProdId
        );
        if (prod) {
          orderJoined.value.push(Object.assign(prod, order));
        }
      }
    });
    existOrderIds.value = await getExistOrderIds(shopId);
  });
  return {
    unsubscribe,
    orderInfo,
    orderJoined,
    existOrderIds,
  };
}
