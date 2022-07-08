import { useShopUserProds } from "@/composables";
import { getShopOrderInfo, getExistOrderIds } from "@/plugins/firebase";
import { ShopReqOrderJoined, ShopOrderParam } from "@/types";
import { ref, watchEffect } from "vue";

export function useShopReadOrderInfo(p: ShopOrderParam) {
  const orderJoined = ref<ShopReqOrderJoined[]>([]);
  const { userProd } = useShopUserProds(p.shopId, null);
  const { unsubscribe, orders: orderInfo } = getShopOrderInfo(p);
  const existOrderIds = ref<Set<string>>(new Set());

  watchEffect(async () => {
    orderJoined.value = [];
    orderInfo.value.forEach((order) => {
      const exist = orderJoined.value.find(
        (j) => j.shopProdId === order.shopProdId
      );
      if (exist) {
        exist.orderCnt! += order.orderCnt;
        exist.amount! += exist.prodPrice ?? 0;
      } else {
        const prod = userProd.value.find(
          (p) => order.shopProdId === p.shopProdId
        );
        if (prod) {
          orderJoined.value.push(
            Object.assign({ userName: prod.userInfo?.userName }, prod, order)
          );
        }
      }
    });
    existOrderIds.value = await getExistOrderIds(p.shopId);
  });
  return {
    unsubscribe,
    orderInfo,
    orderJoined,
    existOrderIds,
  };
}
