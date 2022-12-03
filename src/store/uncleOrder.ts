import { extractGarmentOrd, uniqueArr } from "@/util";
import {
  ORDER_STATE,
  IoOrder,
  ShopUserGarment,
  OrderItemCombined,
  ORDER_GARMENT_DB,
  SHOP_GARMENT_DB,
  OrderItemByShop,
  VENDOR_GARMENT_DB,
} from "@/composable";
import { logger } from "@/plugin/logger";
import { Unsubscribe } from "@firebase/util";
import { defineStore } from "pinia";
import { ref, computed, watchEffect } from "vue";
import { useAuthStore } from "./auth";

export const useUncleOrderStore = defineStore("uncleOrderStore", () => {
  console.log(`=== called useUncleOrderStore ===`);
  const authStore = useAuthStore();
  const inStates = ref<ORDER_STATE[]>([]);
  const uncleId = ref<string | null>(null);
  const _orders = ref<IoOrder[]>([]);
  let orderUnSub: null | Unsubscribe = null;
  const shopProds = ref<ShopUserGarment[]>([]);
  const _ioOrders = ref<OrderItemCombined[]>([]);
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
        ? _ioOrders.value.filter((x) => inStates.includes(x.state))
        : _ioOrders.value
    );
  }
  function getGarmentOrdersByShop(ioOrders: typeof _ioOrders) {
    return computed(() =>
      ioOrders.value.reduce((acc, curr) => {
        const exist = acc.find((x) => x.shopId === curr.shopProd.shopId);
        if (!exist) {
          acc.push({
            shopId: curr.shopProd.shopId,
            shopName:
              curr.shopProd.userInfo.displayName ??
              curr.shopProd.userInfo.userName,
            items: [curr],
          });
          return acc;
        }
        exist.items.push(curr);
        return acc;
      }, [] as OrderItemByShop[])
    );
  }
  function getOrdersByShop(ioOrders: typeof _ioOrders) {
    return computed(() =>
      ioOrders.value.reduce((acc, curr) => {
        const exist = acc.find((x) => x.shopId === curr.shopProd.shopId);
        if (!exist) {
          acc.push({
            shopId: curr.shopProd.shopId,
            shopName:
              curr.shopProd.userInfo.displayName ??
              curr.shopProd.userInfo.userName,
            items: [curr],
          });
          return acc;
        }
        exist.items.push(curr);
        return acc;
      }, [] as OrderItemByShop[])
    );
  }

  watchEffect(async () => {
    if (orders.value.length > 0) {
      shopProds.value = [];
      const shopIds = uniqueArr(orders.value.map((x) => x.shopId));
      const vendorIds = uniqueArr(orders.value.flatMap((x) => x.vendorIds));
      const vendorProds = await VENDOR_GARMENT_DB.listByVendorIds(vendorIds);
      shopProds.value = await SHOP_GARMENT_DB.getBatchShopProds(shopIds);
      _ioOrders.value = extractGarmentOrd(
        orders.value,
        shopProds.value,
        vendorProds
      );
    }
  });

  const unsubscribeAuth = authStore.$onAction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ name, store, args, after, onError }) => {
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
    if (!initial || !uncleUserId || uncleUserId === uncleId.value) return;
    console.log(`=== init useUncleOrderStore === uncleUserId: ${uncleUserId}`);
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
    console.log(`=== discard useUncleOrderStore ===`);
    unsubscribeAuth();
    if (orderUnSub) {
      orderUnSub();
      orderUnSub = null;
    }
    shopProds.value = [];
    inStates.value = [];
    uncleId.value = null;
    _orders.value = [];
    _ioOrders.value = [];
    shopProds.value = [];
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
