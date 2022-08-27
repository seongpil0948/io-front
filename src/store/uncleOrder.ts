import { extractGarmentOrd, uniqueArr } from "@/util";
import {
  ORDER_STATE,
  GarmentOrder,
  ShopUserGarment,
  ProdOrderCombined,
  ORDER_GARMENT_DB,
  SHOP_GARMENT_DB,
  ProdOrderByShop,
} from "@/composable";
import { logger } from "@/plugin/logger";
import { Unsubscribe } from "@firebase/util";
import { defineStore } from "pinia";
import { ref, computed, watchPostEffect } from "vue";
import { useAuthStore } from "./auth";
import { useVendorsStore } from "./vendorProd";

export const useUncleOrderStore = defineStore("uncleOrderStore", () => {
  const authStore = useAuthStore();
  const vendorStore = useVendorsStore();
  const inStates = ref<ORDER_STATE[]>([]);
  const uncleId = ref<string | null>(null);
  const _orders = ref<GarmentOrder[]>([]);
  let orderUnSub: null | Unsubscribe = null;
  const shopGarments = ref<ShopUserGarment[]>([]);
  const _garmentOrders = ref<ProdOrderCombined[]>([]);
  let initial = true;
  // >>> getter >>>
  const orders = computed(() => [..._orders.value]);

  function getOrders(inStates: ORDER_STATE[]) {
    return computed(() =>
      inStates.length > 0
        ? _orders.value.filter((x) =>
            x.states.some((y) => inStates.includes(y))
          )
        : _orders.value
    );
  }
  function getFilteredOrder(inStates: ORDER_STATE[]) {
    return computed(() =>
      inStates.length > 0
        ? _garmentOrders.value.filter((x) => inStates.includes(x.state))
        : _garmentOrders.value
    );
  }
  function getGarmentOrdersByShop(garmentOrders: typeof _garmentOrders) {
    return computed(() =>
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
  }
  function getOrdersByShop(garmentOrders: typeof _garmentOrders) {
    return computed(() =>
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
  }

  watchPostEffect(async () => {
    console.log("orders", orders.value);
    if (orders.value.length > 0) {
      shopGarments.value = [];
      const shopIds = uniqueArr(orders.value.map((x) => x.shopId));
      const vendorIds = uniqueArr(orders.value.flatMap((x) => x.vendorIds));
      const vendorGarments = vendorStore.vendorUserGarments.filter((x) =>
        vendorIds.includes(x.vendorId)
      );
      shopGarments.value = await SHOP_GARMENT_DB.getBatchShopProds(shopIds);
      _garmentOrders.value = extractGarmentOrd(
        orders.value,
        shopGarments.value,
        vendorGarments
      );
    }
  });

  const unsubscribeAuth = authStore.$onAction(
    ({ name, store, args, after, onError }) => {
      // this will trigger before an action on `store` is executed
      console.log(`action "${name}" with params [${args.join(", ")}].`);

      // this will trigger after action resolved
      after(async () => {
        const u = store.user;
        if (name === "login") {
          if (!u) throw new Error("User is null");
          else if (u.userInfo.role === "UNCLE") {
            init(u.userInfo.userId);
          }
        } else if (name === "logout") {
          discard();
        } else if (!u && !initial) {
          discard();
        }
      });
      onError((error) => {
        logger.error(store.user?.userInfo.userId, error);
        discard();
      });
    },
    true
  );

  function init(uncleUserId: string) {
    console.log("try to initiate uncle store");
    if (!initial || !uncleUserId || uncleUserId === uncleId.value) return;
    console.log(`uncleUserId: ${uncleUserId} authOrderStore initiated`);
    uncleId.value = uncleUserId;

    const { unsubscribe: orderUnsubscribe } = ORDER_GARMENT_DB.uncleReadListen({
      uncleId: uncleUserId,
      orders: _orders,
    });
    if (orderUnSub) {
      orderUnSub();
    }
    orderUnSub = orderUnsubscribe;
    initial = false;
  }
  function discard() {
    console.log("=== discard uncleOrderStore ===");
    unsubscribeAuth();
    if (orderUnSub) {
      orderUnSub();
      orderUnSub = null;
    }
    shopGarments.value = [];
    inStates.value = [];
    uncleId.value = null;
    _orders.value = [];
    _garmentOrders.value = [];
    shopGarments.value = [];
    initial = true;
  }

  return {
    getOrders,
    getFilteredOrder,
    orders,
    getGarmentOrdersByShop,
    init,
    getOrdersByShop,
  };
});
