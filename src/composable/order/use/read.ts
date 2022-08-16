import { VendorUserGarment } from "./../../product/vendor-garment/domain";
import {
  GarmentOrder,
  ORDER_STATE,
  ProdOrderCombined,
  ShopUserGarment,
  useShopUserGarments,
  getBatchShopProds,
  ProdOrderByShop,
  VendorUserOrderGarment,
  emptyProdOrder,
  emptyAmount,
  mergeProdOrder,
} from "@/composable";
import { useVendorsStore } from "@/store";
import { computed, onBeforeUnmount, ref, watch, watchEffect } from "vue";
import { ORDER_GARMENT_DB } from "./../db/index";
import debounce from "lodash.debounce";
import { uniqueArr } from "@/util";

export function useReadShopOrderGInfo(shopId: string, inStates: ORDER_STATE[]) {
  const { orders, unsubscribe } = ORDER_GARMENT_DB.shopReadListen({
    shopId,
    inStates,
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
    if (inStates.length > 0) {
      garmentOrders.value = garmentOrders.value.filter((x) =>
        inStates.includes(x.state)
      );
    }
    setExistOrderIds();
  });
  onBeforeUnmount(() => unsubscribe());
  return { existOrderIds, orders, unsubscribe, garmentOrders };
}

export function useReadVendorOrderGInfo(
  vendorId: string,
  inStates: ORDER_STATE[]
) {
  const vendorStore = useVendorsStore();
  const vendorGarments = computed(() =>
    vendorStore.vendorUserGarments.filter((x) => x.vendorId === vendorId)
  );
  const garmentOrders = ref<ProdOrderCombined[]>([]);
  const vendorOrderGarments = computed(() =>
    vendorGarments.value.map((x) => {
      const garment: VendorUserOrderGarment = Object.assign(
        x,
        emptyProdOrder(),
        emptyAmount()
      );
      orders.value.forEach((o) => {
        o.items.forEach((item) => {
          if (item.vendorProdId === garment.vendorProdId) {
            mergeProdOrder(item, garment);
          }
        });
      });
      return garment;
    })
  );

  const { orders, unsubscribe } = ORDER_GARMENT_DB.vendorReadListen({
    vendorId,
    inStates,
  });
  const shopGarments = ref<ShopUserGarment[]>([]);
  watch(
    () => orders.value,
    async (ords) => {
      shopGarments.value = [];
      const shopIds = uniqueArr(ords.map((x) => x.shopId));
      shopGarments.value = await getBatchShopProds(shopIds);
      garmentOrders.value = extractGarmentOrd(
        ords,
        shopGarments.value,
        vendorGarments.value
      ).filter((x) => inStates.includes(x.state));
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
    vendorOrderGarments,
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
