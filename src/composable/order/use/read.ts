import { VendorUserGarment } from "./../../product/vendor-garment/domain";
import {
  GarmentOrder,
  ORDER_STATE,
  ProdOrderCombined,
  ShopUserGarment,
  useShopUserGarments,
  getBatchShopProds,
} from "@/composable";
import { useVendorsStore } from "@/store";
import { computed, onBeforeUnmount, ref, watch, watchEffect } from "vue";
import { ORDER_GARMENT_DB } from "./../db/index";
import debounce from "lodash.debounce";

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
  const setExistOrderIds = debounce(async () => {
    existOrderIds.value = await ORDER_GARMENT_DB.getExistOrderIds(shopId);
  }, 1000);
  watchEffect(() => {
    garmentOrders.value = extractGarmentOrd(
      orders.value,
      shopGarments.value,
      vendorStore.vendorUserGarments
    );
    setExistOrderIds();
  });
  onBeforeUnmount(() => unsubscribe());
  return { existOrderIds, orders, unsubscribe, garmentOrders };
}
interface ProdOrderByShop {
  shopId: string;
  shopName: string;
  items: ProdOrderCombined[];
}
export function useReadVendorOrderGInfo(
  vendorId: string,
  inStates: ORDER_STATE[],
  notStates: ORDER_STATE[]
) {
  const vendorStore = useVendorsStore();
  const vendorGarments = ref<VendorUserGarment[]>([]);
  const garmentOrders = ref<ProdOrderCombined[]>([]);
  watchEffect(() => {
    vendorGarments.value = vendorStore.vendorUserGarments.filter(
      (x) => x.vendorId === vendorId
    );
  });

  const { orders, unsubscribe } = ORDER_GARMENT_DB.vendorReadListen({
    vendorId,
    inStates,
    notStates,
  });
  const shopGarments = ref<ShopUserGarment[]>([]);
  watch(
    () => orders.value,
    async (ords) => {
      shopGarments.value = [];
      const shopIds = ords.map((x) => x.shopId);
      shopGarments.value = await getBatchShopProds(shopIds);
      garmentOrders.value = extractGarmentOrd(
        ords,
        shopGarments.value,
        vendorGarments.value
      );
    }
  );
  const garmentOrdersByShop = computed(() =>
    garmentOrders.value.reduce((acc, curr) => {
      const exist = acc.find((x) => x.shopId === curr.shopGarment.shopId);
      if (!exist) {
        acc.push({
          shopId: curr.shopGarment.shopId,
          shopName:
            curr.shopGarment.userInfo.displayName ??
            curr.shopGarment.userInfo.userName,
          items: [curr],
        });
        return acc;
      }
      exist.items.push(curr);
      return acc;
    }, [] as ProdOrderByShop[])
  );
  return {
    orders,
    garmentOrders,
    shopGarments,
    vendorGarments,
    unsubscribe,
    garmentOrdersByShop,
  };
}

function extractGarmentOrd(
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
