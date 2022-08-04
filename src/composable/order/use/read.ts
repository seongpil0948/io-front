import {
  ORDER_STATE,
  ProdOrderCombined,
  useShopUserGarments,
} from "@/composable";
import { useVendorsStore } from "@/store";
import { onBeforeUnmount, ref, watchEffect } from "vue";
import { ORDER_GARMENT_DB } from "./../db/index";

export function useReadShopOrderGInfo(
  shopId: string,
  inStates: ORDER_STATE[],
  notStates: ORDER_STATE[]
) {
  const { orders, unsubscribe } = ORDER_GARMENT_DB.shopReadListen({
    shopId,
    inStates,
    notStates,
  });
  const { userProd: shopGarments } = useShopUserGarments(shopId, null);
  const vendorStore = useVendorsStore();
  const existOrderIds = ref<Set<string>>(new Set());
  const garmentOrders = ref<ProdOrderCombined[]>([]);
  watchEffect(async () => {
    orders.value.forEach((order) => {
      for (let i = 0; i < order.items.length; i++) {
        const shopGarment = shopGarments.value.find(
          (j) => j.shopProdId === order.items[i].shopProdId
        );
        if (!shopGarment) continue;
        const vendorGarment = vendorStore.vendorUserGarments.find(
          (k) => k.vendorProdId === order.items[i].vendorProdId
        );
        if (!vendorGarment) continue;
        const item: ProdOrderCombined = Object.assign(
          { shopGarment, vendorGarment },
          order.items[i]
        );
        garmentOrders.value.push(item);
      }
    });
    existOrderIds.value = await ORDER_GARMENT_DB.getExistOrderIds(shopId);
  });
  onBeforeUnmount(() => unsubscribe());
  return { existOrderIds, orders, unsubscribe, garmentOrders };
}
