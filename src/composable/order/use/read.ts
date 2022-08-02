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
  watchEffect(async () => {
    orders.value.forEach((order) => {
      for (let i = 0; i < order.items.length; i++) {
        const item: ProdOrderCombined = order.items[i];
        item.shopGarment = shopGarments.value.find(
          (j) => j.shopProdId === item.shopProdId
        );
        item.vendorGarment = vendorStore.vendorUserGarments.find(
          (k) => k.vendorProdId === item.vendorProdId
        );
      }
    });
    existOrderIds.value = await ORDER_GARMENT_DB.getExistOrderIds(shopId);
  });
  onBeforeUnmount(() => unsubscribe());
  return { existOrderIds, orders, unsubscribe };
}
