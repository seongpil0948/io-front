import {
  emptyAmount,
  emptyProdOrder,
  GarmentOrder,
  SHOP_GARMENT_DB,
  mergeProdOrder,
  ORDER_GARMENT_DB,
  ORDER_STATE,
  ProdOrderByShop,
  ProdOrderCombined,
  ShopUserGarment,
  VendorUserOrderGarment,
} from "@/composable";
import { logger } from "@/plugin/logger";
import { uniqueArr, extractGarmentOrd } from "@/util";
import { Unsubscribe } from "@firebase/util";
import { defineStore } from "pinia";
import { ref, computed, watchPostEffect } from "vue";
import { useVendorsStore, useAuthStore } from "./";

export const useVendorOrderStore = defineStore("vendorOrderStore", () => {
  // >>> state >>>
  const authStore = useAuthStore();
  const vendorStore = useVendorsStore();
  const inStates = ref<ORDER_STATE[]>([]);
  const vendorId = ref<string | null>(null);
  const _orders = ref<GarmentOrder[]>([]);
  let orderUnSub: null | Unsubscribe = null;
  const shopGarments = ref<ShopUserGarment[]>([]);
  const _garmentOrders = ref<ProdOrderCombined[]>([]);
  let initial = true;
  // >>> getter >>>
  const orders = computed(() => [..._orders.value]);
  const vendorGarments = computed(() =>
    vendorId.value
      ? vendorStore.vendorUserGarments.filter(
          (x) => x.vendorId === vendorId.value
        )
      : vendorStore.vendorUserGarments
  );
  function getVendorOrderGarments(orders: typeof _orders) {
    return computed(() =>
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
  // >>> connection >>>
  const unsubscribeAuth = authStore.$onAction(
    ({ name, store, args, after, onError }) => {
      // this will trigger before an action on `store` is executed
      console.log(`action "${name}" with params [${args.join(", ")}].`);

      // this will trigger after action resolved
      after(async () => {
        const u = store.user;
        if (name === "login") {
          if (!u) throw new Error("User is null");
          else if (u.userInfo.role === "SHOP") {
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
  watchPostEffect(async () => {
    console.log(orders.value);
    if (orders.value.length > 1) {
      shopGarments.value = [];
      const shopIds = uniqueArr(orders.value.map((x) => x.shopId));
      shopGarments.value = await SHOP_GARMENT_DB.getBatchShopProds(shopIds);
      _garmentOrders.value = extractGarmentOrd(
        orders.value,
        shopGarments.value,
        vendorGarments.value
      );
    }
  });
  // >>> action >>>
  function init(vendorUserId: string) {
    if (!initial || !vendorUserId || vendorUserId === vendorId.value) return;
    console.log(`vendorUserId: ${vendorUserId} vendorOrderStore initiated`);
    vendorId.value = vendorUserId;

    const { unsubscribe: orderUnsubscribe } = ORDER_GARMENT_DB.vendorReadListen(
      {
        vendorId: vendorUserId,
        orders: _orders,
      }
    );
    if (orderUnSub) {
      orderUnSub();
    }
    orderUnSub = orderUnsubscribe;
    initial = false;
  }
  function discard() {
    console.log("=== discard vendorOrderStore ===");
    unsubscribeAuth();
    if (orderUnSub) {
      orderUnSub();
      orderUnSub = null;
    }
    shopGarments.value = [];
    inStates.value = [];
    vendorId.value = null;
    _orders.value = [];
    _garmentOrders.value = [];
    shopGarments.value = [];
    initial = true;
  }
  return {
    getGarmentOrdersByShop,
    getOrders,
    getFilteredOrder,
    vendorGarments,
    orders,
    init,
    discard,
    getVendorOrderGarments,
  };
});
